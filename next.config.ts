import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone for the Docker image (docs/07 >
  // Deployment architecture).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
