import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup') || request.nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname === '/favicon.ico';

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the tokens from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;

  // If no token and trying to access a protected route, redirect to login
  if (!accessToken && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a token and user is trying to access login page, redirect to dashboard
  if (accessToken && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
