import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Optimize performance and reduce rebuild times
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Reduce memory usage
    optimizeCss: true,
  },
  // Configure allowed dev origins for ngrok
  allowedDevOrigins: [
    'glowing-prawn-completely.ngrok-free.app',
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.56.1:3000',
  ],
  async headers() {
    return [
      {
        source: '/api/webhooks/clerk',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, svix-id, svix-timestamp, svix-signature',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "img-src 'self' data: https: http:; object-src 'none';",
          },
        ],
      },
    ];
  },
  // Optimize images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    // Improve performance
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimize webpack for better performance
  webpack: (config, { isServer, dev }) => {
    // Fix for potential module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Avoid issues with certain packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Optimize for development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;