import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const cookieStore = await cookies()
  // const hasToken = cookieStore.has('token')
  // const hasRefreshToken = cookieStore.has('refresh_token')

  // if (hasToken || hasRefreshToken) {
  //   redirect('/dashboard')
  // }

  return <div>{children}</div>
}
