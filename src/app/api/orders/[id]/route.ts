import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// GET /api/orders/[id] - Fetch single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params for Next.js 15+
    const { id } = await params

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
        id: id,
        buyerId: user.id, // ✅ Use user's MongoDB ObjectId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
                price: true,
                brand: true,
                sellerId: true, // ✅ Get sellerId to fetch seller separately
              },
            },
          },
        },
        // ✅ Remove buyer relation to avoid the relation error
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // ✅ Transform data to match frontend expectations and fetch sellers
    const transformedOrder = {
      ...order,
      buyer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      items: await Promise.all(order.items.map(async item => {
        // Fetch seller information separately with fallback
        let seller = null;
        try {
          // Try to find seller by MongoDB ObjectId first
          seller = await prisma.user.findUnique({
            where: { id: item.product.sellerId },
            select: { id: true, name: true }
          });
          
          // If not found, try by clerkId (for legacy products)
          if (!seller) {
            seller = await prisma.user.findUnique({
              where: { clerkId: item.product.sellerId },
              select: { id: true, name: true }
            });
          }
        } catch (sellerError) {
          console.warn('Could not fetch seller:', sellerError);
        }

        return {
          ...item,
          product: {
            ...item.product,
            title: item.product.title, // ✅ Use title field
            seller: seller || { id: 'unknown', name: 'Unknown Seller' }
          }
        };
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params for Next.js 15+
    const { id } = await params

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
    const { status, trackingNumber, adminNotes, paymentStatus, paymentMethod, paymentId } = body

    // Either status or paymentStatus should be provided
    if (!status && !paymentStatus) {
      return NextResponse.json(
        { success: false, error: 'Status or payment status is required' },
        { status: 400 }
      )
    }

    // Check if order exists and user owns it
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: id,
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
      where: { id: id },
      data: { 
        ...(status && { status: status.toUpperCase() }), // ✅ Convert to uppercase for enum
        ...(paymentStatus && { paymentStatus: paymentStatus.toUpperCase() }),
        ...(paymentMethod && { paymentMethod }),
        ...(paymentId && { paymentId }),
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