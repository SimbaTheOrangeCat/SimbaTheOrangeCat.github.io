export type NewsletterApiResultStatus =
  | 'subscribed'
  | 'already_subscribed'
  | 'invalid_email'
  | 'rate_limited'
  | 'temporary_unavailable'

export type NewsletterApiResult =
  | { ok: true; status: Extract<NewsletterApiResultStatus, 'subscribed' | 'already_subscribed'> }
  | { ok: false; error: Exclude<NewsletterApiResultStatus, 'subscribed' | 'already_subscribed'> }

function getNewsletterApiUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_NEWSLETTER_API_URL?.trim()
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_NEWSLETTER_API_URL is not configured')
  }
  return `${baseUrl.replace(/\/$/, '')}/api/newsletter/subscribe`
}

export async function submitNewsletterEmail(email: string): Promise<NewsletterApiResult> {
  const response = await fetch(getNewsletterApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      source: 'mindfactor_footer',
    }),
  })

  if (!response.ok) {
    if (response.status === 429) {
      return { ok: false, error: 'rate_limited' }
    }
    return { ok: false, error: 'temporary_unavailable' }
  }

  const payload = (await response.json()) as NewsletterApiResult
  return payload
}
