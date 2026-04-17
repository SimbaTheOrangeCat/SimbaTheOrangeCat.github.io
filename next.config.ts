import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // next/image doesn't have an optimization server in static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
