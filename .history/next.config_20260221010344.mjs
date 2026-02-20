/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "192.168.0.106",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

module.exports = nextConfig;