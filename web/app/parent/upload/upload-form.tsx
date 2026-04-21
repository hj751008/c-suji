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

  // 단원 선택 상태
  const [schoolType, setSchoolType] = useState<'middle' | 'high'>('middle')
  const [grade, setGrade] = useState<1 | 2 | 3>(1)
  const [selectedUnit, setSelectedUnit] = useState<{ courseCode: string; unitCode: string } | null>(null)

  const currentCourse = CURRICULUM.find(
    (c) => c.schoolType === schoolType && c.grade === grade
  )!

  function handleSchoolChange(type: 'middle' | 'high') {
    setSchoolType(type)
    setGrade(1)
    setSelectedUnit(null)
  }

  function handleGradeChange(g: 1 | 2 | 3) {
    setGrade(g)
    setSelectedUnit(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file || !selectedUnit) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('courseCode', selectedUnit.courseCode)
    formData.append('unitCode', selectedUnit.unitCode)

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

  const selectedUnitName = selectedUnit
    ? CURRICULUM.flatMap((c) => c.units).find((u) => u.code === selectedUnit.unitCode)?.name
    : null

  return (
    <div className="max-w-xl">
      {/* 업로드 방법 */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">업로드 방법</h2>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>아래에서 <strong>단원을 선택</strong>하세요</li>
          <li>Excel 파일을 선택하세요 (.xlsx / .xls)</li>
          <li>업로드 버튼을 누르세요</li>
          <li>업로드된 문제는 <strong>draft</strong> 상태입니다</li>
          <li>문제 목록에서 <strong>published</strong>로 바꿔야 수지에게 보입니다</li>
        </ol>
      </div>

      {/* 단원 선택기 */}
      <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
        <h2 className="font-semibold text-gray-700">단원 선택</h2>

        {/* 학교 탭 */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => handleSchoolChange('middle')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              schoolType === 'middle' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            중학교
          </button>
          <button
            type="button"
            onClick={() => handleSchoolChange('high')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              schoolType === 'high' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            고등학교
          </button>
        </div>

        {/* 학년 선택 */}
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleGradeChange(g)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                grade === g
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              {g}학년
            </button>
          ))}
        </div>

        {/* 단원 목록 */}
        <div className="space-y-1.5">
          {currentCourse.units.map((unit) => {
            const isSelected = selectedUnit?.unitCode === unit.code
            return (
              <button
                key={unit.code}
                type="button"
                onClick={() => setSelectedUnit({ courseCode: currentCourse.code, unitCode: unit.code })}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                  {unit.name}
                </span>
                <span className={`text-xs font-mono ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                  {unit.code}
                </span>
              </button>
            )
          })}
        </div>

        {selectedUnit && selectedUnitName && (
          <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700 font-medium">
            선택됨: {selectedUnitName} ({selectedUnit.unitCode})
          </div>
        )}
      </div>

      {/* 파일 업로드 */}
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
        <Button type="submit" disabled={loading || !selectedUnit}>
          {loading ? '업로드 중...' : !selectedUnit ? '단원을 먼저 선택하세요' : '업로드'}
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
