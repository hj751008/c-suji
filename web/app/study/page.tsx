import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function StudyHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 학생 프로필 확인
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .maybeSingle()

  // 학생 프로필이 없으면 생성
  if (!student) {
    await supabase.from('students').insert({ user_id: user.id, name: '수지', grade: 'M1' })
  }

  // 오늘 체크인 여부 확인
  const today = new Date().toISOString().split('T')[0]
  const { data: checkIn } = await supabase
    .from('check_ins')
    .select('id')
    .eq('check_date', today)
    .maybeSingle()

  if (!checkIn) {
    redirect('/study/checkin')
  }

  // 추천 문제 수 확인
  const studentId = student?.id ?? (await supabase.from('students').select('id').maybeSingle()).data?.id
  const { count: recommendedCount } = await supabase
    .from('problems')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .not('id', 'in',
      `(SELECT problem_id FROM attempts WHERE student_id = '${studentId}' AND is_correct = true)`
    )

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-white px-5 pt-12 pb-6 border-b">
        <p className="text-gray-500 text-sm">안녕하세요 👋</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">수지야, 오늘도 화이팅!</h1>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4">
        {/* 문제 풀기 */}
        <Link
          href="/study/practice"
          className="block w-full bg-blue-600 text-white rounded-2xl p-6 shadow-sm hover:bg-blue-700 transition-colors"
        >
          <div className="text-2xl mb-2">✏️</div>
          <div className="font-bold text-lg">문제 풀기</div>
          <div className="text-blue-200 text-sm mt-1">
            {recommendedCount ? `${recommendedCount}문제 남음` : '오늘의 문제'}
          </div>
        </Link>

        {/* 오답 복습 */}
        <Link
          href="/study/review"
          className="block w-full bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors"
        >
          <div className="text-2xl mb-2">🔄</div>
          <div className="font-bold text-lg text-gray-800">오답 복습</div>
          <div className="text-gray-400 text-sm mt-1">틀린 문제 다시 풀기</div>
        </Link>
      </div>

      {/* 하단 */}
      <div className="px-5 pb-8 flex justify-between text-sm text-gray-400">
        <Link href="/select-role">← 역할 변경</Link>
      </div>
    </div>
  )
}
