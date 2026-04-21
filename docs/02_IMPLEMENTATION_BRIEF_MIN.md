# 02_IMPLEMENTATION_BRIEF_MIN.md

구현을 시작하기 위한 최소 실행 브리프.

## 1. 기술 스택
- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth + Postgres + Storage)
- **Deploy:** Vercel
- **Mobile:** PWA (수지 스마트폰 설치)
- **Explanation API:** Claude API (claude-sonnet-4-6)
- **Excel 파싱:** xlsx (SheetJS)
- **Package manager:** pnpm

## 2. 구현 핵심
- parent 1 + student 1 구조 (Supabase Auth 계정 1개, 역할 선택으로 분기)
- DB에 저장된 문제 풀이 흐름
- Excel 업로드 → DB 저장 흐름
- published 문제만 학생에게 노출
- 설명 API는 추가 설명 요청 때만 호출
- 학생 뷰: 모바일 퍼스트 (스마트폰)
- 부모 뷰: PC 기준

## 3. 콘텐츠 운영 최소판
앱 내부에서 하는 것:
- Excel 업로드
- 업로드된 문제 목록 보기
- 문제 상태 보기
- 공개 여부 전환

앱 내부에서 하지 않는 것:
- 문제 자동 생성
- 문제 AI 검수
- 대량 문제 자동 보충

## 4. 학생 흐름
1. 로그인 → 역할 선택 ("수지")
2. 체크인 (컨디션 + 어제 학습 난이도)
3. 오늘의 추천 문제 목록 (기본 10문제)
4. 문제 풀이 → 정답/오답
5. 오답 시: 회복 피드백 → 힌트1 → 힌트2 → 풀이 → 추가 설명 요청(API)
6. 결과 저장 (attempts)
7. 오답 복습

## 5. 부모 흐름
1. 로그인 → 역할 선택 ("아빠")
2. 대시보드 5카드 확인
3. Excel 업로드 → 미리보기 → 저장
4. 문제 목록 관리 (상태 전환)

## 6. 상태값
- `draft` — 업로드 직후 기본값
- `published` — 학생에게 노출
- `blocked` — 문제 있음

## 7. 추천 로직
1. published 문제 중 정답으로 푼 적 없는 것
2. unit_code 순서 (진도 순)
3. 상위 10문제

## 8. 우선 구현 순서
1. 프로젝트 초기화 (Next.js + Supabase + PWA 설정)
2. DB 스키마 적용 + Auth 설정
3. 로그인 + 역할 선택
4. Excel 업로드 파서 + 문제 저장
5. 문제 관리 화면 (목록/상태 전환)
6. 체크인 화면
7. 문제 풀기 화면 (추천 → 풀이 → 힌트 → 풀이)
8. 추가 설명 API 연결
9. 부모 대시보드 5카드
10. PWA 설정 + 폰 테스트
