'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

type Comment = {
  id: string
  user_id: string | null
  author_name: string
  content: string
  created_at: string
}

const REACTIONS = [
  { emoji: '❤️', label: 'Loved it' },
  { emoji: '🙏', label: 'Helpful' },
  { emoji: '🤔', label: 'Made me think' },
  { emoji: '✨', label: 'Beautiful' },
  { emoji: '💪', label: 'Empowering' },
] as const

interface Props {
  slug: string
  title: string
}

export default function PostEngagement({ slug, title }: Props) {
  const pathname = usePathname()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const postPath = useMemo(() => {
    const normalized = pathname?.replace(/\/+$/, '') ?? ''
    if (normalized.includes('/blog/')) return normalized
    return `/blog/${slug}`
  }, [pathname, slug])
  const { client: supabase, user, username, isAdmin, openAuthModal } = useAuth()

  const loadComments = async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('comments')
      .select('id, user_id, author_name, content, created_at')
      .eq('post_path', postPath)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    if (error) {
      setMessage(`Comments could not load (${error.message}).`)
      return
    }
    setComments(data ?? [])
  }

  const loadReactions = async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('reactions')
      .select('user_id, emoji')
      .eq('post_path', postPath)

    const nextCounts: Record<string, number> = {}
    let nextSelected: string | null = null
    if (error) {
      setMessage(`Reactions could not load (${error.message}).`)
      return
    }
    for (const row of data ?? []) {
      nextCounts[row.emoji] = (nextCounts[row.emoji] ?? 0) + 1
      if (user && row.user_id === user.id) nextSelected = row.emoji
    }
    setCounts(nextCounts)
    setSelectedReaction(nextSelected)
  }

  useEffect(() => {
    if (!supabase) return
    void loadComments()
    void loadReactions()
    if (username) setName(username)
  }, [supabase, user, username, slug, postPath])

  const onReact = async (emoji: string) => {
    if (!supabase) {
      setMessage('Supabase is not configured yet.')
      return
    }
    if (!user) {
      setMessage('Sign in required to leave a like/reaction.')
      openAuthModal('signin')
      return
    }

    if (selectedReaction === emoji) {
      await supabase.from('reactions').delete().eq('user_id', user.id).eq('post_path', postPath)
      await loadReactions()
      return
    }

    await supabase
      .from('reactions')
      .upsert({ user_id: user.id, post_path: postPath, emoji }, { onConflict: 'user_id,post_path' })
    await loadReactions()
  }

  const onSubmitComment = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setMessage('Supabase is not configured yet.')
      return
    }
    if (!name.trim() || !text.trim()) return

    const { error } = await supabase.from('comments').insert({
      user_id: user?.id ?? null,
      post_path: postPath,
      author_name: name.trim(),
      content: text.trim(),
      parent_id: null,
    })

    if (error) {
      setMessage(`Could not post comment (${error.message}).`)
      return
    }

    setMessage('')
    await loadComments()
    setText('')
  }

  const shareUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), [])

  const onShare = async () => {
    if (!shareUrl) return
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl })
      return
    }
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const onDeleteComment = async (id: string) => {
    if (!supabase || !isAdmin) return
    await supabase.from('comments').delete().eq('id', id)
    await loadComments()
  }

  return (
    <section className="container-prose mb-16">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-6 md:p-8">
        <h3 className="font-serif text-xl mb-4">How did this post feel?</h3>
        {message && <p className="text-xs text-[var(--accent-color)] mb-3">{message}</p>}
        <div className="flex flex-wrap gap-2 mb-5">
          {REACTIONS.map(r => {
            const active = selectedReaction === r.emoji
            const count = counts[r.emoji] ?? 0
            return (
              <button
                key={r.emoji}
                onClick={() => onReact(r.emoji)}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all duration-200',
                  active
                    ? 'bg-[var(--accent-color)] text-[#f7f5f2] border-[var(--accent-color)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]',
                ].join(' ')}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
                {count > 0 && (
                  <span className={active ? 'text-[#f7f5f2]/80' : 'text-[var(--text-secondary)]'}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={onShare}
            className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-sm hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors"
          >
            Share this post
          </button>
          {copied && <span className="text-sm text-[var(--accent-color)]">Link copied</span>}
        </div>

        <div className="border-t border-[var(--border-color)] pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-serif text-lg">Comments</h4>
            <span className="text-xs text-[var(--text-secondary)]">{comments.length} total</span>
          </div>

          <form onSubmit={onSubmitComment} className="space-y-3 mb-6">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
              maxLength={80}
              readOnly={!!user}
            />
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write your thoughts..."
              className="w-full min-h-[110px] rounded-lg border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
              maxLength={1000}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[#f7f5f2] text-sm font-semibold"
            >
              Post Comment
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No comments yet. Be the first to share a thought.</p>
          ) : (
            <div className="space-y-3">
              {comments.map(c => (
                <article key={c.id} className="rounded-xl border border-[var(--border-color)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold">{c.author_name}</p>
                    <time className="text-xs text-[var(--text-secondary)]">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{c.content}</p>
                  {isAdmin && (
                    <button
                      onClick={() => void onDeleteComment(c.id)}
                      className="mt-2 text-xs px-2 py-1 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400"
                    >
                      Delete comment
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
