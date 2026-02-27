/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecommerce.skinvee.org",
        // port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;