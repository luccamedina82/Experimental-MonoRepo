// actions/auth.ts

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginSchema } from '@repo/shared'
import { forwardSetCookieHeaders } from '@/lib/cookies'

export interface AuthActionState {
  error: string | null
  fieldErrors: {
    email?: string
    password?: string
  }
}

export async function loginAction(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    const fieldErrors: AuthActionState['fieldErrors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof typeof fieldErrors
      if (field) {
        fieldErrors[field] = issue.message
      }
    }
    return { error: null, fieldErrors }
  }

  try {
    const response = await fetch(`${process.env.API_URL_INTERNAL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const message = body?.message || 'Credenciales invalidas'
      return {
        error: typeof message === 'string'
          ? message
          : message[0] || 'Error de autenticacion',
        fieldErrors: {},
      }
    }

    const setCookieHeaders = response.headers.getSetCookie()
    if (setCookieHeaders.length > 0) {
      await forwardSetCookieHeaders(setCookieHeaders)
    }
  } catch {
    return { error: 'Error de conexion con el servidor', fieldErrors: {} }
  }

  redirect('/dashboard')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  cookieStore.delete('refresh_token')
  redirect('/login')
}
