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
    
    // First get the product without seller relation to debug
    const productBasic = await prisma.product.findUnique({
      where: { id },
    })
    
    if (!productBasic) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Try to get seller separately with better error handling
    let seller = null
    try {
      console.log('Product sellerId:', productBasic.sellerId)
      
      // First try by MongoDB _id (for new products)
      seller = await prisma.user.findUnique({
        where: { id: productBasic.sellerId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })
      
      // If not found, try by clerkId (for old products that have clerkId as sellerId)
      if (!seller) {
        console.log('Seller not found by _id, trying by clerkId')
        seller = await prisma.user.findUnique({
          where: { clerkId: productBasic.sellerId },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        })
        
        if (seller) {
          console.log('Found seller by clerkId - this product needs migration')
        }
      } else {
        console.log('Found seller by _id - this product is correct')
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

    const product = {
      ...productBasic,
      seller,
      reviews,
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum: number, review: ReviewWithRating) => sum + review.rating, 0) / product.reviews.length
      : 0

    const productWithRating = {
      ...product,
      rating: averageRating,
      reviewCount: product.reviews.length,
    }

    console.log('API: Successfully returning product data');
    return NextResponse.json({
      success: true,
      data: productWithRating,
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