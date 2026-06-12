import React, { useState, useMemo } from 'react'
import Header from './components/Header'
import ScrollableOptions from './components/ScrollableOptions'
import MeterDetail from './components/MeterDetail'
import CertificateForm from './components/CertificateForm'
import ToolsDashboard from './components/ToolsDashboard'
import CertificateVault from './components/CertificateVault'
import HomePage from './pages/HomePage'
import { meterCatalog, categories, getMetersByCategory } from './config/meterCatalog'
import './App.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home') // home is landing page
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedMeter, setSelectedMeter] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [meterForForm, setMeterForForm] = useState(null)
  const [formType, setFormType] = useState(null) // 'certificate', 'tag', or 'both'

  // Filter meters based on search or category
  const filteredMeters = useMemo(() => {
    let results = meterCatalog

    // Filter by category if selected
    if (selectedCategory) {
      results = getMetersByCategory(selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(meter =>
        meter.label.toLowerCase().includes(query) ||
        meter.code.toLowerCase().includes(query) ||
        meter.category.toLowerCase().includes(query) ||
        meter.type.toLowerCase().includes(query) ||
        (meter.description && meter.description.toLowerCase().includes(query))
      )
    }

    return results
  }, [selectedCategory, searchQuery])

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id)
    setSelectedMeter(null)
  }

  const handleMeterSelect = (meter) => {
    setSelectedMeter(meter)
  }

  const handleMeterAction = (meter) => {
    setMeterForForm(meter)
    setFormType('both')
    setCurrentPage('form')
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      setSelectedCategory(null)
    }
  }

  const handleCloseMeterDetail = () => {
    setSelectedMeter(null)
  }

  const handleFormBack = () => {
    setCurrentPage('tools')
    setMeterForForm(null)
    setFormType(null)
  }

  const handleFormSubmit = (formData) => {
    console.log('Submitted:', formType, formData)
    if (formType === 'certificate') {
      alert('Certificate generated successfully!')
    } else if (formType === 'tag') {
      alert('Tag generated successfully!')
    } else if (formType === 'both') {
      alert('Certificate and Tags generated successfully!')
    }
    handleFormBack()
  }

  const handleOpenTool = (toolAction) => {
    console.log('Opening tool:', toolAction)
    
    if (toolAction === 'certificate') {
      setFormType('certificate')
      setCurrentPage('form')
      setMeterForForm(null) // Will show meter selection
    } else if (toolAction === 'tag') {
      setFormType('tag')
      setCurrentPage('form')
      setMeterForForm(null)
    } else if (toolAction === 'both') {
      setFormType('both')
      setCurrentPage('form')
      setMeterForForm(null)
    } else if (toolAction === 'vault') {
      setCurrentPage('vault')
    }
  }

  const handleNavigateToHome = () => {
    setCurrentPage('home')
    setSelectedCategory(null)
    setSearchQuery('')
  }

  return (
    <div className="app">
      <Header 
        onSearchChange={handleSearchChange}
        onToolsClick={() => setCurrentPage('tools')}
        currentPage={currentPage}
        onHomeClick={handleNavigateToHome}
      />

      <main className="app-main">
        {/* Tools Page (Landing Page) */}
        {currentPage === 'tools' && (
          <ToolsDashboard onOpenTool={handleOpenTool} />
        )}

        {/* Home Page - Scrolling Showcase */}
        {currentPage === 'home' && (
          <HomePage />
        )}

        {/* Certificate Repository Page */}
        {currentPage === 'vault' && (
          <div className="form-page-container">
            <CertificateVault onBack={() => setCurrentPage('tools')} />
          </div>
        )}

        {/* Certificate/Tag Form Page */}
        {currentPage === 'form' && (
          <div className="form-page-container">
            <CertificateForm
              meter={meterForForm}
              formType={formType}
              onBack={handleFormBack}
              onSubmit={handleFormSubmit}
            />
          </div>
        )}

        {/* Meter Detail Modal */}
        {selectedMeter && (
          <MeterDetail
            meter={selectedMeter}
            onAction={handleMeterAction}
            onClose={handleCloseMeterDetail}
          />
        )}
      </main>
    </div>
  )
}
