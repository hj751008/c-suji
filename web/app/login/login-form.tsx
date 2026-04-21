'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/app/actions/auth'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')

  return (
    <form action={signIn} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="이메일 입력"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호 입력"
          required
          autoComplete="current-password"
        />
      </div>
      {hasError && (
        <p className="text-sm text-red-500 text-center">
          이메일 또는 비밀번호가 올바르지 않습니다.
        </p>
      )}
      <Button type="submit" className="w-full">
        로그인
      </Button>
    </form>
  )
}
