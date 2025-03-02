/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'singareport-media.obs.ap-southeast-3.myhuaweicloud.com',
      },
    ],
  }
}

module.exports = nextConfig 