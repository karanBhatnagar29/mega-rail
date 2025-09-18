import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // 👈 allow Cloudinary images
  },
  turbopack: {
    root: __dirname, // 👈 explicitly set your project root
  },
};

export default nextConfig;
