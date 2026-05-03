import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedPosts, getAllPosts } from '@/lib/content/posts'
import type { PostMeta } from '@/lib/content/posts'
import RevealOnScroll from '@/components/home/RevealOnScroll'

function categoryRail(categories: string[]) {
  return categories.filter(Boolean).slice(0, 6)
}

function LeadStory({ post }: { post: PostMeta }) {
  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="he-lead">
      <Link href={`/blog/${post.slug}`} className="he-lead-media group block overflow-hidden rounded-sm">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt=""
            role="presentation"
            width={1400}
            height={720}
            className="he-lead-img h-[min(52vw,420px)] w-full object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 1400px) 100vw, 1400px"
            priority
          />
        ) : (
          <div
            className="he-lead-img flex h-[min(52vw,420px)] w-full items-center justify-center bg-gradient-to-br from-[#e8e4de] to-[#d4cfc7] text-[#8a8580]"
            aria-hidden
          >
            <span className="font-playfair-display text-4xl font-semibold tracking-tight">Mindfactor</span>
          </div>
        )}
      </Link>

      <div className="he-lead-body mt-8 md:mt-10">
        <div className="mb-4 flex flex-wrap items-center gap-3 font-dm-ui text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#8a2419]">
          <span>{post.category}</span>
          <span className="text-[#c4bfb8]" aria-hidden>
            ·
          </span>
          <time dateTime={post.publishedAt}>{dateStr}</time>
          <span className="text-[#c4bfb8]" aria-hidden>
            ·
          </span>
          <span className="font-medium normal-case tracking-normal text-[#6b6560]">{post.readTime}</span>
        </div>

        <h2 className="font-playfair-display text-[clamp(1.85rem,4.5vw,3rem)] font-bold leading-[1.12] tracking-[-0.03em] text-[#121212]">
          <Link href={`/blog/${post.slug}`} className="he-title-link">
            {post.title}
          </Link>
        </h2>

        <p className="mt-5 max-w-[720px] font-dm-ui text-[1.05rem] font-normal leading-[1.65] text-[#3d3a36] md:text-[1.125rem]">
          {post.excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-7 inline-flex items-center gap-2 font-dm-ui text-sm font-bold uppercase tracking-[0.12em] text-[#8a2419] underline decoration-[#8a2419]/30 decoration-2 underline-offset-4 transition hover:decoration-[#8a2419]"
        >
          Read article <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  )
}

function FeedCard({ post, variant }: { post: PostMeta; variant: 'feature' | 'compact' }) {
  const dateStr = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const isFeature = variant === 'feature'

  return (
    <article
      className={[
        'he-feed-card group border-t border-[#dad6cf] pt-8',
        isFeature ? 'he-feed-card--feature' : '',
      ].join(' ')}
    >
      <div className="mb-3 flex flex-wrap items-baseline gap-2 font-dm-ui text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#8a2419]">
        <span>{post.category}</span>
        <span className="font-medium text-[#a8a29e]">· {dateStr}</span>
      </div>

      <h3
        className={[
          'font-playfair-display font-bold tracking-[-0.02em] text-[#121212]',
          isFeature
            ? 'text-[clamp(1.5rem,2.8vw,2.125rem)] leading-[1.18]'
            : 'text-[clamp(1.15rem,2vw,1.35rem)] leading-[1.28]',
        ].join(' ')}
      >
        <Link href={`/blog/${post.slug}`} className="he-title-link">
          {post.title}
        </Link>
      </h3>

      <p
        className={[
          'mt-3 font-dm-ui text-[#5c5854] leading-relaxed',
          isFeature ? 'line-clamp-4 text-[1.02rem]' : 'line-clamp-3 text-[0.9375rem]',
        ].join(' ')}
      >
        {post.excerpt}
      </p>

      <Link
        href={`/blog/${post.slug}`}
        className="mt-5 inline-block font-dm-ui text-[0.8rem] font-semibold text-[#8a2419] opacity-90 transition group-hover:opacity-100"
        tabIndex={-1}
        aria-hidden
      >
        Read →
      </Link>
    </article>
  )
}

export default function HomePage() {
  const allPosts = getAllPosts()
  const heroPost = allPosts[0] ?? null
  const rest = heroPost ? allPosts.filter(p => p.slug !== heroPost.slug) : allPosts
  const rail = categoryRail([...new Set(allPosts.map(p => p.category))])

  return (
    <div className="home-editorial">
      <div className="he-container mx-auto max-w-[1360px] px-5 pb-24 pt-2 md:px-10 md:pt-4">
        {/* Tag rail — like Environment · Tech · Science */}
        <RevealOnScroll>
          <p className="font-dm-ui text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#6b6560]">
            {rail.length > 0 ? (
              <>
                {rail.map((c, i) => (
                  <span key={c}>
                    {i > 0 && <span className="mx-2 text-[#c4bfb8]">·</span>}
                    {c}
                  </span>
                ))}
              </>
            ) : (
              <>Mindful living · clarity · focus</>
            )}
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h1 className="font-playfair-display mt-6 text-[clamp(3rem,10vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-[#121212]">
            Latest
          </h1>
        </RevealOnScroll>

        <p className="font-dm-ui mt-5 max-w-[520px] text-[1.05rem] font-medium leading-[1.55] text-[#5c5854] md:text-[1.125rem]">
          Thoughts on mindful living, cozy productivity, and the quiet beauty of slowing down — a personal digital garden.
        </p>

        {heroPost && (
          <RevealOnScroll className="mt-14 md:mt-20">
            <LeadStory post={heroPost} />
          </RevealOnScroll>
        )}

        {rest.length > 0 && (
          <div className="he-feed mt-20 md:mt-28">
            <h2 className="font-dm-ui mb-12 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#6b6560]">
              More stories
            </h2>

            <div className="grid grid-cols-1 gap-x-10 gap-y-14 lg:grid-cols-2 lg:gap-y-16">
              {rest.map((post, i) => {
                const feature = i % 3 === 0
                return (
                  <RevealOnScroll key={post.slug} className={feature ? 'lg:col-span-2' : ''}>
                    <FeedCard post={post} variant={feature ? 'feature' : 'compact'} />
                  </RevealOnScroll>
                )
              })}
            </div>
          </div>
        )}

        <RevealOnScroll className="mt-20 border-t border-[#dad6cf] pt-14">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-dm-ui text-sm font-medium text-[#6b6560]">
              Browse the full archive or search by topic.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-sm bg-[#121212] px-6 py-3 font-dm-ui text-xs font-bold uppercase tracking-[0.14em] text-[#f7f5f2] transition hover:bg-[#2a2826]"
              >
                All articles <span aria-hidden>→</span>
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 border border-[#c4bfb8] bg-transparent px-6 py-3 font-dm-ui text-xs font-bold uppercase tracking-[0.14em] text-[#121212] transition hover:border-[#121212]"
              >
                Search
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  )
}
