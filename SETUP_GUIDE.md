# Complete Setup Guide for LiveShop

This guide will walk you through setting up your LiveShop e-commerce platform from scratch.

## 🚀 Quick Start Checklist

- [ ] Install dependencies
- [ ] Set up Supabase database
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Seed sample data
- [ ] Start development server

---

## Step 1: Install Dependencies

First, install all required Node packages:

```bash
npm install
```

This will install:
- Next.js 15 and React
- Prisma ORM
- Clerk authentication
- Razorpay payment integration
- UI libraries (Radix UI, Tailwind CSS)
- And more...

---

## Step 2: Set Up Supabase Database

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `liveshop` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. Wait for the project to be created (~2 minutes)

### Get Your Database Connection String

1. In your Supabase project, click **Settings** (gear icon in sidebar)
2. Navigate to **Database** section
3. Scroll down to **Connection String**
4. Select **Transaction mode** (not Session mode)
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you set earlier

### Enable Required Extensions (Optional but Recommended)

1. Go to **Database** → **Extensions**
2. Enable these if not already enabled:
   - `pg_trgm` - For full-text search
   - `uuid-ossp` - For UUID generation

---

## Step 3: Set Up Clerk Authentication

### Create a Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up/login
2. Click **"Add application"**
3. Choose your authentication options:
   - ✅ Email
   - ✅ Google (optional but recommended)
   - ✅ GitHub (optional)
4. Click **Create application**

### Get Your API Keys

1. In the Clerk dashboard, you'll see your API keys
2. Copy:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

### Set Up User Webhook

1. In Clerk dashboard, go to **Webhooks** in the sidebar
2. Click **Add Endpoint**
3. For local development, you need to expose your localhost:
   ```bash
   # Install ngrok if you haven't
   npm install -g ngrok
   
   # Expose port 3000
   ngrok http 3000
   ```
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Set webhook endpoint to: `https://abc123.ngrok.io/api/webhooks/clerk`
6. Subscribe to these events:
   - `user.created`
   - `user.updated`
7. Copy the **Signing Secret** (starts with `whsec_...`)

---

## Step 4: Set Up Razorpay (Payment Gateway)

### Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Complete business verification (required for live mode)
3. For development, you can use **Test Mode**

### Get API Keys

1. In Razorpay dashboard, go to **Settings** (gear icon)
2. Navigate to **API Keys**
3. Click **Generate Test Key** (or Live Key if ready)
4. Copy:
   - **Key ID** (starts with `rzp_test_...` or `rzp_live_...`)
   - **Key Secret** (hidden - click to reveal and copy)

### Set Up Webhook

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/payments/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Copy the **Webhook Secret**

---

## Step 5: Configure Environment Variables

### Create .env File

Copy the example file:

```bash
cp .env.example .env
```

### Fill in Your Credentials

Open `.env` and update with your actual values:

