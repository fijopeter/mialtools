import React from 'react'
import './MeterDetail.css'

export default function MeterDetail({ meter, onAction, onClose }) {
  if (!meter) return null

  return (
    <div className="meter-detail-overlay" onClick={onClose}>
      <div className="meter-detail" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="detail-header">
          <div className="detail-icon">
            {meter.icon || '📊'}
          </div>
          <div className="detail-title-section">
            <h2 className="detail-title">{meter.label || meter.name}</h2>
            {meter.code && <p className="detail-code">{meter.code}</p>}
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3 className="section-title">Information</h3>
            <div className="section-grid">
              {meter.category && (
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{meter.category}</span>
                </div>
              )}
              {meter.type && (
                <div className="info-item">
                  <span className="info-label">Type</span>
                  <span className="info-value">{meter.type}</span>
                </div>
              )}
              {meter.description && (
                <div className="info-item info-item--full">
                  <span className="info-label">Description</span>
                  <span className="info-value">{meter.description}</span>
                </div>
              )}
            </div>
          </div>

          {meter.specs && (
            <div className="detail-section">
              <h3 className="section-title">Specifications</h3>
              <div className="specs-list">
                {Object.entries(meter.specs).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}</span>
                    <span className="spec-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button 
            className="action-button action-button--primary"
            onClick={() => onAction && onAction(meter)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            Generate Certificate
          </button>
          <button 
            className="action-button action-button--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
