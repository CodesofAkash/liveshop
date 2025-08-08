// src/app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories - Get all categories with product counts
export async function GET() {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
    })

    const formattedCategories = categories
      .map((cat) => ({
        name: cat.category,
        count: cat._count || 0,
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