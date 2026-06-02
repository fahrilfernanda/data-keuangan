import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  // GitHub Pages project repo
  basePath: "/data-keuangan",
  assetPrefix: "/data-keuangan/",

  // penting untuk static export biar tidak error saat build
  trailingSlash: true,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;