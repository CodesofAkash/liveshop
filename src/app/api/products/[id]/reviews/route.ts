import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { rating, title, comment, images } = await req.json();

    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Rating and comment are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: params.id,
          userId: user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId: params.id,
        rating: parseInt(rating),
        title: title || null,
        content: comment,
        images: images || [],
      },
    });

    // Update product rating and review count
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: params.id },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}