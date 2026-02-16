# LiveShop Database Schema Documentation

## Entity Relationship Overview

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       │ (1:N)                      (1:N)│
       ▼                                 ▼
┌─────────────┐                  ┌──────────────┐
│   Product   │                  │    Order     │
└──────┬──────┘                  └──────┬───────┘
       │                                │
       │ (1:N)                     (1:N)│
       ▼                                ▼
┌─────────────┐                  ┌──────────────┐
│   Review    │                  │  OrderItem   │
└─────────────┘                  └──────────────┘
       
┌─────────────┐                  ┌──────────────┐
│    Cart     │◄─(1:1)──User     │  Wishlist    │◄─(N:M)──User
└──────┬──────┘                  └──────┬───────┘        & Product
       │ (1:N)                          │
       ▼                                │
┌─────────────┐                         │
│  CartItem   │                         │
└─────────────┘                         │
```

---

## Models Detail

### 1. User Model

**Purpose:** Store user account information integrated with Clerk authentication

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| clerkId | String | Unique, Required | Clerk authentication ID |
| email | String | Unique, Required | User email address |
| name | String | Nullable | User full name |
| avatar | String | Nullable | Profile image URL |
| role | UserRole | Default: BUYER | User role enum |
| bio | String | Nullable | User biography |
| phone | String | Nullable | Contact phone number |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `products` → Product[] (seller relationship)
- `orders` → Order[] (buyer relationship)
- `liveSessions` → LiveSession[]
- `reviews` → Review[]
- `wishlist` → Wishlist[]
- `cart` → Cart? (1:1 relationship)

**Indexes:**
- Unique index on `clerkId`
- Unique index on `email`

**Business Rules:**
- Every user must have a unique Clerk ID
- Role determines user capabilities (BUYER, SELLER, ADMIN)
- Auto-created when user signs up via Clerk webhook
- Soft delete recommended (keeping order history)

---

### 2. Product Model

**Purpose:** Store product catalog information

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| title | String | Required | Product display name |
| name | String | Nullable | Alternative name field |
| description | String | Required, Text | Product description |
| price | Float | Required | Product price |
| inventory | Int | Default: 0 | Available quantity |
| category | String | Required | Product category |
| brand | String | Nullable | Brand name |
| attributes | Json | Nullable | Flexible attributes object |
| images | String[] | Required | Array of image URLs |
| model3D | String | Nullable | 3D model URL |
| sellerId | String | FK, Required | Reference to User |
| status | ProductStatus | Default: ACTIVE | Product status enum |
| inStock | Boolean | Default: true | Availability flag |
| featured | Boolean | Default: false | Featured product flag |
| rating | Float | Default: 0 | Average rating |
| reviewCount | Int | Default: 0 | Total review count |
| slug | String | Unique, Nullable | SEO-friendly URL slug |
| tags | String[] | Default: [] | Search tags |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `seller` → User (many-to-one)
- `orderItems` → OrderItem[]
- `reviews` → Review[]
- `wishlistItems` → Wishlist[]
- `cartItems` → CartItem[]

**Indexes:**
- Unique index on `slug`
- Index on `sellerId` (FK)
- Index on `category` (for filtering)
- Index on `status` (for active products)

**Business Rules:**
- `title` is the primary display name
- `slug` auto-generated from title + timestamp
- `rating` calculated from reviews
- `reviewCount` maintained via triggers/app logic
- `inventory` decremented on order confirmation
- Image URLs validated before storage

---

### 3. Cart Model

**Purpose:** Store user's shopping cart (one per user)

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| userId | String | FK, Unique | Reference to User |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `user` → User (one-to-one)
- `items` → CartItem[] (one-to-many)

**Indexes:**
- Unique index on `userId`

**Business Rules:**
- One cart per user
- Auto-created on first cart operation
- Not deleted on checkout (items are cleared)
- Cart persists across sessions

---

### 4. CartItem Model

**Purpose:** Individual items within a cart

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| cartId | String | FK, Required | Reference to Cart |
| productId | String | FK, Required | Reference to Product |
| quantity | Int | Default: 1 | Item quantity |
| price | Float | Required | Price at time of adding |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `cart` → Cart (many-to-one)
- `product` → Product (many-to-one)

**Indexes:**
- Unique composite index on `(cartId, productId)`
- Index on `cartId`
- Index on `productId`

**Business Rules:**
- One product can appear only once per cart
- Quantity must be >= 1
- Price snapshot at time of adding (prevents price change issues)
- Cascade delete when cart or product is deleted

---

### 5. Order Model

**Purpose:** Store order information and transaction history

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| orderNumber | String | Unique, Nullable | Human-readable order ID |
| buyerId | String | FK, Required | Reference to User |
| subtotal | Float | Default: 0 | Items subtotal |
| tax | Float | Default: 0 | Tax amount |
| shipping | Float | Default: 0 | Shipping cost |
| discount | Float | Default: 0 | Discount amount |
| total | Float | Required | Total amount |
| paymentStatus | PaymentStatus | Default: PENDING | Payment status enum |
| paymentMethod | String | Nullable | Payment method used |
| paymentId | String | Nullable | External payment ID |
| paidAt | DateTime | Nullable | Payment timestamp |
| shippingAddress | Json | Required | Shipping address object |
| billingAddress | Json | Nullable | Billing address object |
| status | OrderStatus | Default: PENDING | Order status enum |
| trackingNumber | String | Nullable | Shipment tracking |
| notes | String | Nullable | Customer notes |
| giftMessage | String | Nullable | Gift message |
| adminNotes | String | Nullable | Internal admin notes |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `buyer` → User (many-to-one)
- `items` → OrderItem[] (one-to-many)

**Indexes:**
- Unique index on `orderNumber`
- Index on `buyerId`
- Index on `status`
- Index on `paymentStatus`
- Index on `createdAt` (for sorting)

**Business Rules:**
- `orderNumber` format: "ORD-XXXXXX"
- Status progression: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- Payment must be completed before status changes to CONFIRMED
- Addresses stored as JSON for flexibility
- Total = subtotal + tax + shipping - discount

**Order Status Flow:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓          ↓            ↓
CANCELLED  CANCELLED   REFUNDED
```

