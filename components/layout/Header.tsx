'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className={[
        'sticky top-0 z-50 bg-[var(--header-bg)] border-b border-[var(--border-color)]',
        'transition-[background-color,border-color,box-shadow] duration-300',
        scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.07)]' : '',
      ].join(' ')}
    >
      <div className="container-content flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--text-primary)] hover:text-[var(--text-primary)] group"
        >
          <Image
            src="/favicon.svg"
            alt=""
            width={26}
            height={26}
            className="rounded-[6px] transition-transform duration-[250ms] group-hover:rotate-[-5deg] group-hover:scale-[1.06]"
            aria-hidden
          />
          Mindfactor.
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1.5">
          <nav className="flex items-center gap-0.5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-200',
                  pathname === href
                    ? 'text-[var(--text-primary)] bg-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/journal"
              className="ml-2 text-sm font-semibold px-4 py-2 rounded-[7px] text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] shadow-[0_1px_4px_rgba(5,150,105,0.25)] hover:shadow-[0_4px_14px_rgba(5,150,105,0.35)] transition-all duration-200"
            >
              My Journal
            </Link>
          </nav>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden w-8 h-8 flex-col items-center justify-center gap-[5px] rounded-md border border-[var(--border-color)] text-[var(--text-secondary)]"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={`block w-4 h-0.5 bg-current transition-transform duration-200 origin-center ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
          <span className={`block w-4 h-0.5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-4 h-0.5 bg-current transition-transform duration-200 origin-center ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={[
          'md:hidden border-t border-[var(--border-color)] bg-[var(--header-bg)] overflow-hidden transition-all duration-300',
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <nav className="container-content py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                'text-sm font-medium px-3 py-2.5 rounded-md transition-colors duration-200',
                pathname === href
                  ? 'text-[var(--text-primary)] bg-[var(--border-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/journal"
            className="mt-1 text-sm font-semibold px-3 py-2.5 rounded-[7px] text-white bg-[var(--accent-color)] text-center"
          >
            My Journal
          </Link>
        </nav>
      </div>
    </header>
  )
}
