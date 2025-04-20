/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'storage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  // We'll keep using our existing API routes initially
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  // Configuration for Replit environment
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // For Replit, support IPv6
  experimental: {
    ipv6: true,
  },
  // Improve accessibility on Replit
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Enable hostname detection
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  publicRuntimeConfig: {
    API_URL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
  },
};

export default nextConfig;