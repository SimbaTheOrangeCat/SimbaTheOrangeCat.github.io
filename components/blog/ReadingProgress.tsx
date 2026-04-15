'use client'

import { useEffect } from 'react'

export default function ReadingProgress() {
  useEffect(() => {
    const bar = document.getElementById('reading-progress-bar')
    if (!bar) return

    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      bar.style.width = `${Math.min(pct, 100)}%`
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return null
}
