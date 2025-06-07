
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['next-intl'], // Added this line
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
  },
};

export default nextConfig;
