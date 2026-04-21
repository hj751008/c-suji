// web/lib/curriculum.ts

export interface Unit {
  code: string
  name: string
}

export interface Course {
  code: string
  name: string
  schoolType: 'middle' | 'high'
  grade: 1 | 2 | 3
  units: Unit[]
}

export const CURRICULUM: Course[] = [
  {
    code: 'M1',
    name: '중학교 1학년',
    schoolType: 'middle',
    grade: 1,
    units: [
      { code: 'M1U01', name: '수와 연산' },
      { code: 'M1U02', name: '문자와 식' },
      { code: 'M1U03', name: '좌표평면과 그래프' },
      { code: 'M1U04', name: '기본 도형' },
      { code: 'M1U05', name: '평면도형' },
      { code: 'M1U06', name: '입체도형' },
      { code: 'M1U07', name: '통계' },
    ],
  },
  {
    code: 'M2',
    name: '중학교 2학년',
    schoolType: 'middle',
    grade: 2,
    units: [
      { code: 'M2U01', name: '수와 식' },
      { code: 'M2U02', name: '부등식과 연립방정식' },
      { code: 'M2U03', name: '일차함수' },
      { code: 'M2U04', name: '삼각형과 사각형' },
      { code: 'M2U05', name: '도형의 닮음' },
      { code: 'M2U06', name: '확률' },
    ],
  },
  {
    code: 'M3',
    name: '중학교 3학년',
    schoolType: 'middle',
    grade: 3,
    units: [
      { code: 'M3U01', name: '실수와 그 연산' },
      { code: 'M3U02', name: '인수분해와 이차방정식' },
      { code: 'M3U03', name: '이차함수' },
      { code: 'M3U04', name: '삼각비' },
      { code: 'M3U05', name: '원의 성질' },
      { code: 'M3U06', name: '통계' },
    ],
  },
  {
    code: 'H1',
    name: '고등학교 1학년',
    schoolType: 'high',
    grade: 1,
    units: [
      { code: 'H1U01', name: '다항식' },
      { code: 'H1U02', name: '방정식과 부등식' },
      { code: 'H1U03', name: '도형의 방정식' },
      { code: 'H1U04', name: '집합과 명제' },
      { code: 'H1U05', name: '함수' },
      { code: 'H1U06', name: '경우의 수' },
    ],
  },
  {
    code: 'H2',
    name: '고등학교 2학년',
    schoolType: 'high',
    grade: 2,
    units: [
      { code: 'H2U01', name: '지수함수와 로그함수' },
      { code: 'H2U02', name: '삼각함수' },
      { code: 'H2U03', name: '수열' },
    ],
  },
  {
    code: 'H3',
    name: '고등학교 3학년',
    schoolType: 'high',
    grade: 3,
    units: [
      { code: 'H3U01', name: '극한' },
      { code: 'H3U02', name: '미분' },
      { code: 'H3U03', name: '적분' },
    ],
  },
]

/** course_code로 Course 객체 반환. 없으면 undefined. */
export function getCourse(courseCode: string): Course | undefined {
  return CURRICULUM.find((c) => c.code === courseCode)
}

/** unit_code로 Unit 객체 반환. 없으면 undefined. */
export function getUnit(unitCode: string): Unit | undefined {
  for (const course of CURRICULUM) {
    const unit = course.units.find((u) => u.code === unitCode)
    if (unit) return unit
  }
  return undefined
}

/** 유효한 course_code 집합 */
export const VALID_COURSE_CODES = new Set(CURRICULUM.map((c) => c.code))

/** 유효한 unit_code 집합 */
export const VALID_UNIT_CODES = new Set(
  CURRICULUM.flatMap((c) => c.units.map((u) => u.code))
)
