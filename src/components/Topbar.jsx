import React, { useState } from 'react'
import './Topbar.css'

const IconSearch = () => (
  <svg className="topbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"></path>
  </svg>
)

export default function Topbar({ title, subtitle, showSearch, searchQuery, onSearchChange }) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <header className="topbar">
      <div className="topbar__titles">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
      </div>

      {showSearch && (
        <div className={`topbar__search ${isFocused ? 'topbar__search--focused' : ''}`}>
          <IconSearch />
          <input
            type="text"
            className="topbar__search-input"
            placeholder="Search tools by name or category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchQuery && (
            <button className="topbar__search-clear" onClick={() => onSearchChange('')} title="Clear search" aria-label="Clear search">
              <IconClose />
            </button>
          )}
        </div>
      )}
    </header>
  )
}
