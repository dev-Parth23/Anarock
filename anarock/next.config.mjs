/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "property-images.zohostratus.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
