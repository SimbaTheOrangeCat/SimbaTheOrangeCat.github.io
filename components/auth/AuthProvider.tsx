'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getSupabasePublicConfig } from '@/lib/supabase/public-config'

type AuthMode = 'signin' | 'signup'

type AuthContextValue = {
  client: SupabaseClient | null
  user: User | null
  username: string | null
  isAdmin: boolean
  loading: boolean
  openAuthModal: (mode?: AuthMode) => void
  closeAuthModal: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@mindfactor.internal`
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('signin')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formConfirm, setFormConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const authBootstrappedRef = useRef(false)

  const client = useMemo(() => {
    const cfg = getSupabasePublicConfig()
    if (!cfg) return null
    return createBrowserClient(cfg.url, cfg.anonKey)
  }, [])

  const hydrateProfile = useCallback(
    async (nextUser: User | null) => {
      setUser(nextUser)
      if (!nextUser) {
        setUsername(null)
        setIsAdmin(false)
        return
      }

      const meta = nextUser.user_metadata ?? {}
      const metaUsername = typeof meta.username === 'string' ? meta.username : null
      const metaRole = typeof meta.role === 'string' ? meta.role : null
      if (metaUsername) setUsername(metaUsername)
      if (metaRole) setIsAdmin(metaRole === 'admin')

      if (!client) return
      try {
        const { data, error } = await client
          .from('profiles')
          .select('username, role')
          .eq('id', nextUser.id)
          .maybeSingle()

        if (error) {
          console.warn('[auth] profiles lookup failed', error.message)
          return
        }
        if (data?.username) setUsername(data.username)
        if (data?.role) setIsAdmin(data.role === 'admin')
      } catch (e) {
        console.warn('[auth] profiles lookup threw', e)
      }
    },
    [client],
  )

  useEffect(() => {
    if (!client) {
      setLoading(false)
      return
    }

    authBootstrappedRef.current = false
    let mounted = true

    const markReady = () => {
      if (!mounted) return
      if (authBootstrappedRef.current) return
      authBootstrappedRef.current = true
      setLoading(false)
    }

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      try {
        await hydrateProfile(session?.user ?? null)
      } catch (e) {
        console.warn('[auth] onAuthStateChange hydrate failed', e)
        if (mounted) {
          setUser(null)
          setUsername(null)
          setIsAdmin(false)
        }
      } finally {
        markReady()
      }
    })

    void client.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!mounted) return
        if (error) {
          console.warn('[auth] getSession failed', error.message)
          await hydrateProfile(null)
          return
        }
        try {
          await hydrateProfile(data.session?.user ?? null)
        } catch (e) {
          console.warn('[auth] getSession hydrate failed', e)
          setUser(null)
          setUsername(null)
          setIsAdmin(false)
        }
      })
      .catch(e => {
        console.warn('[auth] getSession rejected', e)
        if (mounted) void hydrateProfile(null)
      })
      .finally(() => {
        markReady()
      })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [client, hydrateProfile])

  const resetForm = () => {
    setFormUsername('')
    setFormPassword('')
    setFormConfirm('')
    setError('')
  }

  const openAuthModal = (nextMode: AuthMode = 'signin') => {
    setMode(nextMode)
    setError('')
    setModalOpen(true)
  }

  const closeAuthModal = () => {
    setModalOpen(false)
    resetForm()
  }

  const signOut = async () => {
    if (!client) {
      setUser(null)
      setUsername(null)
      setIsAdmin(false)
      return
    }
    try {
      const { error } = await client.auth.signOut()
      if (error) console.warn('[auth] signOut failed', error.message)
    } catch (e) {
      console.warn('[auth] signOut threw', e)
    } finally {
      await hydrateProfile(null)
    }
  }

  const submit = async () => {
    if (!client) {
      setError(
        'Supabase URL or anon key is missing in this build. ' +
          'Local: save .env.local in the project root (same folder as package.json), then stop the dev server (Ctrl+C) and run npm run dev again. ' +
          'Live site: add GitHub Actions secrets NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.',
      )
      return
    }
    if (!formUsername.trim() || !formPassword.trim()) {
      setError('Please complete all fields.')
      return
    }
    if (mode === 'signup' && formPassword !== formConfirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')
    const email = toEmail(formUsername)

    if (mode === 'signin') {
      const { error: signInError } = await client.auth.signInWithPassword({
        email,
        password: formPassword,
      })
      setSubmitting(false)
      if (signInError) {
        setError('Invalid username or password.')
        return
      }
      closeAuthModal()
      return
    }

    const { data, error: signUpError } = await client.auth.signUp({
      email,
      password: formPassword,
      options: {
        data: {
          username: formUsername.trim(),
          role: 'reader',
        },
      },
    })

    if (!signUpError && data.user) {
      await client.from('profiles').upsert({
        id: data.user.id,
        username: formUsername.trim(),
        role: 'reader',
      })
    }

    setSubmitting(false)
    if (signUpError) {
      setError(signUpError.message || 'Sign up failed.')
      return
    }
    closeAuthModal()
  }

  return (
    <AuthContext.Provider
      value={{
        client,
        user,
        username,
        isAdmin,
        loading,
        openAuthModal,
        closeAuthModal,
        signOut,
      }}
    >
      {children}

      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/55"
            aria-label="Close auth dialog"
            onClick={closeAuthModal}
          />
          <div className="relative w-full max-w-md rounded-none border border-[var(--border-color)] bg-[var(--surface-color)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => setMode('signin')}
                className={[
                  'px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-none border',
                  mode === 'signin'
                    ? 'bg-[var(--accent-color)] text-[#f7f5f2] border-[var(--accent-color)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)]',
                ].join(' ')}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode('signup')}
                className={[
                  'px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-none border',
                  mode === 'signup'
                    ? 'bg-[var(--accent-color)] text-[#f7f5f2] border-[var(--accent-color)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)]',
                ].join(' ')}
              >
                Sign up
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={formUsername}
                onChange={e => setFormUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-none border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
              />
              <input
                value={formPassword}
                onChange={e => setFormPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="w-full rounded-none border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
              />
              {mode === 'signup' && (
                <input
                  value={formConfirm}
                  onChange={e => setFormConfirm(e.target.value)}
                  type="password"
                  placeholder="Confirm password"
                  className="w-full rounded-none border border-[var(--border-color)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)]"
                />
              )}
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full px-4 py-2 rounded-none bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[#f7f5f2] text-[11px] font-bold uppercase tracking-widest disabled:opacity-60"
              >
                {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
