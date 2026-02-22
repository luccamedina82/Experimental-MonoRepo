// src/components/auth-hydrator.tsx

'use client'

import { useRef } from 'react'
import { useAuthStore, type AuthUser } from '@/stores/auth-store'

interface AuthHydratorProps {
  user: AuthUser
  children: React.ReactNode
}

export function AuthHydrator({ user, children }: AuthHydratorProps) {
  const hydrated = useRef(false)

  if (!hydrated.current) {
    useAuthStore.setState({ user })
    hydrated.current = true
  }

  return <>{children}</>
}
