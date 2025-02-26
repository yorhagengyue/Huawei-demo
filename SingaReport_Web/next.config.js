/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'singareport-media.obs.ap-southeast-3.myhuaweicloud.com'],
  },
  i18n: {
    locales: ['en', 'zh', 'ms', 'ta'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig 