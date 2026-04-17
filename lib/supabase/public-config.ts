/**
 * Reads Supabase public env for browser/client usage.
 * Trims whitespace and ignores placeholder values from the template.
 */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

  if (!url || !anonKey) return null
  if (url.includes('YOUR_PROJECT') || anonKey.includes('YOUR_ANON')) return null
  if (!url.startsWith('http')) return null

  return { url, anonKey }
}