---

### 6. OrderItem Model

**Purpose:** Links orders to products with quantity and pricing snapshot

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| orderId | String | FK, Required | Reference to Order |
| productId | String | FK, Required | Reference to Product |
| quantity | Int | Required | Quantity ordered |
| price | Float | Required | Price at purchase time |
| productData | Json | Nullable | Product snapshot |
| selectedVariants | Json | Nullable | Variant selections |

**Relations:**
- `order` → Order (many-to-one, cascade delete)
- `product` → Product (many-to-one)

**Indexes:**
- Index on `orderId`
- Index on `productId`

**Business Rules:**
- Price frozen at time of purchase
- Product data snapshot prevents issues if product is modified/deleted
- Quantity must be >= 1
- Cascade delete with order

---

### 7. Review Model

**Purpose:** Store product reviews and ratings

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| productId | String | FK, Required | Reference to Product |
| userId | String | FK, Required | Reference to User |
| rating | Int | Required | Rating (1-5) |
| title | String | Nullable | Review title |
| content | String | Required, Text | Review content |
| images | String[] | Default: [] | Review images |
| verified | Boolean | Default: false | Verified purchase |
| helpful | Int | Default: 0 | Helpful count |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `product` → Product (many-to-one, cascade delete)
- `user` → User (many-to-one, cascade delete)

**Indexes:**
- Unique composite index on `(productId, userId)` - one review per user per product
- Index on `productId`
- Index on `userId`

**Business Rules:**
- One review per user per product
- Rating must be 1-5
- Verified flag set if user purchased the product
- Updates product's average rating and count

---

### 8. Wishlist Model

**Purpose:** Store user's saved products

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| userId | String | FK, Required | Reference to User |
| productId | String | FK, Required | Reference to Product |
| createdAt | DateTime | Auto | Creation timestamp |

**Relations:**
- `user` → User (many-to-one, cascade delete)
- `product` → Product (many-to-one, cascade delete)

**Indexes:**
- Unique composite index on `(userId, productId)`
- Index on `userId`
- Index on `productId`

**Business Rules:**
- One entry per user-product pair
- Cascade delete when user or product is deleted
- No limit on wishlist size

---

### 9. PromoCode Model

**Purpose:** Store promotional discount codes

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| code | String | Unique, Required | Promo code |
| description | String | Nullable, Text | Code description |
| discountType | DiscountType | Required | PERCENTAGE or FIXED_AMOUNT |
| discountValue | Float | Required | Discount value |
| maxUses | Int | Nullable | Max total uses |
| usedCount | Int | Default: 0 | Times used |
| maxUsesPerUser | Int | Nullable | Max uses per user |
| validFrom | DateTime | Required | Start date |
| validUntil | DateTime | Required | End date |
| minOrderAmount | Float | Nullable | Minimum order amount |
| applicableCategories | String[] | Default: [] | Categories (empty = all) |
| isActive | Boolean | Default: true | Active status |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Indexes:**
- Unique index on `code`
- Index on `isActive`

