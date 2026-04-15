'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { PostMeta } from '@/lib/content/posts'

interface Props {
  posts: PostMeta[]
}

export default function SearchClient({ posts }: Props) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return posts
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)),
    )
  }, [query, posts])

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-10">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, category, or tag…"
          className="w-full pl-11 pr-4 py-3 rounded-[10px] border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_0_3px_rgba(5,150,105,0.12)] transition-all duration-200"
          autoFocus
        />
      </div>

      {/* Results */}
      {query && results.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-secondary)]">
          <p className="text-4xl mb-4">🌿</p>
          <p className="text-lg font-serif">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-sm mt-2">Try a different keyword or browse all posts.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--border-color)]">
          {results.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-start justify-between gap-6 py-5 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs uppercase font-semibold tracking-[0.8px] text-[var(--accent-color)]">
                    {post.category}
                  </span>
                  {post.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-wide text-[var(--text-secondary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-serif text-lg leading-snug group-hover:text-[var(--accent-color)] transition-colors duration-200 truncate">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
              <div className="text-right shrink-0 pt-1">
                <span className="text-xs text-[var(--text-secondary)] block">{post.readTime}</span>
                <span className="text-xs text-[var(--text-secondary)] block mt-1">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!query && (
        <p className="text-center text-xs text-[var(--text-secondary)] mt-8">
          Showing all {posts.length} articles — start typing to filter
        </p>
      )}
    </div>
  )
}
