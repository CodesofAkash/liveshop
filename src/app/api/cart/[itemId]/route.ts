import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// PUT /api/cart/[itemId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { itemId } = await params
    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Find user by clerkId to get MongoDB ObjectId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Find the cart item and verify it belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id
        }
      },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Check if requested quantity is available
    if (cartItem.product.inventory < quantity) {
      return NextResponse.json(
        { success: false, error: 'Insufficient inventory' },
        { status: 400 }
      )
    }

    // Update the cart item
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCartItem,
      message: 'Cart item updated successfully'
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { itemId } = await params

    // Find user by clerkId to get MongoDB ObjectId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Find the cart item and verify it belongs to the user
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id
        }
      }
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    )
  }
}
