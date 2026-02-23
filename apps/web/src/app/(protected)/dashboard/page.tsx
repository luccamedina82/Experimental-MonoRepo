'use client'
import { useUser } from "@/providers/UserContext"
import { test } from "@/app/actions/test";
import { useActionState } from "react";
export default function Dashboard() {
  const user = useUser();
  const [state, executeAction, isPending] = useActionState(test, {success: false});
  return (

    <div>
      <div>Dashboard {user?.user?.email}</div>
<h2>Página (Cliente)</h2>
      
      {/* LA TRAMPA: Si el navegador hace F5, lo que escribas aquí desaparecerá */}
      <input 
        type="text" 
        placeholder="Escribe algo aquí..." 
        className="border p-2 mb-4 block"
      />

      <form action={executeAction}>
        <button type="submit" className="bg-green-500 text-white p-2">
          {isPending ? "Revalidando..." : "Ejecutar revalidatePath('/dashboard', 'layout')"}
        </button>
      </form>
    </div>
  )
}
