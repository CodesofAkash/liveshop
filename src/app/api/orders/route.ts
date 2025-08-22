import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { OrderStatus, Prisma } from '@prisma/client'

// GET /api/orders - Fetch user orders
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First, find the user by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    // If user doesn't exist, create them first
    if (!user) {
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            avatar: clerkUser.imageUrl || null,
            role: 'BUYER',
          }
        })
      } catch (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create user account' },
          { status: 500 }
        )
      }
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    // Build where clause using user's MongoDB ObjectId
    const where: { buyerId: string; status?: OrderStatus } = { buyerId: user.id }
    if (status) {
      where.status = status.toUpperCase() as OrderStatus // ✅ Convert to uppercase for enum
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  price: true,
                },
              },
            },
          },
          // ✅ Remove buyer relation to avoid the relation error
        },
      }),
      prisma.order.count({ where }),
    ])

    // ✅ Transform data to match frontend expectations and add buyer info
    const transformedOrders = orders.map((order: unknown) => ({
      ...(order as Record<string, unknown>),
      buyer: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      items: (order as { items: { product: { title: string; [key: string]: unknown }; [key: string]: unknown }[] }).items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          // Ensure consistent field naming
          name: item.product.title, // Map title to name for compatibility
        }
      }))
    }))

    return NextResponse.json({
      success: true,
      data: transformedOrders, // ✅ Change from { orders, pagination } to just orders
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    // If user doesn't exist, create them first
    if (!user) {
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            avatar: clerkUser.imageUrl || null,
            role: 'BUYER',
          }
        })
      } catch (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create user account' },
          { status: 500 }
        )
      }
    }

    const body = await request.json()
    const { items, shippingAddress, paymentStatus, paymentMethod, discount = 0 } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in order' },
        { status: 400 }
      )
    }

    // Calculate totals and validate products
    let subtotal = 0
    const orderItems: {
      productId: string,
      quantity: number,
      price: number,
    }[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }

      if (product.inventory < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient inventory for ${product.title}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      })
    }

    // Calculate other amounts
    const tax = (subtotal - discount) * 0.18 // 18% GST on discounted amount
    const shipping = subtotal > 500 ? 0 : 50 // Free shipping over ₹500
    const total = subtotal - discount + tax + shipping

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create order with transaction
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // First create the order without items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId, // Add the missing userId field from Clerk auth
          buyerId: user.id,
          subtotal,
          discount,
          tax,
          shipping,
          total,
          status: 'PENDING',
          paymentStatus: paymentStatus || 'PENDING',
          paymentMethod,
          shippingAddress: shippingAddress || {},
        },
      })

      // Then create the order items
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          ...item,
          orderId: newOrder.id,
        })),
      })

      // Update product inventory
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Return the order with items fetched separately
      const orderWithItems = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      return orderWithItems
    })

    // ✅ Fetch buyer information separately to avoid relation issues
    const orderWithBuyer = {
      ...order,
      buyer: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    }

    return NextResponse.json({
      success: true,
      data: orderWithBuyer,
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create order',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}