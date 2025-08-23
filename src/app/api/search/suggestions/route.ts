import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand';
  count?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        suggestions: [],
        message: 'Query too short'
      });
    }

    const searchTerm = query.trim();
    const suggestions: SearchSuggestion[] = [];

    try {
      // Search for matching products (names)
      const productSuggestions = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
        },
        take: Math.floor(limit * 0.5), // 50% of suggestions from products
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ],
      });

      // Add product name suggestions
      productSuggestions.forEach(product => {
        suggestions.push({
          id: `product-${product.id}`,
          text: product.name,
          type: 'product',
        });
      });

      // Search for matching categories
      const categorySuggestions = await prisma.product.groupBy({
        by: ['category'],
        where: {
          status: 'ACTIVE',
          category: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
        take: Math.floor(limit * 0.25), // 25% from categories
      });

      // Add category suggestions
      categorySuggestions.forEach((cat, index) => {
        suggestions.push({
          id: `category-${index}`,
          text: cat.category,
          type: 'category',
          count: cat._count.category,
        });
      });

      // Search for matching brands
      const brandSuggestions = await prisma.product.groupBy({
        by: ['brand'],
        where: {
          status: 'ACTIVE',
          brand: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        _count: {
          brand: true,
        },
        orderBy: {
          _count: {
            brand: 'desc',
          },
        },
        take: Math.floor(limit * 0.25), // 25% from brands
      });

      // Add brand suggestions
      brandSuggestions.forEach((brand, index) => {
        suggestions.push({
          id: `brand-${index}`,
          text: brand.brand,
          type: 'brand',
          count: brand._count.brand,
        });
      });

      // If we have few suggestions, search in descriptions and tags
      if (suggestions.length < limit / 2) {
        const descriptionMatches = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            AND: [
              {
                NOT: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
              {
                OR: [
                  {
                    description: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    },
                  },
                  {
                    tags: {
                      hasSome: [searchTerm.toLowerCase()],
                    },
                  },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
          },
          take: limit - suggestions.length,
          orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' }
          ],
        });

        // Add description/tag matches
        descriptionMatches.forEach(product => {
          suggestions.push({
            id: `desc-match-${product.id}`,
            text: product.name,
            type: 'product',
          });
        });
      }

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, array) => 
          array.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase()) === index
        )
        .slice(0, limit);

      // Sort suggestions by relevance
      const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
        // Exact matches first
        const aExact = a.text.toLowerCase() === searchTerm.toLowerCase();
        const bExact = b.text.toLowerCase() === searchTerm.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Starts with query second
        const aStarts = a.text.toLowerCase().startsWith(searchTerm.toLowerCase());
        const bStarts = b.text.toLowerCase().startsWith(searchTerm.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Products before categories/brands
        if (a.type === 'product' && b.type !== 'product') return -1;
        if (a.type !== 'product' && b.type === 'product') return 1;

        // Sort by count if available
        if (a.count && b.count) return b.count - a.count;

        return 0;
      });

      return NextResponse.json({
        suggestions: sortedSuggestions,
        query: searchTerm,
      });

    } catch (dbError) {
      console.error('Database error in search suggestions:', dbError);
      
      // Return basic fallback suggestions
      const fallbackSuggestions: SearchSuggestion[] = [
        { id: 'fallback-1', text: 'iPhone', type: 'product' },
        { id: 'fallback-2', text: 'Samsung', type: 'brand' },
        { id: 'fallback-3', text: 'Electronics', type: 'category' },
        { id: 'fallback-4', text: 'Laptop', type: 'product' },
        { id: 'fallback-5', text: 'Nike', type: 'brand' },
      ].filter(s => 
        s.text.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return NextResponse.json({
        suggestions: fallbackSuggestions,
        query: searchTerm,
        fallback: true,
      });
    }

  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

// POST method for saving popular search analytics
export async function POST(request: NextRequest) {
  try {
    const { query, userId, clicked } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Log search suggestion analytics
    // You can create a SearchAnalytics model in Prisma for this
    const searchAnalytics = {
      query: query.trim().toLowerCase(),
      userId: userId || null,
      clicked: clicked || false,
      timestamp: new Date(),
    };

    console.log('Search suggestion analytics:', searchAnalytics);

    // In a real application, you would save this to your database:
    // await prisma.searchAnalytics.create({
    //   data: searchAnalytics
    // });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Search suggestion analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log search analytics' },
      { status: 500 }
    );
  }
}