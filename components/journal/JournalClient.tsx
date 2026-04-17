'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

type Entry = {
  id: string
  event_name: string
  content: string
  created_at: string
}

export default function JournalClient() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [eventName, setEventName] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')
  const { client: supabase, user, username, openAuthModal, loading } = useAuth()

  useEffect(() => {
    const boot = async () => {
      if (!supabase || !user) {
        setEntries([])
        return
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, event_name, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        setStatus('Could not load journal entries from Supabase. Check table and RLS policies.')
        return
      }
      setEntries(data ?? [])
    }

    void boot()
  }, [supabase, user])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !user) return
    if (!eventName.trim() || !content.trim()) return

    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      event_name: eventName.trim(),
      content: content.trim(),
    })

    if (error) {
      setStatus('Supabase save failed.')
      return
    }

    const { data } = await supabase
      .from('journal_entries')
      .select('id, event_name, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    setEntries(data ?? [])
    setEventName('')
    setContent('')
    setStatus('Entry saved.')
  }

  const onDelete = async (id: string) => {
    if (!supabase || !user) return

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      setStatus('Could not delete from Supabase.')
      return
    }
    setEntries(entries.filter(e => e.id !== id))
  }

  if (loading) {
    return (
      <div className="container-content">
        <p className="text-[var(--text-secondary)]">Loading journal...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-content">
        <div className="max-w-[760px] mx-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-8 text-center">
          <h1 className="font-serif text-[2.1rem] mb-2">My Journal</h1>
          <p className="text-[var(--text-secondary)] mb-5">
            Sign in to write and manage your private journal entries.
          </p>
          <button
            onClick={() => openAuthModal('signin')}
            className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    )
  }

  if (!supabase) {
    return (
      <div className="container-content">
        <div className="max-w-[760px] mx-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-8">
          <h1 className="font-serif text-[2.1rem] mb-2">My Journal</h1>
          <p className="text-[var(--text-secondary)]">
            Supabase environment variables are missing. Add `NEXT_PUBLIC_SUPABASE_URL` and
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable journal storage.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-content">
      <div className="max-w-[760px] mx-auto">
        <h1 className="font-serif text-[2.5rem] leading-[1.15] tracking-[-0.02em] mb-3">My Journal</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Write entries, revisit past notes, and track your reflection journey, {username ?? 'reader'}.
        </p>

        <form onSubmit={onSubmit} className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-5 mb-8 space-y-3">
          <input
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            placeholder="Event title (example: Morning reflections)"
            className="w-full rounded-lg border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your journal entry..."
            className="w-full min-h-[160px] rounded-lg border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-secondary)]">Mode: Supabase cloud</p>
            <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold">
              Save Entry
            </button>
          </div>
          {status && <p className="text-xs text-[var(--accent-color)]">{status}</p>}
        </form>

        <section className="space-y-3 pb-16">
          <h2 className="font-serif text-2xl mb-2">Past Entries</h2>
          {entries.length === 0 ? (
            <p className="text-[var(--text-secondary)] text-sm">No entries yet. Your first note starts your timeline.</p>
          ) : (
            entries.map(entry => (
              <article key={entry.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold">{entry.event_name}</h3>
                    <time className="text-xs text-[var(--text-secondary)]">
                      {new Date(entry.created_at).toLocaleString()}
                    </time>
                  </div>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-xs px-2 py-1 rounded border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{entry.content}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
