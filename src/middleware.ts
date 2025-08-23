import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/clerk',
  '/api/products(.*)',
  '/api/categories(.*)', 
  '/api/search(.*)',
  '/live',
  '/trending',
  '/deals',
  '/categories/(.*)',
  '/products/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/callback',
  '/orders',
])

export default clerkMiddleware(async (auth, req) => {
  try {
    // Allow public routes to be accessed without authentication
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }
    
    // For all other routes, require authentication
    const { userId } = await auth()
    if (!userId) {
      // Create redirect URL with return_to parameter
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of any error, allow the request to proceed to avoid blocking
    return NextResponse.next()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
