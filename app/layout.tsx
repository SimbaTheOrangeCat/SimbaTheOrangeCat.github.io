import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div id="reading-progress-bar" />
          <Header />
          <main className="flex-1 py-14 page-fade-in">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
