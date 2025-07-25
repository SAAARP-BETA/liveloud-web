/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
   
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'backend-4iko.onrender.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Moved from domains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ai4science.seas.upenn.edu', // Moved from domains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't3.ftcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'backend-4iko.onrender.com',
        pathname: '/uploads/**',  // Add this line for your backend
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/posts/**',
      },
    ],
  },
};

export default nextConfig;