/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://brittopos.brittosoft.site",
        // port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;