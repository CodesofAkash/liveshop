import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Check if user exists in database, create if not
    const response = await fetch(new URL('/api/users', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        avatar: user.imageUrl || null,
      }),
    })

    if (!response.ok) {
      console.error('Failed to create/verify user in database')
    }

    // Redirect to home page after successful authentication
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}
