import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/news/:filename",
          destination: "/api/news/image/:filename",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
