import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { ProductStatus } from '@prisma/client'
import { formatCurrency } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
   
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user by clerkId to get MongoDB ObjectId
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true
      }
    })

    // If user doesn't exist, create them first
    if (!user) {
      try {
        // Get user info from Clerk
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            avatar: clerkUser.imageUrl || null,
            role: 'SELLER', // Since they're creating a product, make them a seller
          }
        })
      } catch {
        return NextResponse.json(
          { success: false, error: 'Failed to create user account. Please try again.' },
          { status: 500 }
        )
      }
    }

    const body = await request.json()

    const { 
      title,
      name, // Handle both title and name
      description, 
      price, 
      images,
      imageUrl, // Handle both images array and single imageUrl
      category, 
      inventory,
      inStock, // Handle inStock boolean
      attributes,
      // New fields from the creation form
      brand,
      tags,
      features,
      specifications,
      dimensions,
      weight,
      colors,
      sizes,
      materials,
      warranty,
      status = 'ACTIVE', // Use enum value instead of 'active'
      isDraft = false
    } = body

    // Use title or name, whichever is provided
    const productTitle = title || name
    
    // Generate unique slug from title
    const generateSlug = (title: string) => {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      
      // Add timestamp to ensure uniqueness
      return `${baseSlug}-${Date.now()}`
    }
    
    // Handle images - convert single imageUrl to array or use images array
    const productImages = images || (imageUrl ? [imageUrl] : [])
    
    // Handle inventory - if inStock is provided but inventory isn't, set a default
    let productInventory = inventory
    if (productInventory === undefined || productInventory === null) {
      productInventory = inStock ? 1 : 0
    }

    // Validate status enum
    const validStatuses = ['ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING', 'DISCONTINUED']
    const productStatus = isDraft ? 'DRAFT' : (validStatuses.includes(status?.toUpperCase()) ? status.toUpperCase() : 'ACTIVE')

    // Validate required fields
    if (!productTitle || !description || price === undefined || price === null || !category) {
      console.log('Missing fields:', { 
        title: productTitle, 
        description, 
        price, 
        category 
      })
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title/name, description, price, and category are required' },
        { status: 400 }
      )
    }

    // Validate price is a positive number
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a valid positive number' },
        { status: 400 }
      )
    }

    // Validate inventory is a non-negative integer
    const parsedInventory = parseInt(productInventory) || 0
    if (parsedInventory < 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory must be a non-negative number' },
        { status: 400 }
      )
    }

    // Parse and validate arrays
    const parsedImages = Array.isArray(productImages) ? productImages : []
    const parsedTags = Array.isArray(tags) ? tags : []
    const parsedFeatures = Array.isArray(features) ? features : []
    const parsedColors = Array.isArray(colors) ? colors : []
    const parsedSizes = Array.isArray(sizes) ? sizes : []
    const parsedMaterials = Array.isArray(materials) ? materials : []

    // Build comprehensive attributes object
    const productAttributes = {
      ...(attributes || {}),
      ...(brand && { brand }),
      ...(specifications && { specifications }),
      ...(dimensions && { dimensions }),
      ...(weight && { weight: parseFloat(weight) || null }),
      ...(warranty && { warranty }),
      ...(parsedFeatures.length > 0 && { features: parsedFeatures }),
      ...(parsedColors.length > 0 && { colors: parsedColors }),
      ...(parsedSizes.length > 0 && { sizes: parsedSizes }),
      ...(parsedMaterials.length > 0 && { materials: parsedMaterials })
    }

    // Generate unique slug
    const productSlug = generateSlug(productTitle)

    console.log('Creating product with user details:', {
      userMongoId: user.id,
      userClerkId: user.clerkId,
      willUseAsSellerId: user.id
    })

    // Create product with all fields
    const product = await prisma.product.create({
      data: {
        title: productTitle.trim(),
        description: description.trim(),
        price: parsedPrice,
        images: parsedImages,
        category: category.trim(),
        inventory: parsedInventory,
        attributes: productAttributes,
        tags: parsedTags,
        sellerId: user.id, // ✅ Use user's MongoDB ObjectId instead of clerkId
        status: productStatus,
        slug: productSlug, // Add the generated slug
        rating: 0,
        reviewCount: 0,
      },
      // Temporarily remove include to test
      // include: {
      //   seller: {
      //     select: {
      //       id: true,
      //       name: true,
      //       email: true,
      //     },
      //   },
      // },
    })

    // Return success response with created product
    return NextResponse.json({
      success: true,
      message: isDraft ? 'Product draft saved successfully' : 'Product created successfully',
      data: {
        ...product,
        // Add computed fields for frontend
        inStock: product.inventory > 0,
        priceFormatted: formatCurrency(product.price),
        createdAgo: 'Just now'
      },
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('Error creating product:', error)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'A product with this title already exists' },
          { status: 400 }
        )
      }

      if (error.code === 'P2003') {
        return NextResponse.json(
          { success: false, error: 'Invalid category or seller reference' },
          { status: 400 }
        )
      }
    }

    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create product. Please try again.',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
// ...existing code...

// GET method for fetching products (existing functionality)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Build where clause
    interface WhereClause {
      category?: string
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        tags?: { hasSome: string[] }
      }>
      price?: {
        gte?: number
        lte?: number
      }
      status?: ProductStatus
    }
    
    const where: WhereClause = {}
    
    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    if (status) {
      where.status = status.toUpperCase() as ProductStatus
    } else {
      // Default to active products only
      where.status = 'ACTIVE'
    }
    
    // Execute query with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.product.count({ where })
    ])
    
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        products: products, // Wrap in products object to match frontend expectation
        pagination: {
          currentPage: page, // Match frontend naming
          totalPages,
          totalCount: total, // Match frontend naming
          hasNextPage: page < totalPages, // Match frontend naming
          hasPrevPage: page > 1, // Match frontend naming
          limit
        }
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}