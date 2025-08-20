// src/app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories - Get all categories with product counts
export async function GET() {
  try {
    // Get all active products with their categories
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE'
      },
      select: {
        category: true
      }
    })

    // Group categories manually and filter out null/empty categories
    const categoryMap = new Map<string, number>()
    
    products.forEach((product: { category: string | null }) => {
      if (product.category && product.category.trim() !== '') {
        const count = categoryMap.get(product.category) || 0
        categoryMap.set(product.category, count + 1)
      }
    })

    const formattedCategories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count) // Sort by count descending

    return NextResponse.json({
      success: true,
      data: formattedCategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}