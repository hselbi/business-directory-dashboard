/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // For external URLs (if needed later)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Unoptimized for blob URLs - they'll be handled separately
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
};

export default nextConfig;