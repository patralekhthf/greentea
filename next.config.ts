import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Turbopack is enabled by default in Next.js 16 dev mode via `next dev --turbopack`
};

export default nextConfig;
