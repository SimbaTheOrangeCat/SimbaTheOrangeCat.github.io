import Link from 'next/link'
import type { PostMeta } from '@/lib/content/posts'

interface Props {
  post: PostMeta
}

export default function PostCard({ post }: Props) {
  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="post-card group">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="category-chip">{post.category}</span>
        <span className="text-xs text-[var(--text-secondary)] tabular-nums">{post.readTime}</span>
      </div>

      {/* Title */}
      <Link href={`/blog/${post.slug}`} className="block mb-3">
        <h2 className="font-serif text-[1.2rem] leading-[1.35] text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors duration-200">
          {post.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-[0.875rem] text-[var(--text-secondary)] leading-[1.65] flex-1 mb-5 line-clamp-3">
        {post.excerpt}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
        <time
          dateTime={post.publishedAt}
          className="text-xs text-[var(--text-secondary)]"
        >
          {dateStr}
        </time>
        <Link
          href={`/blog/${post.slug}`}
          className="text-xs font-semibold text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors duration-200 inline-flex items-center gap-1"
          tabIndex={-1}
          aria-hidden="true"
        >
          Read <span aria-hidden="true">&#8594;</span>
        </Link>
      </div>
    </article>
  )
}
