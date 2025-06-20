import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    API_URL_PREFIX: process.env.API_URL_PREFIX,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
