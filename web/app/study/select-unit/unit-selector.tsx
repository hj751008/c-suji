// web/app/study/select-unit/unit-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CURRICULUM } from '@/lib/curriculum'

const STORAGE_KEY = 'suji_last_unit'

interface SavedSelection {
  courseCode: string
  unitCode: string
}

export default function UnitSelector({
  problemCounts,
}: {
  problemCounts: Record<string, number>
}) {
  const router = useRouter()
  const [schoolType, setSchoolType] = useState<'middle' | 'high'>('middle')
  const [grade, setGrade] = useState<1 | 2 | 3>(1)

  // 마지막 선택 복원
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    const { courseCode } = JSON.parse(saved) as SavedSelection
    const course = CURRICULUM.find((c) => c.code === courseCode)
    if (course) {
      setSchoolType(course.schoolType)
      setGrade(course.grade)
    }
  }, [])

  const courseCode = CURRICULUM.find(
    (c) => c.schoolType === schoolType && c.grade === grade
  )?.code ?? 'M1'

  const currentCourse = CURRICULUM.find((c) => c.code === courseCode)!

  function handleUnitSelect(unitCode: string) {
    const selection: SavedSelection = { courseCode, unitCode }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
    router.push(`/study/practice?course=${courseCode}&unit=${unitCode}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-white px-5 pt-10 pb-4 border-b">
        <a href="/study" className="text-gray-400 text-sm">← 홈</a>
        <h1 className="text-xl font-bold text-gray-900 mt-2">단원 선택</h1>
      </div>

      <div className="flex-1 px-5 py-5 space-y-5">
        {/* 학교 탭 */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200">
          <button
            onClick={() => { setSchoolType('middle'); setGrade(1) }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              schoolType === 'middle'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            중학교
          </button>
          <button
            onClick={() => { setSchoolType('high'); setGrade(1) }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              schoolType === 'high'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600'
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
              onClick={() => setGrade(g)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
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
        <div className="space-y-2">
          {currentCourse.units.map((unit) => {
            const count = problemCounts[unit.code] ?? 0
            return (
              <button
                key={unit.code}
                onClick={() => handleUnitSelect(unit.code)}
                className="w-full flex items-center justify-between px-4 py-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors text-left"
              >
                <div>
                  <p className="font-medium text-gray-800">{unit.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{unit.code}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    count > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {count > 0 ? `${count}문제` : '준비중'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
