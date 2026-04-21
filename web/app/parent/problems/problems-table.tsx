'use client'

import { useState } from 'react'
import type { Problem, ProblemStatus } from '@/lib/supabase/types'
import { CURRICULUM } from '@/lib/curriculum'

const STATUS_LABELS: Record<ProblemStatus, string> = {
  draft: '초안',
  published: '공개',
  blocked: '보류',
}

const STATUS_COLORS: Record<ProblemStatus, string> = {
  draft: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  published: 'bg-green-100 text-green-700 hover:bg-green-200',
  blocked: 'bg-red-100 text-red-600 hover:bg-red-200',
}

const NEXT_STATUS: Record<ProblemStatus, ProblemStatus> = {
  draft: 'published',
  published: 'blocked',
  blocked: 'draft',
}

const COURSE_TABS = CURRICULUM.map((c) => ({ code: c.code, name: c.name }))

export default function ProblemsTable({ initialProblems }: { initialProblems: Problem[] }) {
  const [problems, setProblems] = useState(initialProblems)
  const [loading, setLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('M1')
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set())

  async function toggleStatus(problem: Problem) {
    const nextStatus = NEXT_STATUS[problem.status as ProblemStatus]
    setLoading(problem.id)
    const res = await fetch(`/api/problems/${problem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    if (res.ok) {
      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? { ...p, status: nextStatus } : p))
      )
    }
    setLoading(null)
  }

  function toggleUnit(unitCode: string) {
    setOpenUnits((prev) => {
      const next = new Set(prev)
      if (next.has(unitCode)) next.delete(unitCode)
      else next.add(unitCode)
      return next
    })
  }

  const activeCourse = CURRICULUM.find((c) => c.code === activeTab)!
  const courseProblems = problems.filter((p) => p.course_code === activeTab)

  if (problems.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>문제가 없습니다.</p>
        <a href="/parent/upload" className="text-blue-500 underline mt-2 inline-block text-sm">
          Excel 업로드하기
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* 학년 탭 */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {COURSE_TABS.map((tab) => {
          const count = problems.filter((p) => p.course_code === tab.code).length
          return (
            <button
              key={tab.code}
              onClick={() => setActiveTab(tab.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.name.replace('학교 ', '')}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${activeTab === tab.code ? 'text-blue-200' : 'text-gray-400'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 단원별 아코디언 */}
      <div className="space-y-2">
        {activeCourse.units.map((unit) => {
          const unitProblems = courseProblems.filter((p) => p.unit_code === unit.code)
          const isOpen = openUnits.has(unit.code) || unitProblems.length > 0

          return (
            <div key={unit.code} className="bg-white rounded-xl border overflow-hidden">
              {/* 단원 헤더 */}
              <button
                onClick={() => toggleUnit(unit.code)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{unit.name}</span>
                  <span className="text-xs text-gray-400">{unit.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    unitProblems.length > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {unitProblems.length}문제
                  </span>
                  <span className="text-gray-400 text-xs">{isOpen ? '▼' : '▶'}</span>
                </div>
              </button>

              {/* 문제 목록 */}
              {isOpen && unitProblems.length > 0 && (
                <table className="w-full text-sm border-t">
                  <thead className="bg-gray-50 text-gray-500 text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">문제</th>
                      <th className="px-4 py-2 text-left">유형</th>
                      <th className="px-4 py-2 text-center">난이도</th>
                      <th className="px-4 py-2 text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {unitProblems.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 max-w-xs truncate" title={p.question_text}>
                          {p.title || p.question_text}
                        </td>
                        <td className="px-4 py-2 text-gray-500 text-xs">{p.answer_type}</td>
                        <td className="px-4 py-2 text-center">{'⭐'.repeat(p.difficulty_level)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => toggleStatus(p)}
                            disabled={loading === p.id}
                            title="클릭하면 상태가 변경됩니다"
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${STATUS_COLORS[p.status as ProblemStatus]}`}
                          >
                            {loading === p.id ? '...' : STATUS_LABELS[p.status as ProblemStatus]}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
