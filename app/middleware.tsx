// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard')
  const isAuthRoute = pathname.startsWith('/authenticate')

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/authenticate/login', request.url))
  }

  // If accessing protected route with invalid token, redirect to login
  if (isProtectedRoute && token) {
    const session = await verifyToken(token)
    if (!session) {
      const response = NextResponse.redirect(new URL('/authenticate/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (isAuthRoute && token) {
    const session = await verifyToken(token)
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/authenticate/:path*']
}