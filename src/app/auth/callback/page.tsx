'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      // Ensure user exists in database
      const ensureUserInDatabase = async () => {
        try {
          const response = await fetch('/api/users', {
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

          if (response.ok) {
            // User successfully created/verified, redirect to home
            router.push('/')
          } else {
            console.error('Failed to ensure user in database')
            // Still redirect to home as user is authenticated
            router.push('/')
          }
        } catch (error) {
          console.error('Error ensuring user in database:', error)
          // Still redirect to home as user is authenticated
          router.push('/')
        }
      }

      ensureUserInDatabase()
    } else if (isLoaded && !user) {
      // User not authenticated, redirect to sign-in
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg">Setting up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  )
}
