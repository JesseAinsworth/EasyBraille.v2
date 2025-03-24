/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      }
    ],
  },
  reactStrictMode: true, // Mantiene buenas prácticas de desarrollo
  experimental: {
    optimizeCss: true, // Optimiza CSS automáticamente
    scrollRestoration: true, // Mantiene la posición del scroll al navegar
  },
}

export default nextConfig;
