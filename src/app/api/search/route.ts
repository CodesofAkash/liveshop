import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search - Advanced search with suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const suggest = searchParams.get('suggest') === 'true'

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          suggestions: [],
        },
      })
    }

    if (suggest) {
      // Return search suggestions
      const suggestions = await prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          title: true,
          category: true,
        },
        distinct: ['title'],
        take: 5,
      })

      return NextResponse.json({
        success: true,
        data: {
          suggestions: suggestions.map(p => p.title),
        },
      })
    }

    // Full search
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    const productsWithRating = products.map((product) => ({
      ...product,
      rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length,
    }))

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithRating,
        count: products.length,
        query,
      },
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}