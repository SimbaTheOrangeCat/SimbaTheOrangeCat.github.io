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
          <header className="text-center max-w-[700px] mx-auto pt-6 pb-14 border-b border-[var(--border-color)] mb-14">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors mb-8"
            >
              ← All articles
            </Link>

            <div className="flex items-center justify-center mb-5">
              <span className="category-chip">{post.category}</span>
            </div>

            <h1 className="font-serif text-[2.5rem] md:text-[3rem] leading-[1.15] tracking-[-0.025em] text-[var(--text-primary)] mb-6">
              {post.title}
            </h1>

            <p className="text-[1.1rem] text-[var(--text-secondary)] leading-relaxed mb-8 max-w-[560px] mx-auto">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span className="w-1 h-1 rounded-full bg-[var(--border-color)] inline-block" />
              <span>{post.readTime}</span>
            </div>
          </header>

          {/* ── Article Body ───────────────────────────────── */}
          <div className="prose-content container-prose mb-20">
            <MDXRemote source={post.content} />
          </div>

          {/* ── Article Footer ─────────────────────────────── */}
          <footer className="container-prose pt-10 pb-16 border-t border-[var(--border-color)] text-center">
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
              Thanks for reading. If this resonated with you, share it with someone who might appreciate it.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold rounded-[8px] transition-all duration-200 shadow-[0_2px_8px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] hover:-translate-y-px"
            >
              ← Back to Blog
            </Link>
          </footer>
        </article>

        {/* ── Related Posts ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="pb-20">
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
