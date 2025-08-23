import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get search parameters
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const inStock = searchParams.get('inStock') === 'true';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: Prisma.ProductWhereInput = {
      status: 'ACTIVE', // Only show active products
    };

    // Text search in name, description, brand, and tags
    if (query.trim()) {
      searchConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          tags: {
            hasSome: query.split(' ').map(term => term.toLowerCase()),
          },
        },
      ];
    }

    // Category filter
    if (category && category !== 'All Categories') {
      searchConditions.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    // Brand filter (multiple brands)
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      searchConditions.brand = {
        in: brands,
        mode: 'insensitive',
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      searchConditions.price = {};
      if (minPrice) {
        searchConditions.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        searchConditions.price.lte = parseFloat(maxPrice);
      }
    }

    // Rating filter
    if (rating) {
      searchConditions.rating = {
        gte: parseFloat(rating),
      };
    }

    // Stock filter
    if (inStock) {
      searchConditions.stock = {
        gt: 0,
      };
    }

    // Build sort options
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];

    switch (sortBy) {
      case 'price-low':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price-high':
        orderBy = [{ price: 'desc' }];
        break;
      case 'rating':
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by a combination of factors
        if (query.trim()) {
          // If there's a search query, prioritize exact matches
          orderBy = [
            { rating: 'desc' },
            { reviewCount: 'desc' },
            { createdAt: 'desc' }
          ];
        } else {
          // If no query, show popular products first
          orderBy = [
            { rating: 'desc' },
            { reviewCount: 'desc' },
            { createdAt: 'desc' }
          ];
        }
        break;
    }

    try {
      // Get total count for pagination
      const totalCount = await prisma.product.count({
        where: searchConditions,
      });

      // Get products with pagination
      const products = await prisma.product.findMany({
        where: searchConditions,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          originalPrice: true,
          images: true,
          rating: true,
          reviewCount: true,
          brand: true,
          category: true,
          status: true,
          stock: true,
          tags: true,
          createdAt: true,
        },
      });

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      // Get search suggestions if no results found
      let suggestions: string[] = [];
      if (products.length === 0 && query.trim()) {
        // Find similar products or categories
        const similarProducts = await prisma.product.findMany({
          where: {
            status: 'ACTIVE',
            OR: [
              {
                name: {
                  contains: query.split(' ')[0], // First word of search
                  mode: 'insensitive',
                },
              },
              {
                category: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                brand: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
          select: {
            name: true,
            category: true,
            brand: true,
          },
          take: 5,
        });

        suggestions = Array.from(new Set([
          ...similarProducts.map(p => p.name),
          ...similarProducts.map(p => p.category),
          ...similarProducts.map(p => p.brand),
        ])).slice(0, 5);
      }

      // Get popular search terms if no query provided
      let popularSearches: string[] = [];
      if (!query.trim()) {
        const categories = await prisma.product.groupBy({
          by: ['category'],
          where: { status: 'ACTIVE' },
          _count: {
            category: true,
          },
          orderBy: {
            _count: {
              category: 'desc',
            },
          },
          take: 6,
        });

        popularSearches = categories.map(cat => cat.category);
      }

      // Get filter options for the sidebar
      const filterOptions = await getFilterOptions(searchConditions);

      const response = {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: totalCount,
          hasMore,
          limit,
        },
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        popularSearches: popularSearches.length > 0 ? popularSearches : undefined,
        filters: filterOptions,
        searchQuery: query,
        appliedFilters: {
          category,
          brand: brand ? brand.split(',') : [],
          priceRange: [
            minPrice ? parseFloat(minPrice) : 0,
            maxPrice ? parseFloat(maxPrice) : 10000
          ],
          rating: rating ? parseFloat(rating) : 0,
          inStock,
          sortBy,
        },
      };

      return NextResponse.json(response);

    } catch (error) {
      console.error('Database error in search:', error);
      return NextResponse.json(
        { error: 'Failed to search products' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Invalid search request' },
      { status: 400 }
    );
  }
}

// Helper function to get available filter options
async function getFilterOptions(baseConditions: Prisma.ProductWhereInput) {
  try {
    // Get available categories
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: baseConditions,
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: 'desc',
        },
      },
    });

    // Get available brands
    const brands = await prisma.product.groupBy({
      by: ['brand'],
      where: baseConditions,
      _count: {
        brand: true,
      },
      orderBy: {
        _count: {
          brand: 'desc',
        },
      },
    });

    // Get price range
    const priceStats = await prisma.product.aggregate({
      where: baseConditions,
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    // Get rating distribution
    const ratingStats = await prisma.product.groupBy({
      by: ['rating'],
      where: baseConditions,
      _count: {
        rating: true,
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return {
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      })),
      brands: brands.map(brand => ({
        name: brand.brand,
        count: brand._count.brand,
      })),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 10000,
      },
      ratings: ratingStats.map(rating => ({
        rating: rating.rating,
        count: rating._count.rating,
      })),
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 10000 },
      ratings: [],
    };
  }
}

// POST method for saving search queries (analytics)
export async function POST(request: NextRequest) {
  try {
    const { query, userId, filters, resultCount } = await request.json();

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Save search analytics (you can create a SearchLog model in Prisma)
    // This is useful for understanding user behavior and improving search
    const searchLog = {
      query: query.trim().toLowerCase(),
      userId: userId || null,
      filters: filters || {},
      resultCount: resultCount || 0,
      timestamp: new Date(),
    };

    // You would typically save this to a SearchLog table
    console.log('Search log:', searchLog);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log search' },
      { status: 500 }
    );
  }
}