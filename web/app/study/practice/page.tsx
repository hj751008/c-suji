import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PracticeClient from './practice-client'
import type { Problem } from '@/lib/supabase/types'
import { getUnit, VALID_COURSE_CODES, VALID_UNIT_CODES } from '@/lib/curriculum'

export default async function PracticePage({
  searchParams,
}: {
  searchParams: { course?: string; unit?: string }
}) {
  const courseCode = searchParams.course
  const unitCode = searchParams.unit

  // 코드 없거나 유효하지 않으면 단원선택으로
  if (
    !courseCode || !unitCode ||
    !VALID_COURSE_CODES.has(courseCode) ||
    !VALID_UNIT_CODES.has(unitCode)
  ) {
    redirect('/study/select-unit')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .maybeSingle()

  if (!student) redirect('/study')

  // 이미 정답으로 푼 문제 제외
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
    .eq('course_code', courseCode)
    .eq('unit_code', unitCode)
    .order('difficulty_level')
    .limit(10)

  if (solved.length > 0) {
    query = query.not('id', 'in', `(${solved.join(',')})`)
  }

  const { data: problems } = await query

  const unitName = getUnit(unitCode)?.name ?? unitCode

  if (!problems || problems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5 text-center">
        <div className="text-4xl mb-4">📭</div>
        <h2 className="text-xl font-bold text-gray-800">이 단원에 문제가 없어요</h2>
        <p className="text-gray-500 mt-2 text-sm">{unitName}</p>
        <a
          href="/study/select-unit"
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium"
        >
          다른 단원 선택
        </a>
      </div>
    )
  }

  return (
    <PracticeClient
      problems={problems as Problem[]}
      studentId={student.id}
      unitName={unitName}
    />
  )
}
