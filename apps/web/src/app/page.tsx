'use client'

import { useActionState, startTransition } from "react";
import {test} from "./actions/test";


export default function Home() {
  const [state ,formAction, isPending] = useActionState(test, {success: false});

  return (
    <div>
      <h1>Home</h1>
      <h2>Estado: {state.success ? "True" : "False"}</h2>
      <h3>{isPending ? "Cargando..." : "Test"}</h3>
      <form action={formAction}>
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          type="submit"
          >
            Button
        </button>
      </form>
    </div>
  )
}
