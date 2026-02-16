# LiveShop API Reference

Quick reference guide for all API endpoints.

---

## Authentication

All endpoints marked with 🔒 require authentication via Clerk session.

---

## Products

### GET /api/products
**Public** - Get all products with filtering

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 12 | Items per page |
| category | string | No | - | Filter by category |
| minPrice | number | No | - | Minimum price |
| maxPrice | number | No | - | Maximum price |
| sort | string | No | 'newest' | Sort order: newest, price-asc, price-desc, rating |
| featured | boolean | No | - | Filter featured products |

**Response:**
```typescript
{
  success: boolean
  data: {
    products: Product[]
    pagination: {
      currentPage: number
      totalPages: number
      totalProducts: number
      hasMore: boolean
    }
  }
}
```

---

### POST /api/products
🔒 **Create product**

**Request Body:**
```typescript
{
  title: string              // required
  description: string        // required
  price: number             // required
  images: string[]          // required
  category: string          // required
  inventory: number         // required
  brand?: string
  tags?: string[]
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  featured?: boolean
  attributes?: object
  features?: string[]
  specifications?: object
  dimensions?: object
  weight?: number
  colors?: string[]
  sizes?: string[]
  materials?: string[]
  warranty?: string
}
```

**Response:**
```typescript
{
  success: boolean
  data: Product
}
```

---

### GET /api/products/[id]
**Public** - Get product by ID

**Response:**
```typescript
{
  success: boolean
  data: Product & {
    seller: {
      id: string
      name: string
      email: string
    }
    reviews: Review[]
    _count: {
      reviews: number
      wishlistItems: number
    }
  }
}
```

---

### PATCH /api/products/[id]
🔒 **Update product** (owner only)

**Request Body:** (all fields optional)
```typescript
{
  title?: string
  description?: string
  price?: number
  images?: string[]
  category?: string
  inventory?: number
  brand?: string
  tags?: string[]
  status?: ProductStatus
  featured?: boolean
  // ... other fields
}
```

---

### DELETE /api/products/[id]
🔒 **Delete product** (owner only)

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

---

## Cart

### GET /api/cart
🔒 **Get user's cart**

**Response:**
```typescript
{
  success: boolean
  data: {
    cart: {
      id: string
      userId: string
      items: CartItem[]
    }
    subtotal: number
    itemCount: number
    total: number
  }
}
```

**CartItem Structure:**
```typescript
{
  id: string
  quantity: number
  price: number
  product: {
    id: string
    title: string
    images: string[]
    price: number
    inventory: number
    seller: {
      id: string
      name: string
      email: string
    }
  }
}
```

---

### POST /api/cart
🔒 **Add item to cart**

**Request Body:**
```typescript
{
  productId: string    // required
  quantity?: number    // default: 1
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  data: {
    cartItem: CartItem
  }
}
```

**Error Cases:**
- 404: Product not found
- 400: Product out of stock
- 400: Insufficient inventory

---

### PATCH /api/cart/[itemId]
🔒 **Update cart item quantity**

**Request Body:**
```typescript
{
  quantity: number    // required, must be > 0
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  data: {
    cartItem: CartItem
  }
}
```

---

### DELETE /api/cart/[itemId]
🔒 **Remove item from cart**

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

---

## Orders

### GET /api/orders
🔒 **Get user's orders**

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |
| status | string | No | - | Filter by status |

**Order Status Values:**
- `PENDING`
- `CONFIRMED`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`
- `REFUNDED`

**Response:**
```typescript
{
  success: boolean
  data: {
    orders: Order[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
    }
  }
}
```

---

### POST /api/orders
🔒 **Create order**

**Request Body:**
```typescript
{
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
  billingAddress?: {
    // same structure as shippingAddress
  }
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  notes?: string
  giftMessage?: string
}
```

**Response:**
```typescript
{
  success: boolean
  data: {
    order: Order
  }
  message: string
}
```

**Error Cases:**
- 400: Empty cart or invalid items
- 400: Product not available
- 400: Insufficient inventory

---

### GET /api/orders/[id]
🔒 **Get order details**

**Response:**
```typescript
{
  success: boolean
  data: Order & {
    items: Array<{
      id: string
      quantity: number
      price: number
      product: Product
    }>
    buyer: User
  }
}
```

---

## Payments

### POST /api/payments/create
🔒 **Create Razorpay order**

**Request Body:**
```typescript
{
  orderId: string      // Database order ID
  currency?: string    // default: 'INR'
}
```

**Response:**
```typescript
{
  orderId: string           // Razorpay order ID
  amount: number            // Amount in paise (₹1 = 100 paise)
  currency: string          // Currency code
  key: string              // Razorpay key ID
  order: {
    id: string
    items: OrderItem[]
    total: number
    discount: number
    finalTotal: number
  }
}
```

**Error Cases:**
- 401: Unauthorized
- 404: Order not found
- 500: Razorpay API error

---

### POST /api/payments/verify
🔒 **Verify payment**

**Request Body:**
```typescript
{
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  orderId: string              // Database order ID
}
```

**Response:**
```typescript
{
  success: boolean
  order: Order
  message: string
}
```

**Side Effects:**
- Updates order status to `CONFIRMED`
- Updates payment status to `COMPLETED`
- Decrements product inventory
- Sets `paidAt` timestamp

**Error Cases:**
- 401: Unauthorized
- 400: Invalid signature
- 404: Order not found

---

### POST /api/payments/webhook
**Razorpay webhook** (signature verified)

Handles payment notifications from Razorpay.

---

## Search

### GET /api/search
**Public** - Search products

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| suggest | boolean | No | Return only suggestions |

**Response (Full Search):**
```typescript
{
  success: boolean
  data: {
    products: Array<Product & {
      rating: number
      reviewCount: number
      seller: {
        id: string
        name: string
      }
    }>
  }
}
```

**Response (Suggestions):**
```typescript
{
  success: boolean
  data: {
    suggestions: string[]  // Product titles
  }
}
```

**Search Fields:**
- Product title
- Product description
- Product category
- (Case-insensitive)

---

## Categories

### GET /api/categories
**Public** - Get all categories with counts

**Response:**
```typescript
{
  success: boolean
  data: Array<{
    name: string
    count: number     // Number of active products
  }>
}
```

**Note:** Sorted by count (descending)

---

## Users

### POST /api/users
**Create or get user**

**Request Body:**
```typescript
{
  clerkId: string       // required
  email: string         // required
  name?: string
  avatar?: string
  role?: 'BUYER' | 'SELLER' | 'ADMIN'
  bio?: string
  phone?: string
}
```

**Response:**
```typescript
{
  id: string
  clerkId: string
  email: string
  name: string | null
  avatar: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}
