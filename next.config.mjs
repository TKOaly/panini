/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: true,
    instrumentationHook: true,
  },
};

export default nextConfig;
