import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.59.1",
  ],

  images: {
    unoptimized: true,
  },
};

export default nextConfig;