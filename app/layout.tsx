import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthProvider from '@/components/auth/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Mindfactor's Personal Blog",
    template: '%s | Mindfactor',
  },
  description: 'A warm and minimalist personal space on the internet exploring mindful living, cozy productivity, and the beauty of simplicity.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lora.variable} font-sans`}>
        <AuthProvider>
          <div id="reading-progress-bar" />
          <Header />
          <main className="flex-1 py-14 page-fade-in">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
