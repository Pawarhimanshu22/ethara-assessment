import { useState, useRef } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    // Read the live DOM values so browser autofill (which can skip React onChange)
    // is always honored over possibly-stale component state.
    const emailValue = (emailRef.current?.value ?? email).trim()
    const passwordValue = passwordRef.current?.value ?? password
    if (!emailValue || !passwordValue) {
      setError('Please enter both email and password.')
      return
    }
    setSubmitting(true)
    try {
      await login(emailValue, passwordValue)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  const fieldClass =
    'h-[46px] w-full rounded-[11px] border border-ink-border bg-ink-200 px-[14px] text-sm text-white placeholder:text-surface-400 focus:border-brand-600 focus:outline-none focus:ring-[3px] focus:ring-brand-600/25'
  const labelClass = 'mb-[7px] block text-xs font-semibold text-[#b6b7cd]'

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Left — form panel */}
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="animate-fadeup w-full max-w-[380px]">
          <div className="mb-9 flex items-center gap-3">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-brand-600 shadow-nav">
              <Building2 className="h-[22px] w-[22px] text-white" />
            </div>
            <div>
              <p className="font-display text-[19px] font-bold leading-tight text-white">Ethara</p>
              <p className="text-xs tracking-[0.02em] text-surface-400">
                Seat Allocation &amp; Project Mapping
              </p>
            </div>
          </div>

          <h1 className="mb-2 text-[26px] text-white">Welcome back</h1>
          <p className="mb-7 text-sm text-surface-400">Sign in to the workspace console.</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-[11px] border border-[#4a2436] bg-[#2a1620] px-3.5 py-2.5 text-[13px] text-[#fca5b8]">
                {error}
              </div>
            )}

            <label htmlFor="login-email" className={labelClass}>
              Work email
            </label>
            <input
              id="login-email"
              ref={emailRef}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ethara.ai"
              autoFocus
              className={`${fieldClass} mb-4`}
            />

            <label htmlFor="login-password" className={labelClass}>
              Password
            </label>
            <input
              id="login-password"
              ref={passwordRef}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${fieldClass} mb-6`}
            />

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-brand-600 text-[14.5px] font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in to console'}
            </button>
          </form>

          <div className="mt-5 rounded-[11px] border border-ink-400 bg-ink-200 px-3.5 py-3">
            <p className="text-[11px] leading-relaxed text-surface-400">
              <span className="font-semibold text-[#b6b7cd]">Demo — HR / Admin.</span>{' '}
              admin@ethara.ai · Admin@123. Full write access.
            </p>
          </div>
        </div>
      </div>

      {/* Right — indigo gradient panel */}
      <div
        className="relative hidden min-w-[340px] flex-1 overflow-hidden md:block"
        style={{
          background: 'linear-gradient(160deg,#4f46e5 0%,#312a9c 60%,#1b1656 100%)',
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white">
          <p className="mb-4 text-[13px] uppercase tracking-[0.14em] text-white/70">
            Operations console
          </p>
          <h2 className="max-w-[420px] text-[34px] leading-[1.15] text-white">
            Every seat, every project, every joiner — mapped in one place.
          </h2>
        </div>
      </div>
    </div>
  )
}
