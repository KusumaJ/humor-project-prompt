import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.almostcrackd.ai',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'secure.almostcrackd.ai',
        port: '',
        pathname: '**',
      },
    ],
  },
  /* config options here */
  async redirects() {
    return [
      {
        source: '/prompt-chain-tool/flavor',
        destination: '/prompt-chain-tool',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;