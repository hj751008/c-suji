import * as XLSX from 'xlsx'
import type { Database, ProblemType, AnswerType } from '@/lib/supabase/types'
import { VALID_COURSE_CODES, VALID_UNIT_CODES } from '@/lib/curriculum'

type ProblemInsert = Database['public']['Tables']['problems']['Insert']

const VALID_PROBLEM_TYPES: ProblemType[] = [
  'concept_identification',
  'start_point',
  'calculation',
  'mixed_concept',
  'application_entry',
]

const VALID_ANSWER_TYPES: AnswerType[] = [
  'multiple_choice',
  'short_answer',
  'subjective',
]

export interface ParseResult {
  problems: ProblemInsert[]
  errors: string[]
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  })

  const problems: ProblemInsert[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const rowNum = i + 2 // 헤더 행 제외
    const r = (key: string) => {
      const val = row[key]
      return val !== null && val !== undefined ? String(val).trim() : ''
    }

    // 필수 필드 검증
    const required = [
      'course_code',
      'unit_code',
      'skill_code_main',
      'problem_type',
      'difficulty_level',
      'question_text',
      'answer_type',
      'correct_answer',
      'full_solution',
    ]
    for (const field of required) {
      if (!r(field)) {
        errors.push(`${rowNum}행: ${field} 누락`)
        return
      }
    }

    const problemType = r('problem_type') as ProblemType
    if (!VALID_PROBLEM_TYPES.includes(problemType)) {
      errors.push(
        `${rowNum}행: problem_type 값 오류 (${problemType}). 허용값: ${VALID_PROBLEM_TYPES.join(', ')}`
      )
      return
    }

    const answerType = r('answer_type') as AnswerType
    if (!VALID_ANSWER_TYPES.includes(answerType)) {
      errors.push(
        `${rowNum}행: answer_type 값 오류 (${answerType}). 허용값: ${VALID_ANSWER_TYPES.join(', ')}`
      )
      return
    }

    const difficulty = Number(r('difficulty_level'))
    if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
      errors.push(`${rowNum}행: difficulty_level은 1~5 사이 정수여야 합니다`)
      return
    }

    const courseCode = r('course_code')
    if (!VALID_COURSE_CODES.has(courseCode)) {
      errors.push(
        `${rowNum}행: course_code 오류 (${courseCode}). 허용값: M1~M3, H1~H3`
      )
      return
    }

    const unitCode = r('unit_code')
    if (!VALID_UNIT_CODES.has(unitCode)) {
      errors.push(
        `${rowNum}행: unit_code 오류 (${unitCode}). 예시: M1U01, M2U03`
      )
      return
    }

    problems.push({
      course_code: r('course_code'),
      unit_code: r('unit_code'),
      skill_code_main: r('skill_code_main'),
      problem_type: problemType,
      difficulty_level: difficulty,
      title: r('title') || null,
      question_text: r('question_text'),
      answer_type: answerType,
      correct_answer: r('correct_answer'),
      choice_1: r('choice_1') || null,
      choice_2: r('choice_2') || null,
      choice_3: r('choice_3') || null,
      choice_4: r('choice_4') || null,
      hint_level_1: r('hint_level_1') || null,
      hint_level_2: r('hint_level_2') || null,
      full_solution: r('full_solution'),
      common_wrong_reason: r('common_wrong_reason') || null,
      recovery_feedback_basic: r('recovery_feedback_basic') || null,
      uploader_note: r('uploader_note') || null,
      status: 'draft',
    })
  })

  return { problems, errors }
}
