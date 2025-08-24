import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent' | 'trending';
  count?: number;
}

// Fallback suggestions for when database is unavailable
const FALLBACK_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'trending-1', text: 'iPhone 15', type: 'trending' },
  { id: 'trending-2', text: 'Samsung Galaxy', type: 'trending' },
  { id: 'trending-3', text: 'MacBook Pro', type: 'trending' },
  { id: 'trending-4', text: 'AirPods', type: 'trending' },
  { id: 'trending-5', text: 'PlayStation 5', type: 'trending' },
  { id: 'category-1', text: 'Electronics', type: 'category' },
  { id: 'category-2', text: 'Clothing', type: 'category' },
  { id: 'category-3', text: 'Home & Garden', type: 'category' },
  { id: 'brand-1', text: 'Apple', type: 'brand' },
  { id: 'brand-2', text: 'Samsung', type: 'brand' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    console.log('[SUGGESTIONS API] Query:', query);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: FALLBACK_SUGGESTIONS.slice(0, limit),
        query: query || '',
        message: 'Showing popular suggestions'
      });
    }

    const searchTerm = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    try {
      // Search for matching products (50% of suggestions)
        // For partial tag matches, fetch products with non-empty tags and filter in JS
        const productSuggestionsRaw = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { title: { contains: query, mode: 'insensitive' } },
              { brand: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
              { tags: { isEmpty: false } },
            ],
          },
          select: {
            id: true,
            name: true,
            title: true,
            brand: true,
            category: true,
            tags: true,
          },
          take: Math.floor(limit * 2), // fetch more for filtering
          orderBy: [
            { rating: 'desc' },
            { reviewCount: 'desc' }
          ],
        });

        // Filter for partial tag matches and combine with other matches
        const productSuggestions = productSuggestionsRaw.filter(product => {
          // If any field matches, include
          if (
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.title && product.title.toLowerCase().includes(searchTerm)) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
          ) {
            return true;
          }
          // Check tags for partial match
          if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return true;
          }
          return false;
        }).slice(0, Math.floor(limit * 0.5));

      // Add product suggestions (prefer title, fallback to name)
        productSuggestions.forEach(product => {
          // Prefer title, fallback to name, then brand/category/tags
          let displayText = product.title || product.name || product.brand || product.category;
          if (!displayText && product.tags && product.tags.length > 0) {
            displayText = product.tags[0];
          }
          if (displayText) {
            suggestions.push({
              id: `product-${product.id}`,
              text: displayText,
              type: 'product',
            });
          }
        });
      console.log('[SUGGESTIONS API] Product suggestions:', productSuggestions.map(p => p.title || p.name));

      // Search for matching categories (25% of suggestions)
      const categorySuggestions = await prisma.product.groupBy({
        by: ['category'],
        where: {
          status: 'ACTIVE',
          category: {
            contains: query,
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
        take: Math.floor(limit * 0.25),
      });

      // Add category suggestions
      categorySuggestions.forEach((cat, index) => {
        if (cat.category) {
          suggestions.push({
            id: `category-${index}`,
            text: cat.category,
            type: 'category',
            count: cat._count.category,
          });
        }
      });
      console.log('[SUGGESTIONS API] Category suggestions:', categorySuggestions.map(c => c.category));

      // Search for matching brands (25% of suggestions)
      const brandSuggestions = await prisma.product.groupBy({
        by: ['brand'],
        where: {
          status: 'ACTIVE',
          brand: {
            contains: query,
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
        take: Math.floor(limit * 0.25),
      });

      // Add brand suggestions
      brandSuggestions.forEach((brand, index) => {
        if (brand.brand) {
          suggestions.push({
            id: `brand-${index}`,
            text: brand.brand,
            type: 'brand',
            count: brand._count.brand,
          });
        }
      });
      console.log('[SUGGESTIONS API] Brand suggestions:', brandSuggestions.map(b => b.brand));

      // If we need more suggestions, search in descriptions and tags
      if (suggestions.length < limit / 2) {
        const additionalMatches = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            AND: [
              {
                NOT: {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
              {
                OR: [
                  {
                    description: {
                      contains: query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    tags: {
                      hasSome: [searchTerm],
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

        // Add additional matches
        additionalMatches.forEach(product => {
          if (product.name) {
            suggestions.push({
              id: `additional-${product.id}`,
              text: product.name,
              type: 'product',
            });
          }
        });
      }

      // Remove duplicates and limit results
      let uniqueSuggestions = suggestions
        .filter((suggestion, index, array) => 
          array.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase()) === index
        )
        .slice(0, limit);

      // Sort suggestions by relevance
      uniqueSuggestions = uniqueSuggestions.sort((a, b) => {
        // Exact matches first
        const aExact = a.text.toLowerCase() === searchTerm;
        const bExact = b.text.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Starts with query second
        const aStarts = a.text.toLowerCase().startsWith(searchTerm);
        const bStarts = b.text.toLowerCase().startsWith(searchTerm);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Products before categories/brands
        if (a.type === 'product' && b.type !== 'product') return -1;
        if (a.type !== 'product' && b.type === 'product') return 1;

        // Sort by count if available
        if (a.count && b.count) return b.count - a.count;

        return 0;
      });
      console.log('[SUGGESTIONS API] Final suggestions:', uniqueSuggestions.map(s => s.text));

      // If no suggestions found, return fallback suggestions (filtered by query if present)
      if (uniqueSuggestions.length === 0) {
        const filteredFallback = FALLBACK_SUGGESTIONS.filter(s => 
          !searchTerm || s.text.toLowerCase().includes(searchTerm)
        ).slice(0, limit);
        return NextResponse.json({
          suggestions: filteredFallback,
          query: searchTerm,
          fallback: true,
          message: 'Showing popular suggestions',
        });
      }

      return NextResponse.json({
        suggestions: uniqueSuggestions,
        query: searchTerm,
      });

    } catch (dbError) {
      console.error('Database error in search suggestions:', dbError);
      
      // Return filtered fallback suggestions
      const filteredFallback = FALLBACK_SUGGESTIONS.filter(s => 
        s.text.toLowerCase().includes(searchTerm)
      ).slice(0, limit);

      return NextResponse.json({
        suggestions: filteredFallback,
        query: searchTerm,
        fallback: true,
        message: 'Showing cached suggestions (database unavailable)',
      });
    }

  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch suggestions',
        suggestions: [],
        query: '',
      },
      { status: 500 }
    );
  }
}

// POST method for analytics
export async function POST(request: NextRequest) {
  try {
    const { query, userId, clicked, suggestionType } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Log search suggestion analytics
    const analytics = {
      query: query.trim().toLowerCase(),
      userId: userId || null,
      clicked: clicked || false,
      suggestionType: suggestionType || 'unknown',
      timestamp: new Date(),
    };

    console.log('Search suggestion analytics:', analytics);

    // In production, save to database:
    // await prisma.searchSuggestionAnalytics.create({
    //   data: analytics
    // });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Search suggestion analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}