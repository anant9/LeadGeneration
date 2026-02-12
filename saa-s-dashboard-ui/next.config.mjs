/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
