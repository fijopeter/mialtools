import React, { useRef, useState, useEffect } from 'react'
import './ScrollableOptions.css'

export default function ScrollableOptions({ items, onSelect, title }) {
  const scrollContainerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const itemWidth = 280 // Card width + gap
  const gap = 16

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }

    const container = scrollContainerRef.current
    container?.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    checkScroll()

    return () => {
      container?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [items.length])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = itemWidth
      const newScrollLeft = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })

      // Update current index
      const newIndex = Math.round(newScrollLeft / itemWidth)
      setCurrentIndex(Math.min(newIndex, Math.max(0, items.length - 1)))
    }
  }

  const handleItemHover = (e, index) => {
    // Create zoom effect
    const cards = scrollContainerRef.current?.querySelectorAll('.option-card')
    cards?.forEach((card, idx) => {
      if (idx === index) {
        card.style.transform = 'scale(1.08) translateY(-8px)'
        card.style.zIndex = 10
      } else {
        card.style.transform = 'scale(0.95) translateY(0)'
        card.style.zIndex = 1
      }
    })
  }

  const handleItemLeave = () => {
    const cards = scrollContainerRef.current?.querySelectorAll('.option-card')
    cards?.forEach((card) => {
      card.style.transform = 'scale(1) translateY(0)'
      card.style.zIndex = 1
    })
  }

  const handleItemClick = (item, index) => {
    // Scroll to center the item
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollLeft = index * itemWidth - (container.clientWidth / 2 - itemWidth / 2)
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      })
    }
    onSelect && onSelect(item)
  }

  if (!items || items.length === 0) {
    return (
      <div className="scrollable-options scrollable-options--empty">
        <p>No items found</p>
      </div>
    )
  }

  return (
    <div className="scrollable-options">
      <div className="options-header">
        <h2 className="options-title">{title}</h2>
        <div className="options-counter">
          <span className="counter-current">{currentIndex + 1}</span>
          <span className="counter-separator">/</span>
          <span className="counter-total">{items.length}</span>
        </div>
      </div>

      <div className="options-viewport">
        <button
          className={`scroll-button scroll-button--left ${!canScrollLeft ? 'scroll-button--disabled' : ''}`}
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div className="scroll-container" ref={scrollContainerRef}>
          <div className="options-track">
            {items.map((item, index) => (
              <div
                key={`${item.id || index}-${index}`}
                className="option-card"
                onMouseEnter={(e) => handleItemHover(e, index)}
                onMouseLeave={handleItemLeave}
                onClick={() => handleItemClick(item, index)}
                style={{
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="card-content">
                  {item.icon && (
                    <div className="card-icon">{item.icon}</div>
                  )}
                  <h3 className="card-title">{item.label || item.name}</h3>
                  {item.code && (
                    <p className="card-code">{item.code}</p>
                  )}
                  {item.category && (
                    <p className="card-category">{item.category}</p>
                  )}
                </div>
                <div className="card-overlay"></div>
              </div>
            ))}
          </div>
        </div>

        <button
          className={`scroll-button scroll-button--right ${!canScrollRight ? 'scroll-button--disabled' : ''}`}
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="options-footer">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
