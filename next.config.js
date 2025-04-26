/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.bible.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imageproxy.youversionapi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig 