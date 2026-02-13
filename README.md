# LiveShop - Live Shopping E-commerce Platform

A modern, full-stack e-commerce platform with live shopping capabilities built with Next.js 15, Prisma, and Supabase.

## Features

- 🛍️ **Product Management** - Browse, search, and filter products
- 🛒 **Shopping Cart** - Add items to cart with real-time updates
- 💳 **Secure Payments** - Razorpay integration for seamless checkout
- 📦 **Order Management** - Track order status and history
- ⭐ **Reviews & Ratings** - Customer feedback system
- 💝 **Wishlist** - Save products for later
- 🎥 **Live Shopping** - Real-time live shopping sessions
- 🏷️ **Promo Codes** - Discount system with flexible rules
- 👤 **User Authentication** - Powered by Clerk
- 🎨 **Modern UI** - Beautiful components with Radix UI and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Zustand** - State management

### Backend
- **Prisma** - Type-safe ORM
- **Supabase (PostgreSQL)** - Database
- **Clerk** - Authentication & user management
- **Razorpay** - Payment processing

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([Sign up here](https://supabase.com))
- A Clerk account ([Sign up here](https://clerk.com))
- A Razorpay account ([Sign up here](https://razorpay.com))

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd liveshop
npm install
```

### 2. Set Up Supabase Database

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **Project Settings** → **Database**
3. Copy the **Connection String** (Transaction mode)
4. The format will be: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update your `.env` file with your Supabase DATABASE_URL and other credentials.

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
