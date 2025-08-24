import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define consistent product type
export interface SearchProduct {
  id: string;
  name: string;
  title?: string; // For backwards compatibility
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inventory: number;
  status: string;
  tags: string[];
  createdAt: Date;
}

// Transform database product to consistent format
const transformProduct = (dbProduct: any): SearchProduct => {
  // Fallback logic: use name if present, else title, else first tag, else description, else 'Unknown Product'
  let fallbackName = dbProduct.name;
  if (!fallbackName && dbProduct.title) {
    fallbackName = dbProduct.title;
  }
  if (!fallbackName && dbProduct.tags && dbProduct.tags.length > 0) {
    fallbackName = dbProduct.tags[0];
  }
  if (!fallbackName && dbProduct.description) {
    fallbackName = dbProduct.description;
  }
  if (!fallbackName) {
    fallbackName = 'Unknown Product';
  }
  return {
    id: String(dbProduct.id),
    name: dbProduct.name ? String(dbProduct.name) : fallbackName,
    title: dbProduct.title ? String(dbProduct.title) : fallbackName,
    description: String(dbProduct.description || ''),
    price: dbProduct.price,
    images: dbProduct.images || [],
    category: String(dbProduct.category || ''),
    brand: dbProduct.brand ? String(dbProduct.brand) : 'Unknown Brand',
    rating: dbProduct.rating || 0,
    reviewCount: dbProduct.reviewCount || 0,
    inventory: dbProduct.inventory || 0,
    status: String(dbProduct.status || 'ACTIVE'),
    tags: dbProduct.tags || [],
    createdAt: dbProduct.createdAt,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
  // Get search parameters with validation
  const query = searchParams.get('q')?.trim() || '';
  const category = searchParams.get('category')?.trim();
  const brand = searchParams.get('brand')?.trim();
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice') ?? '999999';
  const rating = searchParams.get('rating');
  const inStock = searchParams.get('inStock') === 'true';
  const sortBy = (searchParams.get('sortBy') || 'relevance') as 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '12')), 100);

  const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: Prisma.ProductWhereInput = {
      status: 'ACTIVE', // Only show active products
    };

    // Text search across multiple fields: name/title, tags, brand, category
    if (query) {
      const queryWords = query.toLowerCase().split(' ').filter(term => term.length > 0);
      searchConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          title: {
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
          category: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
      // Tag search: match any query word in tags
      if (queryWords.length === 1) {
        searchConditions.OR.push({
          tags: {
            has: queryWords[0],
          },
        });
      } else if (queryWords.length > 1) {
        searchConditions.OR.push({
          tags: {
            hasSome: queryWords,
          },
        });
      }
    }

    // Category filter
    if (category && category !== 'All Categories') {
      searchConditions.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    // Brand filter (support multiple brands)
    if (brand) {
      const brands = brand.split(',').map(b => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        searchConditions.brand = {
          equals: brands[0],
          mode: 'insensitive',
        };
      } else if (brands.length > 1) {
        searchConditions.brand = {
          in: brands,
          mode: 'insensitive',
        };
      }
    }

    // Price range filter
    const minPriceNum = minPrice ? Math.max(0, parseFloat(minPrice)) : undefined;
  const maxPriceNum = maxPrice ? Math.max(0, parseFloat(maxPrice)) : 999999;
    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      searchConditions.price = {};
      if (minPriceNum !== undefined) {
        searchConditions.price.gte = minPriceNum;
      }
      if (maxPriceNum !== undefined) {
        searchConditions.price.lte = maxPriceNum;
      }
    }

    // Rating filter
    if (rating) {
      const ratingNum = Math.max(0, Math.min(5, parseFloat(rating)));
      searchConditions.rating = {
        gte: ratingNum,
      };
    }

    // Inventory filter
    if (inStock) {
      searchConditions.inventory = {
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
        orderBy = [
          { rating: 'desc' }, 
          { reviewCount: 'desc' }, 
          { createdAt: 'desc' }
        ];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'relevance':
      default:
        // For relevance sorting, prioritize highly-rated products with reviews
        orderBy = [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { createdAt: 'desc' }
        ];
        break;
    }

    try {
      // Get total count for pagination
      const totalCount = await prisma.product.count({
        where: searchConditions,
      });

      // Get products with all necessary fields
      const dbProducts = await prisma.product.findMany({
        where: searchConditions,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          title: true,
          description: true,
          price: true,
          images: true,
          rating: true,
          reviewCount: true,
          brand: true,
          category: true,
          status: true,
          inventory: true,
          tags: true,
          createdAt: true,
        },
      });

      // Transform products to consistent format
      const products = dbProducts.map(transformProduct);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      // Get filter options for the sidebar
      const filterOptions = await getFilterOptions(searchConditions);

      // Get search suggestions if no results found
      // Always get search suggestions
      let suggestions: string[] = [];
      if (query) {
        suggestions = await getSearchSuggestions(query);
      } else {
        suggestions = await getSearchSuggestions('');
      }

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
        filters: filterOptions,
        searchQuery: query,
        appliedFilters: {
          category: category !== 'All Categories' ? category : undefined,
          brand: brand ? brand.split(',').map(b => b.trim()) : [],
      priceRange: [minPriceNum || 0, maxPriceNum || 999999] as [number, number],
          rating: rating ? parseFloat(rating) : 0,
          inStock,
          sortBy,
        },
        // Backwards compatibility
        total: totalCount,
        totalPages,
      };
      return NextResponse.json(response);

    } catch (dbError) {
      console.error('Database error in search:', dbError);
      
      // Return fallback response for database errors
      return NextResponse.json({
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          hasMore: false,
          limit,
        },
        suggestions: ['Try searching for popular items like "laptop", "phone", or "headphones"'],
        filters: {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 999999 },
          ratings: [],
        },
        searchQuery: query,
        error: 'Database temporarily unavailable',
        fallback: true,
      });
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Invalid search request',
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalResults: 0,
          hasMore: false,
          limit: 12,
        }
      },
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
      categories: categories
        .filter(cat => cat.category)
        .map(cat => ({
          name: cat.category!,
          count: cat._count.category,
        })),
      brands: brands
        .filter(brand => brand.brand && brand.brand !== '')
        .map(brand => ({
          name: brand.brand!,
          count: brand._count.brand,
        })),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 999999,
      },
      ratings: ratingStats
        .filter(rating => rating.rating !== null)
        .map(rating => ({
          rating: rating.rating!,
          count: rating._count.rating,
        })),
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 999999 },
      ratings: [],
    };
  }
}

