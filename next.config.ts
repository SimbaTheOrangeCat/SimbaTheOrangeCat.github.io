import type { NextConfig } from 'next'
import { loadEnvConfig } from '@next/env'

// Ensure .env.local is loaded before Next reads config (helps some Windows / IDE setups)
loadEnvConfig(process.cwd())

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // next/image doesn't have an optimization server in static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
