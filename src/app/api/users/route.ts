import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByClerkId, CreateUserData } from '@/lib/user'

// POST /api/users - Create a new user or return existing user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const clerkId = body.clerkId
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Clerk ID is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUser = await getUserByClerkId(clerkId)
      if (existingUser) {
        return NextResponse.json(existingUser, { status: 200 })
      }
    } catch {
      // User doesn't exist, continue to create
    }

    const userData: CreateUserData = {
      clerkId: clerkId,
      email: body.email,
      name: body.name,
      avatar: body.avatar,
      role: body.role || 'BUYER',
      bio: body.bio,
      phone: body.phone,
    }

    const user = await createUser(userData)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
