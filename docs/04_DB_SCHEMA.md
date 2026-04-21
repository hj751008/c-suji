# 04_DB_SCHEMA.md

Supabase Postgres 스키마. 아래 SQL을 Supabase SQL Editor에서 실행.

## 테이블 구조

### students — 학생 프로필
```sql
create table students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  grade text not null default 'M1',
  created_at timestamptz default now()
);
```

### problems — 문제 (Excel 업로드)
```sql
create table problems (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  unit_code text not null,
  skill_code_main text not null,
  problem_type text not null
    check (problem_type in (
      'concept_identification','start_point','calculation',
      'mixed_concept','application_entry'
    )),
  difficulty_level integer not null check (difficulty_level between 1 and 5),
  title text,
  question_text text not null,
  answer_type text not null
    check (answer_type in ('multiple_choice','short_answer','subjective')),
  correct_answer text not null,
  choice_1 text,
  choice_2 text,
  choice_3 text,
  choice_4 text,
  hint_level_1 text,
  hint_level_2 text,
  full_solution text not null,
  common_wrong_reason text,
  recovery_feedback_basic text,
  uploader_note text,
  status text not null default 'draft'
    check (status in ('draft','published','blocked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### attempts — 풀이 기록
```sql
create table attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) not null,
  problem_id uuid references problems(id) not null,
  student_answer text,
  is_correct boolean not null,
  time_spent_seconds integer,
  hint_used integer default 0,
  created_at timestamptz default now()
);
```

### check_ins — 체크인
```sql
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) not null,
  check_date date not null default current_date,
  condition integer not null check (condition between 1 and 3),
  yesterday_difficulty integer not null check (yesterday_difficulty between 1 and 3),
  created_at timestamptz default now(),
  unique(student_id, check_date)
);
```

### explanation_requests — 추가 설명 API 호출 기록
```sql
create table explanation_requests (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references attempts(id) not null,
  student_id uuid references students(id) not null,
  response_text text,
  model text default 'claude-sonnet-4-6',
  created_at timestamptz default now()
);
```

## RLS (Row Level Security)

MVP는 부모 계정 1개이므로 인증 여부만 확인하는 단순 정책.

```sql
alter table students enable row level security;
alter table problems enable row level security;
alter table attempts enable row level security;
alter table check_ins enable row level security;
alter table explanation_requests enable row level security;

-- 인증된 사용자는 모든 조작 가능 (단일 가족 앱)
create policy "authenticated_all" on students
  for all using (auth.uid() is not null);
create policy "authenticated_all" on problems
  for all using (auth.uid() is not null);
create policy "authenticated_all" on attempts
  for all using (auth.uid() is not null);
create policy "authenticated_all" on check_ins
  for all using (auth.uid() is not null);
create policy "authenticated_all" on explanation_requests
  for all using (auth.uid() is not null);
```

## 인덱스
```sql
create index idx_problems_status on problems(status);
create index idx_problems_unit on problems(unit_code);
create index idx_attempts_student on attempts(student_id);
create index idx_attempts_problem on attempts(problem_id);
create index idx_check_ins_student_date on check_ins(student_id, check_date);
```
