import React, { useState, useEffect } from 'react'
import './Header.css'
import mlogo from '../images/Mlogo-nobg.png';

export default function Header({ onSearchChange, onToolsClick, currentPage, onHomeClick }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearchChange && onSearchChange(value)
  }

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    setTimeout(() => setIsSearchFocused(false), 150)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearchChange && onSearchChange('')
  }

  const handleLogoClick = () => {
    setSearchQuery('')
    onSearchChange && onSearchChange('')
    onHomeClick && onHomeClick()
  }

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__logo" onClick={handleLogoClick} role="button" tabIndex="0">
          <div className="logo-icon">
            <img src={mlogo}alt="MIAL Logo" className="logo-image" />
          </div>
          <span className="logo-text">MIAL</span>
        </div>

        {currentPage === 'home' && (
          <div className={`search-wrapper ${isSearchFocused ? 'search-wrapper--focused' : ''}`}>
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search meters, codes, categories..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                disabled="true"
              />
              {searchQuery && (
                <button className="search-clear" onClick={clearSearch} title="Clear search">
                  ✕
                </button>
              )}
            </div>
            <div className="search-underline"></div>
          </div>
        )}

        <div className="header__actions">
          <button 
            className={`nav-button ${currentPage === 'home' ? 'nav-button--active' : ''}`}
            onClick={() => {
              setSearchQuery('')
              onSearchChange && onSearchChange('')
              onHomeClick && onHomeClick()
            }}
            title="Home"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </button>

          <button 
            className={`nav-button ${currentPage === 'tools' ? 'nav-button--active' : ''}`}
            onClick={() => onToolsClick && onToolsClick()}
            title="Tools"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <span>Tools</span>
          </button>

          <div className="header__status">
            <div class="user-icon">
              👤
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
