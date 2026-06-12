import React from 'react'
import './Sidebar.css'
import mlogo from '../images/Mlogo-nobg.png'

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

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: IconHome },
  { id: 'tools', label: 'Tools', icon: IconTools },
  { id: 'vault', label: 'Repository', icon: IconArchive },
]

export default function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }) {
  const activeId = currentPage === 'form' ? 'tools' : currentPage
  const activeIndex = NAV_ITEMS.findIndex((item) => item.id === activeId)

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
        <img src={mlogo} alt="MIAL" className="sidebar__logo-img" />
        <span className="sidebar__logo-text">MIAL</span>
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
        <button className="sidebar__account" title="Account" aria-label="Account">
          <IconUser />
        </button>
      </div>
    </aside>
  )
}
