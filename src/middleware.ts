import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl

  // Only run this middleware on the root path
  if (pathname === '/') {
    // Check if the user is authenticated by looking for the payload-token cookie
    const payloadToken = request.cookies.get('payload-token')

    // If there's no token, redirect to the admin login
    if (!payloadToken) {
      // Create a redirect URL to the admin login
      const redirectUrl = new URL('/admin/login', request.url)

      // Store the original URL to redirect back after login
      redirectUrl.searchParams.set('redirect', '/')

      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

// Only run the middleware on the home route
export const config = {
  matcher: '/',
}
