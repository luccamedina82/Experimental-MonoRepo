// src/stores/auth-store.ts


import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
