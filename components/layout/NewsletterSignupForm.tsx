'use client'

import { FormEvent, useMemo, useState } from 'react'
import { submitNewsletterEmail } from '@/lib/newsletter-client'

type SubmitState = 'idle' | 'loading' | 'subscribed' | 'already_subscribed' | 'error'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function NewsletterSignupForm() {
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')

  const disabled = submitState === 'loading'

  const feedbackToneClass = useMemo(() => {
    if (submitState === 'subscribed' || submitState === 'already_subscribed') {
      return 'text-[#2f6f3a]'
    }
    if (submitState === 'error') {
      return 'text-[#8a2419]'
    }
    return 'text-[#5c5854]'
  }, [submitState])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      setSubmitState('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setSubmitState('loading')
    setMessage('')

    try {
      const result = await submitNewsletterEmail(normalizedEmail)

      if (result.ok && result.status === 'subscribed') {
        setSubmitState('subscribed')
        setMessage('You are subscribed. Welcome to gentle weekly notes.')
        setEmail('')
        return
      }

      if (result.ok && result.status === 'already_subscribed') {
        setSubmitState('already_subscribed')
        setMessage('This email is already subscribed.')
        return
      }

      if (!result.ok && result.error === 'invalid_email') {
        setSubmitState('error')
        setMessage('Please enter a valid email address.')
        return
      }

      if (!result.ok && result.error === 'rate_limited') {
        setSubmitState('error')
        setMessage('Too many attempts. Please try again shortly.')
        return
      }

      setSubmitState('error')
      setMessage('Service is temporarily unavailable. Please try again later.')
    } catch {
      setSubmitState('error')
      setMessage('Service is temporarily unavailable. Please try again later.')
    }
  }

  return (
    <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={disabled}
        className="h-11 w-full rounded-full border border-[#d7d2ca] bg-[#f4f1ec] px-4 text-sm text-[#2f2c28] outline-none transition-colors duration-200 placeholder:text-[#9a958d] focus:border-[#8a2419] disabled:cursor-not-allowed disabled:opacity-70"
      />
      <button
        type="submit"
        disabled={disabled}
        className="h-11 rounded-full bg-[#8a2419] px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#6f1d14] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitState === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      <p className={`sm:basis-full sm:pt-1 text-xs ${feedbackToneClass}`} aria-live="polite">
        {message}
      </p>
    </form>
  )
}
