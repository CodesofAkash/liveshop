// src/app/api/wishlist/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// GET - Fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    // Get wishlist items with product details
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { 
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            category: true,
            inventory: true,
            rating: true,
            reviewCount: true,
            brand: true,
            status: true,
            sellerId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' }, 
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Valid productId is required' }, 
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId }, 
      select: { id: true } 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, status: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' }, 
        { status: 404 }
      );
    }

    if (product.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Product is not available' }, 
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const existingWishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    if (existingWishlistItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' }, 
        { status: 409 }
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId: productId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            category: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${product.title} added to wishlist`,
      data: wishlistItem
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add item to wishlist' }, 
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Valid productId is required' }, 
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId }, 
      select: { id: true } 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' }, 
        { status: 404 }
      );
    }

    // Find and delete the wishlist item
    const deletedItem = await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist'
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from wishlist' }, 
      { status: 500 }
    );
  }
}