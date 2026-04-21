export type ProblemStatus = 'draft' | 'published' | 'blocked'
export type ProblemType =
  | 'concept_identification'
  | 'start_point'
  | 'calculation'
  | 'mixed_concept'
  | 'application_entry'
export type AnswerType = 'multiple_choice' | 'short_answer' | 'subjective'

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          user_id: string
          name: string
          grade: string
          created_at: string
        }
        Insert: {
          user_id: string
          name: string
          grade?: string
        }
        Update: {
          user_id?: string
          name?: string
          grade?: string
        }
        Relationships: []
      }
      problems: {
        Row: {
          id: string
          course_code: string
          unit_code: string
          skill_code_main: string
          problem_type: ProblemType
          difficulty_level: number
          title: string | null
          question_text: string
          answer_type: AnswerType
          correct_answer: string
          choice_1: string | null
          choice_2: string | null
          choice_3: string | null
          choice_4: string | null
          hint_level_1: string | null
          hint_level_2: string | null
          full_solution: string
          common_wrong_reason: string | null
          recovery_feedback_basic: string | null
          uploader_note: string | null
          status: ProblemStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          course_code: string
          unit_code: string
          skill_code_main: string
          problem_type: ProblemType
          difficulty_level: number
          title?: string | null
          question_text: string
          answer_type: AnswerType
          correct_answer: string
          choice_1?: string | null
          choice_2?: string | null
          choice_3?: string | null
          choice_4?: string | null
          hint_level_1?: string | null
          hint_level_2?: string | null
          full_solution: string
          common_wrong_reason?: string | null
          recovery_feedback_basic?: string | null
          uploader_note?: string | null
          status?: ProblemStatus
        }
        Update: {
          course_code?: string
          unit_code?: string
          skill_code_main?: string
          problem_type?: ProblemType
          difficulty_level?: number
          title?: string | null
          question_text?: string
          answer_type?: AnswerType
          correct_answer?: string
          choice_1?: string | null
          choice_2?: string | null
          choice_3?: string | null
          choice_4?: string | null
          hint_level_1?: string | null
          hint_level_2?: string | null
          full_solution?: string
          common_wrong_reason?: string | null
          recovery_feedback_basic?: string | null
          uploader_note?: string | null
          status?: ProblemStatus
          updated_at?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          id: string
          student_id: string
          problem_id: string
          student_answer: string | null
          is_correct: boolean
          time_spent_seconds: number | null
          hint_used: number
          created_at: string
        }
        Insert: {
          student_id: string
          problem_id: string
          student_answer?: string | null
          is_correct: boolean
          time_spent_seconds?: number | null
          hint_used?: number
        }
        Update: {
          student_id?: string
          problem_id?: string
          student_answer?: string | null
          is_correct?: boolean
          time_spent_seconds?: number | null
          hint_used?: number
        }
        Relationships: [
          {
            foreignKeyName: 'attempts_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attempts_problem_id_fkey'
            columns: ['problem_id']
            isOneToOne: false
            referencedRelation: 'problems'
            referencedColumns: ['id']
          }
        ]
      }
      check_ins: {
        Row: {
          id: string
          student_id: string
          check_date: string
          condition: number
          yesterday_difficulty: number
          created_at: string
        }
        Insert: {
          student_id: string
          check_date?: string
          condition: number
          yesterday_difficulty: number
        }
        Update: {
          student_id?: string
          check_date?: string
          condition?: number
          yesterday_difficulty?: number
        }
        Relationships: [
          {
            foreignKeyName: 'check_ins_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          }
        ]
      }
      explanation_requests: {
        Row: {
          id: string
          attempt_id: string
          student_id: string
          response_text: string | null
          model: string
          created_at: string
        }
        Insert: {
          attempt_id: string
          student_id: string
          response_text?: string | null
          model?: string
        }
        Update: {
          attempt_id?: string
          student_id?: string
          response_text?: string | null
          model?: string
        }
        Relationships: [
          {
            foreignKeyName: 'explanation_requests_attempt_id_fkey'
            columns: ['attempt_id']
            isOneToOne: false
            referencedRelation: 'attempts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'explanation_requests_student_id_fkey'
            columns: ['student_id']
            isOneToOne: false
            referencedRelation: 'students'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// 편의 타입 alias
export type Student = Database['public']['Tables']['students']['Row']
export type Problem = Database['public']['Tables']['problems']['Row']
export type Attempt = Database['public']['Tables']['attempts']['Row']
export type CheckIn = Database['public']['Tables']['check_ins']['Row']
export type ExplanationRequest = Database['public']['Tables']['explanation_requests']['Row']
