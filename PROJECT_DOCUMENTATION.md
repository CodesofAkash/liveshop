# LiveShop - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Getting Started](#getting-started)
5. [Database Schema](#database-schema)
6. [Application Routes](#application-routes)
7. [API Endpoints](#api-endpoints)
8. [State Management](#state-management)
9. [Authentication & Authorization](#authentication--authorization)
10. [Key Features](#key-features)
11. [Payment Integration](#payment-integration)
12. [Development Notes](#development-notes)
13. [Environment Variables](#environment-variables)
14. [Project Structure](#project-structure)

---

## Project Overview

**LiveShop** is a modern, full-stack e-commerce platform built with Next.js 15 that combines traditional online shopping with live streaming capabilities. The application supports multiple user roles (Buyers, Sellers, Admins) and provides comprehensive features including:

- Product catalog with advanced search and filtering
- Shopping cart and wishlist functionality
- Multi-step checkout with integrated payment processing
- Order management and tracking
- Product reviews and ratings
- Seller dashboard with analytics
- Live shopping sessions (infrastructure ready)
- Real-time analytics for sellers

**Current Status**: Active development, recently added seller analytics features. The project is production-ready for standard e-commerce features, with live streaming infrastructure in place.

---

## Technology Stack

### Core Framework
- **Next.js 15.4.5** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5** - Type safety

### Database & ORM
- **MongoDB** - NoSQL database
- **Prisma 6.13.0** - Type-safe ORM with schema management

### Authentication
- **Clerk** - Authentication & user management
  - OAuth support (Google, GitHub, etc.)
  - Email/password authentication
  - Webhook integration for user lifecycle

### Payment Processing
- **Razorpay** - Indian payment gateway
  - Test mode: `rzp_test_8AlFWKIHXkMvTK`
  - Supports UPI, cards, net banking, wallets

### State Management
- **Zustand 5** - Lightweight state management
  - Persistent stores with localStorage
  - Multiple domain-specific stores

### UI Framework
- **Radix UI** - Accessible, unstyled component primitives
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Shadcn/ui** - Component library built on Radix

### Form Handling & Validation
- **React Hook Form 7** - Form state management
- **Zod 4** - Schema validation

### Additional Libraries
- **Axios 1.11.0** - HTTP client
- **Recharts 3.1.2** - Charts for analytics
- **react-hot-toast** - Notification system
- **Sonner** - Toast notifications
- **next-themes** - Theme management (light/dark mode)
- **ngrok** - Local webhook testing during development

### Real-time Features (Ready for Implementation)
- **LiveKit** - Infrastructure for live video streaming

---

## Project Architecture

### Architecture Pattern
- **Server-Side Rendering (SSR)** with Next.js App Router
- **API Routes** for backend logic
- **RESTful API** design
- **MongoDB** for flexible schema storage
- **Zustand** for client-side state management

### Key Design Decisions

1. **MongoDB with Prisma**: Chosen for flexible schema (products with varying attributes stored as JSON)
2. **Clerk Authentication**: Provides OAuth, webhooks, and user management out-of-the-box
3. **Database-backed Cart**: Cart persists across sessions (moved from localStorage)
4. **Zustand over Redux**: Simpler API, less boilerplate, better performance
5. **Server Components**: Default for better performance, client components only where needed
6. **Middleware Protection**: Centralized authentication checks

### Directory Structure
```
liveshop/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── _components/        # Shared app components
│   │   ├── (auth)/            # Auth group routes
│   │   ├── api/               # API routes
│   │   ├── products/          # Product pages
│   │   ├── seller/            # Seller dashboard
│   │   ├── orders/            # Order management
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── categories/        # Category browsing
│   │   └── ...                # Other pages
│   ├── components/
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and shared code
│   │   ├── store.ts           # Zustand stores
│   │   ├── prisma.ts          # Prisma client
│   │   ├── utils.ts           # Helper functions
│   │   └── user.ts            # User utilities
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Route protection
├── .env                       # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or Atlas)
- Clerk account (for authentication)
- Razorpay account (for payments, test mode available)

### Installation

1. **Clone the repository**
```bash
cd liveshop
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file with the following:
```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Razorpay Payment
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# MongoDB Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/liveshop?retryWrites=true&w=majority
```

4. **Generate Prisma Client**
```bash
npx prisma generate
```

5. **Push database schema** (for first-time setup)
```bash
npx prisma db push
```

6. **Run development server**
```bash
npm run dev
```

7. **Open application**
Visit `http://localhost:3000`

### Building for Production
```bash
npm run build
npm start
```

### Development Tools
- **Prisma Studio**: `npx prisma studio` - Database GUI
- **ngrok**: For testing webhooks locally

---

## Database Schema

### Entity Relationship Overview

```
User (clerkId, role: BUYER/SELLER/ADMIN)
  ├── Products (1:many) - Seller's products
  ├── Orders (1:many) - Buyer's orders
  ├── Reviews (1:many)
  ├── Wishlist (1:many)
  ├── Cart (1:1)
  ├── LiveSessions (1:many) - Seller's live streams
  ├── ProductViews (1:many) - User's product views
  ├── AnalyticsSnapshots (1:many) - Seller analytics
  └── StorePerformance (1:many) - Seller performance data

Product
  ├── OrderItems (1:many)
  ├── Reviews (1:many)
  ├── WishlistItems (1:many)
  ├── CartItems (1:many)
  └── ProductViews (1:many) - View tracking

Order
  └── OrderItems (1:many)

Cart
  └── CartItems (1:many)
```

### Core Models

#### User Model
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  clerkId   String   @unique
  email     String   @unique
  name      String?
  avatar    String?
  role      UserRole @default(BUYER)
  bio       String?
  phone     String?

  // Relations
  products             Product[]
  orders               Order[]
  liveSessions         LiveSession[]
  reviews              Review[]
  wishlist             Wishlist[]
  cart                 Cart?
  productViews         ProductView[]
  analyticsSnapshots   AnalyticsSnapshot[]
  storePerformance     StorePerformance[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  BUYER
  SELLER
  ADMIN
}
```

**Key Features**:
- Integrated with Clerk via `clerkId`
- Role-based access (BUYER, SELLER, ADMIN)
- One-to-many relationships with products, orders, reviews
- Analytics tracking for sellers

#### Product Model
```prisma
model Product {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  name        String?
  description String
  price       Float
  inventory   Int      @default(0)
  category    String
  brand       String?
  attributes  Json?    // Flexible product specifications
  images      String[]
  model3D     String?  // For AR/3D viewing

  sellerId    String   @db.ObjectId
  seller      User     @relation(fields: [sellerId], references: [id], onDelete: Cascade)

  orderItems  OrderItem[]
  reviews     Review[]
  wishlistItems Wishlist[]
  cartItems   CartItem[]
  views       ProductView[]

  status      ProductStatus @default(ACTIVE)
  inStock     Boolean       @default(true)
  featured    Boolean       @default(false)
  rating      Float         @default(0)
  reviewCount Int           @default(0)
  slug        String?       @unique
  tags        String[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProductStatus {
  DRAFT
  ACTIVE
  INACTIVE
  OUT_OF_STOCK
}
```

**Key Features**:
- Flexible attributes stored as JSON (e.g., color, size, material)
- Multiple images support
- 3D model support for AR viewing (future feature)
- Automatic rating calculation
- Status tracking (DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK)
- Category and brand filtering
- Tag-based search

#### Order Model
```prisma
model Order {
  id            String      @id @default(auto()) @map("_id") @db.ObjectId
  orderNumber   String?     @unique

  buyerId       String      @db.ObjectId
  buyer         User        @relation(fields: [buyerId], references: [id])

  items         OrderItem[]

  subtotal      Float       @default(0)
  tax           Float       @default(0)
  shipping      Float       @default(0)
  discount      Float       @default(0)
  total         Float

  paymentStatus PaymentStatus @default(PENDING)
  paymentMethod String?
  paymentId     String?
  paidAt        DateTime?

  shippingAddress Json
  billingAddress  Json?
  status          OrderStatus @default(PENDING)
  trackingNumber  String?

  notes         String?
  giftMessage   String?
  adminNotes    String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  CONFIRMED
  PROCESSING
  CANCELLED
  REFUNDED
}
```

**Key Features**:
- Auto-generated order numbers
- Comprehensive pricing breakdown (subtotal, tax, shipping, discount)
- Dual payment and order status tracking
- Shipping address stored as JSON for flexibility
- Gift message support
- Admin notes for internal tracking

#### Cart & CartItem Models
```prisma
model Cart {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CartItem {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  cartId    String   @db.ObjectId
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)

  productId String   @db.ObjectId
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  quantity  Int      @default(1)
  price     Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
}
```

**Key Features**:
- Database-backed cart for persistence
- Unique constraint prevents duplicate products in cart
- Price snapshot at time of adding to cart
- Cascading deletes for data integrity

#### Review Model
```prisma
model Review {
  id        String @id @default(auto()) @map("_id") @db.ObjectId

  productId String @db.ObjectId
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  userId    String @db.ObjectId
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  rating    Int
  comment   String
  images    String[]
  verified  Boolean @default(false)
  helpful   Int    @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Key Features**:
- 1-5 star rating system
- Image attachments support
- Verified purchase flag
- Helpful count for community moderation

#### Wishlist Model
```prisma
model Wishlist {
  id        String @id @default(auto()) @map("_id") @db.ObjectId
  userId    String @db.ObjectId
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String @db.ObjectId
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}
```

#### LiveSession Model (Infrastructure Ready)
```prisma
model LiveSession {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  liveKitRoom String   @unique

  sellerId    String   @db.ObjectId
  seller      User     @relation(fields: [sellerId], references: [id], onDelete: Cascade)

  productIds  String[] @db.ObjectId
  status      LiveStatus @default(SCHEDULED)
  scheduledAt DateTime?
  startedAt   DateTime?
  endedAt     DateTime?

  maxViewers  Int      @default(0)
  totalViews  Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum LiveStatus {
  SCHEDULED
  LIVE
  ENDED
  CANCELLED
}
```

#### Analytics Models (Recently Added)

**ProductView** - Track product page views
```prisma
model ProductView {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  productId String   @db.ObjectId
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String?  @db.ObjectId  // Null for anonymous
  user      User?    @relation(fields: [userId], references: [id])
  sessionId String?   // For anonymous tracking
  ipAddress String?
  userAgent String?
  referrer  String?
  source    String?   // organic, social, direct, etc.
  createdAt DateTime @default(now())
}
```

**AnalyticsSnapshot** - Pre-calculated analytics
```prisma
model AnalyticsSnapshot {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  sellerId    String   @db.ObjectId
  seller      User     @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  startDate   DateTime
  endDate     DateTime
  period      String   // "day", "week", "month", "quarter", "year"
  metrics     Json     // Pre-calculated metrics
  isComplete  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([sellerId, startDate, endDate, period])
}
```

**StorePerformance** - Daily aggregated stats
```prisma
model StorePerformance {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  sellerId    String   @db.ObjectId
  seller      User     @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  date        DateTime
  revenue     Float    @default(0)
  orders      Int      @default(0)
  items       Int      @default(0)
  views       Int      @default(0)
  visitors    Int      @default(0)
  sessions    Int      @default(0)
  conversionRate      Float @default(0)
  averageOrderValue   Float @default(0)
  topProducts         Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([sellerId, date])
}
```

#### PromoCode Model
```prisma
model PromoCode {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  code        String    @unique
  description String?
  discountType    DiscountType
  discountValue   Float
  maxUses         Int?
  usedCount       Int          @default(0)
  maxUsesPerUser  Int?
  validFrom   DateTime
  validUntil  DateTime
  minOrderAmount  Float?
  applicableCategories String[]
  isActive    Boolean   @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}
```

#### Category Model
```prisma
model Category {
  id          String @id @default(auto()) @map("_id") @db.ObjectId
  name        String @unique
  slug        String @unique
  description String?
  image       String?
  parentId    String? @db.ObjectId
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  children    Category[] @relation("CategoryHierarchy")
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Application Routes

### Public Routes (No Authentication Required)

#### Homepage
- **Route**: `/`
- **Description**: Main landing page with product grid, featured products, live sessions
- **Features**:
  - Product search with real-time suggestions
  - Category filter
  - Price range filter
  - Sort options (relevance, price, rating, newest, popular)
  - Pagination
  - Grid/list view toggle

#### Product Pages
- **Route**: `/products/[id]`
- **Description**: Product detail page
- **Features**:
  - Image gallery with zoom
  - Product information (title, price, description, brand, specs)
  - Add to cart/wishlist
  - Quantity selector
  - Reviews and ratings
  - Related products
  - Seller information

#### Category Browsing
- **Route**: `/categories/[category]`
- **Description**: Browse products by category
- **Features**:
  - Filtered product grid
  - Category-specific filters
  - Breadcrumb navigation

#### Search
- **Route**: `/search`
- **Query Params**: `?q=search_term&category=...&sort=...`
- **Description**: Search results page
- **Features**:
  - Full-text search
  - Advanced filtering (category, price, brand, rating)
  - Sort options
  - Search suggestions

### Protected Routes (Authentication Required)

#### Cart
- **Route**: `/cart`
- **Description**: Shopping cart page
- **Features**:
  - List cart items with images
  - Update quantities
  - Remove items
  - Price breakdown (subtotal, tax, shipping, discount)
  - Proceed to checkout button
  - Empty cart state

#### Checkout
- **Route**: `/checkout`
- **Description**: Multi-step checkout process
- **Steps**:
  1. **Shipping Information**: Address form with validation
  2. **Delivery Options**: Standard/Express shipping selection
  3. **Payment**: Razorpay integration
- **Features**:
  - Form validation with Zod
  - Order summary sidebar
  - Tax calculation (18% GST)
  - Shipping fee calculation
  - Payment gateway integration

#### Orders
- **Route**: `/orders`
- **Description**: Order history page
- **Features**:
  - List all orders with pagination
  - Filter by status (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
  - Order summary cards (order number, date, items, total, status)
  - Click to view order details

- **Route**: `/orders/[id]`
- **Description**: Order detail page
- **Features**:
  - Complete order information
  - Item list with images
  - Shipping address
  - Payment information
  - Order status tracking
  - Cancel order button (if applicable)
  - Download invoice

- **Route**: `/orders/[id]/success`
- **Description**: Payment success confirmation page
- **Features**:
  - Success message
  - Order summary
  - Next steps
  - Link to order details

#### Wishlist
- **Route**: `/wishlist`
- **Description**: Saved items page
- **Features**:
  - Grid of wishlisted products
  - Remove from wishlist
  - Add to cart from wishlist
  - Empty wishlist state

#### Profile
- **Route**: `/profile`
- **Description**: User profile management
- **Features**:
  - Personal information (name, email, phone, bio, avatar)
  - Saved addresses
  - Order statistics
  - Recent activity
  - Preferences (newsletter, notifications, dark mode)

### Seller Routes

#### Product Creation
- **Route**: `/products/create`
- **Role**: SELLER
- **Description**: Create new product listing
- **Features**:
  - Product form with validation
  - Multiple image upload
  - Category selection
  - Brand input
  - Inventory management
  - Price setting
  - Tags and specifications
  - Draft/Active status

#### Seller Dashboard
- **Route**: `/seller/dashboard`
- **Role**: SELLER
- **Description**: Seller overview page
- **Features**:
  - Product list
  - Quick stats (total products, active listings, inventory alerts)
  - Recent orders
  - Quick actions (add product, manage inventory)

#### Seller Analytics
- **Route**: `/seller/analytics`
- **Role**: SELLER
- **Description**: Comprehensive analytics dashboard
- **Features**:
  - **Time Range Selection**: 7d, 30d, 90d, 1y
  - **Revenue Metrics**:
    - Total revenue with growth percentage
    - Revenue trend chart
  - **Order Analytics**:
    - Total orders with growth percentage
    - Orders over time chart
  - **Customer Metrics**:
    - Total customers
    - New vs returning customers
  - **Product Performance**:
    - Top-performing products table
    - Category breakdown chart
  - **Traffic Analytics**:
    - Total views, unique visitors
    - Bounce rate, average session time
    - Traffic over time chart
  - **Conversion Metrics**:
    - Conversion rate with trend
    - Conversion rate chart
  - **Export**: PDF export functionality

### Other Routes

#### Dashboard
- **Route**: `/dashboard`
- **Description**: General user dashboard

#### Settings
- **Route**: `/settings`
- **Description**: Application settings page

---

## API Endpoints

All API routes are located in `src/app/api/`.

### Authentication
- **POST** `/api/webhooks/clerk` - Clerk webhook for user lifecycle events (create, update, delete)

### Products
- **GET** `/api/products` - Fetch products with pagination, filtering, sorting
  - Query params: `page`, `limit`, `category`, `search`, `minPrice`, `maxPrice`, `sort`
  - Returns: `{ products, totalPages, currentPage }`

- **POST** `/api/products` - Create new product (seller only)
  - Body: Product data
  - Returns: Created product

- **GET** `/api/products/[id]` - Get single product details
  - Returns: Product with reviews

- **PUT** `/api/products/[id]` - Update product (seller only, own products)
  - Body: Partial product data
  - Returns: Updated product

- **DELETE** `/api/products/[id]` - Delete product (seller only, own products)
  - Returns: Success message

### Reviews
- **GET** `/api/products/[id]/reviews` - Get product reviews
  - Query params: `page`, `limit`, `sort`
  - Returns: `{ reviews, totalPages }`

- **POST** `/api/products/[id]/reviews` - Submit product review
  - Body: `{ rating, comment, images? }`
  - Returns: Created review

### Cart
- **GET** `/api/cart` - Get user's cart
  - Returns: Cart with items and products

- **POST** `/api/cart` - Add item to cart
  - Body: `{ productId, quantity }`
  - Returns: Updated cart

- **PUT** `/api/cart/[itemId]` - Update cart item quantity
  - Body: `{ quantity }`
  - Returns: Updated cart

- **DELETE** `/api/cart/[itemId]` - Remove cart item
  - Returns: Updated cart

- **DELETE** `/api/cart` - Clear entire cart
  - Returns: Empty cart

### Orders
- **GET** `/api/orders` - Fetch user's orders
  - Query params: `page`, `limit`, `status`
  - Returns: `{ orders, totalPages }`

- **POST** `/api/orders` - Create order from cart
  - Body: `{ shippingAddress, paymentMethod }`
  - Returns: Created order

- **GET** `/api/orders/[id]` - Get order details
  - Returns: Order with items

- **DELETE** `/api/orders/[id]/cancel` - Cancel order
  - Returns: Updated order

### Payment
- **POST** `/api/payments/create` - Create Razorpay order
  - Body: `{ orderId, amount }`
  - Returns: `{ razorpayOrderId, amount, currency }`

- **POST** `/api/payments/verify` - Verify payment signature
  - Body: `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }`
  - Returns: Success/failure status
  - Updates order payment status on success

- **POST** `/api/payments/webhook` - Razorpay webhook handler
  - Handles payment events (success, failure)

### Wishlist
- **GET** `/api/wishlist` - Get user's wishlist
  - Returns: Array of wishlisted products

- **POST** `/api/wishlist` - Add to wishlist
  - Body: `{ productId }`
  - Returns: Updated wishlist

- **DELETE** `/api/wishlist` - Remove from wishlist
  - Body: `{ productId }`
  - Returns: Updated wishlist

### Search
- **GET** `/api/search` - Full-text product search
  - Query params: `q`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`
  - Returns: `{ products, totalPages }`

- **GET** `/api/search/suggestions` - Auto-complete suggestions
  - Query params: `q`
  - Returns: Array of suggestions

### Categories
- **GET** `/api/categories` - Fetch all categories
  - Returns: Array of categories with hierarchy

- **GET** `/api/categories/[category]` - Get products by category
  - Query params: `page`, `limit`, `sort`, `minPrice`, `maxPrice`
  - Returns: `{ products, totalPages }`

### Users
- **GET** `/api/users/[clerkId]` - Get user profile
  - Returns: User data

- **POST** `/api/users` - Create user (called on first login)
  - Body: `{ clerkId, email, name, avatar }`
  - Returns: Created user

### Seller Analytics
- **GET** `/api/seller/analytics` - Fetch seller analytics
  - Query params: `timeRange` (7d, 30d, 90d, 1y)
  - Returns: Comprehensive analytics data (revenue, orders, customers, products, traffic, conversion)

### Other
- **POST** `/api/messages` - Send message/contact form
  - Body: Message data
  - Returns: Success message

- **POST** `/api/images/validate` - Validate image URLs
  - Body: `{ images: string[] }`
  - Returns: Validation results

---

## State Management

### Zustand Stores

All stores are located in `src/lib/store.ts`. The application uses multiple domain-specific stores rather than a single global store.

#### useUserStore
```typescript
interface UserState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}
```
- **Persistence**: localStorage (key: `user-storage`)
- **Purpose**: User authentication state
- **Usage**: User profile, role-based rendering

#### useProductsStore
```typescript
interface ProductsState {
  products: Product[]
  filteredProducts: Product[]
  searchQuery: string
  selectedCategory: string
  priceRange: [number, number]
  loading: boolean
  error: string | null

  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setPriceRange: (range: [number, number]) => void
  filterProducts: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}
```
- **Purpose**: Product catalog, search, filtering
- **Auto-filtering**: Automatically re-filters when search/category/price changes

#### useCartStore (Legacy - Local Storage)
```typescript
interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
  discount: number
  discountCode: string | null

  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  calculateTotals: () => void
  getCartItemsCount: () => number
  getCartSubtotal: () => number
  getCartTotal: () => number
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  applyDiscount: (code: string, amount: number) => void
  removeDiscount: () => void
}
```
- **Persistence**: localStorage (key: `cart-storage`)
- **Status**: Legacy implementation, replaced by database-backed cart
- **Usage**: Might still be used for offline cart before login

#### useDbCartStore (Database-backed)
Located in `src/lib/cart-store.ts` (separate file)
```typescript
interface DbCartState {
  cart: Cart | null
  loading: boolean
  error: string | null

  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartItemCount: () => number
}
```
- **Purpose**: Current cart implementation
- **Backend**: All mutations call API endpoints
- **Sync**: Auto-syncs with database

#### useLiveStore
```typescript
interface LiveState {
  activeSessions: LiveSession[]
  currentSession: LiveSession | null
  isConnected: boolean
  viewerCount: number
  chatMessages: Array<{
    id: string
    userId: string
    userName: string
    message: string
    timestamp: Date
  }>

  setActiveSessions: (sessions: LiveSession[]) => void
  setCurrentSession: (session: LiveSession | null) => void
  setIsConnected: (connected: boolean) => void
  setViewerCount: (count: number) => void
  addChatMessage: (message: {...}) => void
  clearChat: () => void
}
```
- **Purpose**: Live shopping sessions
- **Status**: Infrastructure ready, not yet fully implemented

#### useUIStore
```typescript
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  loading: {
    global: boolean
    products: boolean
    orders: boolean
    live: boolean
    analytics: boolean
  }
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
  }>

  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void
  addNotification: (notification: {...}) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}
```
- **Persistence**: localStorage (key: `ui-storage`, only theme persisted)
- **Purpose**: Global UI state
- **Features**: Auto-dismiss notifications after 5s

#### useOrdersStore
```typescript
interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean

  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  setCurrentOrder: (order: Order | null) => void
  setLoading: (loading: boolean) => void
}
```
- **Purpose**: Order management
- **Usage**: Order history, order tracking

#### useAnalyticsStore (Recently Added)
```typescript
interface AnalyticsState {
  data: AnalyticsData | null
  realtimeData: RealtimeAnalytics | null
  timeRange: TimeRange
  loading: boolean
  error: string | null
  lastUpdated: Date | null

  setAnalyticsData: (data: AnalyticsData) => void
  setRealtimeData: (data: RealtimeAnalytics) => void
  setTimeRange: (range: TimeRange) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLastUpdated: (date: Date) => void
  clearData: () => void

  // Computed values
  getRevenueTrend: () => 'up' | 'down' | 'neutral'
  getTopCategory: () => string | null
  getConversionTrend: () => 'up' | 'down' | 'neutral'
}
```
- **Purpose**: Seller analytics dashboard
- **Features**:
  - Time range filtering
  - Computed trend calculations
  - Real-time data updates

---

## Authentication & Authorization

### Authentication Provider: Clerk

#### Integration Points

1. **User Signup/Login**
   - Clerk handles OAuth and email/password auth
   - Clerk redirects specified in `.env`:
     - Sign in/up URLs: `/`
     - After sign in/up: `/`

2. **Middleware Protection** (`src/middleware.ts`)
```typescript
// Public routes (no auth required)
const publicRoutes = [
  '/',
  '/api/webhooks/clerk',
  '/api/products(.*)',
  '/api/categories(.*)',
  '/api/search(.*)',
  '/products/(.*)',
  '/categories/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/orders',
  '/wishlist',
  '/search(.*)'
]

// All other routes require authentication
// Redirects to /sign-in with return_to param
```

3. **API Route Protection**
```typescript
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user from database via clerkId
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  // ... rest of logic
}
```

4. **Webhook Integration** (`/api/webhooks/clerk`)
   - **Events Handled**:
     - `user.created` - Creates User record in MongoDB
     - `user.updated` - Updates User record (email, name, avatar)
     - `user.deleted` - Deletes User record (cascades to related data)

   - **Signature Verification**:
   ```typescript
   import { Webhook } from 'svix'

   const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
   wh.verify(body, headers)
   ```

#### User Creation Flow
1. User signs up via Clerk
2. Clerk webhook fires `user.created` event
3. `/api/webhooks/clerk` creates User in MongoDB:
   ```typescript
   await prisma.user.create({
     data: {
       clerkId: evt.data.id,
       email: evt.data.email_addresses[0].email_address,
       name: `${evt.data.first_name} ${evt.data.last_name}`,
       avatar: evt.data.image_url,
       role: 'BUYER' // default role
     }
   })
   ```

### Authorization (Role-Based)

#### Roles
- **BUYER** (default): Can browse, purchase, review
- **SELLER**: Can create products, view analytics, manage inventory
- **ADMIN**: Full access (not yet implemented)

#### Role Checking in API Routes
```typescript
const user = await prisma.user.findUnique({
  where: { clerkId: userId }
})

if (user.role !== 'SELLER') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

#### Role Checking in UI
```typescript
import { useUserStore } from '@/lib/store'

const { user } = useUserStore()

{user?.role === 'SELLER' && (
  <Link href="/seller/dashboard">Seller Dashboard</Link>
)}
```

---

## Key Features

### 1. Product Catalog & Discovery

#### Search Functionality
- **Full-text search** across product title and description
- **Real-time suggestions** with debouncing
- **Auto-complete** powered by API endpoint
- **Search history** (could be added)

#### Filtering
- **Category filter**: Browse by product category
- **Price range**: Slider with min/max
- **Brand filter**: Multi-select brand filtering
- **Rating filter**: Filter by minimum rating
- **Status filter**: In stock/out of stock

#### Sorting Options
- Relevance (default for search)
- Price: Low to High
- Price: High to Low
- Rating: High to Low
- Newest First
- Most Popular (by views/sales)

#### Product Detail Page
- Image gallery with main image + thumbnails
- Zoom on hover
- Product specifications table
- Add to cart with quantity selector
- Add to wishlist (heart icon)
- Reviews and ratings section
- Related products carousel
- Seller information card

### 2. Shopping Cart

#### Cart Management
- **Persistent cart**: Database-backed, syncs across devices
- **Real-time updates**: Instant UI updates with optimistic rendering
- **Quantity controls**: Increase/decrease with inventory validation
- **Remove items**: Delete individual items or clear entire cart
- **Price calculation**: Subtotal, tax, shipping, discount
- **Cart sidebar**: Slide-out panel for quick cart view

#### Cart Sync Component
Located in `src/components/CartSync.tsx`
- Fetches cart on app mount
- Syncs local state with database
- Handles migration from localStorage cart to database

### 3. Wishlist

#### Wishlist Features (Custom Hook: `useWishlist`)
- **Toggle wishlist**: Heart icon on product cards
- **Add/remove**: Single API call with optimistic updates
- **Wishlist page**: Grid view of saved products
- **Add to cart from wishlist**: Quick action
- **Wishlist stats**: Count of saved items
- **Remove with confirmation**: Prevents accidental removal

**Hook Functions**:
```typescript
useWishlist() // Main hook
useWishlistButton(productId) // For heart icon toggle
useWishlistItem(productId) // For wishlist page items
useWishlistStats() // For count badge
```

### 4. Checkout Process

#### Multi-Step Checkout
**Step 1: Shipping Information**
- Address form with Zod validation
- Fields: Full name, address line 1 & 2, city, state, postal code, phone
- Auto-save to user profile
- Address book (saved addresses)

**Step 2: Delivery Options**
- Standard Shipping (₹99, 5-7 days)
- Express Shipping (₹199, 2-3 days)
- Free shipping on orders over ₹999

**Step 3: Payment**
- Razorpay integration
- Multiple payment methods (UPI, cards, wallets, net banking)
- Payment verification
- Order confirmation

#### Pricing Breakdown
```typescript
Subtotal = sum(item.price * item.quantity)
Tax = Subtotal * 0.18 (18% GST)
Shipping = Based on cart value and shipping option
  - Over ₹999: Free
  - Standard: ₹99
  - Express: ₹199
Discount = From promo code (if applied)
Total = Subtotal + Tax + Shipping - Discount
```

### 5. Order Management

#### Order Tracking
- **Order number**: Auto-generated unique identifier
- **Status tracking**: 7 status levels
  1. PENDING - Order created, payment pending
  2. CONFIRMED - Payment confirmed
  3. PROCESSING - Order being prepared
  4. SHIPPED - Order dispatched, tracking number available
  5. DELIVERED - Order completed
  6. CANCELLED - Order cancelled by user/seller
  7. REFUNDED - Payment refunded

#### Order History
- **Pagination**: 10 orders per page
- **Filter by status**: Dropdown to filter orders
- **Order cards**: Quick summary (order #, date, items, total, status)
- **Order details**: Full information page with:
  - Item list with images and prices
  - Shipping address
  - Payment information
  - Status history
  - Tracking number (if shipped)
  - Cancel button (if eligible)
  - Download invoice (future feature)

### 6. Product Reviews & Ratings

#### Review System
- **1-5 star rating**: Required field
- **Comment**: Text review
- **Images**: Optional review images
- **Verified purchase**: Auto-flagged if user bought the product
- **Helpful count**: Community voting on review helpfulness
- **Timestamp**: When review was created

#### Review Submission
- Located on product detail page
- Requires authentication
- Form validation with React Hook Form + Zod
- Optimistic UI updates

#### Review Display
- Average rating displayed prominently
- Total review count
- Reviews sorted by: Most Recent, Highest Rating, Lowest Rating, Most Helpful
- Pagination for reviews

### 7. Seller Dashboard

#### Dashboard Overview (`/seller/dashboard`)
- **Product list**: All seller's products
- **Quick stats**:
  - Total products
  - Active listings
  - Inventory low alerts
  - Total revenue (future)
- **Recent orders**: Orders containing seller's products
- **Quick actions**: Add product, manage inventory

#### Product Management
- **Create product** (`/products/create`):
  - Product form with validation
  - Multiple image upload (drag & drop)
  - Category, brand, tags
  - Inventory tracking
  - Draft/Active status
  - Rich text description

- **Edit product**: Update existing products
- **Delete product**: Remove listings
- **Inventory management**: Update stock levels

### 8. Seller Analytics

#### Analytics Dashboard (`/seller/analytics`)

**Time Range Options**: 7d, 30d, 90d, 1y

**Metrics Tracked**:

1. **Revenue Metrics**
   - Total revenue
   - Growth percentage vs previous period
   - Revenue over time chart (line graph)

2. **Order Analytics**
   - Total orders
   - Growth percentage
   - Orders over time chart

3. **Customer Metrics**
   - Total unique customers
   - Returning customers count
   - New customers count
   - Customer acquisition trends

4. **Product Performance**
   - Top 5 performing products table:
     - Product name
     - Revenue generated
     - Orders count
     - Views count
     - Conversion rate
   - Category breakdown pie chart:
     - Revenue by category
     - Orders by category
     - Product count by category

5. **Traffic Analytics**
   - Total product views
   - Unique visitors
   - Average session time
   - Bounce rate
   - Traffic over time chart

6. **Conversion Metrics**
   - Overall conversion rate
   - Conversion rate trend chart
   - Funnel analysis (future)

**Export Features**:
- **PDF Export**: Download analytics report
- Custom hook: `useExportAnalytics`
- Generates PDF with all charts and metrics

#### Analytics Implementation
- **Data Aggregation**: Pre-calculated in `AnalyticsSnapshot` and `StorePerformance` models
- **Real-time Updates**: Calculated on-demand from orders and product views
- **Caching**: Analytics snapshots cached for performance
- **Charts**: Recharts library for visualizations

### 9. Live Shopping (Infrastructure Ready)

#### LiveKit Integration
- Room creation and management
- Viewer count tracking
- Product association with live sessions
- Chat functionality structure
- Session status (SCHEDULED, LIVE, ENDED, CANCELLED)

**Note**: Frontend components and real-time streaming features not yet implemented.

---

## Payment Integration

### Razorpay Integration

#### Setup
1. **Test Mode**: Currently using Razorpay test keys
2. **Keys**:
   - Key ID: `rzp_test_8AlFWKIHXkMvTK`
   - Key Secret: Stored in `.env`

#### Payment Flow

1. **Create Order** (`/api/payments/create`)
```typescript
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

const razorpayOrder = await razorpay.orders.create({
  amount: total * 100, // Convert to paise
  currency: 'INR',
  receipt: orderId,
})

// Returns razorpayOrderId for frontend
```

2. **Frontend Payment Gateway** (`PaymentGateway.tsx`)
```typescript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount,
  currency: 'INR',
  name: 'LiveShop',
  description: 'Purchase from LiveShop',
  order_id: razorpayOrderId,
  handler: async (response) => {
    // Payment successful, verify signature
    await verifyPayment(response)
  },
  prefill: {
    name: user.name,
    email: user.email,
    contact: user.phone
  },
  theme: {
    color: '#3399cc'
  }
}

const razorpay = new window.Razorpay(options)
razorpay.open()
```

3. **Verify Payment** (`/api/payments/verify`)
```typescript
import crypto from 'crypto'

// Verify signature
const body = `${razorpayOrderId}|${razorpayPaymentId}`
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(body)
  .digest('hex')

if (expectedSignature === razorpaySignature) {
  // Update order status
  await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'CONFIRMED',
      paymentId: razorpayPaymentId,
      paidAt: new Date()
    }
  })
}
```

4. **Webhook Handler** (`/api/payments/webhook`)
   - Handles Razorpay webhooks (payment.authorized, payment.failed, etc.)
   - Updates order status based on payment events
   - Signature verification for security

#### Supported Payment Methods
- UPI (Google Pay, PhonePe, Paytm, etc.)
- Credit/Debit Cards (Visa, Mastercard, Amex, Rupay)
- Net Banking (All major banks)
- Wallets (Paytm, Mobikwik, Freecharge, etc.)
- EMI
- Cardless EMI

---

## Development Notes

### Common Patterns

#### API Route Structure
```typescript
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // 1. Authenticate
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. Perform operation
    const data = await prisma.someModel.findMany({
      where: { userId: user.id }
    })

    // 4. Return response
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Error Handling
- All API routes have try-catch blocks
- User-friendly error messages
- Console logging for debugging
- Proper HTTP status codes

#### Data Fetching in Pages
```typescript
// Server component (default)
export default async function ProductPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { reviews: true, seller: true }
  })

  return <ProductDetail product={product} />
}

// Client component (for interactivity)
'use client'

export default function ProductList() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products)
  }

  return <ProductGrid products={products} />
}
```

### Performance Optimizations

1. **Image Optimization**
   - Next.js Image component with automatic WebP/AVIF
   - Remote image patterns configured
   - Lazy loading by default

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based code splitting (automatic with App Router)

3. **Database Queries**
   - Include only necessary relations
   - Pagination for large datasets
   - Indexes on frequently queried fields (MongoDB)

4. **Caching**
   - Static generation where possible
   - Incremental static regeneration (ISR) for product pages
   - API route caching (future)

5. **Bundle Size**
   - `optimizePackageImports` for lucide-react and Radix UI
   - Tree shaking enabled
   - Dynamic imports for payment gateway

### Common Issues & Solutions

#### Issue: Clerk webhook not firing locally
**Solution**: Use ngrok to expose local server
```bash
ngrok http 3000
# Update Clerk dashboard webhook URL to ngrok URL
# Add ngrok domain to next.config.ts allowedDevOrigins
```

#### Issue: MongoDB ObjectId validation errors
**Solution**: Use `isValidObjectId` helper
```typescript
import { isValidObjectId } from '@/lib/prisma'

if (!isValidObjectId(productId)) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
}
```

#### Issue: Prisma client not updated after schema changes
**Solution**: Regenerate Prisma client
```bash
npx prisma generate
# Or restart dev server (postinstall hook runs prisma generate)
```

#### Issue: Cart not syncing after login
**Solution**: `CartSync` component in root layout
```typescript
// src/app/layout.tsx
import CartSync from '@/components/CartSync'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartSync />
        {children}
      </body>
    </html>
  )
}
```

### Testing Considerations

**Manual Testing Checklist**:
- [ ] User signup and login (OAuth + email/password)
- [ ] Product browsing and filtering
- [ ] Add to cart (logged in + logged out)
- [ ] Wishlist functionality
- [ ] Checkout flow (all 3 steps)
- [ ] Payment integration (use test cards)
- [ ] Order creation and tracking
- [ ] Product review submission
- [ ] Seller product creation
- [ ] Seller analytics dashboard
- [ ] Mobile responsiveness

**Test Payment Cards**:
```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

---

## Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_[your_secret_key]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your_publishable_key]
CLERK_WEBHOOK_SECRET=whsec_[your_webhook_secret]

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_[your_key_id]
RAZORPAY_KEY_ID=rzp_test_[your_key_id]
RAZORPAY_KEY_SECRET=[your_key_secret]

# MongoDB Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/liveshop?retryWrites=true&w=majority&appName=Cluster0
```

### How to Obtain Keys

#### Clerk
1. Sign up at https://clerk.com
2. Create a new application
3. Go to API Keys section
4. Copy publishable key and secret key
5. Set up webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
6. Subscribe to user.created, user.updated, user.deleted events
7. Copy webhook signing secret

#### Razorpay
1. Sign up at https://razorpay.com
2. Generate API Keys from Dashboard > Settings > API Keys
3. Use Test Mode keys for development
4. Copy Key ID and Key Secret

#### MongoDB
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get connection string from Connect > Connect your application
6. Replace `<username>`, `<password>`, and database name

---

## Project Structure

### Complete File Tree

```
liveshop/
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── components.json                # Shadcn/ui configuration
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── middleware.ts              # Route protection middleware
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   ├── globals.css            # Global styles
│   │   ├── _components/           # Shared app components
│   │   │   ├── Header.tsx         # Navigation header
│   │   │   ├── SearchSuggestions.tsx
│   │   │   ├── PaymentGateway.tsx
│   │   │   └── OrderSummary.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── webhooks/
│   │   │   │   └── clerk/route.ts # Clerk webhook handler
│   │   │   ├── products/
│   │   │   │   ├── route.ts       # GET, POST /api/products
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts   # GET, PUT, DELETE /api/products/[id]
│   │   │   │       └── reviews/route.ts # Product reviews
│   │   │   ├── cart/
│   │   │   │   ├── route.ts       # GET, POST, DELETE /api/cart
│   │   │   │   └── [itemId]/route.ts # PUT, DELETE /api/cart/[itemId]
│   │   │   ├── orders/
│   │   │   │   ├── route.ts       # GET, POST /api/orders
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts   # GET /api/orders/[id]
│   │   │   │       └── cancel/route.ts # DELETE /api/orders/[id]/cancel
│   │   │   ├── payments/
│   │   │   │   ├── create/route.ts   # POST /api/payments/create
│   │   │   │   ├── verify/route.ts   # POST /api/payments/verify
│   │   │   │   └── webhook/route.ts  # POST /api/payments/webhook
│   │   │   ├── wishlist/route.ts     # GET, POST, DELETE /api/wishlist
│   │   │   ├── search/
│   │   │   │   ├── route.ts          # GET /api/search
│   │   │   │   └── suggestions/route.ts # GET /api/search/suggestions
│   │   │   ├── categories/
│   │   │   │   ├── route.ts          # GET /api/categories
│   │   │   │   └── [category]/route.ts # GET /api/categories/[category]
│   │   │   ├── users/
│   │   │   │   ├── route.ts          # POST /api/users
│   │   │   │   └── [clerkId]/route.ts # GET /api/users/[clerkId]
│   │   │   ├── seller/
│   │   │   │   └── analytics/route.ts # GET /api/seller/analytics
│   │   │   ├── images/
│   │   │   │   └── validate/route.ts  # POST /api/images/validate
│   │   │   └── messages/route.ts      # POST /api/messages
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx       # Product detail page
│   │   │   └── create/
│   │   │       └── page.tsx       # Create product page (seller)
│   │   ├── categories/
│   │   │   └── [category]/
│   │   │       └── page.tsx       # Category browse page
│   │   ├── cart/
│   │   │   └── page.tsx           # Shopping cart page
│   │   ├── checkout/
│   │   │   └── page.tsx           # Checkout page
│   │   ├── orders/
│   │   │   ├── page.tsx           # Order history page
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Order detail page
│   │   │       └── success/
│   │   │           └── page.tsx   # Payment success page
│   │   ├── wishlist/
│   │   │   └── page.tsx           # Wishlist page
│   │   ├── profile/
│   │   │   └── page.tsx           # User profile page
│   │   ├── search/
│   │   │   └── page.tsx           # Search results page
│   │   ├── seller/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Seller dashboard
│   │   │   └── analytics/
│   │   │       ├── page.tsx       # Analytics dashboard
│   │   │       └── export-pdf/
│   │   │           └── route.ts   # PDF export
│   │   ├── dashboard/
│   │   │   └── page.tsx           # General dashboard
│   │   └── settings/
│   │       └── page.tsx           # Settings page
│   ├── components/
│   │   ├── CartSync.tsx           # Cart synchronization component
│   │   ├── RequireAuth.tsx        # Auth wrapper component
│   │   └── ui/                    # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── sheet.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── accordion.tsx
│   │       ├── tabs.tsx
│   │       ├── select.tsx
│   │       ├── checkbox.tsx
│   │       ├── radio-group.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── separator.tsx
│   │       ├── alert.tsx
│   │       ├── progress.tsx
│   │       ├── skeleton.tsx
│   │       ├── textarea.tsx
│   │       ├── spinner.tsx
│   │       └── optimized-image.tsx
│   ├── hooks/                     # Custom React hooks
│   │   ├── useWishlist.ts         # Wishlist management hook
│   │   ├── useAnalytics.ts        # Analytics data fetching
│   │   ├── useExportAnalytics.ts  # PDF export hook
│   │   └── useDebounce.ts         # Debouncing utility
│   ├── lib/                       # Shared utilities
│   │   ├── store.ts               # Zustand stores (all stores)
│   │   ├── cart-store.ts          # Database cart store
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── user.ts                # User utility functions
│   │   └── utils.ts               # Helper functions (cn, formatCurrency)
│   └── types/                     # TypeScript type definitions
│       └── (empty or untracked)
└── public/                        # Static assets
    └── (images, fonts, etc.)
```

---

## Recent Changes (Git Status)

### Modified Files
```
M  prisma/schema.prisma           # Added analytics models
M  src/lib/store.ts                # Added analytics store
```

### Untracked/New Files
```
?? src/app/api/seller/             # New seller API endpoints
?? src/app/seller/analytics/export-pdf/  # PDF export functionality
?? src/hooks/useAnalytics.ts       # Analytics data hook
?? src/hooks/useExportAnalytics.ts # PDF export hook
?? src/types/                      # New types directory
```

### Recent Commits
```
efcc69d - add category page
8c5c783 - update product card in home page a little
d635351 - update product page add functionality to add reviews
ffada62 - add category page and reviews in product page
7ff8ec6 - complete search functionality
```

**Development Focus**: The recent activity shows ongoing work on:
1. Category browsing features
2. Product review system
3. Search functionality
4. Seller analytics (unreleased/staged)

---

## Next Steps & Future Features

### Immediate Tasks (Based on Uncommitted Changes)
1. Complete seller analytics implementation
2. Test PDF export functionality
3. Commit types directory with proper TypeScript definitions
4. Update database with new analytics models (`prisma db push`)

### Upcoming Features
1. **Live Shopping**
   - LiveKit frontend integration
   - Real-time video streaming
   - Live chat
   - Product showcasing during live sessions

2. **Admin Panel**
   - User management
   - Product moderation
   - Order oversight
   - Analytics dashboard

3. **Enhanced Features**
   - Product recommendations (ML-based)
   - Email notifications (order updates, promotions)
   - SMS notifications
   - Push notifications
   - Advanced filtering (multiple brands, tags)
   - Save searches
   - Compare products
   - Product Q&A section
   - Social sharing

4. **Performance**
   - Redis caching
   - CDN for images
   - API rate limiting
   - Database indexing optimization

5. **Business Features**
   - Seller subscription plans
   - Commission system
   - Payout management
   - Multi-vendor marketplace features
   - Seller messaging
   - Bulk product upload
   - Inventory sync with external systems

---

## Conclusion

**LiveShop** is a comprehensive e-commerce platform with modern architecture and production-ready features. The codebase is well-organized, type-safe, and follows Next.js best practices. Recent focus on seller analytics indicates the platform is moving toward providing comprehensive business intelligence tools for sellers.

The project uses industry-standard technologies (Next.js, MongoDB, Prisma, Clerk, Razorpay) and implements core e-commerce features including product catalog, cart, checkout, payments, orders, reviews, and analytics. The live shopping infrastructure is in place and ready for implementation when needed.

**Key Strengths**:
- Modern tech stack with excellent TypeScript support
- Clean, modular architecture
- Comprehensive feature set
- Good separation of concerns
- Proper authentication and authorization
- Database-backed cart for persistence
- Real-time analytics for sellers
- Responsive design with Tailwind CSS

**Areas for Improvement**:
- Add automated tests
- Implement error boundaries
- Add loading states and skeletons
- Improve SEO (metadata, sitemap)
- Add monitoring and logging (Sentry, LogRocket)
- Implement rate limiting on API routes

This documentation should help you quickly resume development and understand the full scope of the project. Good luck with your continued development!
