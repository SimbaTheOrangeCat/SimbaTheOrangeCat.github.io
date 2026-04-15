import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Redirect legacy .html routes to clean paths
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/blog.html', destination: '/blog', permanent: true },
      { source: '/search.html', destination: '/search', permanent: true },
      { source: '/journal.html', destination: '/journal', permanent: true },
      { source: '/warmth-in-minimalism.html', destination: '/blog/warmth-in-minimalism', permanent: true },
      { source: '/art-of-slow-living.html', destination: '/blog/art-of-slow-living', permanent: true },
      { source: '/cozy-productivity.html', destination: '/blog/cozy-productivity', permanent: true },
      { source: '/art-of-mindful-breathing.html', destination: '/blog/art-of-mindful-breathing', permanent: true },
    ]
  },
}

export default nextConfig
