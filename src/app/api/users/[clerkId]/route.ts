import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser, deleteUser, UpdateUserData } from '@/lib/user'

interface RouteParams {
  params: Promise<{ clerkId: string }>
}

// GET /api/users/[clerkId] - Get user by Clerk ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { clerkId } = await params
    const user = await getUserByClerkId(clerkId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only allow users to access their own data or admin access
    if (userId !== clerkId && userId !== user.clerkId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[clerkId] - Update user
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { clerkId } = await params

    // Only allow users to update their own data
    if (userId !== clerkId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const updateData: UpdateUserData = {
      email: body.email,
      name: body.name,
      avatar: body.avatar,
      role: body.role,
      bio: body.bio,
      phone: body.phone,
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof UpdateUserData] === undefined) {
        delete updateData[key as keyof UpdateUserData]
      }
    })

    const user = await updateUser(clerkId, updateData)

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[clerkId] - Delete user
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { clerkId } = await params

    // Only allow users to delete their own data
    if (userId !== clerkId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await deleteUser(clerkId)

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
