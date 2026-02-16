# LiveShop - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Routes Documentation](#api-routes-documentation)
6. [Dependencies](#dependencies)
7. [Environment Variables](#environment-variables)
8. [Key Components](#key-components)
9. [State Management](#state-management)
10. [Authentication Flow](#authentication-flow)
11. [Payment Integration](#payment-integration)
12. [Setup Instructions](#setup-instructions)

---

## Project Overview

**LiveShop** is a modern, full-stack e-commerce platform built with Next.js 15, featuring live shopping capabilities, real-time cart management, and secure payment processing through Razorpay.

### Key Features
- 🛍️ Product Management (CRUD operations)
- 🛒 Real-time Shopping Cart with Zustand state management
- 💳 Razorpay Payment Integration
- 📦 Order Management & Tracking
- ⭐ Product Reviews & Ratings
- 💝 Wishlist Functionality
- 🎥 Live Shopping Sessions
- 🏷️ Promo Codes & Discounts
- 👤 Clerk Authentication
- 🔍 Advanced Search with Suggestions
- 🎨 Modern UI with Radix UI & Tailwind CSS

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15.4.5 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + PostCSS
- **UI Components:** Radix UI (Avatar, Dialog, Dropdown, Select, etc.)
- **Icons:** Lucide React
- **State Management:** Zustand 5.0.7
- **Forms:** React Hook Form 7.62.0 + Zod 4.0.14
- **Notifications:** React Hot Toast 2.5.2 + Sonner 2.0.7
- **Charts:** Recharts 3.1.2

### Backend
- **Runtime:** Node.js 20+
- **API:** Next.js API Routes
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma 7.4.0
- **Authentication:** Clerk 6.28.1
- **Payment Gateway:** Razorpay 2.9.6
- **Webhooks:** Svix 1.71.0

### Development Tools
- **Linting:** ESLint 9
- **TypeScript:** ts-node 10.9.2, tsx 4.19.2
- **Database Tools:** Prisma Studio

---

## Project Structure

```
liveshop/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Database seeding script
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── _components/       # Page-specific components
│   │   │   ├── EnhancedSearch.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   └── PaymentGateway.tsx
│   │   ├── api/               # API Routes
│   │   │   ├── cart/
│   │   │   │   ├── route.ts   # GET, POST (Add to cart)
│   │   │   │   └── [itemId]/route.ts  # PATCH, DELETE
│   │   │   ├── categories/
│   │   │   │   └── route.ts   # GET categories
│   │   │   ├── images/
│   │   │   │   └── validate/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts   # GET, POST (Create order)
│   │   │   │   └── [id]/route.ts  # GET order details
│   │   │   ├── payments/
│   │   │   │   ├── create/route.ts   # Create Razorpay order
│   │   │   │   ├── verify/route.ts   # Verify payment
│   │   │   │   └── webhook/route.ts  # Payment webhooks
│   │   │   ├── products/
│   │   │   │   ├── route.ts   # GET, POST (Create product)
│   │   │   │   └── [id]/route.ts  # GET, PATCH, DELETE
│   │   │   ├── search/
│   │   │   │   └── route.ts   # GET search results
│   │   │   ├── users/
│   │   │   │   ├── route.ts   # POST (Create user)
│   │   │   │   └── [clerkId]/route.ts  # GET user by Clerk ID
│   │   │   └── webhooks/
│   │   │       └── clerk/route.ts  # Clerk user webhooks
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── success/page.tsx
│   │   ├── products/
│   │   │   ├── [id]/page.tsx
│   │   │   └── create/page.tsx
│   │   ├── search/page.tsx
│   │   ├── seller/
│   │   │   ├── analytics/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── shared/            # Reusable components
│   │   │   ├── Header.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── ui/                # UI primitives (Radix UI wrappers)
│   │   └── CartSync.tsx       # Cart synchronization component
│   ├── hooks/
│   │   └── useDbUser.ts       # Custom hook for user data
│   ├── lib/
│   │   ├── cart-store.ts      # Zustand cart state management
│   │   ├── dev-optimizations.ts
│   │   ├── image-validation.ts
│   │   ├── prisma.ts          # Prisma client instance
│   │   ├── store.ts           # Additional stores
│   │   ├── user.ts            # User utility functions
│   │   └── utils.ts           # Utility functions
│   └── middleware.ts          # Next.js middleware for auth
├── components.json            # shadcn/ui configuration
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts             # Next.js configuration
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── tsconfig.json
├── README.md
├── SETUP_GUIDE.md
└── MIGRATION_GUIDE.md
```

---

## Database Schema

### Models

#### **User**
```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique       # Clerk authentication ID
  email     String   @unique
  name      String?
  avatar    String?
  role      UserRole @default(BUYER)  # BUYER, SELLER, ADMIN
  bio       String?
  phone     String?
  
  # Relations
  products      Product[]
  orders        Order[]
  liveSessions  LiveSession[]
  reviews       Review[]
  wishlist      Wishlist[]
  cart          Cart?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### **Product**
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  name        String?
  description String   @db.Text
  price       Float
  inventory   Int      @default(0)
  category    String
  brand       String?
  attributes  Json?           # Flexible product attributes
  images      String[]        # Array of image URLs
  model3D     String?         # 3D model URL
  
  # Relations
  sellerId    String
  seller      User     @relation(...)
  orderItems  OrderItem[]
  reviews     Review[]
  wishlistItems Wishlist[]
  cartItems   CartItem[]
  
  # Status
  status      ProductStatus @default(ACTIVE)  # DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK
  inStock     Boolean       @default(true)
  featured    Boolean       @default(false)
  
  # Ratings
  rating      Float         @default(0)
  reviewCount Int           @default(0)
  
  # SEO
  slug        String?       @unique
  tags        String[]
}
```

#### **Cart & CartItem**
```prisma
model Cart {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(...)
  items     CartItem[]
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int      @default(1)
  price     Float    # Price at time of adding
}
```

#### **Order & OrderItem**
```prisma
model Order {
  id            String      @id @default(cuid())
  orderNumber   String?     @unique
  buyerId       String
  buyer         User        @relation(...)
  items         OrderItem[]
  
  # Pricing
  subtotal      Float       @default(0)
  tax           Float       @default(0)
  shipping      Float       @default(0)
  discount      Float       @default(0)
  total         Float
  
  # Payment
  paymentStatus PaymentStatus @default(PENDING)
  paymentMethod String?
  paymentId     String?
  paidAt        DateTime?
  
  # Shipping
  shippingAddress Json
  billingAddress  Json?
  status          OrderStatus @default(PENDING)
  trackingNumber  String?
}
```

#### **Review**
```prisma
model Review {
  id        String @id @default(cuid())
  productId String
  userId    String
  rating    Int           # 1-5 stars
  title     String?
  content   String   @db.Text
  images    String[]
  verified  Boolean @default(false)
  helpful   Int    @default(0)
}
```

#### **Wishlist**
```prisma
model Wishlist {
  id        String @id @default(cuid())
  userId    String
  productId String
  
  @@unique([userId, productId])
}
```

#### **PromoCode**
```prisma
model PromoCode {
  id          String    @id @default(cuid())
  code        String    @unique
  discountType    DiscountType     # PERCENTAGE, FIXED_AMOUNT
  discountValue   Float
  maxUses         Int?
  usedCount       Int      @default(0)
  validFrom       DateTime
  validUntil      DateTime
  minOrderAmount  Float?
  isActive        Boolean  @default(true)
}
```

#### **Category**
```prisma
model Category {
  id          String @id @default(cuid())
  name        String @unique
  slug        String @unique
  description String?  @db.Text
  image       String?
  parentId    String?
  isActive    Boolean @default(true)
}
```

#### **LiveSession**
```prisma
model LiveSession {
  id          String   @id @default(cuid())
  title       String
  liveKitRoom String   @unique
  sellerId    String
  productIds  String[]
  status      LiveStatus @default(SCHEDULED)  # SCHEDULED, LIVE, ENDED, CANCELLED
  scheduledAt DateTime?
  maxViewers  Int      @default(0)
  totalViews  Int      @default(0)
}
```

### Enums
```prisma
enum UserRole { BUYER, SELLER, ADMIN }
enum ProductStatus { DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK }
enum OrderStatus { PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED }
enum PaymentStatus { PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED }
enum LiveStatus { SCHEDULED, LIVE, ENDED, CANCELLED }
enum DiscountType { PERCENTAGE, FIXED_AMOUNT }
```

---

## API Routes Documentation

### Products API

#### **GET /api/products**
Fetch all products with filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12)
- `category` (string, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `sort` (string: 'newest' | 'price-asc' | 'price-desc' | 'rating')
- `featured` (boolean, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 50,
      "hasMore": true
    }
  }
}
```

#### **POST /api/products**
Create a new product (requires authentication).

**Request Body:**
```json
{
  "title": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "images": ["url1", "url2"],
  "category": "Electronics",
  "inventory": 100,
  "brand": "Brand Name",
  "tags": ["tag1", "tag2"],
  "status": "ACTIVE",
  "features": [...],
  "specifications": {...},
  "dimensions": {...},
  "weight": 1.5,
  "colors": [...],
  "sizes": [...],
  "materials": [...],
  "warranty": "1 year"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "title": "Product Name",
    ...
  }
}
```

#### **GET /api/products/[id]**
Get a single product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "title": "Product Name",
    "seller": {
      "id": "seller_id",
      "name": "Seller Name"
    },
    "reviews": [...],
    ...
  }
}
```

#### **PATCH /api/products/[id]**
Update a product (requires authentication & ownership).

**Request Body:** (partial update)
```json
{
  "title": "Updated Name",
  "price": 89.99,
  "inventory": 150
}
```

#### **DELETE /api/products/[id]**
Delete a product (requires authentication & ownership).

---

### Cart API

#### **GET /api/cart**
Get user's cart (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart_id",
      "items": [
        {
          "id": "item_id",
          "quantity": 2,
          "price": 99.99,
          "product": {
            "id": "product_id",
            "title": "Product Name",
            "images": ["url"],
            "seller": {...}
          }
        }
      ]
    },
    "subtotal": 199.98,
    "itemCount": 2,
    "total": 199.98
  }
}
```

#### **POST /api/cart**
Add item to cart (requires authentication).

**Request Body:**
```json
{
  "productId": "product_id",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cartItem": {...}
  }
}
```

#### **PATCH /api/cart/[itemId]**
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

#### **DELETE /api/cart/[itemId]**
Remove item from cart.

---

### Orders API

#### **GET /api/orders**
Get user's orders with pagination (requires authentication).

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (OrderStatus, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_id",
        "orderNumber": "ORD-123456",
        "status": "CONFIRMED",
        "total": 299.99,
        "items": [...],
        "buyer": {...},
        "createdAt": "2026-02-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25
    }
  }
}
```