```env
# ===================
# DATABASE (Supabase)
# ===================
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"

# ===================
# CLERK AUTH
# ===================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Clerk URLs (keep these as-is for default setup)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ===================
# RAZORPAY PAYMENTS
# ===================
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxx

# ===================
# APP CONFIG
# ===================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Verify Your Configuration

Double-check:
- ✅ No spaces around `=` signs
- ✅ No quotes inside the values (unless part of the actual value)
- ✅ Database URL has correct password
- ✅ All keys are copied completely

---

## Step 6: Initialize Database

### Generate Prisma Client

This creates the TypeScript types for your database:

```bash
npm run db:generate
```

You should see: `✔ Generated Prisma Client`

### Create Database Tables

Push your schema to Supabase:

```bash
npm run db:push
```

This will:
- Connect to your Supabase database
- Create all tables (users, products, orders, etc.)
- Set up relationships and indexes

You should see:
```
🚀 Your database is now in sync with your Prisma schema.
```

### Verify in Supabase

1. Go to your Supabase project
2. Click **Table Editor** in sidebar
3. You should see tables like:
   - users
   - products
   - orders
   - carts
   - reviews
   - etc.

---

## Step 7: Seed Sample Data

Load your database with sample products, users, and orders:

```bash
npm run db:seed
```

This will create:
- 5 users (buyers, sellers, admin)
- 8 products across different categories
- 5 categories
- 4 reviews
- 3 promo codes
- 2 orders
- Cart items
- Wishlist items
- 2 scheduled live sessions

You should see:
```
🌱 Starting database seeding...
✅ Created users
✅ Created categories
✅ Created products
...
🎉 Database seeding completed successfully!
```

---

## Step 8: Run Development Server

Start your Next.js development server:

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

You should see your LiveShop homepage! 🎉

---

## Step 9: Test Your Setup

### Test Product Browsing

1. Visit [http://localhost:3000](http://localhost:3000)
2. You should see seeded products displayed

### Test Authentication

1. Click **Sign In** in the header
2. Create a new account or sign in
3. After signing in, you should be redirected to the homepage

### Test Database with Prisma Studio

Open Prisma Studio to view/edit your database:

```bash
npm run db:studio
```

This opens a visual database editor at `http://localhost:5555`

### Check API Endpoints

Test that your API is working:
- Products: [http://localhost:3000/api/products](http://localhost:3000/api/products)
- Categories: [http://localhost:3000/api/categories](http://localhost:3000/api/categories)

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:
1. Verify your `DATABASE_URL` is correct
2. Check your Supabase project is running (green status)
3. Verify your database password is correct
4. Check if your IP is whitelisted in Supabase

### Issue: Prisma Client Not Found

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run db:generate
```

### Issue: Clerk Authentication Not Working

**Error**: User not syncing to database

**Solutions**:
1. Verify webhook is set up correctly
2. Check `CLERK_WEBHOOK_SECRET` in `.env`
3. Make sure ngrok is running if testing locally
4. Check Clerk dashboard → Webhooks for delivery status

### Issue: Port 3000 Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use a different port:
PORT=3001 npm run dev
```

### Issue: Seed Script Fails

**Error**: Unique constraint failed or foreign key errors

**Solution**:
```bash
# Clear database and reseed
npm run db:push -- --force-reset
npm run db:seed
```

---

## Next Steps

### 1. Customize Your Store

- Update products in [prisma/seed.ts](prisma/seed.ts)
- Modify categories
- Add your own branding

### 2. Set Up Production

- Deploy database migrations: `npm run db:migrate`
- Deploy to Vercel/Netlify
- Update environment variables in hosting platform
- Update webhook URLs to production domain

### 3. Configure Payments

- Switch Razorpay from test to live mode
- Complete business verification
- Update API keys in production

### 4. Customize UI

- Update colors in Tailwind config
- Modify components in `src/components/`
- Update app layout in `src/app/layout.tsx`

---

## Useful Commands Reference

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Database
npm run db:generate        # Generate Prisma Client
npm run db:migrate         # Create and run migrations
npm run db:push            # Push schema changes (dev only)
npm run db:seed            # Seed database with sample data
npm run db:studio          # Open Prisma Studio

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues
```

---

## Getting Help

- 📚 Check the [README.md](README.md) for API documentation
- 🐛 Found a bug? Open an issue on GitHub
- 💬 Need help? Check discussions or open a new one

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Switch all services from test to production mode
- [ ] Update all API keys in production environment
- [ ] Set up production database (can use same Supabase project)
- [ ] Run migrations: `npm run db:migrate`
- [ ] Update webhook URLs to production domain
- [ ] Enable HTTPS everywhere
- [ ] Set up monitoring and error tracking
- [ ] Configure CORS properly
- [ ] Review and update security settings
- [ ] Test payment flow end-to-end
- [ ] Set up automated backups

---

Happy Coding! 🚀
