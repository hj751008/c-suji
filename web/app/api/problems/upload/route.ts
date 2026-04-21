import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseExcel } from '@/lib/excel-parser'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: '파일 없음' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const { problems, errors } = parseExcel(buffer)

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
