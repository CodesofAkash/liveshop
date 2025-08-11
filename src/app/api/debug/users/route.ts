import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users to debug structure
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // Get current user specifically
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    // Get products to see sellerId values
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        sellerId: true,
        createdAt: true
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      data: {
        currentUserId: userId,
        currentUser,
        allUsers,
        recentProducts: products,
        analysis: {
          userIdType: typeof currentUser?.id,
          userIdLength: currentUser?.id?.length,
          clerkIdType: typeof currentUser?.clerkId,
          clerkIdLength: currentUser?.clerkId?.length,
        }
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    )
  }
}
