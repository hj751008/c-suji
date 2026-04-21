# 교육과정 분류 확장 설계

**날짜**: 2026-04-22
**범위**: 학생 뷰(수지) + 부모 뷰(아빠)
**방식**: 정적 상수 파일 (DB 스키마 변경 없음)

---

## 1. 목표

- 중학교 1/2/3학년 + 고등학교 1/2/3학년 분류 구조 추가
- 각 학년별 표준 교육과정 단원 구분
- 실제 콘텐츠는 중1 위주로 시작, 분류 구조만 전 학년 완비
- 학생(수지)이 직접 학교·학년·단원을 선택해서 문제 풀기

---

## 2. 데이터 구조

### `web/lib/curriculum.ts` (신규)

DB 스키마 변경 없이 기존 `course_code` / `unit_code` 필드를 그대로 사용.
정적 상수 파일로 전체 교육과정 구조를 정의.

```
course_code 규칙: M1~M3 (중학교), H1~H3 (고등학교)
unit_code 규칙: {course_code}U{NN} (예: M1U01, H2U03)
```

**단원 목록**:

| 과정 | 코드 | 단원 |
|------|------|------|
| 중1 | M1U01~M1U07 | 수와 연산, 문자와 식, 좌표평면과 그래프, 기본 도형, 평면도형, 입체도형, 통계 |
| 중2 | M2U01~M2U06 | 수와 식, 부등식과 연립방정식, 일차함수, 삼각형과 사각형, 도형의 닮음, 확률 |
| 중3 | M3U01~M3U06 | 실수와 그 연산, 인수분해와 이차방정식, 이차함수, 삼각비, 원의 성질, 통계 |
| 고1 | H1U01~H1U06 | 다항식, 방정식과 부등식, 도형의 방정식, 집합과 명제, 함수, 경우의 수 |
| 고2 | H2U01~H2U03 | 지수함수와 로그함수, 삼각함수, 수열 |
| 고3 | H3U01~H3U03 | 극한, 미분, 적분 |

---

## 3. 학생 뷰 변경

### 흐름

```
체크인 → /study (홈) → /study/select-unit → /study/practice?course=M1&unit=M1U01
```

### `/study/select-unit` (신규 페이지)

- 상단: 중학교 / 고등학교 탭
- 중단: 학년 선택 (1/2/3학년 버튼)
- 하단: 해당 학년의 단원 목록 (리스트)
  - 문제 있는 단원: 활성 (문제 수 뱃지 표시)
  - 문제 없는 단원: 회색 표시 (선택은 가능)
- 마지막 선택 단원을 `localStorage`에 저장 → 다음 방문 시 복원

### `/study` 홈 변경

- "문제 풀기" 카드 클릭 → `/study/select-unit`으로 이동
- 마지막 선택 단원이 있으면 카드 하단에 표시 (예: "중1 · 수와 연산")

### `/study/practice` 변경

- URL query param `?course=M1&unit=M1U01` 수신
- 해당 `course_code` + `unit_code`로 문제 필터링
- 문제 없을 경우: "이 단원에 아직 문제가 없어요" + 단원 선택 화면으로 돌아가기 버튼

---

## 4. 부모 뷰 변경

### `/parent/problems` 문제 목록

- 상단: 학년 탭 (중1/중2/중3/고1/고2/고3)
- 탭별: 단원 그룹 헤더 + 해당 단원 문제 목록 (아코디언)
  - 문제 있는 단원: 기본 펼침
  - 문제 없는 단원: 접힘 (헤더만 표시)
- 기존 상태 토글(초안/공개/보류) 기능 유지

### `/parent/upload` 업로드 폼

- 업로드 폼 자체는 변경 없음 (Excel 파일 업로드)
- 유효 코드 참조표 추가: `course_code` / `unit_code` 목록을 표 형태로 표시
- 업로드 API에서 유효하지 않은 코드 검출 시 파싱 오류로 안내

---

## 5. 변경 파일 목록

| 파일 | 변경 유형 |
|------|-----------|
| `web/lib/curriculum.ts` | 신규 |
| `web/app/study/select-unit/page.tsx` | 신규 |
| `web/app/study/page.tsx` | 수정 (select-unit으로 연결) |
| `web/app/study/practice/page.tsx` | 수정 (query param 처리) |
| `web/app/study/practice/practice-client.tsx` | 수정 (course/unit 필터) |
| `web/app/parent/problems/page.tsx` | 수정 (학년 탭 + 단원 그룹) |
| `web/app/parent/problems/problems-table.tsx` | 수정 (탭/아코디언 UI) |
| `web/app/parent/upload/upload-form.tsx` | 수정 (코드 참조표 추가) |
| `web/app/api/problems/upload/route.ts` | 수정 (코드 유효성 검증) |

---

## 6. 하지 않는 것

- DB 스키마 변경 (curriculum 테이블 추가 등)
- 중2~고3 실제 문제 콘텐츠 입력
- 강제 단원 추천 (수지가 직접 선택)
- 다중 학생 지원