**Business Rules:**
- Code must be uppercase alphanumeric
- PERCENTAGE: value 0-100
- FIXED_AMOUNT: value > 0
- Automatically deactivated when maxUses reached
- Empty applicableCategories = applies to all

**Validation:**
```typescript
function validatePromoCode(code, order) {
  // Check if active
  if (!code.isActive) return false;
  
  // Check validity dates
  if (now < code.validFrom || now > code.validUntil) return false;
  
  // Check usage limits
  if (code.maxUses && code.usedCount >= code.maxUses) return false;
  
  // Check minimum order amount
  if (code.minOrderAmount && order.subtotal < code.minOrderAmount) return false;
  
  // Check categories
  if (code.applicableCategories.length > 0) {
    const orderCategories = order.items.map(i => i.product.category);
    if (!orderCategories.some(c => code.applicableCategories.includes(c))) {
      return false;
    }
  }
  
  return true;
}
```

---

### 10. Category Model

**Purpose:** Organize products into hierarchical categories

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| name | String | Unique, Required | Category name |
| slug | String | Unique, Required | URL-friendly slug |
| description | String | Nullable, Text | Category description |
| image | String | Nullable | Category image URL |
| parentId | String | FK, Nullable | Parent category |
| isActive | Boolean | Default: true | Active status |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `parent` → Category (self-reference)
- `children` → Category[] (self-reference)

**Indexes:**
- Unique index on `name`
- Unique index on `slug`
- Index on `parentId`

**Business Rules:**
- Supports hierarchical categories
- Slug auto-generated from name
- Deleting parent doesn't cascade to children (use NoAction)

**Category Hierarchy Example:**
```
Electronics (parentId: null)
├── Smartphones (parentId: Electronics.id)
│   ├── iOS (parentId: Smartphones.id)
│   └── Android (parentId: Smartphones.id)
└── Laptops (parentId: Electronics.id)
```

---

### 11. LiveSession Model

**Purpose:** Manage live shopping sessions

**Fields:**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | String | PK, CUID | Primary key |
| title | String | Required | Session title |
| description | String | Nullable, Text | Session description |
| liveKitRoom | String | Unique, Required | LiveKit room ID |
| sellerId | String | FK, Required | Reference to User |
| productIds | String[] | Default: [] | Featured products |
| status | LiveStatus | Default: SCHEDULED | Session status |
| scheduledAt | DateTime | Nullable | Scheduled start time |
| startedAt | DateTime | Nullable | Actual start time |
| endedAt | DateTime | Nullable | End time |
| maxViewers | Int | Default: 0 | Max concurrent viewers |
| totalViews | Int | Default: 0 | Total view count |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last update timestamp |

**Relations:**
- `seller` → User (many-to-one, cascade delete)

**Indexes:**
- Unique index on `liveKitRoom`
- Index on `sellerId`
- Index on `status`

**Business Rules:**
- Status flow: SCHEDULED → LIVE → ENDED
- Can be CANCELLED at any point
- totalViews incremented on each viewer join

---

## Enumerations

### UserRole
```typescript
enum UserRole {
  BUYER   = "BUYER"    // Can purchase, review, wishlist
  SELLER  = "SELLER"   // Can create/manage products + BUYER privileges
  ADMIN   = "ADMIN"    // Full access
}
```

### ProductStatus
```typescript
enum ProductStatus {
  DRAFT        = "DRAFT"          // Not visible to buyers
  ACTIVE       = "ACTIVE"         // Available for purchase
  INACTIVE     = "INACTIVE"       // Not visible, not purchasable
  OUT_OF_STOCK = "OUT_OF_STOCK"  // Visible but not purchasable
}
```

### OrderStatus
```typescript
enum OrderStatus {
  PENDING    = "PENDING"      // Order created, awaiting payment
  CONFIRMED  = "CONFIRMED"    // Payment received
  PROCESSING = "PROCESSING"   // Being prepared
  SHIPPED    = "SHIPPED"      // Shipped to customer
  DELIVERED  = "DELIVERED"    // Successfully delivered
  CANCELLED  = "CANCELLED"    // Order cancelled
  REFUNDED   = "REFUNDED"     // Payment refunded
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING    = "PENDING"      // Awaiting payment
  PROCESSING = "PROCESSING"   // Payment in progress
  COMPLETED  = "COMPLETED"    // Payment successful
  FAILED     = "FAILED"       // Payment failed
  REFUNDED   = "REFUNDED"     // Payment refunded
}
```

