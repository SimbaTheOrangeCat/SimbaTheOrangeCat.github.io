import type { Metadata } from 'next'
import JournalClient from '@/components/journal/JournalClient'

export const metadata: Metadata = {
  title: 'My Journal',
  description: 'Write and revisit journal entries in your mindful timeline.',
}

export default function JournalPage() {
  return <JournalClient />
}
