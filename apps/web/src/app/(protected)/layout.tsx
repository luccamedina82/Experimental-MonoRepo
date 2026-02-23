import {cookies} from 'next/headers';
import { UserProvider } from '@/providers/UserContext';
import { redirect } from 'next/navigation';


export default async function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${apiUrl}/user/me`, {
    method: 'GET',
    headers: {
        Cookie: `token=${token}`,
    },
    cache: 'no-store',
    next: { tags: ['perfil-usuario'] }
  });

  if (!response.ok) {
    redirect('/login');
  }
  const userData = await response.json();

  console.log('yo me estoy re renderizando soy el layout de protected')
  const horaServidor = new Date().toLocaleTimeString();

  return (
      <UserProvider initialUser={userData}>
        <main className='min-h-screen bg-gray-50'>
        <h2>Layout del Dashboard (Servidor)</h2>
        <p>Última actualización del servidor: <strong>{horaServidor}</strong></p>
        
         {children}
        </main>
      </UserProvider>

      
  );
}
