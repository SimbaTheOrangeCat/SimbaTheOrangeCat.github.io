import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

export interface Post {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
  featured: boolean
  coverImage?: string
  seoDescription: string
  content: string
}

export type PostMeta = Omit<Post, 'content'>

function parsePost(filename: string): Post {
  const slug = filename.replace(/\.mdx$/, '')
  const filePath = path.join(POSTS_DIR, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    slug,
    title: data.title ?? '',
    excerpt: data.excerpt ?? '',
    category: data.category ?? '',
    tags: data.tags ?? [],
    publishedAt: data.publishedAt ? String(data.publishedAt) : '',
    readTime: data.readTime ?? '',
    featured: data.featured ?? false,
    coverImage: data.coverImage,
    seoDescription: data.seoDescription ?? data.excerpt ?? '',
    content,
  }
}

/** Return all posts sorted by publishedAt descending. */
export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(f => {
      const { content: _content, ...meta } = parsePost(f)
      return meta
    })
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
}

/** Return a single post with full content, or null if not found. */
export function getPostBySlug(slug: string): Post | null {
  const filename = `${slug}.mdx`
  const filePath = path.join(POSTS_DIR, filename)
  if (!fs.existsSync(filePath)) return null
  return parsePost(filename)
}

/** Return all post slugs (used for generateStaticParams). */
export function getPostSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''))
}

/** Return featured posts only. */
export function getFeaturedPosts(): PostMeta[] {
  return getAllPosts().filter(p => p.featured)
}

/** Return posts matching a query string (title, excerpt, tags, category). */
export function searchPosts(query: string): PostMeta[] {
  const q = query.toLowerCase().trim()
  if (!q) return getAllPosts()
  return getAllPosts().filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.excerpt.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)),
  )
}
