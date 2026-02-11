// src/app/api/products/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// GET - Fetch reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch reviews with user data
    const reviews = await prisma.review.findMany({
      where: { 
        productId,
        // Only show approved reviews (you can add moderation later)
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        verified: true,
        createdAt: true,
        helpful: true,
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      message: `Found ${reviews.length} reviews`
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: productId } = await context.params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validate input
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    if (!comment || comment.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Comment must be at least 5 characters long' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Find user in DB by clerkId
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id }
    });
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId: dbUser.id,
        rating: parseInt(rating),
        comment: comment.trim(),
        verified: false, // Set to true if user has purchased the product
        helpful: 0
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length
      }
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}