import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
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
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        serif: ['var(--font-lora)', 'Lora', 'serif'],
      },
      maxWidth: {
        content: '1100px',
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
