#!/usr/bin/env node
// PWA 아이콘 생성 스크립트 (외부 패키지 없이 순수 Node.js)
import zlib from 'zlib'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// CRC32 테이블
const crc32Table = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeChunk(type, data) {
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const combined = Buffer.concat([typeBuffer, data])
  const checksum = crc32(combined)
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(checksum, 0)
  return Buffer.concat([len, typeBuffer, data, crcBuf])
}

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

  const ihdrData = Buffer.allocUnsafe(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 2  // RGB
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0

  const rowSize = 1 + size * 3
  const rawData = Buffer.allocUnsafe(size * rowSize)
  for (let y = 0; y < size; y++) {
    rawData[y * rowSize] = 0  // filter None
    for (let x = 0; x < size; x++) {
      const offset = y * rowSize + 1 + x * 3
      rawData[offset] = r
      rawData[offset + 1] = g
      rawData[offset + 2] = b
    }
  }

  const compressed = zlib.deflateSync(rawData)
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const publicDir = path.join(__dirname, '..', 'public')

// Tailwind blue-600: #2563eb → rgb(37, 99, 235)
const R = 37, G = 99, B = 235

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createSolidPNG(192, R, G, B))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createSolidPNG(512, R, G, B))

console.log('✅ icon-192.png, icon-512.png 생성 완료')
