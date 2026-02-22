// dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/use-auth'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p>Bienvenido, {user.email}</p>}
      <button
        onClick={logout}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Cerrar Sesion
      </button>
    </div>
  )
}
