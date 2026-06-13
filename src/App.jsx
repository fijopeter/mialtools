import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import CertificateForm from './components/CertificateForm'
import ToolsDashboard from './components/ToolsDashboard'
import CertificateVault from './components/CertificateVault'
import AuthPage from './components/AuthPage'
import PendingApprovalPage from './components/PendingApprovalPage'
import HomePage from './pages/HomePage'
import { useAuth, displayName } from './contexts/AuthContext'
import './App.css'

const FORM_TITLES = {
  certificate: { title: 'Generate Certificate', subtitle: 'Create a calibration certificate for a selected meter' },
  tag: { title: 'Generate Tag', subtitle: 'Create calibration tags for a selected meter' },
  both: { title: 'Generate Certificate & Tags', subtitle: 'Create a certificate and tags together for a selected meter' },
}

export default function App() {
  const { session, user, loading, isConfigured, isApproved, signOut } = useAuth()
  const [currentPage, setCurrentPage] = useState('home') // home is landing page
  const [searchQuery, setSearchQuery] = useState('')
  const [meterForForm, setMeterForForm] = useState(null)
  const [formType, setFormType] = useState(null) // 'certificate', 'tag', or 'both'
  const [pageLoaderState, setPageLoaderState] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Brief top progress bar on every page switch for consistent loading feedback
  useEffect(() => {
    setPageLoaderState('active')
    const doneTimer = setTimeout(() => setPageLoaderState('done'), 250)
    const resetTimer = setTimeout(() => setPageLoaderState(''), 550)
    return () => {
      clearTimeout(doneTimer)
      clearTimeout(resetTimer)
    }
  }, [currentPage])

  if (loading) {
    return (
      <div className="auth-loading">
        <span className="spinner spinner--lg" />
      </div>
    )
  }

  if (!isConfigured || !session) {
    return <AuthPage />
  }

  if (!isApproved) {
    return <PendingApprovalPage />
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
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
    setSearchQuery('')
  }

  const handleSidebarNavigate = (page) => {
    if (page === 'home') {
      handleNavigateToHome()
    } else if (page === 'vault') {
      handleOpenTool('vault')
    } else {
      setCurrentPage(page)
    }
  }

  const topbarInfo =
    currentPage === 'home'
      ? { title: 'Home', subtitle: 'Welcome back — explore meter tools and resources' }
      : currentPage === 'tools'
      ? { title: 'Available Tools', subtitle: 'Browse and launch calibration tools' }
      : currentPage === 'vault'
      ? { title: 'Certificate Repository', subtitle: 'Upload, search and manage certificates & tags' }
      : currentPage === 'form'
      ? FORM_TITLES[formType] || { title: 'Generate', subtitle: '' }
      : { title: '', subtitle: '' }

  return (
    <div className="app-shell">

      <div className={`page-loader-bar ${pageLoaderState ? `page-loader-bar--${pageLoaderState}` : ''}`} />

      <Sidebar
        currentPage={currentPage}
        onNavigate={handleSidebarNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        userName={displayName(user)}
        userEmail={user?.email}
        onLogout={signOut}
      />

      <div className={`app-content ${sidebarCollapsed ? 'app-content--collapsed' : ''}`}>
        <Topbar
          title={topbarInfo.title}
          subtitle={topbarInfo.subtitle}
          showSearch={currentPage === 'tools'}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        <main className="app-main">
          {/* Tools Page (Landing Page) */}
          {currentPage === 'tools' && (
            <div className="page-transition" key="tools">
              <ToolsDashboard onOpenTool={handleOpenTool} searchQuery={searchQuery} />
            </div>
          )}

          {/* Home Page - Scrolling Showcase */}
          {currentPage === 'home' && (
            <div className="page-transition" key="home">
              <HomePage onExploreClick={() => setCurrentPage('tools')} />
            </div>
          )}

          {/* Certificate Repository Page */}
          {currentPage === 'vault' && (
            <div className="form-page-container page-transition" key="vault">
              <CertificateVault onBack={() => setCurrentPage('tools')} />
            </div>
          )}

          {/* Certificate/Tag Form Page */}
          {currentPage === 'form' && (
            <div className="form-page-container page-transition" key="form">
              <CertificateForm
                meter={meterForForm}
                formType={formType}
                onBack={handleFormBack}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
