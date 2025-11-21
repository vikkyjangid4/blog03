/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
    domains: ['localhost', 'boganto.com', 'www.boganto.com'],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'boganto.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.boganto.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      }
    ],

    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
      (process.env.NODE_ENV === 'production'
        ? 'https://boganto.com'
        : 'http://localhost:8000');

    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  env: {
    BACKEND_URL:
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_BASE_URL || 'https://boganto.com'
        : 'http://localhost:8000',
  },
};

module.exports = nextConfig;
