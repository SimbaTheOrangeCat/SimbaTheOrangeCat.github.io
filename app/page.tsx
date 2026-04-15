import Link from 'next/link'
import { getFeaturedPosts, getAllPosts } from '@/lib/content/posts'
import PostCard from '@/components/blog/PostCard'

export default function HomePage() {
  const featured = getFeaturedPosts()
  const nonFeatured = getAllPosts().filter(p => !p.featured)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border-color)] bg-[var(--surface-color)] transition-colors duration-300">
        <div className="container-content py-24 md:py-32">
          <div className="max-w-[640px]">
            <p className="category-chip mb-6">Digital Garden</p>
            <h1 className="font-serif text-[3rem] md:text-[3.75rem] leading-[1.08] tracking-[-0.025em] text-[var(--text-primary)] mb-6">
              Thoughts, Life and{' '}
              <em className="not-italic text-[var(--accent-color)]">Mindful</em>{' '}
              Living.
            </h1>
            <p className="text-[1.1rem] text-[var(--text-secondary)] max-w-[500px] mb-10 leading-[1.7]">
              A personal space exploring the intersections of mindful living,
              cozy productivity, and the beauty of simplicity.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-[8px] text-sm shadow-[0_2px_8px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Read the Blog
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] font-medium rounded-[8px] text-sm transition-all duration-200"
              >
                Search Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-content">
        {/* ── Featured Stories ───────────────────────────────── */}
        {featured.length > 0 && (
          <section className="mt-16">
            <h2 className="section-heading">Featured Stories</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* ── More to Read ───────────────────────────────────── */}
        {nonFeatured.length > 0 && (
          <section className="mt-16 mb-16">
            <h2 className="section-heading">More to Read</h2>
            <div className="divide-y divide-[var(--border-color)]">
              {nonFeatured.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="flex items-start justify-between gap-6 py-5 group"
                >
                  <div className="min-w-0">
                    <span className="category-chip mb-2 inline-flex">{post.category}</span>
                    <h3 className="font-serif text-[1.1rem] leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors duration-200 mt-1.5">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">
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
          </section>
        )}
      </div>
    </>
  )
}
