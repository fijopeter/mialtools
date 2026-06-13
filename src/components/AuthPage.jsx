import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import mlogo from '../images/Mlogo-nobg.png'
import './AuthPage.css'

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export default function AuthPage() {
  const { isConfigured, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setInfo('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    if (mode === 'signin') {
      const { error: signInError } = await signIn({ email, password })
      if (signInError) setError(signInError.message)
    } else {
      const { error: signUpError, needsEmailConfirmation } = await signUp({ fullName, email, password })
      if (signUpError) {
        setError(signUpError.message)
      } else if (needsEmailConfirmation) {
        setInfo('Account created! Check your email to confirm your account, then sign in.')
        setMode('signin')
        setPassword('')
        setConfirmPassword('')
      }
    }
    setSubmitting(false)
  }

  return (
    <div className="auth-page">
      <div className="bg-blobs">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
        <span className="blob blob--3" />
      </div>

      <div className="auth-card glass-panel animate-scale-up">
        <div className="auth-card__brand">
          <img src={mlogo} alt="MIAL" className="auth-card__logo" />
          <h1 className="gradient-text">MIAL Tools</h1>
        </div>

        {!isConfigured ? (
          <div className="vault-setup-notice">
            <div className="vault-setup-icon">
              <IconLock />
            </div>
            <h3>Supabase isn't configured yet</h3>
            <p>
              To enable sign-in, add your Supabase project URL and anon key to the <code>.env</code> file at
              the project root.
            </p>
            <pre className="vault-setup-code">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
            </pre>
            <p>
              See <code>SUPABASE_SETUP.md</code> for full step-by-step setup instructions, then restart the
              dev server.
            </p>
          </div>
        ) : (
          <>
            <p className="auth-card__subtitle">
              {mode === 'signin' ? 'Sign in to continue to MIAL Tools' : 'Create an account to get started'}
            </p>

            {error && (
              <div className="vault-banner vault-banner--error animate-fade-in">
                <IconAlert />
                {error}
              </div>
            )}
            {info && (
              <div className="vault-banner vault-banner--success animate-fade-in">
                <IconCheck />
                {info}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label className="field-group">
                  <span>Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </label>
              )}
              <label className="field-group">
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="field-group">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              {mode === 'signup' && (
                <label className="field-group">
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
              )}

              <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <button className="auth-toggle" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
