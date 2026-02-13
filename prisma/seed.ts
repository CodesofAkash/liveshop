import { PrismaClient, UserRole, ProductStatus, OrderStatus, PaymentStatus, DiscountType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (in development only!)
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.product.deleteMany()
  await prisma.liveSession.deleteMany()
  await prisma.promoCode.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create Users
  const buyer1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_buyer_001',
      email: 'buyer1@example.com',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      role: UserRole.BUYER,
      bio: 'Love shopping online!',
      phone: '+1234567890',
    },
  })

  const buyer2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_buyer_002',
      email: 'buyer2@example.com',
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      role: UserRole.BUYER,
      bio: 'Tech enthusiast and gadget collector',
      phone: '+1234567891',
    },
  })

  const seller1 = await prisma.user.create({
    data: {
      clerkId: 'clerk_seller_001',
      email: 'seller1@example.com',
      name: 'Tech Store Pro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechStore',
      role: UserRole.SELLER,
      bio: 'Premium electronics and gadgets seller',
      phone: '+1234567892',
    },
  })

  const seller2 = await prisma.user.create({
    data: {
      clerkId: 'clerk_seller_002',
      email: 'seller2@example.com',
      name: 'Fashion Hub',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fashion',
      role: UserRole.SELLER,
      bio: 'Your one-stop shop for trendy fashion',
      phone: '+1234567893',
    },
  })

  const admin = await prisma.user.create({
    data: {
      clerkId: 'clerk_admin_001',
      email: 'admin@example.com',
      name: 'Admin User',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: UserRole.ADMIN,
      bio: 'Platform administrator',
      phone: '+1234567894',
    },
  })

  console.log('✅ Created users')

  // Create Categories
  const electronicsCategory = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      isActive: true,
    },
  })

  const fashionCategory = await prisma.category.create({
    data: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing and accessories',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      isActive: true,
    },
  })

  const homeCategory = await prisma.category.create({
    data: {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Beautiful items for your home',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba',
      isActive: true,
    },
  })

  // Create subcategories
  const smartphonesCategory = await prisma.category.create({
    data: {
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Latest smartphones from top brands',
      parentId: electronicsCategory.id,
      isActive: true,
    },
  })

  const laptopsCategory = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      description: 'Powerful laptops for work and play',
      parentId: electronicsCategory.id,
      isActive: true,
    },
  })

  console.log('✅ Created categories')

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'iPhone 15 Pro Max',
        name: 'iPhone 15 Pro Max',
        description: 'The latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Experience unprecedented performance and battery life.',
        price: 1199.99,
        inventory: 50,
        category: 'Electronics',
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb',
          'https://images.unsplash.com/photo-1592286927505-12e1e4d85961',
        ],
        sellerId: seller1.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: true,
        rating: 4.8,
        reviewCount: 156,
        slug: 'iphone-15-pro-max',
        tags: ['smartphone', 'apple', 'premium', '5g'],
        attributes: {
          storage: ['256GB', '512GB', '1TB'],
          colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
          screen: '6.7 inch',
          camera: '48MP main camera',
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'MacBook Pro 16"',
        name: 'MacBook Pro 16"',
        description: 'Professional laptop with M3 Pro chip, stunning Liquid Retina XDR display, and up to 22 hours of battery life. Perfect for creators and developers.',
        price: 2499.99,
        inventory: 30,
        category: 'Electronics',
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9',
        ],
        sellerId: seller1.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: true,
        rating: 4.9,
        reviewCount: 89,
        slug: 'macbook-pro-16',
        tags: ['laptop', 'apple', 'premium', 'professional'],
        attributes: {
          processor: 'M3 Pro',
          ram: ['16GB', '32GB', '64GB'],
          storage: ['512GB', '1TB', '2TB'],
          screen: '16.2 inch Liquid Retina XDR',
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'Samsung Galaxy S24 Ultra',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Flagship Android phone with AI features, S Pen, and exceptional camera capabilities. The ultimate productivity and creativity device.',
        price: 1299.99,
        inventory: 40,
        category: 'Electronics',
        brand: 'Samsung',
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        ],
        sellerId: seller1.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: true,
        rating: 4.7,
        reviewCount: 234,
        slug: 'samsung-galaxy-s24-ultra',
        tags: ['smartphone', 'samsung', 'android', '5g', 's-pen'],
        attributes: {
          storage: ['256GB', '512GB', '1TB'],
          colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
          screen: '6.8 inch Dynamic AMOLED 2X',
          camera: '200MP main camera',
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'Sony WH-1000XM5 Headphones',
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise cancellation headphones with exceptional sound quality and 30-hour battery life. Perfect for music lovers and travelers.',
        price: 399.99,
        inventory: 75,
        category: 'Electronics',
        brand: 'Sony',
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944',
        ],
        sellerId: seller1.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: false,
        rating: 4.8,
        reviewCount: 412,
        slug: 'sony-wh-1000xm5',
        tags: ['headphones', 'sony', 'noise-cancelling', 'wireless'],
        attributes: {
          colors: ['Black', 'Silver'],
          battery: '30 hours',
          connectivity: ['Bluetooth 5.2', 'NFC', '3.5mm jack'],
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'Premium Cotton T-Shirt',
        name: 'Premium Cotton T-Shirt',
        description: 'Ultra-soft 100% organic cotton t-shirt. Perfect fit and supreme comfort for everyday wear. Sustainable and eco-friendly.',
        price: 29.99,
        inventory: 200,
        category: 'Fashion',
        brand: 'EcoWear',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
        ],
        sellerId: seller2.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: false,
        rating: 4.5,
        reviewCount: 89,
        slug: 'premium-cotton-t-shirt',
        tags: ['fashion', 'clothing', 't-shirt', 'organic', 'eco-friendly'],
        attributes: {
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          colors: ['White', 'Black', 'Navy', 'Gray', 'Olive'],
          material: '100% Organic Cotton',
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'Designer Leather Backpack',
        name: 'Designer Leather Backpack',
        description: 'Handcrafted genuine leather backpack with laptop compartment. Stylish and functional for work or travel. Ages beautifully over time.',
        price: 159.99,
        inventory: 45,
        category: 'Fashion',
        brand: 'UrbanCarry',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3',
        ],
        sellerId: seller2.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: true,
        rating: 4.7,
        reviewCount: 67,
        slug: 'designer-leather-backpack',
        tags: ['fashion', 'accessories', 'backpack', 'leather', 'premium'],
        attributes: {
          colors: ['Brown', 'Black', 'Tan'],
          material: 'Genuine Leather',
          capacity: '25L',
          laptop: 'Fits up to 15.6"',
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'Smart LED Desk Lamp',
        name: 'Smart LED Desk Lamp',
        description: 'App-controlled LED desk lamp with adjustable brightness and color temperature. USB charging port included. Perfect for work and study.',
        price: 79.99,
        inventory: 100,
        category: 'Home & Living',
        brand: 'LightTech',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
        ],
        sellerId: seller1.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: false,
        rating: 4.6,
        reviewCount: 145,
        slug: 'smart-led-desk-lamp',
        tags: ['home', 'lighting', 'smart-home', 'desk-lamp'],
        attributes: {
          colors: ['White', 'Black', 'Silver'],
          features: ['App Control', 'Touch Control', 'USB Charging', 'Timer'],
          power: '12W LED',
        },
      },
    }),
    prisma.product.create({
      data: {
        title: 'Minimalist Coffee Table',
        name: 'Minimalist Coffee Table',
        description: 'Scandinavian-inspired coffee table with solid oak wood and minimalist design. Perfect centerpiece for modern living rooms.',
        price: 299.99,
        inventory: 25,
        category: 'Home & Living',
        brand: 'NordicHome',
        images: [
          'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
          'https://images.unsplash.com/photo-1532372576444-dda954194ad0',
        ],
        sellerId: seller2.id,
        status: ProductStatus.ACTIVE,
        inStock: true,
        featured: true,
        rating: 4.8,
        reviewCount: 52,
        slug: 'minimalist-coffee-table',
        tags: ['home', 'furniture', 'table', 'scandinavian', 'minimalist'],
        attributes: {
          material: 'Solid Oak Wood',
          dimensions: '120cm x 60cm x 45cm',
          colors: ['Natural Oak', 'Walnut', 'White'],
          weight: '25kg',
        },
      },
    }),
  ])

  console.log('✅ Created products')

  // Create Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: products[0].id,
        userId: buyer1.id,
        rating: 5,
        title: 'Amazing phone!',
        content: 'The iPhone 15 Pro Max exceeded all my expectations. The camera is incredible and battery life is outstanding!',
        images: [],
        verified: true,
        helpful: 24,
      },
      {
        productId: products[0].id,
        userId: buyer2.id,
        rating: 4,
        title: 'Great but expensive',
        content: 'Love the phone but the price is quite steep. Worth it if you can afford it.',
        images: [],
        verified: true,
        helpful: 12,
      },
      {
        productId: products[1].id,
        userId: buyer2.id,
        rating: 5,
        title: 'Best laptop for developers',
        content: 'The M3 Pro chip is a beast! Compiles code incredibly fast and the battery lasts all day.',
        images: [],
        verified: true,
        helpful: 45,
      },
      {
        productId: products[3].id,
        userId: buyer1.id,
        rating: 5,
        title: 'Best noise cancellation',
        content: 'These headphones are perfect for my daily commute. The noise cancellation is magical!',
        images: [],
        verified: true,
        helpful: 18,
      },
    ],
  })

  console.log('✅ Created reviews')

  // Create Promo Codes
  await prisma.promoCode.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: 'Welcome discount for new customers',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        maxUses: 1000,
        usedCount: 43,
        maxUsesPerUser: 1,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2026-12-31'),
        minOrderAmount: 50,
        applicableCategories: [],
        isActive: true,
      },
      {
        code: 'TECH50',
        description: '$50 off on electronics over $500',
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 50,
        maxUses: 500,
        usedCount: 89,
        maxUsesPerUser: 1,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2026-06-30'),
        minOrderAmount: 500,
        applicableCategories: ['Electronics'],
        isActive: true,
      },
      {
        code: 'FASHION20',
        description: '20% off on fashion items',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        maxUses: 300,
        usedCount: 156,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2026-12-31'),
        minOrderAmount: 100,
        applicableCategories: ['Fashion'],
        isActive: true,
      },
    ],
  })

  console.log('✅ Created promo codes')

  // Create Cart for buyer1
  const cart1 = await prisma.cart.create({
    data: {
      userId: buyer1.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
          },
          {
            productId: products[3].id,
            quantity: 2,
            price: products[3].price,
          },
        ],
      },
    },
  })

  console.log('✅ Created cart')

  // Create Wishlist
  await prisma.wishlist.createMany({
    data: [
      {
        userId: buyer1.id,
        productId: products[1].id,
      },
      {
        userId: buyer1.id,
        productId: products[5].id,
      },
      {
        userId: buyer2.id,
        productId: products[0].id,
      },
      {
        userId: buyer2.id,
        productId: products[7].id,
      },
    ],
  })

  console.log('✅ Created wishlist items')

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      userId: buyer1.id,
      orderNumber: 'ORD-2026-0001',
      subtotal: 1599.98,
      tax: 128.00,
      shipping: 15.00,
      discount: 0,
      total: 1742.98,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'Razorpay',
      paymentId: 'pay_test_001',
      paidAt: new Date('2026-02-10T10:30:00Z'),
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1234567890',
      },
      billingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1234567890',
      },
      status: OrderStatus.DELIVERED,
      trackingNumber: 'TRK123456789',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
            productData: {
              title: products[0].title,
              image: products[0].images[0],
            },
          },
          {
            productId: products[3].id,
            quantity: 1,
            price: products[3].price,
            productData: {
              title: products[3].title,
              image: products[3].images[0],
            },
          },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      userId: buyer2.id,
      orderNumber: 'ORD-2026-0002',
      subtotal: 2499.99,
      tax: 200.00,
      shipping: 0,
      discount: 50,
      total: 2649.99,
      paymentStatus: PaymentStatus.COMPLETED,
      paymentMethod: 'Razorpay',
      paymentId: 'pay_test_002',
      paidAt: new Date('2026-02-11T14:20:00Z'),
      shippingAddress: {
        name: 'Jane Smith',
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        phone: '+1234567891',
      },
      status: OrderStatus.SHIPPED,
      trackingNumber: 'TRK987654321',
      notes: 'Please deliver before 5 PM',
      items: {
        create: [
          {
            productId: products[1].id,
            quantity: 1,
            price: products[1].price,
            productData: {
              title: products[1].title,
              image: products[1].images[0],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Created orders')

  // Create Live Sessions
  await prisma.liveSession.createMany({
    data: [
      {
        title: 'iPhone 15 Pro Launch Event',
        description: 'Join us for an exclusive live demonstration of the new iPhone 15 Pro features!',
        liveKitRoom: 'iphone-launch-2026',
        sellerId: seller1.id,
        productIds: [products[0].id],
        status: 'SCHEDULED',
        scheduledAt: new Date('2026-02-20T18:00:00Z'),
        maxViewers: 1000,
        totalViews: 0,
      },
      {
        title: 'Fashion Week Special',
        description: 'Exclusive fashion items showcase with special discounts!',
        liveKitRoom: 'fashion-week-2026',
        sellerId: seller2.id,
        productIds: [products[4].id, products[5].id],
        status: 'SCHEDULED',
        scheduledAt: new Date('2026-02-25T20:00:00Z'),
        maxViewers: 500,
        totalViews: 0,
      },
    ],
  })

  console.log('✅ Created live sessions')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - Users: 5 (${[buyer1, buyer2, seller1, seller2, admin].length})`)
  console.log(`   - Categories: 5`)
  console.log(`   - Products: ${products.length}`)
  console.log(`   - Reviews: 4`)
  console.log(`   - Promo Codes: 3`)
  console.log(`   - Orders: 2`)
  console.log(`   - Cart Items: 2`)
  console.log(`   - Wishlist Items: 4`)
  console.log(`   - Live Sessions: 2`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
