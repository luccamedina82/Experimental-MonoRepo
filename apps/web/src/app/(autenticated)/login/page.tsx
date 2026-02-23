'use client'

import { useActionState } from "react";
import { login, type AuthActionState } from "@/app/actions/auth";

const initialState: AuthActionState = {
  error: null,
  fieldErrors: {},
}

export default function LoginPage() {
  // useActionState recibe la acción y el estado inicial.
  // Devuelve: [estadoActual, funcionFormulario, estadoDeCarga]
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Reemplazamos action={login} por action={formAction} */}
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4 p-8">
        <h1 className="text-2xl font-bold">Iniciar Sesión</h1>

        {/* Mensaje de error general (ej: "Credenciales inválidas") */}
        {state.error && (
          <div className="rounded bg-red-100 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded border px-3 py-2"
          />
          {/* Errores específicos del campo email */}
          {state.fieldErrors?.email && (
            <span className="text-xs text-red-600">{state.fieldErrors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="rounded border px-3 py-2"
          />
          {/* Errores específicos del campo contraseña */}
          {state.fieldErrors?.password && (
            <span className="text-xs text-red-600">{state.fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}