#### **POST /api/orders**
Create a new order (requires authentication).

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country",
    "phone": "+1234567890"
  },
  "billingAddress": {...},
  "subtotal": 199.98,
  "tax": 20.00,
  "shipping": 10.00,
  "discount": 0,
  "total": 229.98
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_id",
      "orderNumber": "ORD-123456",
      ...
    }
  },
  "message": "Order created successfully"
}
```

#### **GET /api/orders/[id]**
Get order details by ID.

---

### Payments API

#### **POST /api/payments/create**
Create a Razorpay payment order (requires authentication).

**Request Body:**
```json
{
  "orderId": "order_id",
  "currency": "INR"
}
```

**Response:**
```json
{
  "orderId": "razorpay_order_id",
  "amount": 22998,
  "currency": "INR",
  "key": "rzp_test_xxxxx",
  "order": {
    "id": "order_id",
    "items": [...],
    "total": 229.98,
    "finalTotal": 229.98
  }
}
```

#### **POST /api/payments/verify**
Verify Razorpay payment signature (requires authentication).

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxxx",
  "razorpay_payment_id": "pay_xxxx",
  "razorpay_signature": "signature",
  "orderId": "order_id"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_id",
    "status": "CONFIRMED",
    "paymentStatus": "COMPLETED",
    ...
  },
  "message": "Payment verified successfully"
}
```

