# 03_EXCEL_UPLOAD_SPEC_MIN.md

문서 목적: 외부에서 만든 문제를 앱으로 가져오기 위한 **최소 Excel 업로드 형식**을 고정한다.

## 1. 파일 형식
- `.xlsx`
- 시트명 권장: `problem_upload`

## 2. 필수 컬럼
1. `course_code`
2. `unit_code`
3. `skill_code_main`
4. `problem_type`
5. `difficulty_level`
6. `question_text`
7. `answer_type`
8. `correct_answer`
9. `hint_level_1`
10. `hint_level_2`
11. `full_solution`
12. `status`

## 3. 선택 컬럼
- `title`
- `choice_1`
- `choice_2`
- `choice_3`
- `choice_4`
- `common_wrong_reason`
- `recovery_feedback_basic`
- `uploader_note`

## 4. 값 규칙
### `problem_type`
- `concept_identification`
- `start_point`
- `calculation`
- `mixed_concept`
- `application_entry`

### `answer_type`
- `multiple_choice`
- `short_answer`
- `subjective`

### `status`
- `draft`
- `published`
- `blocked`

## 5. 업로드 원칙
- 업로드 기본 권장 상태는 `draft`
- 검토 후 `published`로 전환
- 학생에게는 `published`만 노출
