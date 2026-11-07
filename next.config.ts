import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

const backendBaseUrl = (
  process.env.BACKEND_APACHE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (isVercel
    ? "https://technohub.kasunwalakumbura.com/backend"
    : "http://localhost/Evon-registration/backend")
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${backendBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
