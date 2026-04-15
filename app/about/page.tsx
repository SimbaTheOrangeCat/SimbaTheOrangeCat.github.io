import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about Mindfactor and the person behind the writing.',
}

export default function AboutPage() {
  return (
    <div className="container-content">
      <div className="container-prose">
        <h1 className="font-serif text-[2.5rem] leading-[1.15] tracking-[-0.02em] mb-6">
          About
        </h1>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          This page will be filled in during Phase 2 — content migration.
        </p>
      </div>
    </div>
  )
}
