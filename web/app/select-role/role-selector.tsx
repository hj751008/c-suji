'use client'

import { useRouter } from 'next/navigation'

export default function RoleSelector() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => router.push('/study')}
        className="w-full py-8 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all"
      >
        <div className="text-4xl mb-2">📚</div>
        <div className="text-xl font-bold text-blue-700">수지</div>
        <div className="text-sm text-blue-500 mt-1">수학 공부하기</div>
      </button>

      <button
        onClick={() => router.push('/parent')}
        className="w-full py-8 rounded-2xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-all"
      >
        <div className="text-4xl mb-2">👨‍👧</div>
        <div className="text-xl font-bold text-green-700">아빠</div>
        <div className="text-sm text-green-500 mt-1">문제 관리 · 현황 확인</div>
      </button>
    </div>
  )
}
