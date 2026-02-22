// protected/layout

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthHydrator } from '@/components/auth-hydrator'
import type { AuthUser } from '@/stores/auth-store'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const res = await fetch(`${process.env.API_URL_INTERNAL}/user/me`, {
    headers: { Cookie: `token=${token}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    redirect('/login')
  }

  const user: AuthUser = await res.json()

  return <AuthHydrator user={user}>{children}</AuthHydrator>
}
