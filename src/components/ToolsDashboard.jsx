import React, { useState } from 'react'
import TiltCard from './TiltCard'
import { toolsCatalog } from '../config/toolsCatalog'
import { useAuth } from '../contexts/AuthContext'
import './ToolsDashboard.css'

const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
    <path d="M3.3 7 12 12l8.7-5"></path>
    <path d="M12 22V12"></path>
  </svg>
)

const IconCertificate = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M9 15l1.5 1.5L15 12"></path>
  </svg>
)

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12.59 2.59a2 2 0 0 0-2.83 0L2.59 9.76a2 2 0 0 0 0 2.83l7.82 7.82a2 2 0 0 0 2.83 0l7.17-7.17a2 2 0 0 0 0-2.83z"></path>
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"></circle>
  </svg>
)

const IconArchive = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="5" rx="1"></rect>
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path>
    <path d="M10 12h4"></path>
  </svg>
)

const IconFileSpreadsheet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <path d="M14 2v6h6"></path>
    <path d="M8 13h8M8 17h8M8 13v4M12 13v4M16 13v4"></path>
  </svg>
)

const IconSearchOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="7"></circle>
    <path d="m20 20-3-3"></path>
    <path d="M8 8l6 6M14 8l-6 6"></path>
  </svg>
)

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7"></path>
  </svg>
)

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L9 4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4H15L12 1M12 13.5C13.933 13.5 15.5 15.067 15.5 17C15.5 18.933 13.933 20.5 12 20.5C10.067 20.5 8.5 18.933 8.5 17C8.5 15.067 10.067 13.5 12 13.5Z"></path>
  </svg>
)

const TOOL_ICONS = {
  'both-gen': IconPackage,
  'certificate-gen': IconCertificate,
  'tag-gen': IconTag,
  'certificate-vault': IconArchive,
  'datalog-converter': IconFileSpreadsheet,
}

export default function ToolsDashboard({ onOpenTool, searchQuery = '' }) {
  const { hasToolAccess } = useAuth()
  const tools = toolsCatalog.map(t => {
    const accessDenied = !hasToolAccess(t.id)
    return { ...t, accessDenied, locked: t.locked || accessDenied }
  })

  const categories = ['All', ...new Set(tools.map(t => t.category))]
  const [selectedCategory, setSelectedCategory] = useState(null)

  const query = searchQuery.trim().toLowerCase()

  const filteredTools = tools.filter(tool => {
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || tool.category === selectedCategory
    const matchesSearch = !query ||
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  const unlockedCount = tools.filter(t => !t.locked).length
  const totalCount = tools.length

  const handleOpenTool = (tool) => {
    if (!tool.locked) {
      onOpenTool && onOpenTool(tool.action)
    }
  }

  return (
    <div className="tools-dashboard container">
      <div className="tools-toolbar">
        <div className="category-pills">
          {categories.map(cat => {
            const isActive = selectedCategory === cat || (selectedCategory === null && cat === 'All')
            const count = cat === 'All' ? totalCount : tools.filter(t => t.category === cat).length
            return (
              <button
                key={cat}
                className={`category-pill ${isActive ? 'category-pill--active' : ''}`}
                onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              >
                {cat}
                <span className="category-pill__count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="tools-stats glass-card">
          <span className="tools-stats__value gradient-text">{unlockedCount}/{totalCount}</span>
          <span className="tools-stats__label">Tools Available</span>
        </div>
      </div>

      {filteredTools.length > 0 ? (
        <div className="bento-grid tools-grid">
          {filteredTools.map((tool, idx) => {
            const Icon = TOOL_ICONS[tool.id] || IconPackage
            return (
              <TiltCard
                key={tool.id}
                className={`glass-card tool-card bento-tile--wide ${tool.locked ? 'tool-card--locked' : ''}`}
                style={{ animationDelay: `${idx * 0.07}s` }}
                onClick={() => handleOpenTool(tool)}
                role="button"
                tabIndex={tool.locked ? -1 : 0}
                onKeyDown={(e) => {
                  if (!tool.locked && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleOpenTool(tool)
                  }
                }}
              >
                {/* Lock Badge */}
                {tool.locked && (
                  <div className="lock-badge">
                    <IconLock />
                  </div>
                )}

                <div className="tool-card__header">
                  <div className="tool-icon">
                    <Icon />
                  </div>
                  <div className={`status-badge ${tool.locked ? 'status-locked' : 'status-active'}`}>
                    {tool.accessDenied ? 'Restricted' : tool.locked ? 'Locked' : 'Active'}
                  </div>
                </div>

                <div className="tool-info">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>

                  <div className="tool-meta">
                    <span className="meta-tag">{tool.category}</span>
                  </div>
                </div>

                {/* Footer: stats + CTA */}
                {!tool.locked && (
                  <div className="tool-card__footer">
                    <div className="tool-stats">
                      <div className="stat">
                        <span className="stat-label">Last Used</span>
                        <span className="stat-value">{tool.lastUsed}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Times Used</span>
                        <span className="stat-value">{tool.usageCount}</span>
                      </div>
                    </div>
                    <div className="tool-open-cta">
                      <span>Open Tool</span>
                      <IconArrowRight />
                    </div>
                  </div>
                )}

                {/* Unlock Info */}
                {tool.locked && (
                  <div className="tool-unlock-info">
                    <p className="unlock-message">
                      {tool.accessDenied
                        ? 'Not authorized — ask an administrator to grant access to this tool'
                        : (tool.unlockMessage || `Unlocks on ${new Date(tool.unlocksAt).toLocaleDateString()}`)}
                    </p>
                  </div>
                )}
              </TiltCard>
            )
          })}
        </div>
      ) : (
        <div className="tools-empty glass-card animate-fade-in">
          <div className="tools-empty-icon">
            <IconSearchOff />
          </div>
          <h3>No tools match your search</h3>
          <p>Try a different keyword or clear the search to see all tools.</p>
        </div>
      )}
    </div>
  )
}
