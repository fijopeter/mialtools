import React, { useEffect, useRef, useState } from 'react'
import './Sidebar.css'
import mlogo from '../images/Mlogo-nobg.png'
import fullLogo from '../images/fullLogo-nobg.png'

const ITEM_HEIGHT = 48

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const IconTools = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
)

const IconArchive = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="5" rx="1"></rect>
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
    <path d="M10 12h4"></path>
  </svg>
)

const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6"></path>
  </svg>
)

const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: IconHome },
  { id: 'tools', label: 'Tools', icon: IconTools },
  { id: 'vault', label: 'Repository', icon: IconArchive },
]

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse, userName, userEmail, onLogout }) {
  const activeId = currentPage === 'form' ? 'tools' : currentPage
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeId)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  useEffect(() => {
    if (!accountOpen) return
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [accountOpen])

  const initial = (userName || '?').trim().charAt(0).toUpperCase()

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div
        className="sidebar__logo"
        onClick={() => onNavigate('home')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onNavigate('home')
          }
        }}
        title="MIAL Home"
      >
        {collapsed ? (
          <img src={mlogo} alt="MIAL" className="sidebar__logo-img" />
        ) : (
          <img src={fullLogo} alt="MIAL Instruments" className="sidebar__logo-img sidebar__logo-img--full" />
        )}
      </div>

      <nav className="sidebar__nav">
        {activeIndex >= 0 && (
          <div
            className="sidebar__indicator"
            style={{ transform: `translateY(${activeIndex * ITEM_HEIGHT}px)` }}
          />
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`sidebar__item ${activeId === item.id ? 'sidebar__item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <span className="sidebar__icon">
                <Icon />
              </span>
              <span className="sidebar__label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__collapse"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconChevron />
        </button>
        <div className="sidebar__account-wrap" ref={accountRef}>
          {accountOpen && (
            <div className="sidebar__account-menu glass-card animate-scale-up">
              <div className="sidebar__account-info">
                <span className="sidebar__account-name">{userName}</span>
                <span className="sidebar__account-email">{userEmail}</span>
              </div>
              <button
                className="sidebar__logout"
                onClick={() => {
                  setAccountOpen(false)
                  onLogout && onLogout()
                }}
              >
                <IconLogout />
                <span>Log out</span>
              </button>
            </div>
          )}
          <button
            className="sidebar__account"
            onClick={() => setAccountOpen((open) => !open)}
            title="Account"
            aria-label="Account"
          >
            <span className="sidebar__avatar">{initial}</span>
            <span className="sidebar__label">{userName}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