### LiveStatus
```typescript
enum LiveStatus {
  SCHEDULED = "SCHEDULED"   // Session scheduled
  LIVE      = "LIVE"        // Currently live
  ENDED     = "ENDED"       // Session ended
  CANCELLED = "CANCELLED"   // Session cancelled
}
```

### DiscountType
```typescript
enum DiscountType {
  PERCENTAGE   = "PERCENTAGE"     // Percentage off (0-100)
  FIXED_AMOUNT = "FIXED_AMOUNT"   // Fixed amount off
}
```

---

## Relationships Summary

### One-to-One (1:1)
- User ↔ Cart

### One-to-Many (1:N)
- User → Products (as seller)
- User → Orders (as buyer)
- User → Reviews
- User → LiveSessions
- Product → Reviews
- Product → CartItems
- Product → OrderItems
- Cart → CartItems
- Order → OrderItems
- Category → Categories (self-reference, parent-child)

### Many-to-Many (N:M)
- User ↔ Products (via Wishlist)

---

## Database Constraints

### Foreign Key Constraints
```sql
-- Product.sellerId → User.id (CASCADE delete)
-- Cart.userId → User.id (CASCADE delete)
-- CartItem.cartId → Cart.id (CASCADE delete)
-- CartItem.productId → Product.id (CASCADE delete)
-- Order.buyerId → User.id (NO ACTION - preserve order history)
-- OrderItem.orderId → Order.id (CASCADE delete)
-- OrderItem.productId → Product.id (NO ACTION - preserve order history)
-- Review.productId → Product.id (CASCADE delete)
-- Review.userId → User.id (CASCADE delete)
-- Wishlist.userId → User.id (CASCADE delete)
-- Wishlist.productId → Product.id (CASCADE delete)
-- LiveSession.sellerId → User.id (CASCADE delete)
```

### Unique Constraints
```sql
-- User: clerkId, email
-- Product: slug
-- Cart: userId
-- CartItem: (cartId, productId) composite
-- Order: orderNumber
-- Review: (productId, userId) composite
-- Wishlist: (userId, productId) composite
-- PromoCode: code
-- Category: name, slug
-- LiveSession: liveKitRoom
```

---

## Indexing Strategy

### High-Performance Queries

**Product Searches:**
```sql
-- Index on frequently queried fields
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_product_status ON products(status);
CREATE INDEX idx_product_featured ON products(featured);
CREATE INDEX idx_product_created_at ON products(createdAt DESC);
```

**Order Queries:**
```sql
-- Index for user order history
CREATE INDEX idx_order_buyer_created ON orders(buyerId, createdAt DESC);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_payment_status ON orders(paymentStatus);
```

**Cart Operations:**
```sql
-- Cart lookups by user
CREATE INDEX idx_cart_user ON carts(userId);
```

---

## Common Queries

### Get User's Cart with Items
```typescript
const cart = await prisma.cart.findUnique({
  where: { userId: user.id },
  include: {
    items: {
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    }
  }
});
```

### Get Product with Reviews and Average Rating
```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    seller: {
      select: {
        id: true,
        name: true,
        avatar: true
      }
    },
    reviews: {
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    },
    _count: {
      select: {
        reviews: true,
        wishlistItems: true
      }
    }
  }
});
```

### Get Order with Full Details
```typescript
const order = await prisma.order.findUnique({
  where: { id: orderId },
  include: {
    buyer: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    items: {
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true
          }
        }
      }
    }
  }
});
```

---

## Data Integrity Rules

### Product Inventory Management
```typescript
// When order is confirmed, decrement inventory
await prisma.$transaction(
  order.items.map(item =>
    prisma.product.update({
      where: { id: item.productId },
      data: {
        inventory: { decrement: item.quantity }
      }
    })
  )
);
```

### Review Count and Rating Update
```typescript
// After review is created/updated, update product stats
const reviews = await prisma.review.findMany({
  where: { productId },
  select: { rating: true }
});

const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

await prisma.product.update({
  where: { id: productId },
  data: {
    rating: avgRating,
    reviewCount: reviews.length
  }
});
```

---

## Backup and Migration Strategy

### Before Schema Changes
```bash
# 1. Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Create migration
npx prisma migrate dev --name descriptive_name

# 3. Test migration on staging
npx prisma migrate deploy

# 4. Deploy to production
npx prisma migrate deploy
```

### Rollback Strategy
```bash
# Revert last migration
npx prisma migrate resolve --rolled-back migration_name

# Restore from backup
psql $DATABASE_URL < backup_20260215.sql
```

---

**Last Updated:** February 15, 2026