**Note:** On successful verification:
- Order status → `CONFIRMED`
- Payment status → `COMPLETED`
- Product inventory is automatically decremented

#### **POST /api/payments/webhook**
Razorpay webhook endpoint for payment notifications.

---

### Search API

#### **GET /api/search**
Search products with suggestions.

**Query Parameters:**
- `q` (string, required) - Search query
- `suggest` (boolean, default: false) - Return only suggestions

**Response (Full Search):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product_id",
        "title": "Product Name",
        "rating": 4.5,
        "reviewCount": 12,
        "seller": {...},
        ...
      }
    ]
  }
}
```

**Response (Suggestions):**
```json
{
  "success": true,
  "data": {
    "suggestions": ["iPhone 13", "iPhone 14", "iPhone Case"]
  }
}
```

---

### Categories API

#### **GET /api/categories**
Get all categories with product counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Electronics",
      "count": 150
    },
    {
      "name": "Fashion",
      "count": 89
    }
  ]
}
```

---

### Users API

#### **POST /api/users**
Create a new user or return existing user.

**Request Body:**
```json
{
  "clerkId": "user_xxxxx",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "role": "BUYER"
}
```

#### **GET /api/users/[clerkId]**
Get user by Clerk ID.

---

### Webhooks API

#### **POST /api/webhooks/clerk**
Clerk webhook for user events (create, update, delete).

