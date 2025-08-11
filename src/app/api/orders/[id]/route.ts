import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// GET /api/orders/[id] - Fetch single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const order = await prisma.order.findFirst({
      where: { 
        id: params.id,
        buyerId: user.id, // ✅ Use user's MongoDB ObjectId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                name: true, // ✅ Include both for compatibility
                images: true,
                price: true,
                brand: true,
                seller: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // ✅ Transform data to match frontend expectations
    const transformedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          title: item.product.title || item.product.name, // ✅ Ensure title exists
        }
      }))
    }

    return NextResponse.json({
      success: true,
      data: transformedOrder,
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { status, trackingNumber, adminNotes } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Check if order exists and user owns it
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        buyerId: user.id, // ✅ Use user's MongoDB ObjectId
      },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status: status.toUpperCase(), // ✅ Convert to uppercase for enum
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}