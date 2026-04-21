import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { attemptId, problemId, studentAnswer } = await request.json()

  // 문제 조회
  const { data: problem } = await supabase
    .from('problems')
    .select('question_text, correct_answer, full_solution, unit_code, skill_code_main')
    .eq('id', problemId)
    .single()

  if (!problem) return NextResponse.json({ error: '문제 없음' }, { status: 404 })

  // 학생 조회
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .maybeSingle()

  if (!student) return NextResponse.json({ error: '학생 없음' }, { status: 404 })

  const prompt = `중학교 1학년 수학 문제에 대해 학생이 추가 설명을 요청했습니다.

단원: ${problem.unit_code}
문제: ${problem.question_text}
학생 답: ${studentAnswer}
정답: ${problem.correct_answer}
풀이: ${problem.full_solution}

이 학생이 왜 틀렸는지, 올바른 풀이 방법은 무엇인지 중학교 1학년 수준에 맞게 친절하고 쉽게 설명해 주세요.
300자 이내로 핵심만 설명하세요.`

  let explanation = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    explanation = (message.content[0] as { type: string; text: string }).text
  } catch {
    return NextResponse.json({ error: 'API 오류' }, { status: 500 })
  }

  // 설명 요청 기록 저장
  await supabase.from('explanation_requests').insert({
    attempt_id: attemptId,
    student_id: student.id,
    response_text: explanation,
    model: 'claude-sonnet-4-6',
  })

  return NextResponse.json({ explanation })
}