**Events Handled:**
- `user.created` - Create user in database
- `user.updated` - Update user details
- `user.deleted` - Soft delete or remove user

**Headers Required:**
- `svix-id`
- `svix-timestamp`
- `svix-signature`

---

## Dependencies

### Production Dependencies
```json
{
  "@clerk/nextjs": "^6.28.1",                  // Authentication
  "@hookform/resolvers": "^5.2.1",             // Form validation
  "@prisma/client": "^7.4.0",                  // Database ORM
  "@radix-ui/react-*": "Various",              // UI primitives
  "axios": "^1.11.0",                          // HTTP client
  "class-variance-authority": "^0.7.1",        // CSS variants
  "clsx": "^2.1.1",                           // Class name utility
  "lucide-react": "^0.540.0",                  // Icons
  "next": "15.4.5",                            // React framework
  "next-themes": "^0.4.6",                     // Theme management
  "razorpay": "^2.9.6",                        // Payment gateway
  "react": "18.2.0",                           // UI library
  "react-hook-form": "^7.62.0",                // Form management
  "react-hot-toast": "^2.5.2",                 // Notifications
  "recharts": "^3.1.2",                        // Charts
  "sonner": "^2.0.7",                          // Toast notifications
  "svix": "^1.71.0",                           // Webhook verification
  "tailwind-merge": "^3.3.1",                  // Tailwind utilities
  "uuid": "^11.1.0",                           // UUID generation
  "zod": "^4.0.14",                            // Schema validation
  "zustand": "^5.0.7"                          // State management
}
```

### Dev Dependencies
```json
{
  "@types/node": "^20.19.9",
  "@types/react": "^18.3.23",
  "@types/react-dom": "^18.3.7",
  "eslint": "^9",
  "eslint-config-next": "15.4.5",
  "prisma": "^7.4.0",                          // Prisma CLI
  "tailwindcss": "^4",
  "ts-node": "^10.9.2",
  "tsx": "^4.19.2",                            // TypeScript execution
  "typescript": "^5"
}
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxxxx"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional: Webhook Verification
WEBHOOK_SECRET="whsec_xxxxx"
```

---

## Key Components

### CartSync Component
**Location:** `src/components/CartSync.tsx`

Synchronizes cart state with the database when user logs in.

```typescript
// Automatically fetches cart when user is authenticated
useEffect(() => {
  if (user) {
    fetchCart();
  }
}, [user, fetchCart]);
```

### useDbCartStore Hook
**Location:** `src/lib/cart-store.ts`

Zustand store for cart management with the following methods:

**State:**
- `cart` - Current cart object
- `items` - Array of cart items
- `loading` - Loading state
- `itemCount` - Total items in cart
- `subtotal` - Cart subtotal
- `total` - Cart total

**Actions:**
- `fetchCart()` - Fetch cart from database
- `addItem(productId, quantity)` - Add item to cart
- `updateQuantity(itemId, quantity)` - Update item quantity
- `removeItem(itemId)` - Remove item from cart
- `clearCart()` - Clear all cart items
- `toggleCart()` - Toggle cart sidebar
- `clearState()` - Clear cart state (on logout)

**Usage:**
```typescript
import { useDbCartStore } from '@/lib/cart-store';

const cartItemCount = useDbCartStore(state => state.itemCount);
const addItem = useDbCartStore(state => state.addItem);
```

### Header Component
**Location:** `src/app/_components/Header.tsx`

Main navigation header with:
- Logo and branding
- User authentication (Clerk)
- Cart icon with item count badge
- Wishlist icon
- Seller dashboard link
- Mobile menu

### Middleware
**Location:** `src/middleware.ts`

Handles authentication for protected routes:
- Public routes: `/`, `/products`, `/categories`, `/search`, `/api/webhooks/clerk`
- Protected routes: `/cart`, `/checkout`, `/orders`, `/seller`, `/dashboard`
- Redirects unauthenticated users to `/sign-in`

---

## State Management

### Zustand Stores

#### Cart Store (`cart-store.ts`)
Manages shopping cart state with automatic API synchronization.

#### General Store (`store.ts`)
Additional application state (if needed).

### React Context
- **ClerkProvider** - Authentication context

---

## Authentication Flow

### 1. User Signs Up/Signs In (Clerk)
- User authenticates via Clerk UI
- Clerk creates user session

### 2. Webhook Triggered
- Clerk sends webhook to `/api/webhooks/clerk`
- `user.created` event received
- User record created in database

