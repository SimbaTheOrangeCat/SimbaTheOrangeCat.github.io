import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/content/posts'
import BlogClient from '@/app/blog/BlogClient'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'All articles from Mindfactor — mindful living, cozy productivity, and simplicity.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  return <BlogClient posts={posts} />
}
