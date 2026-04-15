import Link from 'next/link'
import type { PostMeta } from '@/lib/content/posts'

interface Props {
  post: PostMeta
}

export default function PostCard({ post }: Props) {
  return (
    <article className="post-card group">
      {/* Meta row */}
      <div className="flex items-center gap-3 mb-4">
        <span className="category-chip">{post.category}</span>
        <span className="text-xs text-[var(--text-secondary)]">{post.readTime}</span>
      </div>

      {/* Title */}
      <Link href={`/blog/${post.slug}`} className="block mb-3">
        <h2 className="font-serif text-[1.25rem] leading-[1.35] text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors duration-200">
          {post.title}
        </h2>
      </Link>

      {/* Excerpt */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 mb-5 line-clamp-3">
        {post.excerpt}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-color)]">
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <Link
          href={`/blog/${post.slug}`}
          className="text-xs font-semibold text-[var(--accent-color)] hover:text-[var(--accent-hover)] transition-colors duration-200 flex items-center gap-1"
        >
          Read more <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  )
}
