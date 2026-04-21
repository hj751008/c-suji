import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProblemStatus } from '@/lib/supabase/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  }

  const body = await request.json()
  const { status } = body as { status: ProblemStatus }

  const validStatuses: ProblemStatus[] = ['draft', 'published', 'blocked']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: '잘못된 상태값' }, { status: 400 })
  }

  const { error } = await supabase
    .from('problems')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
