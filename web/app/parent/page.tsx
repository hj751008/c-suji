import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function ParentDashboard() {
  const supabase = await createClient()

  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0]

  // 오늘 체크인 + 학습 통계를 한번에 조회
  const [
    { data: todayCheckIn },
    { data: totalProblems },
    { data: todayAttempts },
    { data: allAttempts },
  ] = await Promise.all([
    supabase
      .from('check_ins')
      .select('*')
      .eq('check_date', today)
      .maybeSingle(),
    supabase.from('problems').select('id, status'),
    supabase
      .from('attempts')
      .select('*, problems(unit_code, skill_code_main)')
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false }),
    supabase
      .from('attempts')
      .select('is_correct, problems(unit_code)'),
  ])

  // 5카드 데이터 계산
  const publishedCount = totalProblems?.filter((p) => p.status === 'published').length ?? 0
  const todayTotal = todayAttempts?.length ?? 0
  const todayCorrect = todayAttempts?.filter((a) => a.is_correct).length ?? 0
  const todayRate = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : null

  // 약한 단원 TOP 3 (오답 기준)
  const wrongByUnit: Record<string, number> = {}
  allAttempts
    ?.filter((a) => !a.is_correct)
    .forEach((a) => {
      const unit = (a.problems as { unit_code: string } | null)?.unit_code
      if (unit) wrongByUnit[unit] = (wrongByUnit[unit] ?? 0) + 1
    })
  const weakUnits = Object.entries(wrongByUnit)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // 실수 유형 TOP 3 (skill_code_main 기준)
  const wrongBySkill: Record<string, number> = {}
  todayAttempts
    ?.filter((a) => !a.is_correct)
    .forEach((a) => {
      const skill = (a.problems as { skill_code_main: string } | null)?.skill_code_main
      if (skill) wrongBySkill[skill] = (wrongBySkill[skill] ?? 0) + 1
    })
  const mistakeTypes = Object.entries(wrongBySkill)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // 회복 지표: 최근 7일 정답률 추이
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { data: recentAttempts } = await supabase
    .from('attempts')
    .select('is_correct, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())

  const recentTotal = recentAttempts?.length ?? 0
  const recentCorrect = recentAttempts?.filter((a) => a.is_correct).length ?? 0
  const recentRate = recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">오늘의 현황</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* 카드 1: 오늘 학습 현황 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">오늘 학습</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTotal > 0 ? (
              <>
                <p className="text-3xl font-bold">{todayTotal}문제</p>
                <p className="text-sm text-gray-500 mt-1">
                  정답률 {todayRate !== null ? `${todayRate}%` : '-'}
                  {' '}({todayCorrect}/{todayTotal})
                </p>
              </>
            ) : (
              <p className="text-gray-400">오늘 아직 학습 없음</p>
            )}
            {todayCheckIn && (
              <p className="text-xs text-gray-400 mt-2">
                컨디션 {['😴', '😐', '😊'][todayCheckIn.condition - 1]}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 카드 2: 약한 단원 TOP 3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">약한 단원 TOP 3</CardTitle>
          </CardHeader>
          <CardContent>
            {weakUnits.length > 0 ? (
              <ol className="space-y-1">
                {weakUnits.map(([unit, count], i) => (
                  <li key={unit} className="flex justify-between text-sm">
                    <span>{i + 1}. {unit}</span>
                    <span className="text-red-500">{count}회 오답</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-400 text-sm">오답 데이터 없음</p>
            )}
          </CardContent>
        </Card>

        {/* 카드 3: 실수 유형 TOP 3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">오늘 실수 유형</CardTitle>
          </CardHeader>
          <CardContent>
            {mistakeTypes.length > 0 ? (
              <ol className="space-y-1">
                {mistakeTypes.map(([skill, count], i) => (
                  <li key={skill} className="flex justify-between text-sm">
                    <span className="truncate">{i + 1}. {skill}</span>
                    <span className="text-orange-500 ml-2">{count}회</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-400 text-sm">오늘 오답 없음</p>
            )}
          </CardContent>
        </Card>

        {/* 카드 4: 회복 지표 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">최근 7일 회복 지표</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRate !== null ? (
              <>
                <p className="text-3xl font-bold">{recentRate}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  {recentTotal}문제 중 {recentCorrect}개 정답
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">최근 7일 데이터 없음</p>
            )}
          </CardContent>
        </Card>

        {/* 카드 5: 오늘 아빠가 도와줄 포인트 */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 font-medium">오늘 도와줄 포인트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {publishedCount === 0 && (
              <p className="text-sm text-orange-600">
                📋 공개된 문제가 없어요. <Link href="/parent/upload" className="underline">업로드</Link>해 주세요.
              </p>
            )}
            {weakUnits[0] && (
              <p className="text-sm">
                📌 <strong>{weakUnits[0][0]}</strong> 단원을 집중적으로 설명해 주세요.
              </p>
            )}
            {todayRate !== null && todayRate < 50 && (
              <p className="text-sm">
                💪 오늘 정답률이 낮아요. 함께 오답 복습을 해보세요.
              </p>
            )}
            {!todayCheckIn && (
              <p className="text-sm text-gray-400">오늘 체크인을 아직 안 했어요.</p>
            )}
            {weakUnits.length === 0 && todayRate === null && (
              <p className="text-sm text-gray-400">학습 데이터가 쌓이면 여기에 표시됩니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link
          href="/parent/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          문제 업로드
        </Link>
        <Link
          href="/parent/problems"
          className="px-4 py-2 bg-white border text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          문제 목록 ({publishedCount}개 공개)
        </Link>
      </div>
    </div>
  )
}
