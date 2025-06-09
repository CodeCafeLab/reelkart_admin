
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // transpilePackages: ['next-intl'], // Removed this line
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    // Allow all domains for <Image> src prop if needed for dynamic SVGs from /public or external
    // For security, it's better to list specific domains if possible.
    // However, for local /public SVGs, this might not be necessary if handled by Next.js static file serving.
    // This is more for external image URLs.
    // domains: [], // If you need to allow specific external domains for SVGs
  },
};

export default nextConfig;

