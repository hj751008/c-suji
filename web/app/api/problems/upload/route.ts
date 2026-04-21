import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseExcel } from '@/lib/excel-parser'
import { VALID_COURSE_CODES, VALID_UNIT_CODES } from '@/lib/curriculum'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const courseCode = formData.get('courseCode') as string | null
  const unitCode = formData.get('unitCode') as string | null

  if (!file) {
    return NextResponse.json({ error: '파일 없음' }, { status: 400 })
  }

  if (!courseCode || !VALID_COURSE_CODES.has(courseCode)) {
    return NextResponse.json({ error: '유효하지 않은 course_code입니다' }, { status: 400 })
  }

  if (!unitCode || !VALID_UNIT_CODES.has(unitCode)) {
    return NextResponse.json({ error: '유효하지 않은 unit_code입니다' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const { problems, errors } = parseExcel(buffer, courseCode, unitCode)

  if (problems.length === 0) {
    return NextResponse.json(
      { error: '유효한 문제가 없습니다', parseErrors: errors },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('problems')
    .insert(problems)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    inserted: data.length,
    parseErrors: errors,
  })
}
