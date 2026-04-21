'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const CONDITIONS = [
  { value: 1, emoji: '😴', label: '힘들어요' },
  { value: 2, emoji: '😐', label: '보통이에요' },
  { value: 3, emoji: '😊', label: '좋아요!' },
]

const DIFFICULTIES = [
  { value: 1, emoji: '😅', label: '어려웠어요' },
  { value: 2, emoji: '🙂', label: '적당했어요' },
  { value: 3, emoji: '😎', label: '쉬웠어요' },
]

export default function CheckInForm() {
  const router = useRouter()
  const [condition, setCondition] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!condition || !difficulty) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let { data: student } = await supabase
      .from('students')
      .select('id')
      .maybeSingle()

    // 학생 레코드가 없으면 자동 생성
    if (!student) {
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({ user_id: user.id, name: '수지', grade: 'M1' })
        .select('id')
        .single()
      if (insertError || !newStudent) {
        setError('학생 정보를 만들 수 없습니다: ' + (insertError?.message ?? '알 수 없는 오류'))
        setLoading(false)
        return
      }
      student = newStudent
    }

    const { error: upsertError } = await supabase.from('check_ins').upsert({
      student_id: student.id,
      check_date: new Date().toISOString().split('T')[0],
      condition,
      yesterday_difficulty: difficulty,
    })

    if (upsertError) {
      setError('저장 실패: ' + upsertError.message)
      setLoading(false)
      return
    }

    router.push('/study')
  }

  return (
    <div className="space-y-8">
      {/* 오늘 컨디션 */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">오늘 컨디션이 어때요?</h2>
        <div className="flex gap-3">
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCondition(c.value)}
              className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                condition === c.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-xs text-gray-600">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 어제 난이도 */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">어제 수학이 어땠어요?</h2>
        <div className="flex gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                difficulty === d.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{d.emoji}</span>
              <span className="text-xs text-gray-600">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!condition || !difficulty || loading}
        className="w-full py-6 text-base"
      >
        {loading ? '저장 중...' : '시작하기 🚀'}
      </Button>

      {(!condition || !difficulty) && (
        <p className="text-center text-xs text-gray-400">
          위 두 항목을 모두 선택해야 시작할 수 있어요
        </p>
      )}
    </div>
  )
}
