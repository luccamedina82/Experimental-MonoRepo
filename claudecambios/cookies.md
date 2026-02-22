// src/lib/cookies.ts
import { cookies } from 'next/headers'

export async function forwardSetCookieHeaders(
  setCookieHeaders: string[],
): Promise<void> {
  const cookieStore = await cookies()

  for (const header of setCookieHeaders) {
    const parts = header.split(';').map((p) => p.trim())
    const [nameValue, ...attributes] = parts

    if (!nameValue) continue

    const eqIndex = nameValue.indexOf('=')
    if (eqIndex === -1) continue

    const name = nameValue.substring(0, eqIndex)
    const value = nameValue.substring(eqIndex + 1)

    const options: Record<string, unknown> = {}
    for (const attr of attributes) {
      const lower = attr.toLowerCase()
      if (lower === 'httponly') options.httpOnly = true
      else if (lower === 'secure') options.secure = true
      else if (lower.startsWith('path=')) options.path = attr.split('=')[1]
      else if (lower.startsWith('max-age='))
        options.maxAge = parseInt(attr.split('=')[1]!, 10)
      else if (lower.startsWith('samesite='))
        options.sameSite = attr.split('=')[1]!.toLowerCase() as
          | 'lax'
          | 'strict'
          | 'none'
    }

    cookieStore.set(name, value, options)
  }
}
