import type { Metadata } from 'next'
import { Inter, Lora, Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MainFrame from '@/components/layout/MainFrame'
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
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
      <body
        className={`${inter.variable} ${lora.variable} ${playfair.variable} ${dmSans.variable} font-sans`}
      >
        <AuthProvider>
          <div id="reading-progress-bar" />
          <Header />
          <MainFrame>{children}</MainFrame>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
