import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllPosts } from '@/lib/content/posts'
import SearchClient from '@/app/search/SearchClient'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all articles on Mindfactor.',
}

export default function SearchPage() {
  const posts = getAllPosts()

  return (
    <div className="container-content">
      <div className="pt-4 pb-10 border-b border-[var(--border-color)] mb-10">
        <h1 className="font-serif text-[2.75rem] leading-[1.1] tracking-[-0.025em] mb-3">
          Search
        </h1>
        <p className="text-[var(--text-secondary)] text-[1.05rem]">
          Search across {posts.length} article{posts.length !== 1 ? 's' : ''}.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-[var(--text-secondary)]">Loading search&hellip;</p>}>
        <SearchClient posts={posts} />
      </Suspense>
    </div>
  )
}
