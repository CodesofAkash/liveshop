import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

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
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes to be accessed without authentication
  if (isPublicRoute(req)) {
    return
  }
  
  // For all other routes, require authentication
  const { userId } = await auth()
  if (!userId) {
    // This will redirect to sign-in
    return Response.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
