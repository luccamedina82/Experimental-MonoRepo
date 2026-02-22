// src/hooks/use-auth.ts

'use client'

import { useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { logoutAction } from '@/app/actions/auth'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)

  const logout = useCallback(async () => {
    clearUser()
    await logoutAction()
  }, [clearUser])

  return {
    user,
    isAuthenticated: !!user,
    logout,
  }
}
