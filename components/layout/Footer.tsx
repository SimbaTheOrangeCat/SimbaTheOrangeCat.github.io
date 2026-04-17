import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
  { href: '/journal', label: 'My Journal' },
]

const topics = ['Mindfulness', 'Productivity', 'Simplicity', 'Slow Living']

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--surface-color)] transition-colors duration-300">
      <div className="container-content py-12">
        {/* ── Top row ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-10 border-b border-[var(--border-color)]">
          {/* Brand */}
          <div className="max-w-[240px]">
            <p className="font-serif text-[1.2rem] font-semibold text-[var(--text-primary)] tracking-[-0.015em] mb-2">
              Mindfactor.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              A warm corner of the internet for mindful living and quiet reflection.
            </p>
          </div>

          {/* Nav + Topics */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-3">
                Pages
              </p>
              <nav className="flex flex-col gap-2">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-3">
                Topics
              </p>
              <div className="flex flex-col gap-2">
                {topics.map(topic => (
                  <span
                    key={topic}
                    className="text-sm text-[var(--text-secondary)]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-[var(--text-secondary)]">
          <span>
            &copy; {new Date().getFullYear()} Mindfactor. Designed with warmth.
          </span>
          <span className="text-[var(--border-color)]">
            Made with care, not rush.
          </span>
        </div>
      </div>
    </footer>
  )
}
