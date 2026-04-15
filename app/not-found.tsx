import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-content text-center py-24">
      <p className="text-[var(--accent-color)] font-semibold text-sm uppercase tracking-widest mb-4">
        404
      </p>
      <h1 className="font-serif text-[2.75rem] leading-[1.15] tracking-[-0.02em] mb-4">
        Page not found
      </h1>
      <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto mb-10 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-[7px] text-sm transition-all duration-200"
      >
        Back to home
      </Link>
    </div>
  )
}
