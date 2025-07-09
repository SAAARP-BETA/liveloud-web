/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com',
      'via.placeholder.com',
      'placehold.co', // ✅ Added this
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // ✅ Added this
      },
    ],
  },
};

export default nextConfig;
