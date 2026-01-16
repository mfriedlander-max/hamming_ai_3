import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/recommendations',
        destination: '/calendar',
        permanent: true,
      },
      {
        source: '/optimizer',
        destination: '/calendar',
        permanent: true,
      },
      {
        source: '/binge',
        destination: '/calendar',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
