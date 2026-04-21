# sujimathAI 최소판 MVP 문서 세트

## 핵심 합의
- 문제는 **앱 밖에서 아빠가 ChatGPT로 생성**
- 문제는 **Excel 업로드**로 앱에 공급
- 앱은 **업로드된 문제를 DB에 저장하고 학생에게 제공**
- 앱은 **학생 런타임에서 새 문제를 생성하지 않음**
- API 호출은 **추가 설명 요청 시에만** (Claude API)
- 대상은 **부모 1명(PC) + 학생 1명(스마트폰)**

## 문서 읽는 순서
1. `CLAUDE.md` — 실행 규칙 + 기술 스택
2. `docs/01_MVP_LOCK_MIN.md` — 범위 잠금
3. `docs/02_IMPLEMENTATION_BRIEF_MIN.md` — 구현 브리프 + 구현 순서
4. `docs/03_EXCEL_UPLOAD_SPEC_MIN.md` — Excel 업로드 형식
5. `docs/04_DB_SCHEMA.md` — DB 스키마 (SQL)
6. `docs/05_SCREEN_FLOW.md` — 화면 흐름 + 추천 로직 + API 프롬프트

## 기타 파일
- `templates/problem_upload_template_min.xlsx` — 업로드 템플릿
- `AGENTS.md` — 에이전트 실행 규칙
