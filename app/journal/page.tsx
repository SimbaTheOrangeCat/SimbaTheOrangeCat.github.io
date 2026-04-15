import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Journal',
  description: 'A private space for personal reflections.',
}

export default function JournalPage() {
  return (
    <div className="container-content">
      <h1 className="font-serif text-[2.5rem] leading-[1.15] tracking-[-0.02em] mb-4">
        My Journal
      </h1>
      <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
        Journal entries will be available here once auth and Supabase are rebuilt in Phase 4.
      </p>
    </div>
  )
}
