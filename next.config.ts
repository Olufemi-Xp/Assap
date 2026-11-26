import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@supabase/supabase-js", "@supabase/ssr", "date-fns"],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.output = {
        ...config.output,
        chunkLoadTimeout: 300000,
      };
    }
    return config;
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
      ],
    },
  ],
};

export default nextConfig;
