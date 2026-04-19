'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Adds .he-in-view when the block intersects the viewport (scroll reveal).
 */
export default function RevealOnScroll({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('he-in-view')
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('he-in-view')
          io.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`he-scroll-reveal ${className}`.trim()}>
      {children}
    </div>
  )
}
