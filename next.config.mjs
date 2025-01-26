/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default nextConfig;
