import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import mlogo from '../images/Mlogo-nobg.png'
import './AuthPage.css'

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth()

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

        <div className="pending-approval">
          <div className="vault-setup-icon">
            <IconClock />
          </div>
          <h3>Your account is pending approval</h3>
          <p>
            Thanks for registering, <strong>{user?.email}</strong>. An administrator needs to approve your
            account before you can access MIAL Tools. You'll be able to sign in normally once that's done.
          </p>
          <button className="btn btn-secondary" onClick={signOut}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
