import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUser, CreateUserData } from '@/lib/user'

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const userData: CreateUserData = {
      clerkId: body.clerkId || userId,
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
