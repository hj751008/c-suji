'use client'

import { useState } from 'react'
import type { Problem } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

type Phase = 'question' | 'correct' | 'wrong_feedback' | 'hint1' | 'hint2' | 'solution' | 'explain'

export default function PracticeClient({
  problems,
  studentId,
}: {
  problems: Problem[]
  studentId: string
}) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loadingExplain, setLoadingExplain] = useState(false)
  const [startTime] = useState(Date.now())
  const [done, setDone] = useState(false)

  const problem = problems[index]
  const progress = Math.round((index / problems.length) * 100)

  async function submitAnswer() {
    if (!answer.trim()) return
    const supabase = createClient()
    const correct = answer.trim() === problem.correct_answer.trim()
    const elapsed = Math.round((Date.now() - startTime) / 1000)

    const { data } = await supabase
      .from('attempts')
      .insert({
        student_id: studentId,
        problem_id: problem.id,
        student_answer: answer.trim(),
        is_correct: correct,
        time_spent_seconds: elapsed,
        hint_used: 0,
      })
      .select('id')
      .single()

    setAttemptId(data?.id ?? null)
    setPhase(correct ? 'correct' : 'wrong_feedback')
  }

  async function updateHintUsed(hintLevel: number) {
    if (!attemptId) return
    const supabase = createClient()
    await supabase
      .from('attempts')
      .update({ hint_used: hintLevel })
      .eq('id', attemptId)
  }

  async function requestExplanation() {
    if (!attemptId) return
    setLoadingExplain(true)

    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        problemId: problem.id,
        studentAnswer: answer,
      }),
    })

    const data = await res.json()
    setExplanation(data.explanation ?? '설명을 불러올 수 없습니다.')
    setLoadingExplain(false)
    setPhase('explain')
  }

  function next() {
    if (index + 1 >= problems.length) {
      setDone(true)
    } else {
      setIndex(index + 1)
      setAnswer('')
      setPhase('question')
      setAttemptId(null)
      setExplanation(null)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5 text-center">
        <div className="text-5xl mb-4">🎊</div>
        <h2 className="text-2xl font-bold text-gray-800">모두 풀었어요!</h2>
        <p className="text-gray-500 mt-2">오늘도 수고했어요 😊</p>
        <a href="/study" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">
          홈으로
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 상단 진행바 */}
      <div className="bg-white px-5 pt-10 pb-4 border-b">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <span>{index + 1} / {problems.length}</span>
          <a href="/study" className="text-gray-400">✕</a>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-gray-400 mt-2">{problem.unit_code} · 난이도 {'⭐'.repeat(problem.difficulty_level)}</p>
      </div>

      {/* 문제 영역 */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {/* 문제 */}
        {phase === 'question' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border text-gray-800 leading-relaxed whitespace-pre-wrap">
              {problem.question_text}
            </div>

            {/* 객관식 */}
            {problem.answer_type === 'multiple_choice' && (
              <div className="space-y-2">
                {[problem.choice_1, problem.choice_2, problem.choice_3, problem.choice_4]
                  .filter(Boolean)
                  .map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswer(String(i + 1))}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        answer === String(i + 1)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-500 mr-2">{i + 1}.</span>
                      {choice}
                    </button>
                  ))}
              </div>
            )}

            {/* 단답형 */}
            {(problem.answer_type === 'short_answer' || problem.answer_type === 'subjective') && (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                placeholder="답을 입력하세요"
                className="text-base py-4 px-4 rounded-xl border-2"
                autoFocus
              />
            )}

            <Button
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="w-full py-6 text-base rounded-xl"
            >
              제출
            </Button>
          </div>
        )}

        {/* 정답 */}
        {phase === 'correct' && (
          <div className="space-y-4 text-center">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-600">정답!</h2>
            <Button onClick={next} className="w-full py-6 text-base rounded-xl mt-4">
              다음 문제
            </Button>
          </div>
        )}

        {/* 오답 피드백 */}
        {phase === 'wrong_feedback' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-red-600 font-medium mb-2">아쉽지만 틀렸어요 😅</p>
              {problem.recovery_feedback_basic && (
                <p className="text-gray-700 text-sm">{problem.recovery_feedback_basic}</p>
              )}
            </div>
            <div className="space-y-2">
              {problem.hint_level_1 && (
                <Button
                  variant="outline"
                  className="w-full py-5 rounded-xl"
                  onClick={() => { updateHintUsed(1); setPhase('hint1') }}
                >
                  💡 힌트 1 보기
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full py-5 rounded-xl"
                onClick={() => setPhase('solution')}
              >
                📖 풀이 보기
              </Button>
            </div>
          </div>
        )}

        {/* 힌트 1 */}
        {phase === 'hint1' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <p className="font-medium text-yellow-700 mb-2">💡 힌트 1</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{problem.hint_level_1}</p>
            </div>
            <div className="space-y-2">
              {problem.hint_level_2 && (
                <Button
                  variant="outline"
                  className="w-full py-5 rounded-xl"
                  onClick={() => { updateHintUsed(2); setPhase('hint2') }}
                >
                  💡 힌트 2 보기
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full py-5 rounded-xl"
                onClick={() => setPhase('solution')}
              >
                📖 풀이 보기
              </Button>
            </div>
          </div>
        )}

        {/* 힌트 2 */}
        {phase === 'hint2' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <p className="font-medium text-yellow-700 mb-2">💡 힌트 2</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{problem.hint_level_2}</p>
            </div>
            <Button
              variant="outline"
              className="w-full py-5 rounded-xl"
              onClick={() => setPhase('solution')}
            >
              📖 풀이 보기
            </Button>
          </div>
        )}

        {/* 풀이 */}
        {phase === 'solution' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="font-medium text-blue-700 mb-2">📖 풀이</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{problem.full_solution}</p>
              <p className="text-sm mt-3 text-blue-600 font-medium">
                정답: {problem.correct_answer}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full py-5 rounded-xl"
                onClick={requestExplanation}
                disabled={loadingExplain}
              >
                {loadingExplain ? '설명 불러오는 중...' : '🤖 추가 설명 요청'}
              </Button>
              <Button
                className="w-full py-5 rounded-xl"
                onClick={next}
              >
                다음 문제
              </Button>
            </div>
          </div>
        )}

        {/* 추가 설명 (Claude API) */}
        {phase === 'explain' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
              <p className="font-medium text-purple-700 mb-2">🤖 Claude의 추가 설명</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{explanation}</p>
            </div>
            <Button
              className="w-full py-5 rounded-xl"
              onClick={next}
            >
              다음 문제
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
