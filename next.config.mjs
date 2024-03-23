import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    instrumentationHook: true,
  },
};

/** @type {import('next-pwa').PWAConfig} */
const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheStartUrl: false,
  dynamicStartUrl: false,
};

export default withPWA(pwaConfig)(nextConfig);
