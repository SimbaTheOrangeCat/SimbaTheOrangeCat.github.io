import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
theme: {
    extend: {
      // Brand colors mapped to CSS variables so dark mode + accent customisation work
      colors: {
        bg: 'var(--bg-color)',
        surface: 'var(--surface-color)',
        border: 'var(--border-color)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        accent: 'var(--accent-color)',
        'accent-hover': 'var(--accent-hover)',
        'header-bg': 'var(--header-bg)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '1360px',
        prose: '720px',
      },
      transitionTimingFunction: {
        smooth: 'ease',
      },
    },
  },
  plugins: [],
}

export default config
