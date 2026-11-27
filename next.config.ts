import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { optimizePackageImports: ["@once-ui-system/core"] },
};

export default nextConfig;
