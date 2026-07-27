import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["lvh.me", "*.lvh.me"],
  async rewrites() {
    const backendUrl = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/+$/, "");
    const routes = [
      {
        source: "/portal/constructor",
        destination: "/portal/store-builder",
      },
    ];

    if (!backendUrl) {
      return routes;
    }

    routes.push({
      source: "/api/:path*",
      destination: `${backendUrl}/api/:path*`,
    });

    return routes;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
