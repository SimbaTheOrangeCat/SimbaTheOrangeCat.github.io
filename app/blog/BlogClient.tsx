'use client'

import { useState, useMemo } from 'react'
import PostCard from '@/components/blog/PostCard'
import type { PostMeta } from '@/lib/content/posts'

interface Props {
  posts: PostMeta[]
}

export default function BlogClient({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map(p => p.category)))
    return ['All', ...cats.sort()]
  }, [posts])

  const countFor = (cat: string) =>
    cat === 'All' ? posts.length : posts.filter(p => p.category === cat).length

  const filtered = useMemo(
    () => activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory),
    [posts, activeCategory],
  )

  return (
    <div className="container-content">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="pt-4 pb-10 border-b border-[var(--border-color)] mb-10">
        <h1 className="font-serif text-[2.75rem] leading-[1.1] tracking-[-0.025em] mb-3">
          Blog
        </h1>
        <p className="text-[var(--text-secondary)] text-[1.05rem] mb-6">
          {posts.length} article{posts.length !== 1 ? 's' : ''} on mindful living, productivity, and simplicity.
        </p>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const active = cat === activeCategory
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={[
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200',
                  active
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[#f7f5f2] shadow-[0_2px_12px_rgba(138,36,25,0.25)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] bg-transparent hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]',
                ].join(' ')}
              >
                {cat}
                <span className={`text-[10px] tabular-nums ${active ? 'opacity-75' : 'opacity-50'}`}>
                  {countFor(cat)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Post Grid ────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {filtered.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">&#127807;</p>
          <p className="font-serif text-lg text-[var(--text-primary)] mb-2">
            Nothing in &ldquo;{activeCategory}&rdquo; yet.
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Check back soon, or browse everything.
          </p>
          <button
            onClick={() => setActiveCategory('All')}
            className="text-sm font-semibold text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors"
          >
            View all articles &#8594;
          </button>
        </div>
      )}
    </div>
  )
}
