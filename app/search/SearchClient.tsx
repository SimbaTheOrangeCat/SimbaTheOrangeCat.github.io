'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { PostMeta } from '@/lib/content/posts'

interface Props {
  posts: PostMeta[]
}

export default function SearchClient({ posts }: Props) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const q = searchParams.get('q')
    setQuery(q ?? '')
  }, [searchParams])

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

  const hasQuery = query.trim().length > 0

  // Unique categories for the no-query browse state
  const categories = useMemo(
    () => Array.from(new Set(posts.map(p => p.category))).sort(),
    [posts],
  )

  return (
    <div>
      {/* ── Search Input ─────────────────────────────────────── */}
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none text-base leading-none">
          &#128269;
        </span>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, category, or tag&#8230;"
          className="w-full pl-11 pr-10 py-3.5 rounded-none border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm focus:outline-none focus:border-[var(--accent-color)] focus:shadow-[0_0_0_3px_var(--accent-ring)] transition-all duration-200"
          autoFocus
        />
        {hasQuery && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-none bg-[var(--border-color)] hover:bg-[var(--text-secondary)] text-[var(--text-secondary)] hover:text-[#f7f5f2] transition-all duration-150 text-xs font-bold"
            aria-label="Clear search"
          >
            &#215;
          </button>
        )}
      </div>

      {/* ── Results count ────────────────────────────────────── */}
      {hasQuery && (
        <p className="text-xs text-[var(--text-secondary)] mb-6">
          {results.length === 0
            ? 'No results'
            : `${results.length} result${results.length !== 1 ? 's' : ''}`}{' '}
          for &ldquo;<span className="font-medium text-[var(--text-primary)]">{query}</span>&rdquo;
        </p>
      )}

      {/* ── No results state ─────────────────────────────────── */}
      {hasQuery && results.length === 0 && (
        <div className="text-center py-16 text-[var(--text-secondary)]">
          <p className="text-4xl mb-4">&#127807;</p>
          <p className="font-serif text-lg text-[var(--text-primary)] mb-2">
            Nothing found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm mb-6">Try a different keyword, or browse by category below.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setQuery(cat)}
                className="category-chip cursor-pointer hover:bg-[var(--accent-color)] hover:text-[#f7f5f2] transition-all duration-200"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Result list ──────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="flex flex-col divide-y divide-[var(--border-color)]">
          {results.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-start justify-between gap-6 py-5 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="category-chip">{post.category}</span>
                  {post.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="tag-chip">{tag}</span>
                  ))}
                </div>
                <h2 className="font-serif text-[1.1rem] leading-snug group-hover:text-[var(--accent-color)] transition-colors duration-200">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              </div>
              <div className="text-right shrink-0 pt-1">
                <span className="text-xs text-[var(--text-secondary)] block tabular-nums">{post.readTime}</span>
                <span className="text-xs text-[var(--text-secondary)] block mt-1 tabular-nums">
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

      {/* ── Empty query browse state ─────────────────────────── */}
      {!hasQuery && (
        <div className="mt-2">
          <p className="text-xs text-[var(--text-secondary)] mb-5">
            Showing all {posts.length} articles &#8212; start typing to filter, or browse by category:
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setQuery(cat)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-none border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-all duration-200"
              >
                {cat}
                <span className="text-[10px] opacity-50 tabular-nums">
                  {posts.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
