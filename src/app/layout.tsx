import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LiveShop - Live Shopping Experience',
  description: 'Real-time e-commerce platform with live shopping sessions',
  keywords: ['e-commerce', 'live shopping', 'online store', 'real-time shopping'],
  authors: [{ name: 'LiveShop Team' }],
  openGraph: {
    title: 'LiveShop - Live Shopping Experience',
    description: 'Real-time e-commerce platform with live shopping sessions',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiveShop - Live Shopping Experience',
    description: 'Real-time e-commerce platform with live shopping sessions',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
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
  )
}