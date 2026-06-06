import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Read the auth token cookie set by the backend
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = pathname === '/login' || pathname === '/signup';

  if (isPublicRoute && token) {
    // If user is logged in, they shouldn't access login/signup. Redirect to dashboard.
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute && !token) {
    // If user is not logged in and tries to access private pages, redirect to login.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, and favicon
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
