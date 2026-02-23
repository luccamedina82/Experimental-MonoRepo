'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 1. Definimos el estado que espera useActionState en tu LoginPage
export type AuthActionState = {
  error: string | null;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export async function login(
  prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // 2. Extraemos los datos del formulario
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 3. Validación básica (puedes usar Zod aquí si lo prefieres)
  if (!email || !password) {
    return {
      error: 'Por favor, completa todos los campos.',
      fieldErrors: {
        email: !email ? 'El email es requerido' : undefined,
        password: !password ? 'La contraseña es requerida' : undefined,
      },
    };
  }

  let isSuccess = false;

  try {
    // 4. Hacemos la petición a tu backend en NestJS
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/auth/login`, { // Ajusta el endpoint según tu API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // 5. Manejamos errores de autenticación
    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        return { error: 'Credenciales incorrectas.', fieldErrors: {} };
      }
      return { error: 'Error interno del servidor. Intenta más tarde.', fieldErrors: {} };
    }

    // 6. El Puente de Cookies (Crucial para que funcione con tu Fastify)
    // Extraemos las cookies que tu backend seteó usando setAuthCookies()
    const setCookies = response.headers.getSetCookie();
    
    // Obtenemos el almacén de cookies de Next.js 15 (ahora es asíncrono)
    const cookieStore = await cookies();

    // Parseamos las cookies del backend y las guardamos en Next.js
    setCookies.forEach((cookieString) => {
      // Un parseo rápido para obtener el nombre y el valor de "access_token=valor; HttpOnly..."
      const [nameValue] = cookieString.split(';');
      if(!nameValue) return; // Si no hay parte de nombre=valor, saltamos
      const [name, value] = nameValue.split('=');

      if (name && value) {
        cookieStore.set(name.trim(), value.trim(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          // maxAge: name.trim() === 'refresh_token' ? 60 * 60 * 24 * 7 : 60 * 15 // Opcional
        });
      }
    });

    isSuccess = true;

  } catch (error) {
    console.error('Error en el login action:', error);
    return { error: 'No se pudo conectar con el servidor.', fieldErrors: {} };
  }

  // 7. Redirección
  // IMPORTANTE: redirect() lanza un error interno de Next.js para cortar la ejecución.
  // Por eso SIEMPRE debe ir fuera del bloque try...catch, sino el catch lo atraparía.
//   if (isSuccess) {
//     redirect('/dashboard'); // Ajusta a tu ruta protegida principal
//   }

  // Retorno de seguridad (teóricamente nunca llega aquí si isSuccess es true)
  return prevState;
}