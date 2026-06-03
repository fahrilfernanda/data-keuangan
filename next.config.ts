import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.59.1",
      ],
  output: isProd ? "export" : undefined,

  basePath: isProd ? "/data-keuangan" : "",

  assetPrefix: isProd ? "/data-keuangan/" : "",

  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;