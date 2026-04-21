# AGENTS.md

## Project
sujimathAI — 중1 수지를 위한 회복형 수학 학습 앱 MVP.

## Read first
1. `CLAUDE.md`
2. `docs/01_MVP_LOCK_MIN.md`
3. `docs/02_IMPLEMENTATION_BRIEF_MIN.md`
4. `docs/03_EXCEL_UPLOAD_SPEC_MIN.md`
5. `docs/04_DB_SCHEMA.md`
6. `docs/05_SCREEN_FLOW.md`

## Tech stack
- Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Supabase (Auth + Postgres + Storage)
- Vercel deploy, PWA
- Claude API for explanation only

## Scope now
- parent 1 (PC) + student 1 (smartphone)
- check-in (condition + yesterday difficulty)
- problem solving from DB (published only)
- Excel upload flow for problems
- dashboard 5 cards
- explanation API only when extra help is needed

## Out of scope now
- student runtime problem generation
- M2~H3 real content entry
- RL / bandit
- multi-student support
- admin console
- heavy content-operation workflows

## Product rules
- Problems are created outside the app by the parent using ChatGPT
- Problems are uploaded via Excel
- The app stores and serves uploaded problems from DB
- The app does not generate new problems at student runtime
- API calls are limited to explanation requests (Claude API)

## Execution rules
- Do not expand scope
- Keep implementation small and reviewable
- Follow CLAUDE.md and minimal docs only
- Student view: mobile-first (smartphone)
- Parent view: desktop-first (PC)
