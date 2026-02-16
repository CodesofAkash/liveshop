import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [trending, categories, featured] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          seller: { select: { id: true, name: true } },
        },
      }),
      prisma.$queryRaw`
        SELECT category, COUNT(*) as count 
        FROM "Product" 
        WHERE status = 'ACTIVE' 
        GROUP BY category 
        ORDER BY count DESC 
        LIMIT 6
      `,
      prisma.product.findMany({
        where: { status: 'ACTIVE', featured: true },
        take: 5,
        include: { seller: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { trending, categories, featured },
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}