# sujimathAI

## Identity
중1 수지를 위한 회복형 수학 학습 앱 MVP.
문제는 앱 밖에서 아빠가 ChatGPT로 만들고, Excel로 업로드해서 DB에 저장.
학생은 DB에 저장된 문제를 풀고, 모를 때만 Claude API로 추가 설명을 받는다.

## Tech Stack (확정)
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (Auth + Postgres + Storage)
- Deploy: Vercel
- Mobile: PWA (수지 스마트폰에 설치)
- Explanation API: Claude API (claude-sonnet-4-6)
- Package manager: pnpm

## Project Structure
```
c-suji/
├── CLAUDE.md
├── AGENTS.md
├── docs/           ← 기획/설계 문서
├── templates/      ← Excel 업로드 템플릿
└── web/            ← Next.js 앱
```

## Hard Rules
1. 문제 생성은 앱 밖에서만 (ChatGPT → Excel → 업로드)
2. 학생 런타임에 문제 생성 절대 금지
3. API 호출은 "추가 설명 요청" 시에만
4. 범위: 중1만 (중2~고3 콘텐츠 금지)
5. 단일 학생만 (다중 학생 지원 금지)
6. published 문제만 학생에게 노출
7. 학생 뷰: 모바일 퍼스트 (수지 스마트폰)
8. 부모 뷰: PC 기준
9. 범위 확장 금지 — docs/01_MVP_LOCK_MIN.md의 "하지 않는 것" 참조

## Auth
- Supabase Auth 계정 1개 (부모 이메일+비밀번호)
- 로그인 후 역할 선택: "수지" / "아빠"
- 학생 뷰: /study/* (모바일 최적화)
- 부모 뷰: /parent/* (PC 최적화)

## Source of Truth 순서
1. 이 파일 (CLAUDE.md) — 실행 규칙
2. docs/01_MVP_LOCK_MIN.md — 범위
3. docs/04_DB_SCHEMA.md — DB 구조
4. docs/02_IMPLEMENTATION_BRIEF_MIN.md — 구현 상세
5. AGENTS.md — 에이전트 규칙

## Verification
```bash
cd web && pnpm lint
cd web && pnpm type-check
cd web && pnpm test
```
