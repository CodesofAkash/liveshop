# Migration Guide: MongoDB to PostgreSQL (Supabase)

This guide helps you migrate your existing data from MongoDB to PostgreSQL with Supabase.

## Overview of Changes

### Database Provider
- **Old**: MongoDB
- **New**: PostgreSQL (via Supabase)

### Schema Changes
- **IDs**: Changed from MongoDB ObjectId to CUID strings
- **Relations**: Updated to use standard PostgreSQL foreign keys
- **Field Types**: Optimized for PostgreSQL (e.g., `@db.Text` for long strings)

## Migration Options

### Option 1: Fresh Start (Recommended for Development)

If you're in development and don't need to preserve data:

```bash
# 1. Update dependencies
npm install

# 2. Set up Supabase and configure .env
# See SETUP_GUIDE.md for detailed instructions

# 3. Push new schema to database
npm run db:push

# 4. Seed with sample data
npm run db:seed
```

### Option 2: Migrate Existing Data

If you need to preserve production data:

#### Step 1: Export Data from MongoDB

Create a script to export your MongoDB data:

```typescript
// scripts/export-mongodb-data.ts
import { MongoClient } from 'mongodb'
import fs from 'fs'

async function exportData() {
  const client = new MongoClient(process.env.OLD_MONGODB_URL!)
  await client.connect()
  
  const db = client.db()
  
  // Export each collection
  const collections = ['users', 'products', 'orders', 'reviews', 'categories']
  const data: any = {}
  
  for (const collectionName of collections) {
    const collection = db.collection(collectionName)
    data[collectionName] = await collection.find({}).toArray()
    console.log(`Exported ${data[collectionName].length} ${collectionName}`)
  }
  
  // Save to file
  fs.writeFileSync('mongodb-export.json', JSON.stringify(data, null, 2))
  console.log('✅ Export complete: mongodb-export.json')
  
  await client.close()
}

exportData().catch(console.error)
```

Run the export:
```bash
tsx scripts/export-mongodb-data.ts
```

#### Step 2: Transform Data for PostgreSQL

Create a transformation script:

```typescript
// scripts/transform-data.ts
import fs from 'fs'
import { createId } from '@paralleldrive/cuid2'

function transformData() {
  const oldData = JSON.parse(fs.readFileSync('mongodb-export.json', 'utf-8'))
  const newData: any = {}
  
  // Map old MongoDB IDs to new CUIDs
  const idMap = new Map<string, string>()
  
  // Transform users
  newData.users = oldData.users.map((user: any) => {
    const newId = createId()
    idMap.set(user._id.toString(), newId)
    
    return {
      id: newId,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      bio: user.bio,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  })
  
  // Transform products
  newData.products = oldData.products.map((product: any) => {
    const newId = createId()
    idMap.set(product._id.toString(), newId)
    
    return {
      id: newId,
      title: product.title,
      name: product.name,
      description: product.description,
      price: product.price,
      inventory: product.inventory,
      category: product.category,
      brand: product.brand,
      attributes: product.attributes,
      images: product.images,
      model3D: product.model3D,
      sellerId: idMap.get(product.sellerId) || product.sellerId,
      status: product.status,
      inStock: product.inStock,
      featured: product.featured,
      rating: product.rating,
      reviewCount: product.reviewCount,
      slug: product.slug,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  })
  
  // Transform orders (similar pattern)
  // Transform reviews (similar pattern)
  // Transform categories (similar pattern)
  
  fs.writeFileSync('postgresql-import.json', JSON.stringify(newData, null, 2))
  fs.writeFileSync('id-mapping.json', JSON.stringify(Array.from(idMap.entries()), null, 2))
  
  console.log('✅ Transformation complete')
  console.log('   - postgresql-import.json: Data ready for import')
  console.log('   - id-mapping.json: ID mappings for reference')
}

transformData()
```

#### Step 3: Import to PostgreSQL

Create an import script:

