import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PracticeClient from './practice-client'
import type { Problem } from '@/lib/supabase/types'

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .maybeSingle()

  if (!student) redirect('/study')

  // 추천 문제: published 중 정답으로 푼 적 없는 것, unit_code 순, 10개
  const { data: solvedIds } = await supabase
    .from('attempts')
    .select('problem_id')
    .eq('student_id', student.id)
    .eq('is_correct', true)

  const solved = (solvedIds ?? []).map((a) => a.problem_id)

  let query = supabase
    .from('problems')
    .select('*')
    .eq('status', 'published')
    .order('unit_code')
    .limit(10)

  if (solved.length > 0) {
    query = query.not('id', 'in', `(${solved.join(',')})`)
  }

  const { data: problems } = await query

  if (!problems || problems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-800">오늘 문제를 다 풀었어요!</h2>
        <p className="text-gray-500 mt-2 text-sm text-center">
          아빠가 새 문제를 추가할 때까지 기다려 주세요.
        </p>
        <a href="/study" className="mt-6 text-blue-500 underline text-sm">홈으로</a>
      </div>
    )
  }

  return <PracticeClient problems={problems as Problem[]} studentId={student.id} />
}
