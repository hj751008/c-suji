'use client'

import { useState } from 'react'
import type { Problem, ProblemStatus } from '@/lib/supabase/types'

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

export default function ProblemsTable({ initialProblems }: { initialProblems: Problem[] }) {
  const [problems, setProblems] = useState(initialProblems)
  const [loading, setLoading] = useState<string | null>(null)

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
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-left">단원</th>
            <th className="px-4 py-3 text-left">문제</th>
            <th className="px-4 py-3 text-left">유형</th>
            <th className="px-4 py-3 text-center">난이도</th>
            <th className="px-4 py-3 text-center">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {problems.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                {p.unit_code}
              </td>
              <td className="px-4 py-3 max-w-xs truncate" title={p.question_text}>
                {p.title || p.question_text}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{p.answer_type}</td>
              <td className="px-4 py-3 text-center">{'⭐'.repeat(p.difficulty_level)}</td>
              <td className="px-4 py-3 text-center">
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
    </div>
  )
}
