import React, { useState } from 'react'
import './ToolsDashboard.css'

export default function ToolsDashboard({ onOpenTool }) {
  const [tools, setTools] = useState([
    {
      id: 'both-gen',
      name: 'Generate Certificate & Tag',
      description: 'Generate certificates and tags together in one workflow - Perfect for complete meter documentation',
      icon: '📦',
      category: 'Generation',
      locked: false,
      lastUsed: '--',
      usageCount: 0,
      status: 'active',
      action: 'both'
    },
    {
      id: 'certificate-gen',
      name: 'Certificate Generator',
      description: 'Generate professional certificates for meters with detailed information and signatures',
      icon: '📄',
      category: 'Generation',
      locked: false,
      lastUsed: '--',
      usageCount: 0,
      status: 'active',
      action: 'certificate'
    },
    {
      id: 'tag-gen',
      name: 'Tag Generator',
      description: 'Create QR codes and RFID tags for meters with automatic encoding',
      icon: '🏷️',
      category: 'Generation',
      locked: false,
      lastUsed: '--',
      usageCount: 0,
      status: 'active',
      action: 'tag'
    },
    {
      id: 'certificate-vault',
      name: 'Certificate Repository',
      description: 'Upload certificates and tags, then search and download them by file name',
      icon: '🗄️',
      category: 'Management',
      locked: false,
      lastUsed: '--',
      usageCount: 0,
      status: 'active',
      action: 'vault'
    }
  ])

  const [expandedTool, setExpandedTool] = useState(null)

  const categories = ['All', ...new Set(tools.map(t => t.category))]
  const [selectedCategory, setSelectedCategory] = useState(null)

  const filteredTools = selectedCategory && selectedCategory !== 'All'
    ? tools.filter(t => t.category === selectedCategory)
    : tools

  const unlockedCount = tools.filter(t => !t.locked).length
  const totalCount = tools.length

  const handleOpenTool = (tool) => {
    if (!tool.locked) {
      onOpenTool && onOpenTool(tool.action)
    }
  }

  const handleToolClick = (toolId) => {
    const tool = tools.find(t => t.id === toolId)
    if (!tool?.locked) {
      setExpandedTool(expandedTool === toolId ? null : toolId)
    }
  }

  return (
    <div className="tools-dashboard">
      <div className="tools-header">
        <div className="header-content">
          <h1>Available Tools</h1>
          <p>Select a tool to get started with certificate and tag generation</p>
        </div>
        <div className="tools-stats">
          <div className="stat-card">
            <span className="stat-value">{unlockedCount}/{totalCount}</span>
            <span className="stat-label">Tools Available</span>
          </div>
        </div>
      </div>

      <div className="tools-container">
        {/* Categories */}
        <div className="categories-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat || (selectedCategory === null && cat === 'All') ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
              >
                {cat}
                <span className="category-count">
                  {cat === 'All' ? totalCount : tools.filter(t => t.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="tools-grid">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className={`tool-card ${tool.locked ? 'tool-card--locked' : ''} ${expandedTool === tool.id ? 'tool-card--expanded' : ''}`}
              onClick={() => handleToolClick(tool.id)}
            >
              {/* Lock Badge */}
              {tool.locked && (
                <div className="lock-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L9 4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4H15L12 1M12 13.5C13.933 13.5 15.5 15.067 15.5 17C15.5 18.933 13.933 20.5 12 20.5C10.067 20.5 8.5 18.933 8.5 17C8.5 15.067 10.067 13.5 12 13.5Z"></path>
                  </svg>
                </div>
              )}

              {/* Status Badge */}
              <div className={`status-badge status-${tool.status}`}>
                {tool.status === 'active' ? '✓ Active' : '🔒 Locked'}
              </div>

              {/* Tool Icon */}
              <div className="tool-icon">{tool.icon}</div>

              {/* Tool Info */}
              <div className="tool-info">
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>

                {/* Additional Info */}
                <div className="tool-meta">
                  <span className="meta-tag">{tool.category}</span>
                  {tool.version && (
                    <span className="meta-tag meta-tag--premium">{tool.version}</span>
                  )}
                </div>
              </div>

              {/* Tool Stats */}
              {!tool.locked && (
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
              )}

              {/* Unlock Info */}
              {tool.locked && (
                <div className="tool-unlock-info">
                  <p className="unlock-message">
                    🔐 Unlocks on {new Date(tool.unlocksAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Expanded Details */}
              {expandedTool === tool.id && !tool.locked && (
                <div className="tool-details animate-scale-up">
                  <div className="details-header">
                    <h4>Actions</h4>
                  </div>
                  <button 
                    className="btn-action"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenTool(tool)
                    }}
                  >
                    Open Tool
                  </button>
                  <button className="btn-action btn-action--secondary">Learn More</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
