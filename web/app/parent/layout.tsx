import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'

export default async function ParentLayout({
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/parent" className="font-bold text-gray-900">
            수지 수학 관리
          </Link>
          <Link href="/parent" className="text-sm text-gray-600 hover:text-gray-900">
            대시보드
          </Link>
          <Link href="/parent/problems" className="text-sm text-gray-600 hover:text-gray-900">
            문제 목록
          </Link>
          <Link href="/parent/upload" className="text-sm text-gray-600 hover:text-gray-900">
            업로드
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/select-role" className="text-sm text-gray-500 hover:text-gray-700">
            역할 변경
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-sm text-red-500 hover:text-red-700">
              로그아웃
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
