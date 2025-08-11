import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'prisma'], // Changed from experimental.serverComponentsExternalPackages
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
    ];
  },
  // Add this for ngrok CORS issues
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
    ];
  },
};

export default nextConfig;