import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'npb.jp',
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
