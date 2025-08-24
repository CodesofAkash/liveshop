import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'

interface ReviewWithRating {
  id: string
  rating: number
}

// GET /api/products/[id] - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch product with all relevant fields
    const productBasic = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        name: true,
        description: true,
        price: true,
        inventory: true,
        category: true,
        attributes: true,
        images: true,
        sellerId: true,
        status: true,
        inStock: true,
        featured: true,
        slug: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        brand: true,
      },
    })

    if (!productBasic) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get seller info
    let seller = null
    try {
      seller = await prisma.user.findUnique({
        where: { id: productBasic.sellerId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })
      if (!seller) {
        seller = await prisma.user.findUnique({
          where: { clerkId: productBasic.sellerId },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        })
      }
    } catch (sellerError) {
      console.error('Error fetching seller:', sellerError)
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, review: ReviewWithRating) => sum + review.rating, 0) / reviews.length
      : 0

    // Compose product response
    const product = {
      id: productBasic.id,
      title: productBasic.title || productBasic.name,
      name: productBasic.name,
      description: productBasic.description,
      price: productBasic.price,
      inventory: productBasic.inventory,
      category: productBasic.category,
      attributes: productBasic.attributes,
      images: productBasic.images,
      seller,
      status: productBasic.status,
      inStock: productBasic.inStock,
      featured: productBasic.featured,
      slug: productBasic.slug,
      tags: productBasic.tags,
      createdAt: productBasic.createdAt,
      updatedAt: productBasic.updatedAt,
      brand: productBasic.brand,
      reviews,
      rating: averageRating,
      reviewCount: reviews.length,
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (owner only)
export async function PUT(
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

    const { id } = await params

    // Find user by clerkId to get MongoDB ObjectId
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
            role: 'SELLER',
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

    // Check if product exists and user owns it
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (existingProduct.sellerId !== user.id) { // ✅ Compare with user.id instead of userId
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only update your own products' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, price, images, category, inventory, attributes } = body

    // Update product
    const product = await prisma.product.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(images && { images }),
        ...(category && { category }),
        ...(inventory !== undefined && { inventory: parseInt(inventory) }),
        ...(attributes && { attributes }),
        updatedAt: new Date(),
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id] - Delete product (owner only)
export async function DELETE(
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

    const { id } = await params

    // Find user by clerkId to get MongoDB ObjectId
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
            role: 'SELLER',
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

    // Check if product exists and user owns it
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    if (existingProduct.sellerId !== user.id) { // ✅ Compare with user.id instead of userId
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only delete your own products' },
        { status: 403 }
      )
    }

    // Delete product
    await prisma.product.delete({
      where: { id: id },
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}