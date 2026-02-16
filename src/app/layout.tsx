import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import Header from '@/app/_components/Header';
import Footer from '@/components/shared/Footer';
import { CartSync } from '@/components/CartSync';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'LiveShop - Your Trusted E-Commerce Marketplace',
    template: '%s | LiveShop',
  },
  description: 'Discover quality products from trusted sellers. Shop electronics, fashion, home goods, and more with secure payments and fast delivery.',
  keywords: [
    'e-commerce',
    'online shopping',
    'marketplace',
    'buy online',
    'sell online',
    'electronics',
    'fashion',
    'trending products',
    'deals',
  ],
  authors: [{ name: 'LiveShop Team' }],
  creator: 'LiveShop',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'LiveShop - Your Trusted E-Commerce Marketplace',
    description: 'Discover quality products from trusted sellers',
    siteName: 'LiveShop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiveShop - Your Trusted E-Commerce Marketplace',
    description: 'Discover quality products from trusted sellers',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <CartSync />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}