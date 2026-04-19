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

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 w-full border-b transition-[background-color,backdrop-filter,-webkit-backdrop-filter,box-shadow,border-color] duration-300',
          scrolled
            ? 'border-black/[0.12] bg-[rgba(247,245,242,0.94)] backdrop-blur-xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(20px)] shadow-[0_10px_40px_rgba(0,0,0,0.06)]'
            : 'border-black/[0.08] bg-[rgba(247,245,242,0.88)] backdrop-blur-md [-webkit-backdrop-filter:blur(14px)]',
        ].join(' ')}
      >
        <div className="relative flex h-[66px] w-full items-center justify-between pl-3 pr-3 sm:pl-5 sm:pr-5 md:pl-6 md:pr-6">
          <button
            className="relative z-[1] flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-[5px] rounded-md text-[#3d3a36] transition-colors duration-200 hover:text-[#121212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f2]"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            <span className="block h-0.5 w-[18px] bg-current" />
            <span className="block h-0.5 w-[18px] bg-current" />
            <span className="block h-0.5 w-[18px] bg-current" />
          </button>

          <Link
            href="/"
            className="pointer-events-auto absolute left-1/2 top-1/2 z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 font-serif text-[1.45rem] font-bold tracking-[-0.02em] text-[#121212] hover:text-[#121212] group"
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

          <div className="relative z-[1] shrink-0">
            {user ? (
              <button
                onClick={() => void signOut()}
                className="rounded-lg border border-[#c4bfb8] px-3 py-1.5 text-xs font-semibold text-[#3d3a36] transition-colors hover:border-[#121212] hover:text-[#121212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f2]"
                title={username ?? 'Signed in'}
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="rounded-lg bg-[#121212] px-3 py-1.5 text-xs font-semibold text-[#f7f5f2] shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#2a2826] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f2]"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        className={[
          'fixed inset-0 z-40 bg-black/[0.12] backdrop-blur-[2px] transition-opacity duration-300',
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#e5e2dc] bg-[#faf9f7] shadow-[6px_0_40px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Site navigation"
      >
        <div className="flex h-[66px] flex-shrink-0 items-center justify-between border-b border-[#e5e2dc] px-5">
          <Link href="/" className="flex items-center gap-2 font-serif text-[1.1rem] font-bold tracking-[-0.02em] text-[#121212]">
            <Image src="/assets/logo-nav.svg" alt="" width={20} height={20} className="rounded-[5px]" aria-hidden />
            Mindfactor.
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b6560] transition-colors duration-200 hover:bg-[#ebe8e2] hover:text-[#121212]"
            aria-label="Close menu"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8a8782]">Menu</p>
          {navLinks.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  active
                    ? 'bg-[#ebe8e2] text-[#121212]'
                    : 'text-[#5c5854] hover:bg-[#ebe8e2] hover:text-[#121212]',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors duration-200',
                    active ? 'bg-[#8a2419]' : 'bg-[#d4d0c8]',
                  ].join(' ')}
                  aria-hidden="true"
                />
                {label}
              </Link>
            )
          })}

          <div className="my-3 border-t border-[#e5e2dc]" />

          <Link
            href="/journal"
            className="flex items-center gap-2.5 rounded-lg bg-[#121212] px-3 py-2.5 text-sm font-semibold text-[#f7f5f2] shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#2a2826] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]"
          >
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#f7f5f2]/35" aria-hidden="true" />
            My Journal
          </Link>

          {user ? (
            <button
              onClick={() => void signOut()}
              className="mt-2 w-full rounded-lg border border-[#e5e2dc] px-3 py-2.5 text-left text-sm text-[#5c5854] transition-colors hover:border-[#121212] hover:text-[#121212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]"
            >
              Sign out {username ? `(${username})` : ''}
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="mt-2 w-full rounded-lg border border-[#e5e2dc] px-3 py-2.5 text-left text-sm text-[#5c5854] transition-colors hover:border-[#121212] hover:text-[#121212] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f7]"
            >
              Sign in
            </button>
          )}
        </nav>

        <div className="flex-shrink-0 border-t border-[#e5e2dc] px-5 py-4">
          <p className="text-xs text-[#8a8782]">Mindful living · clarity · focus</p>
        </div>
      </aside>
    </>
  )
}
