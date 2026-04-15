import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/content/posts'
import PostCard from '@/components/blog/PostCard'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'All articles from Mindfactor — mindful living, cozy productivity, and simplicity.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  // Derive unique categories
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))]

  return (
    <div className="container-content">
      {/* Header */}
      <div className="pt-4 pb-10 border-b border-[var(--border-color)] mb-10">
        <h1 className="font-serif text-[2.75rem] leading-[1.1] tracking-[-0.025em] mb-3">
          Blog
        </h1>
        <p className="text-[var(--text-secondary)] text-[1.05rem]">
          {posts.length} article{posts.length !== 1 ? 's' : ''} on mindful living, productivity, and simplicity.
        </p>

        {/* Category pills — visual only, filtering is Phase 6 */}
        <div className="flex flex-wrap gap-2 mt-6">
          {categories.map(cat => (
            <span
              key={cat}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors duration-200 cursor-default ${
                cat === 'All'
                  ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        {posts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