// Helper function to get search suggestions when no results found
async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    // Get similar products by searching parts of the query
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length >= 2);

    // If no valid query words, fallback to popular items
    if (queryWords.length === 0) {
      return ['Try searching for popular items like "laptop", "phone", or "headphones"'];
    }


    // Search for products with any of the query words
    const similarProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          ...queryWords.flatMap(word => [
            { name: { contains: word, mode: Prisma.QueryMode.insensitive } },
            { title: { contains: word, mode: Prisma.QueryMode.insensitive } },
            { category: { contains: word, mode: Prisma.QueryMode.insensitive } },
            { brand: { contains: word, mode: Prisma.QueryMode.insensitive } },
            { tags: { has: word } },
          ]),
        ],
      },
      select: {
        id: true,
        name: true,
        title: true,
        category: true,
        brand: true,
        tags: true,
        description: true,
        status: true,
        reviewCount: true,
        rating: true,
        inStock: true,
        createdAt: true,
      },
      take: 10,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
    });

    // Extract unique suggestions with robust fallback
    const suggestions = new Set<string>();
    similarProducts.forEach(product => {
      // Use name, title, first tag, description, or 'Unknown Product'
      const displayName = product.name || product.title || (product.tags?.[0]) || product.description || 'Unknown Product';
      if (displayName) suggestions.add(displayName);
      if (product.category) suggestions.add(product.category);
      if (product.brand) suggestions.add(product.brand);
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => {
          if (tag) suggestions.add(tag);
        });
      }
    });

    const suggestionArray = Array.from(suggestions).slice(0, 5);

    return suggestionArray.length > 0
      ? suggestionArray
      : ['Try searching for popular items like "laptop", "phone", or "headphones"'];

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return ['Try searching for popular items like "laptop", "phone", or "headphones"'];
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
    const searchLog = {
      query: query.trim().toLowerCase(),
      userId: userId || null,
      filters: filters || {},
      resultCount: resultCount || 0,
      timestamp: new Date(),
    };

    // Log for now (implement database logging when SearchLog model is created)

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log search' },
      { status: 500 }
    );
  }
}