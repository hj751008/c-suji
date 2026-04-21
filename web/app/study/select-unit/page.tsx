// web/app/study/select-unit/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UnitSelector from './unit-selector'

export default async function SelectUnitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // published 문제 수를 unit_code별로 집계
  const { data: rows } = await supabase
    .from('problems')
    .select('unit_code')
    .eq('status', 'published')

  const problemCounts: Record<string, number> = {}
  for (const row of rows ?? []) {
    problemCounts[row.unit_code] = (problemCounts[row.unit_code] ?? 0) + 1
  }

  return <UnitSelector problemCounts={problemCounts} />
}