```typescript
// scripts/import-postgresql-data.ts
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function importData() {
  const data = JSON.parse(fs.readFileSync('postgresql-import.json', 'utf-8'))
  
  console.log('🚀 Starting PostgreSQL import...')
  
  // Disable foreign key checks temporarily
  await prisma.$executeRawUnsafe('SET session_replication_role = replica;')
  
  try {
    // Import users
    console.log('Importing users...')
    for (const user of data.users) {
      await prisma.user.create({ data: user })
    }
    
    // Import categories
    console.log('Importing categories...')
    for (const category of data.categories || []) {
      await prisma.category.create({ data: category })
    }
    
    // Import products
    console.log('Importing products...')
    for (const product of data.products) {
      await prisma.product.create({ data: product })
    }
    
    // Import orders
    console.log('Importing orders...')
    for (const order of data.orders) {
      await prisma.order.create({ 
        data: {
          ...order,
          items: {
            create: order.items
          }
        }
      })
    }
    
    // Import reviews
    console.log('Importing reviews...')
    for (const review of data.reviews || []) {
      await prisma.review.create({ data: review })
    }
    
    console.log('✅ Import complete!')
  } finally {
    // Re-enable foreign key checks
    await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;')
    await prisma.$disconnect()
  }
}

importData().catch(console.error)
```

Run the import:
```bash
npm run db:push  # Create tables first
tsx scripts/import-postgresql-data.ts
```

## Key Differences to Update in Code

### 1. Prisma Client Usage

No changes needed! The Prisma Client API remains the same.

### 2. ID Type

MongoDB ObjectIds are now CUID strings, but both are strings in TypeScript, so no code changes needed.

### 3. Text Search

If you were using MongoDB text search, update to PostgreSQL full-text search:

**Old (MongoDB)**:
```typescript
const products = await prisma.product.findMany({
  where: {
    $text: { $search: query }
  }
})
```

**New (PostgreSQL)**:
```typescript
const products = await prisma.product.findMany({
  where: {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }
})
```

Or enable full-text search in schema:
```prisma
model Product {
  // ... other fields
  
  @@index([title, description])
}
```

### 4. Transactions

PostgreSQL transactions work differently:

**MongoDB Transactions** (if you used them):
```typescript
const session = await mongoose.startSession()
session.startTransaction()
// ... operations
await session.commitTransaction()
```

**PostgreSQL Transactions**:
```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: userData })
  await tx.product.create({ data: productData })
})
```

## Testing the Migration

### 1. Compare Record Counts

```typescript
// scripts/verify-migration.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  const counts = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    orders: await prisma.order.count(),
    reviews: await prisma.review.count(),
  }
  
  console.log('PostgreSQL Record Counts:')
  console.table(counts)
}

verify()
```

### 2. Spot Check Data

Manually verify:
- User data is complete
- Product images are intact
- Order history is accurate
- Relationships are correct

### 3. Test Critical Flows

- User authentication
- Product browsing
- Cart operations
- Checkout process
- Order viewing

## Rollback Plan

If you need to rollback to MongoDB:

1. Keep your old MongoDB database running
2. Keep a backup of `.env` with MongoDB URL
3. Keep the old `schema.prisma` in version control
4. To rollback:
   ```bash
   git checkout old-commit -- prisma/schema.prisma
   # Update .env with MongoDB URL
   npm run db:generate
   npm run dev
   ```

## Performance Considerations

### PostgreSQL Advantages
- ✅ Better performance for complex queries
- ✅ ACID compliance and strong consistency
- ✅ Excellent for relational data
- ✅ Rich indexing options
- ✅ Better tooling ecosystem

### Optimization Tips

1. **Add Indexes for Frequent Queries**:
```prisma
model Product {
  // ... fields
  
  @@index([category])
  @@index([sellerId])
  @@index([featured, inStock])
}
```

2. **Use Connection Pooling** (Already set up with Supabase)

3. **Optimize Queries**:
```typescript
// Instead of loading all relations
const product = await prisma.product.findUnique({
  where: { id },
  include: {
    seller: true,
    reviews: true,
    orderItems: true,
  }
})

// Load only what you need
const product = await prisma.product.findUnique({
  where: { id },
  include: {
    seller: {
      select: { id: true, name: true, avatar: true }
    },
    reviews: {
      take: 5,
      orderBy: { createdAt: 'desc' }
    }
  }
})
```

## Post-Migration Checklist

- [ ] All data migrated successfully
- [ ] Record counts match between databases
- [ ] All API endpoints tested
- [ ] Authentication working
- [ ] Payments processing correctly
- [ ] Admin functions operational
- [ ] Performance benchmarks acceptable
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Old MongoDB connection removed from code
- [ ] Team notified of changes

## Need Help?

- Check PostgreSQL query equivalents: https://www.prisma.io/docs/concepts/database-connectors/postgresql
- Supabase docs: https://supabase.com/docs
- Open an issue on GitHub if you encounter problems

---

**Important**: Always test the migration in a staging environment before production!
