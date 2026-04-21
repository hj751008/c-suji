import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RoleSelector from './role-selector'

export default async function SelectRolePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">수지 수학</h1>
          <p className="text-gray-500 mt-2 text-sm">누구로 시작할까요?</p>
        </div>
        <RoleSelector />
      </div>
    </div>
  )
}
