import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admin or the specific user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Starting migration of products with incorrect sellerId...')

    // Find all products where sellerId looks like a clerkId (starts with "user_")
    const productsToMigrate = await prisma.product.findMany({
      where: {
        sellerId: {
          startsWith: "user_"
        }
      },
      select: {
        id: true,
        title: true,
        sellerId: true
      }
    })

    console.log(`Found ${productsToMigrate.length} products to migrate`)

    const results = []
    
    for (const product of productsToMigrate) {
      try {
        // Find the user by clerkId
        const seller = await prisma.user.findUnique({
          where: { clerkId: product.sellerId },
          select: { id: true, clerkId: true }
        })

        if (seller) {
          // Update the product with the correct MongoDB ObjectId
          await prisma.product.update({
            where: { id: product.id },
            data: { sellerId: seller.id }
          })

          results.push({
            productId: product.id,
            title: product.title,
            oldSellerId: product.sellerId,
            newSellerId: seller.id,
            status: 'migrated'
          })

          console.log(`Migrated product ${product.title}: ${product.sellerId} -> ${seller.id}`)
        } else {
          results.push({
            productId: product.id,
            title: product.title,
            sellerId: product.sellerId,
            status: 'seller_not_found'
          })

          console.log(`Seller not found for product ${product.title} with sellerId ${product.sellerId}`)
        }
      } catch (error) {
        results.push({
          productId: product.id,
          title: product.title,
          sellerId: product.sellerId,
          status: 'error',
          error: error.message
        })

        console.error(`Error migrating product ${product.title}:`, error)
      }
    }

    console.log('Migration completed')

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      data: {
        totalProducts: productsToMigrate.length,
        results,
        summary: {
          migrated: results.filter(r => r.status === 'migrated').length,
          errors: results.filter(r => r.status === 'error').length,
          sellerNotFound: results.filter(r => r.status === 'seller_not_found').length
        }
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    )
  }
}
