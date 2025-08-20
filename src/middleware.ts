import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that require authentication
const protectedPaths = [
  '/hackathons/my',
  '/profile',
  '/organizer/dashboard',
  '/organizer/profile',
  '/judge/dashboard',
  '/judge/profile'
]

// Add paths that should redirect to dashboard if already authenticated
const authPaths = [
  '/login',
  '/signup',
  '/organizer/login',
  '/organizer/signup',
  '/judge/login'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('authToken')?.value
  const userType = request.cookies.get('userType')?.value

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // If accessing a protected path without authentication, redirect to login
  if (isProtectedPath && !authToken) {
    // Route to role-specific login if path indicates organizer/judge areas
    const loginPath = pathname.startsWith('/organizer')
      ? '/organizer/login'
      : pathname.startsWith('/judge')
      ? '/judge/login'
      : '/login'
    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth pages while already authenticated, redirect to appropriate dashboard
  if (isAuthPath && authToken) {
    const dest = userType === 'organizer'
      ? '/organizer/dashboard'
      : userType === 'judge'
      ? '/judge/dashboard'
      : '/hackathons/my'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
