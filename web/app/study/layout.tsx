import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function StudyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    // 모바일 최적화: 최대 너비 고정, 세로 전체
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {children}
    </div>
  )
}
