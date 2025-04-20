/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Server components are handled by Next.js
  experimental: {
    appDir: false, // We'll stick with pages directory for now
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
};

module.exports = nextConfig;