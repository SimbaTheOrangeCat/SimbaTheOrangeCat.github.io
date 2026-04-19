'use client'

import type { ReactNode } from 'react'

export default function MainFrame({ children }: { children: ReactNode }) {
  return <main className="flex-1 py-10 page-fade-in md:py-14">{children}</main>
}
