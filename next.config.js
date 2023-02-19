/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src', 'fauna'],
  },
}

module.exports = nextConfig
