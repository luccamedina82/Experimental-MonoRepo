import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET
const encodedToken = new TextEncoder().encode(JWT_SECRET)

export default async function proxy(request: NextRequest) {
    const accessToken = request.cookies.get('token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    if (!accessToken && !refreshToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        if (accessToken) {
            await jwtVerify(accessToken, encodedToken);
            return NextResponse.next();
        } 
    } catch (error) {
        console.log('token expirado o invalido, intentando refresh')
    }

    if (!refreshToken) {
        return expulsarAlLogin(request);
    }
    
    try {
        const apiUrl = process.env.API_URL_INTERNAL || 'http://localhost:3000';
        const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                Cookie: `refresh_token=${refreshToken}`,
            },
            cache: 'no-store',
        })
        if (!refreshResponse.ok) {
            throw new Error('Refresh token invalido o expirado en el backend');
        }
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        const requestHeaders = new Headers(request.headers);
        
        if (!setCookieHeaders || setCookieHeaders.length === 0) {
            throw new Error('No se recibieron cookies de refresh');
        }

        setCookieHeaders.forEach((cookieString) => {
            requestHeaders.append('cookie', cookieString.split(';')[0] || '');
            console.log('cookie', cookieString.split(';')[0] || '');
        });

        const response = NextResponse.next({
            request: { headers: requestHeaders },
        });
        setCookieHeaders.forEach((cookieString) => {
            response.headers.append('Set-Cookie', cookieString);
        });
        
        return response;

    } catch (error) {
        console.error('Fallo la renovacion del token', error);
        return expulsarAlLogin(request);
    }

}

function expulsarAlLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('token');
  response.cookies.delete('refresh_token');
  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};