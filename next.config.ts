import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/wrapped",
  assetPrefix: "/wrapped",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/wrapped",
  },
};

export default nextConfig;
