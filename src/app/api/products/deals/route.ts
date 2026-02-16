import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { featured: true },
          { price: { lt: 10000 } },
        ],
      },
      orderBy: [
        { featured: 'desc' },
        { price: 'asc' },
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
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}