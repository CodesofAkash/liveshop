import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ clerkId: string }>;
}

// GET /api/users/[clerkId]/dashboard - Get user dashboard data
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { clerkId } = await params;

    // Only allow users to fetch their own dashboard
    if (userId !== clerkId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const [totalOrders, recentOrders, totalSpent, wishlistCount, reviewCount] = await Promise.all([
      prisma.order.count({
        where: { buyerId: user.id },
      }),
      prisma.order.findMany({
        where: { buyerId: user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.order.aggregate({
        where: {
          buyerId: user.id,
          paymentStatus: 'COMPLETED',
        },
        _sum: {
          total: true,
        },
      }),
      prisma.wishlist.count({
        where: { userId: user.id },
      }),
      prisma.review.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalSpent: Number(totalSpent._sum.total || 0),
          wishlistCount,
          reviewCount,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}