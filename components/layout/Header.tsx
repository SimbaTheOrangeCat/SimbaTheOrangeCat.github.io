'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/search', label: 'Search' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, username, openAuthModal, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setSidebarOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 bg-[var(--header-bg)] border-b border-[var(--border-color)]',
          'transition-[background-color,border-color,box-shadow] duration-300',
          scrolled ? 'shadow-[0_1px_16px_rgba(0,0,0,0.06)]' : '',
        ].join(' ')}
      >
        <div className="container-content flex items-center h-[66px]">
          {/* Hamburger */}
          <button
            className="flex w-9 h-9 flex-col items-center justify-center gap-[5px] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors duration-200"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            <span className="block w-[18px] h-0.5 bg-current" />
            <span className="block w-[18px] h-0.5 bg-current" />
            <span className="block w-[18px] h-0.5 bg-current" />
          </button>

          {/* Logo — centered */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 font-serif text-[1.45rem] font-bold tracking-[-0.02em] text-[var(--text-primary)] hover:text-[var(--text-primary)] group"
          >
            <Image
              src="/assets/logo-nav.svg"
              alt=""
              width={26}
              height={26}
              className="rounded-[6px] transition-transform duration-[250ms] group-hover:rotate-[-5deg] group-hover:scale-[1.06]"
              aria-hidden
            />
            Mindfactor.
          </Link>

          <div className="ml-auto">
            {user ? (
              <button
                onClick={() => void signOut()}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors"
                title={username ?? 'Signed in'}
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 z-50 h-full w-64 bg-[var(--surface-color)] border-r border-[var(--border-color)]',
          'flex flex-col transition-transform duration-300 ease-in-out',
          'shadow-[6px_0_40px_rgba(0,0,0,0.07)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Site navigation"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 h-[66px] border-b border-[var(--border-color)] flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-[1.1rem] font-bold tracking-[-0.02em] text-[var(--text-primary)]"
          >
            <Image
              src="/assets/logo-nav.svg"
              alt=""
              width={20}
              height={20}
              className="rounded-[5px]"
              aria-hidden
            />
            Mindfactor.
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[var(--text-secondary)] px-3 mb-3">
            Menu
          </p>
          {navLinks.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg transition-colors duration-200',
                  active
                    ? 'text-[var(--text-primary)] bg-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200',
                    active ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]',
                  ].join(' ')}
                  aria-hidden="true"
                />
                {label}
              </Link>
            )
          })}

          <div className="my-3 border-t border-[var(--border-color)]" />

          <Link
            href="/journal"
            className="flex items-center gap-2.5 text-sm font-semibold px-3 py-2.5 rounded-lg text-white bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] transition-colors duration-200 shadow-[0_1px_6px_rgba(5,150,105,0.22)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" aria-hidden="true" />
            My Journal
          </Link>

          {user ? (
            <button
              onClick={() => void signOut()}
              className="mt-2 w-full text-left px-3 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors"
            >
              Sign out {username ? `(${username})` : ''}
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="mt-2 w-full text-left px-3 py-2.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors"
            >
              Sign in
            </button>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-[var(--border-color)] flex-shrink-0">
          <p className="text-xs text-[var(--text-secondary)]">Mindful living · clarity · focus</p>
        </div>
      </aside>
    </>
  )
}
