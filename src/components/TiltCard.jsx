import React, { useRef } from 'react'

export default function TiltCard({ className = '', style, onClick, children, ...rest }) {
  const ref = useRef(null)

  const handleMove = (e) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    node.style.setProperty('--rx', `${(0.5 - py) * 8}deg`)
    node.style.setProperty('--ry', `${(px - 0.5) * 8}deg`)
    node.style.setProperty('--mx', `${px * 100}%`)
    node.style.setProperty('--my', `${py * 100}%`)
  }

  const handleLeave = () => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--rx', '0deg')
    node.style.setProperty('--ry', '0deg')
  }

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {children}
    </div>
  )
}
