import Link from 'next/link'

const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
  { href: '/journal', label: 'My Journal' },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] py-10 transition-colors duration-300">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <p className="font-serif text-lg font-semibold text-[var(--text-primary)] tracking-[-0.01em]">
              Mindfactor.
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              A warm corner of the internet.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-secondary)]">
          &copy; {new Date().getFullYear()} Mindfactor. Designed with warmth.
        </div>
      </div>
    </footer>
  )
}
