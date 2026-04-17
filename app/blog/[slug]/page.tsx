import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug, getPostSlugs, getAllPosts } from '@/lib/content/posts'
import PostCard from '@/components/blog/PostCard'
import ReadingProgress from '@/components/blog/ReadingProgress'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getPostSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.seoDescription,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  // Related posts: same category, excluding current
  const related = getAllPosts()
    .filter(p => p.slug !== slug && p.category === post.category)
    .slice(0, 2)

  return (
    <>
      <ReadingProgress />

      <div className="container-content">
        <article>
          {/* ── Article Header ─────────────────────────────── */}
          <header className="text-center max-w-[680px] mx-auto pt-8 pb-14 border-b border-[var(--border-color)] mb-14">
            {/* Back navigation */}
            <div className="flex justify-center mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-color)] border border-[var(--border-color)] hover:border-[var(--accent-color)] px-3 py-1.5 rounded-full transition-all duration-200"
              >
                <span aria-hidden="true">&#8592;</span> All articles
              </Link>
            </div>

            {/* Category */}
            <div className="flex items-center justify-center mb-5">
              <span className="category-chip">{post.category}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-[2.375rem] md:text-[2.875rem] leading-[1.15] tracking-[-0.025em] text-[var(--text-primary)] mb-5">
              {post.title}
            </h1>

            {/* Excerpt / lede */}
            <p className="text-[1.1rem] text-[var(--text-secondary)] leading-[1.75] mb-8 max-w-[540px] mx-auto">
              {post.excerpt}
            </p>

            {/* Metadata row */}
            <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-secondary)] flex-wrap">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span className="w-1 h-1 rounded-full bg-[var(--border-color)] inline-block" aria-hidden="true" />
              <span>{post.readTime}</span>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            )}
          </header>

          {/* ── Article Body ───────────────────────────────── */}
          <div className="prose-content container-prose mb-16">
            <MDXRemote source={post.content} />
          </div>

          {/* ── End-of-Article CTA ─────────────────────────── */}
          <div className="container-prose mb-16">
            <div className="article-end-cta">
              <p className="font-serif text-lg text-[var(--text-primary)] mb-1.5">
                Thanks for reading.
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-[400px] mx-auto leading-relaxed">
                If this resonated with you, share it with someone who might appreciate it.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold rounded-[8px] transition-all duration-200 shadow-[0_2px_8px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] hover:-translate-y-px"
                >
                  <span aria-hidden="true">&#8592;</span> Back to Blog
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--accent-ring)] hover:border-[var(--accent-color)] text-[var(--accent-color)] text-sm font-medium rounded-[8px] transition-all duration-200"
                >
                  Browse more articles
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* ── Related Posts ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="pb-20 border-t border-[var(--border-color)] pt-14">
            <h2 className="section-heading">More in {post.category}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {related.map(p => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
