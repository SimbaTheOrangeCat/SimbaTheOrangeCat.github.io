import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/content/posts'
import SearchClient from '@/app/search/SearchClient'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all articles on Mindfactor.',
}

export default function SearchPage() {
  // Pass serialisable post metadata to the client search component
  const posts = getAllPosts()

  return (
    <div className="container-content">
      <h1 className="font-serif text-[2.5rem] leading-[1.15] tracking-[-0.02em] mb-2">
        Search
      </h1>
      <p className="text-[var(--text-secondary)] mb-10">
        Search across {posts.length} articles
      </p>
      <SearchClient posts={posts} />
    </div>
  )
}
