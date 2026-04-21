import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReviewClient from './review-client'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .maybeSingle()

  if (!student) redirect('/study')

  // 틀린 문제 (최근 30개, 정답으로 재도전한 것 제외)
  const { data: wrongAttempts } = await supabase
    .from('attempts')
    .select('problem_id, problems(*)')
    .eq('student_id', student.id)
    .eq('is_correct', false)
    .order('created_at', { ascending: false })
    .limit(30)

  // 이미 정답 맞춘 problem_id 제외
  const { data: correctIds } = await supabase
    .from('attempts')
    .select('problem_id')
    .eq('student_id', student.id)
    .eq('is_correct', true)

  const solved = new Set((correctIds ?? []).map((a) => a.problem_id))
  const reviewProblems = (wrongAttempts ?? [])
    .filter((a) => !solved.has(a.problem_id))
    .map((a) => a.problems)
    .filter(Boolean)
    // 중복 제거
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 10)

  if (reviewProblems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5 text-center">
        <div className="text-4xl mb-4">✨</div>
        <h2 className="text-xl font-bold text-gray-800">복습할 문제가 없어요!</h2>
        <p className="text-gray-500 mt-2 text-sm">오답이 없거나 이미 모두 맞췄어요.</p>
        <a href="/study" className="mt-6 text-blue-500 underline text-sm">홈으로</a>
      </div>
    )
  }

  return <ReviewClient problems={reviewProblems} studentId={student.id} />
}
