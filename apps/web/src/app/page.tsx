
// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <h1>holaaa</h1>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { api } from '@/lib/axios'; // 👈 Asegurate de que la ruta a tu axios sea la correcta

export default function TestAuthPage() {
  const [log, setLog] = useState<string>('Esperando acción...');
  // 1. Botón de Login Rápido
  const loginRapido = async () => {
    try {
      setLog('⏳ Intentando iniciar sesión...');
      
      const res = await api.post('/auth/login', {
        email: 'usuario@padelgo.com',
        password: 'password123',
      });

      console.log('Respuesta del login:', res.data);
      setLog('✅ ¡Login exitoso! Ahora esperá 6 segundos y apretá el otro botón.');
    } catch (error) {
      console.error('Error en login:', error);
      setLog('❌ Falló el login. Revisá la consola.');
    }
  };

  // 2. Botón para testear el Interceptor (el que armamos antes)
  const probarRutaProtegida = async () => {
    try {
      setLog('🚀 Disparando petición a /user/me...');
      const res = await api.get('/user/me'); // 👈 Cambiá esta ruta si la tuya se llama distinto
      
      console.log('Datos recibidos:', res.data);
      setLog('✅ ¡Éxito! El interceptor nos salvó la vida.');
    } catch (error) {
      console.error('Error en la ruta protegida:', error);
      setLog('❌ Falló todo, el patovica no nos dejó pasar.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Laboratorio de Pruebas PadelGO 🧪</h1>
      
      <div className="flex gap-4">
        <button 
          onClick={loginRapido} 
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
        >
          1. Login Rápido
        </button>

        <button 
          onClick={probarRutaProtegida} 
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          2. Golpear API Protegida
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded border w-full max-w-md text-center font-mono text-sm text-gray-800">
        {log}
      </div>
    </div>
  );
}