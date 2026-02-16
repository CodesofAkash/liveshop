import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [
        { featured: 'desc' },
        { reviewCount: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 12,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending products' },
      { status: 500 }
    );
  }
}