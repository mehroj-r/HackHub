import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone for the Docker image (docs/07 >
  // Deployment architecture).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The event form sends a logo and a header image, up to 5 MB each
    // (src/lib/uploads). nginx allows the same (client_max_body_size 12m).
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
