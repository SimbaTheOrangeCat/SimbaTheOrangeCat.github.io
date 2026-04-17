import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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

  const fallbackHeroBySlug: Record<string, string> = {
    'art-of-mindful-breathing': '/assets/images/breathing-hero.png',
    'cozy-productivity': '/assets/images/productivity-hero.png',
    'warmth-in-minimalism': '/assets/images/minimalism-hero.png',
    'art-of-slow-living': '/assets/images/slow-living-hero.png',
  }
  const heroImage = post.coverImage ?? fallbackHeroBySlug[post.slug]

  // Related posts: same category, excluding current
  const related = getAllPosts()
    .filter(p => p.slug !== slug && p.category === post.category)
    .slice(0, 2)

  return (
    <>
      <ReadingProgress />

      <div className="container-content page-fade-in">
        <article>
          {/* ── Article Header ─────────────────────────────── */}
          <header className="max-w-[680px] mx-auto pt-10 pb-14 mb-14 border-b border-[var(--border-color)]">
            {/* Back navigation — left-aligned, icon + label */}
            <div className="mb-10">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors duration-200 group"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[var(--border-color)] group-hover:border-[var(--accent-color)] group-hover:bg-[var(--accent-subtle)] transition-all duration-200 text-[10px]" aria-hidden="true">
                  &#8592;
                </span>
                All articles
              </Link>
            </div>

            {/* Category */}
            <div className="mb-4">
              <span className="category-chip">{post.category}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-[2.375rem] md:text-[2.875rem] leading-[1.15] tracking-[-0.025em] text-[var(--text-primary)] mb-5">
              {post.title}
            </h1>

            {/* Excerpt / lede */}
            <p className="text-[1.1rem] text-[var(--text-secondary)] leading-[1.75] mb-8">
              {post.excerpt}
            </p>

            {/* Accent rule before metadata */}
            <div className="w-8 h-px bg-[var(--accent-color)] mb-6 opacity-50" />

            {/* Metadata row — author + date + read time */}
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] flex-wrap">
              <span className="font-semibold text-[var(--text-primary)] text-[0.8rem]">Ayan Saha</span>
              <span className="w-1 h-1 rounded-full bg-[var(--border-color)] inline-block" aria-hidden="true" />
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
              <div className="flex flex-wrap items-center gap-1.5 mt-5">
                {post.tags.map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            )}
          </header>

          {heroImage && (
            <div className="container-prose mb-14">
              <figure className="post-hero-figure">
                <div className="post-hero-media">
                  <Image
                    src={heroImage}
                    alt={`${post.title} hero image`}
                    fill
                    sizes="(max-width: 768px) 100vw, 680px"
                    className="object-cover"
                    priority
                  />
                </div>
              </figure>
            </div>
          )}

          {/* ── Article Body ───────────────────────────────── */}
          <div className="prose-content container-prose mb-20">
            <MDXRemote source={post.content} />
          </div>

          {/* ── End-of-Article CTA ─────────────────────────── */}
          <div className="container-prose mb-20">
            <div className="article-end-cta">
              {/* Decorative "fin" marker */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-8 h-px bg-[var(--accent-color)] opacity-30" />
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-[var(--accent-color)] uppercase opacity-70">fin</span>
                <div className="w-8 h-px bg-[var(--accent-color)] opacity-30" />
              </div>

              <p className="font-serif text-xl text-[var(--text-primary)] mb-2">
                Thanks for reading.
              </p>
              <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-[380px] mx-auto leading-relaxed">
                If this resonated with you, share it with someone who might appreciate it &mdash; or keep exploring.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold rounded-[8px] transition-all duration-200 shadow-[var(--shadow-accent)] hover:shadow-[0_4px_20px_rgba(5,150,105,0.35)] hover:-translate-y-px"
                >
                  <span aria-hidden="true">&#8592;</span> Back to Blog
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--accent-ring)] hover:border-[var(--accent-color)] text-[var(--accent-color)] text-sm font-medium rounded-[8px] transition-all duration-200 hover:bg-[var(--accent-subtle)]"
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
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="font-serif text-[1.5rem] font-semibold tracking-[-0.01em] text-[var(--text-primary)] pb-[0.875rem] border-b border-[var(--border-color)] relative after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-9 after:h-0.5 after:bg-[var(--accent-color)] after:rounded-sm">More in {post.category}</h2>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                {related.length} {related.length === 1 ? 'article' : 'articles'}
              </span>
            </div>
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
