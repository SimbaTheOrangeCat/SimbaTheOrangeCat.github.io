import Link from 'next/link'
import { getFeaturedPosts, getAllPosts } from '@/lib/content/posts'
import PostCard from '@/components/blog/PostCard'

export default function HomePage() {
  const allPosts = getAllPosts()
  const featured = getFeaturedPosts()
  const heroPost = featured[0] ?? null
  const secondaryPosts = allPosts.filter(p => p.slug !== heroPost?.slug)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border-color)] bg-[var(--surface-color)]">
        <div className="container-content py-20 md:py-28">
          <div className="max-w-[600px]">
            <p className="category-chip mb-5">Digital Garden</p>
            <h1 className="font-serif text-[2.875rem] md:text-[3.5rem] leading-[1.1] tracking-[-0.025em] text-[var(--text-primary)] mb-5">
              Thoughts, Life and{' '}
              <em className="not-italic text-[var(--accent-color)]">Mindful</em>{' '}
              Living.
            </h1>
            <p className="text-[1.05rem] text-[var(--text-secondary)] max-w-[480px] mb-8 leading-[1.75]">
              A personal space exploring mindful living,
              cozy productivity, and the quiet beauty of slowing down.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-[8px] text-sm shadow-[0_2px_8px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Read the Blog
                <span aria-hidden="true">&#8594;</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--border-color)] hover:border-[var(--accent-color)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] font-medium rounded-[8px] text-sm transition-all duration-200"
              >
                Search Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-content">
        {/* ── Featured Story ─────────────────────────────────── */}
        {heroPost && (
          <section className="mt-14 mb-14">
            <h2 className="section-heading">Featured Story</h2>
            <Link href={`/blog/${heroPost.slug}`} className="featured-story-card group">
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="category-chip">{heroPost.category}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{heroPost.readTime}</span>
                </div>
                <h3 className="font-serif text-[1.75rem] md:text-[2.125rem] leading-[1.2] tracking-[-0.02em] text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors duration-200 mb-4 max-w-[640px]">
                  {heroPost.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-[1.05rem] leading-[1.75] mb-7 max-w-[580px]">
                  {heroPost.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-color)]">
                    Read story <span aria-hidden="true">&#8594;</span>
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(heroPost.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* ── More to Read ───────────────────────────────────── */}
        {secondaryPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="section-heading">More to Read</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {secondaryPosts.map(post => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
