// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard']
const authRoutes = ['/login']

function parseCookieHeader(header: string) {
  const parts = header.split(';').map((p) => p.trim())
  const [nameValue, ...attributes] = parts

  if (!nameValue) return null

  const eqIndex = nameValue.indexOf('=')
  if (eqIndex === -1) return null

  const name = nameValue.substring(0, eqIndex)
  const value = nameValue.substring(eqIndex + 1)

  const options: Record<string, string | number | boolean> = {}
  for (const attr of attributes) {
    const lower = attr.toLowerCase()
    if (lower === 'httponly') options.httpOnly = true
    else if (lower === 'secure') options.secure = true
    else if (lower.startsWith('path=')) options.path = attr.split('=')[1]!
    else if (lower.startsWith('max-age='))
      options.maxAge = parseInt(attr.split('=')[1]!, 10)
    else if (lower.startsWith('samesite='))
      options.sameSite = attr.split('=')[1]!.toLowerCase()
  }

  return { name, value, options }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasAccessToken = request.cookies.has('token')
  const hasRefreshToken = request.cookies.has('refresh_token')
  const hasAnyAuth = hasAccessToken || hasRefreshToken

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )

  if (isProtected && !hasAnyAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Access token expired but refresh token exists — refresh tokens
  if (isProtected && !hasAccessToken && hasRefreshToken) {
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const refreshRes = await fetch(
        `${process.env.API_URL_INTERNAL}/auth/refresh`,
        {
          method: 'POST',
          headers: { Cookie: `refresh_token=${refreshToken}` },
          cache: 'no-store',
        },
      )

      if (!refreshRes.ok) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      // Forward refreshed cookies to the browser AND the downstream request
      const response = NextResponse.next()
      const setCookieHeaders = refreshRes.headers.getSetCookie()

      for (const header of setCookieHeaders) {
        const parsed = parseCookieHeader(header)
        if (parsed) {
          response.cookies.set(parsed.name, parsed.value, parsed.options)
        }
      }

      return response
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  if (isAuthRoute && hasAnyAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