### 3. Session Management
- Clerk session stored in cookies
- `useUser()` hook provides user data
- Middleware protects routes

### 4. User Sync
- Database user linked via `clerkId`
- User record automatically created on first API call if not exists

---

## Payment Integration

### Razorpay Flow

1. **Create Order**
   ```typescript
   POST /api/payments/create
   Body: { orderId, currency }
   Returns: Razorpay order ID and amount
   ```

2. **Show Razorpay Checkout**
   ```typescript
   const options = {
     key: RAZORPAY_KEY_ID,
     amount: order.amount,
     currency: order.currency,
     order_id: order.orderId,
     handler: async (response) => {
       // Verify payment
     }
   };
   const rzp = new Razorpay(options);
   rzp.open();
   ```

3. **Verify Payment**
   ```typescript
   POST /api/payments/verify
   Body: {
     razorpay_order_id,
     razorpay_payment_id,
     razorpay_signature,
     orderId
   }
   ```

4. **Update Order Status**
   - Payment verified ✅
   - Order status → CONFIRMED
   - Payment status → COMPLETED
   - Inventory decremented
   - User redirected to success page

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone <repository-url>
cd liveshop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create `.env` file with required variables (see Environment Variables section).

### 4. Set Up Database
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production
```bash
npm run build
npm start
```

---

## NPM Scripts

```json
{
  "dev": "next dev",                    // Start development server
  "build": "prisma generate && next build",  // Build for production
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "postinstall": "prisma generate",     // Auto-generate Prisma Client
  "db:generate": "prisma generate",     // Generate Prisma Client
  "db:migrate": "prisma migrate dev",   // Run migrations
  "db:push": "prisma db push",          // Push schema to DB
  "db:seed": "tsx prisma/seed.ts",      // Seed database
  "db:studio": "prisma studio"          // Open Prisma Studio
}
```

---

## Database Commands

### Generate Prisma Client
```bash
npm run db:generate
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Push Schema (Without Migration)
```bash
npm run db:push
```

### Seed Database
```bash
npm run db:seed
```

### Open Prisma Studio
```bash
npm run db:studio
```

### Reset Database
```bash
npx prisma migrate reset
```

---

## Additional Features

### Image Validation
**Location:** `src/lib/image-validation.ts`

Validates image URLs and dimensions.

### Development Optimizations
**Location:** `src/lib/dev-optimizations.ts`

Performance optimizations for development mode.

### User Utilities
**Location:** `src/lib/user.ts`

Helper functions:
- `getUserByClerkId(clerkId)`
- `createUser(userData)`
- `updateUser(clerkId, data)`
- `deleteUser(clerkId)`

---

## Security Features

1. **Authentication:** Clerk-based authentication with session management
2. **Authorization:** Route-level protection via middleware
3. **Payment Security:** Razorpay signature verification
4. **Webhook Security:** Svix signature verification for Clerk webhooks
5. **SQL Injection Protection:** Prisma ORM with parameterized queries
6. **CSRF Protection:** Next.js built-in CSRF protection
7. **Content Security Policy:** Configured in `next.config.ts`

---

## Performance Optimizations

1. **Image Optimization:** Next.js Image component with remote patterns
2. **Code Splitting:** Automatic with Next.js App Router
3. **CSS Optimization:** Tailwind CSS with PurgeCSS
4. **Database Queries:** Optimized with Prisma includes and selects
5. **Caching:** Next.js automatic static optimization
6. **Bundle Size:** Package import optimization configured

---

## Error Handling

### API Error Responses
All API routes return consistent error format:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing

### Manual Testing
1. User registration and login
2. Product creation and management
3. Cart operations (add, update, remove)
4. Order creation and payment flow
5. Search functionality
6. Review submission

### Database Testing
Use Prisma Studio to inspect database:
```bash
npm run db:studio
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically on push

### Database Migration for Production
```bash
npx prisma migrate deploy
```

---

## Troubleshooting

### Prisma Client Not Found
```bash
npm run db:generate
```

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check database is running
- Ensure network connectivity

### Clerk Authentication Issues
- Verify Clerk API keys
- Check middleware configuration
- Ensure webhook endpoint is accessible

### Payment Issues
- Verify Razorpay credentials
- Check payment webhook configuration
- Ensure proper signature verification

---

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Clerk Docs:** https://clerk.com/docs
- **Razorpay Docs:** https://razorpay.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## License

This project is proprietary and confidential.

---

**Last Updated:** February 15, 2026
**Version:** 0.1.0