```

**Behavior:**
- Returns existing user if `clerkId` exists
- Creates new user if not found

---

### GET /api/users/[clerkId]
**Get user by Clerk ID**

**Response:**
```typescript
{
  success: boolean
  data: User
}
```

---

## Webhooks

### POST /api/webhooks/clerk
**Clerk webhook** (signature verified)

**Events Handled:**
- `user.created` - Create user in database
- `user.updated` - Update user details
- `user.deleted` - Delete user

**Headers Required:**
- `svix-id`
- `svix-timestamp`
- `svix-signature`

**Request Body:** (varies by event type)
```typescript
{
  type: string
  data: {
    id: string              // Clerk user ID
    email_addresses: Array<{
      email_address: string
    }>
    first_name: string
    last_name: string
    image_url: string
    // ... other Clerk user fields
  }
}
```

**Response:**
```typescript
{
  success: boolean
  message: string
  userId?: string
}
```

---

## Data Types

### Product
```typescript
{
  id: string
  title: string
  name: string | null
  description: string
  price: number
  inventory: number
  category: string
  brand: string | null
  attributes: object | null
  images: string[]
  model3D: string | null
  sellerId: string
  status: ProductStatus
  inStock: boolean
  featured: boolean
  rating: number
  reviewCount: number
  slug: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

### Order
```typescript
{
  id: string
  orderNumber: string | null
  buyerId: string
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  paymentStatus: PaymentStatus
  paymentMethod: string | null
  paymentId: string | null
  paidAt: string | null
  shippingAddress: object
  billingAddress: object | null
  status: OrderStatus
  trackingNumber: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}
```

### CartItem
```typescript
{
  id: string
  cartId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
  product: Product
}
```

### Review
```typescript
{
  id: string
  productId: string
  userId: string
  rating: number        // 1-5
  title: string | null
  content: string
  images: string[]
  verified: boolean
  helpful: number
  createdAt: string
  updatedAt: string
}
```

---

## Error Responses

All endpoints follow consistent error format:

```typescript
{
  success: false
  error: string
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Internal Server Error | Server error, database error |

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting in production.

---

## Pagination

Standard pagination response format:

```typescript
{
  pagination: {
    currentPage: number      // Current page (1-indexed)
    totalPages: number       // Total number of pages
    totalCount: number       // Total number of items
    hasMore: boolean        // Whether more pages exist
  }
}
```

---

## Authentication Flow

1. **Client** sends request with Clerk session cookie
2. **Middleware** validates session via `@clerk/nextjs/server`
3. **API Route** calls `auth()` to get `userId` (Clerk ID)
4. **Database** looks up user by `clerkId` field
5. **Response** sent with user-specific data

---

## Best Practices

### Making API Calls

```typescript
// Using fetch
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Product Name',
    // ... other fields
  }),
});

const data = await response.json();

if (data.success) {
  // Handle success
} else {
  // Handle error: data.error
}
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data.data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

---

## Postman Collection Structure

Import these endpoints into Postman:

```
LiveShop API
├── Products
│   ├── GET    /api/products
│   ├── POST   /api/products
│   ├── GET    /api/products/:id
│   ├── PATCH  /api/products/:id
│   └── DELETE /api/products/:id
├── Cart
│   ├── GET    /api/cart
│   ├── POST   /api/cart
│   ├── PATCH  /api/cart/:itemId
│   └── DELETE /api/cart/:itemId
├── Orders
│   ├── GET    /api/orders
│   ├── POST   /api/orders
│   └── GET    /api/orders/:id
├── Payments
│   ├── POST   /api/payments/create
│   ├── POST   /api/payments/verify
│   └── POST   /api/payments/webhook
├── Search
│   └── GET    /api/search
├── Categories
│   └── GET    /api/categories
├── Users
│   ├── POST   /api/users
│   └── GET    /api/users/:clerkId
└── Webhooks
    └── POST   /api/webhooks/clerk
```

---

## Testing Examples

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Test Description",
    "price": 99.99,
    "images": ["https://example.com/image.jpg"],
    "category": "Electronics",
    "inventory": 10
  }'
```

### Get Products
```bash
curl "http://localhost:3000/api/products?page=1&limit=10&category=Electronics"
```

### Search Products
```bash
curl "http://localhost:3000/api/search?q=iPhone&suggest=false"
```

---

**Last Updated:** February 15, 2026
