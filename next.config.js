/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
  },
  // si tu veux garder le build même si ESLint râle encore :
  // eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
