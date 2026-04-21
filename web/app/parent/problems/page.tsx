import { createClient } from '@/lib/supabase/server'
import ProblemsTable from './problems-table'

export default async function ProblemsPage() {
  const supabase = await createClient()
  const { data: problems } = await supabase
    .from('problems')
    .select('*')
    .order('unit_code')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">문제 목록</h1>
        <div className="text-sm text-gray-500">
          총 {problems?.length ?? 0}개
        </div>
      </div>
      <ProblemsTable initialProblems={problems ?? []} />
    </div>
  )
}
