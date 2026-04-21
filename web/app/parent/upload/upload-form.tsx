'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CURRICULUM } from '@/lib/curriculum'

export default function UploadForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    inserted?: number
    parseErrors?: string[]
    error?: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/problems/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)

    if (res.ok) {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">업로드 방법</h2>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Excel 템플릿을 채워주세요</li>
          <li>아래에서 파일을 선택하세요 (.xlsx / .xls)</li>
          <li>업로드 버튼을 누르세요</li>
          <li>업로드된 문제는 <strong>draft</strong> 상태입니다</li>
          <li>문제 목록에서 <strong>published</strong>로 바꿔야 수지에게 보입니다</li>
        </ol>
      </div>

      {/* 코드 참조표 */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">유효한 course_code / unit_code</h2>
        <div className="space-y-3">
          {CURRICULUM.map((course) => (
            <div key={course.code}>
              <p className="text-xs font-bold text-gray-500 mb-1">
                {course.code} — {course.name}
              </p>
              <div className="flex flex-wrap gap-1">
                {course.units.map((unit) => (
                  <span
                    key={unit.code}
                    className="text-xs px-2 py-0.5 bg-gray-100 rounded font-mono"
                    title={unit.name}
                  >
                    {unit.code}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          코드 위에 마우스를 올리면 단원 이름이 표시됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            required
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '업로드 중...' : '업로드'}
        </Button>
      </form>

      {result && (
        <div className="mt-6 space-y-3">
          {result.error ? (
            <Alert variant="destructive">
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                {result.inserted}개 문제가 저장되었습니다.
                <button
                  onClick={() => router.push('/parent/problems')}
                  className="ml-2 underline"
                >
                  문제 목록 보기
                </button>
              </AlertDescription>
            </Alert>
          )}
          {result.parseErrors && result.parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <p className="font-medium mb-1">파싱 오류 ({result.parseErrors.length}건):</p>
                <ul className="text-xs space-y-0.5">
                  {result.parseErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
