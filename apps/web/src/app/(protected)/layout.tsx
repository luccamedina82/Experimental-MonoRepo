import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function fetchMe(token: string, refreshToken?: string) {
  const res = await fetch(`${process.env.API_URL_INTERNAL}/user/me`, {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: 'no-store',
  })
  if (res.ok) {
    return { user: await res.json(), refreshed: false }
  }

  // Si el access token expiró, intentar refresh
  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${process.env.API_URL_INTERNAL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
      cache: 'no-store',
    })

    if (!refreshRes.ok) {
      return { user: null, refreshed: false }
    }

    // Extraer las nuevas cookies del response del refresh
    const setCookieHeaders = refreshRes.headers.getSetCookie()
    let newToken: string | undefined

    for (const cookieHeader of setCookieHeaders) {
      const match = cookieHeader.match(/^token=([^;]+)/)
      if (match) {
        newToken = match[1]
      }
    }

    if (!newToken) {
      return { user: null, refreshed: false }
    }

    // Reintentar con el nuevo token
    const retryRes = await fetch(`${process.env.API_URL_INTERNAL}/user/me`, {
      headers: {
        Cookie: `token=${newToken}`,
      },
      cache: 'no-store',
    })

    if (!retryRes.ok) {
      return { user: null, refreshed: false }
    }

    return { user: await retryRes.json(), refreshed: true, setCookieHeaders }
  }

  return { user: null, refreshed: false }
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value
  if (!token && !refreshToken) {
    redirect('/login')
  }
  const result = await fetchMe(token ?? '', refreshToken)

  if (!result.user) {
    redirect('/login')
  }

  const user = result.user
  console.log(user)
  return <div>{children}</div>
}
