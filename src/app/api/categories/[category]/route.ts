// src/app/api/categories/[category]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const category = decodeURIComponent(params.category);
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const inStock = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sort') || 'relevance';
    const excludeId = searchParams.get('exclude');

    // Build where clause
    const where: any = {
      category: {
        equals: category,
        mode: 'insensitive'
      },
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    // Add brand filter
    if (brands.length > 0) {
      where.brand = { in: brands };
    }

    // Add rating filter
    if (minRating > 0) {
      where.rating = { gte: minRating };
    }

    // Add stock filter
    if (inStock) {
      where.inStock = true;
      where.inventory = { gt: 0 };
    }

    // Exclude specific product (for related products)
    if (excludeId) {
      where.id = { not: excludeId };
    }

    // Build sort clause
    let orderBy: any = {};
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { reviewCount: 'desc' };
        break;
      default: // relevance
        orderBy = [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { createdAt: 'desc' }
        ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [products, totalCount, categoryStats] = await Promise.all([
      // Get products
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reviews: {
            select: {
              rating: true
            }
          }
        }
      }),
      
      // Get total count
      prisma.product.count({ where }),
      
      // Get category statistics
      prisma.product.groupBy({
        by: ['category'],
        where: { category: { equals: category, mode: 'insensitive' } },
        _count: { id: true },
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    // Get filter options for the category
    const [brandsData, tagsData] = await Promise.all([
      prisma.product.findMany({
        where: { category: { equals: category, mode: 'insensitive' } },
        select: { brand: true },
        distinct: ['brand']
      }),
      prisma.product.findMany({
        where: { category: { equals: category, mode: 'insensitive' } },
        select: { tags: true }
      })
    ]);

    // Process filter options
    const availableBrands = brandsData
      .map(p => p.brand)
      .filter(Boolean)
      .sort();

    const allTags = tagsData
      .flatMap(p => p.tags)
      .filter(Boolean);
    
    const uniqueTags = [...new Set(allTags)].sort();

    // Get price range
    const priceStats = categoryStats[0];
    const priceRange = {
      min: priceStats?._min?.price || 0,
      max: priceStats?._max?.price || 10000
    };

    // Get subcategories (if any - this would depend on your data structure)
    const subcategories = await prisma.product.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
      select: { tags: true },
      take: 50
    });

    const popularTags = subcategories
      .flatMap(p => p.tags)
      .filter(Boolean)
      .reduce((acc: {[key: string]: number}, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

    const topSubcategories = Object.entries(popularTags)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([tag]) => tag);

    // Format response
    const categoryInfo = {
      name: category,
      description: `Discover our wide selection of ${category.toLowerCase()} products`,
      productCount: totalCount,
      subcategories: topSubcategories
    };

    const filterOptions = {
      brands: availableBrands,
      priceRange,
      tags: uniqueTags.slice(0, 20) // Limit to top 20 tags
    };

    return NextResponse.json({
      success: true,
      data: {
        products,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        categoryInfo,
        filterOptions
      },
      message: `Found ${totalCount} products in ${category}`
    });

  } catch (error) {
    console.error('Error fetching category products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}