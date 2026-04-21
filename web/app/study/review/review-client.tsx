'use client'

import { useState } from 'react'
import type { Problem } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Phase = 'question' | 'correct' | 'wrong' | 'solution'

export default function ReviewClient({
  problems,
  studentId,
}: {
  problems: Problem[]
  studentId: string
}) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [done, setDone] = useState(false)

  const problem = problems[index]

  async function submitAnswer() {
    if (!answer.trim()) return
    const supabase = createClient()
    const correct = answer.trim() === problem.correct_answer.trim()

    await supabase.from('attempts').insert({
      student_id: studentId,
      problem_id: problem.id,
      student_answer: answer.trim(),
      is_correct: correct,
    })

    setPhase(correct ? 'correct' : 'wrong')
  }

  function next() {
    if (index + 1 >= problems.length) {
      setDone(true)
    } else {
      setIndex(index + 1)
      setAnswer('')
      setPhase('question')
    }
  }

  if (done) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-5 text-center">
        <div className="text-5xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold text-gray-800">복습 완료!</h2>
        <p className="text-gray-500 mt-2">수고했어요 😊</p>
        <a href="/study" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">
          홈으로
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white px-5 pt-10 pb-4 border-b">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>오답 복습 {index + 1}/{problems.length}</span>
          <a href="/study" className="text-gray-400">✕</a>
        </div>
        <p className="text-xs text-gray-400 mt-2">{problem.unit_code}</p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6">
        {phase === 'question' && (
          <>
            <div className="bg-white rounded-2xl p-5 border text-gray-800 whitespace-pre-wrap">
              {problem.question_text}
            </div>

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
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-medium text-gray-500 mr-2">{i + 1}.</span>
                      {choice}
                    </button>
                  ))}
              </div>
            )}

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
          </>
        )}

        {phase === 'correct' && (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-green-600">정답!</h2>
            <Button onClick={next} className="w-full py-6 text-base rounded-xl">
              다음
            </Button>
          </div>
        )}

        {phase === 'wrong' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-red-600 font-medium">아직 어렵군요 😅</p>
            </div>
            <Button
              variant="outline"
              className="w-full py-5 rounded-xl"
              onClick={() => setPhase('solution')}
            >
              풀이 보기
            </Button>
          </div>
        )}

        {phase === 'solution' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="font-medium text-blue-700 mb-2">📖 풀이</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{problem.full_solution}</p>
              <p className="text-sm mt-3 text-blue-600 font-medium">
                정답: {problem.correct_answer}
              </p>
            </div>
            <Button className="w-full py-5 rounded-xl" onClick={next}>
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
