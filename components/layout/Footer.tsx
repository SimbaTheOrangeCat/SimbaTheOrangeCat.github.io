import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
  { href: '/journal', label: 'My Journal' },
]

const topicLinks = [
  { label: 'Mindfulness', query: 'Mindfulness' },
  { label: 'Productivity', query: 'Productivity' },
  { label: 'Simplicity', query: 'minimalism' },
  { label: 'Slow Living', query: 'slow living' },
] as const

export default function Footer() {
  return (
    <footer className="border-t border-[#e5e2dc] bg-[#ebe8e2] transition-colors duration-300">
      <div className="container-content py-12">
        <div className="flex flex-col justify-between gap-8 border-b border-[#dad6cf] pb-10 md:flex-row md:items-start">
          <div className="max-w-[240px]">
            <p className="mb-2 font-serif text-[1.2rem] font-semibold tracking-[-0.015em] text-[#121212]">
              Mindfactor.
            </p>
            <p className="text-sm leading-relaxed text-[#5c5854]">
              A warm corner of the internet for mindful living and quiet reflection.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.8px] text-[#8a8782]">Pages</p>
              <nav className="flex flex-col gap-2">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm text-[#5c5854] transition-colors duration-200 hover:text-[#8a2419]"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.8px] text-[#8a8782]">Topics</p>
              <nav className="flex flex-col gap-0.5" aria-label="Browse by topic">
                {topicLinks.map(({ label, query }) => (
                  <Link
                    key={label}
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="-mx-2 rounded-md px-2 py-1.5 text-sm text-[#5c5854] transition-colors duration-200 hover:bg-[#e0dcd4] hover:text-[#8a2419]"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-[#8a8782] sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Mindfactor. Designed with warmth.</span>
          <span className="text-[#c4bfb8]">Made with care, not rush.</span>
        </div>
      </div>
    </footer>
  )
}
