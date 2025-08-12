import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { User } from '@prisma/client'

/**
 * Custom hook to get user data from your database
 * This will automatically sync the user if they don't exist in your DB
 */
export function useDbUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser()
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) {
      setDbUser(null)
      return
    }

    const fetchDbUser = async () => {
      setLoading(true)
      setError(null)

      try {
        // First try to get the user from your database
        const response = await fetch(`/api/users/${clerkUser.id}`)
        
        if (response.ok) {
          const userData = await response.json()
          setDbUser(userData)
        } else if (response.status === 404) {
          // User doesn't exist in DB, create them
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: clerkUser.id,
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
              avatar: clerkUser.imageUrl || null,
            }),
          })

          if (createResponse.ok) {
            const newUser = await createResponse.json()
            setDbUser(newUser)
          } else {
            throw new Error('Failed to create user in database')
          }
        } else {
          throw new Error('Failed to fetch user data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchDbUser()
  }, [clerkUser, isLoaded, isSignedIn])

  return {
    user: dbUser,
    loading,
    error,
    isLoaded,
    isSignedIn,
  }
}

/**
 * Hook to update user data in the database
 */
export function useUpdateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUser = async (userId: string, userData: Partial<User>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const updatedUser = await response.json()
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    updateUser,
    loading,
    error,
  }
}
