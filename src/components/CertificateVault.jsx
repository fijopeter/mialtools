import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase, isSupabaseConfigured, CERTIFICATES_BUCKET } from '../utils/supabaseClient'
import { useAuth, displayName } from '../contexts/AuthContext'
import './CertificateVault.css'

const IconUploadCloud = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.9A7 7 0 0 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
)

const IconPdf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
)

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconSearch = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const IconArchive = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="5" rx="1" />
    <path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8" />
    <path d="M10 13h4" />
  </svg>
)

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
)

function formatBytes(bytes) {
  if (bytes == null) return '—'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, exponent)
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim()
}

const isPdfFile = (file) =>
  file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))

export default function CertificateVault({ onBack }) {
  const { user } = useAuth()
  const uploaderName = displayName(user)
  const [activeTab, setActiveTab] = useState('browse')

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null)
  const [customName, setCustomName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState('')
  const [uploadStatus, setUploadStatus] = useState('idle') // idle | uploading | success | error
  const [uploadMessage, setUploadMessage] = useState('')
  const [pendingOverwrite, setPendingOverwrite] = useState(false)
  const [recentUploads, setRecentUploads] = useState([])
  const fileInputRef = useRef(null)

  // Browse state
  const [files, setFiles] = useState([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadingName, setDownloadingName] = useState(null)
  const [downloadError, setDownloadError] = useState('')
  const [viewingName, setViewingName] = useState(null)
  const [viewError, setViewError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchFiles = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setIsLoadingFiles(true)
    setLoadError('')
    const { data, error } = await supabase.storage.from(CERTIFICATES_BUCKET).list('', {
      limit: 1000,
      sortBy: { column: 'updated_at', order: 'desc' },
    })

    if (error) {
      setLoadError(error.message || 'Failed to load certificates.')
      setFiles([])
      setIsLoadingFiles(false)
      return
    }

    const validFiles = (data || []).filter((item) => item.id && !item.name.startsWith('.'))

    if (validFiles.length > 0) {
      const { data: uploads } = await supabase
        .from('certificate_uploads')
        .select('file_name, uploaded_by_name')
        .in('file_name', validFiles.map((file) => file.name))

      const uploaderByFileName = new Map((uploads || []).map((row) => [row.file_name, row.uploaded_by_name]))
      validFiles.forEach((file) => {
        file.uploadedByName = uploaderByFileName.get(file.name) || null
      })
    }

    setFiles(validFiles)
    setIsLoadingFiles(false)
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return files
    return files.filter((file) => file.name.toLowerCase().includes(query))
  }, [files, searchQuery])

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0),
    [files]
  )

  const processSelectedFile = (file) => {
    if (!isPdfFile(file)) {
      setFileError('Only PDF files are supported.')
      return
    }
    setFileError('')
    setUploadStatus('idle')
    setUploadMessage('')
    setPendingOverwrite(false)
    setSelectedFile(file)
    setCustomName(file.name.replace(/\.pdf$/i, ''))
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) processSelectedFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processSelectedFile(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setCustomName('')
    setFileError('')
    setUploadStatus('idle')
    setUploadMessage('')
    setPendingOverwrite(false)
  }

  const handleUpload = async (overwrite = false) => {
    if (!selectedFile) return
    const trimmedName = (customName || selectedFile.name.replace(/\.pdf$/i, '')).trim()
    if (!trimmedName) {
      setFileError('Please enter a file name.')
      return
    }

    const finalName = sanitizeFileName(`${trimmedName}.pdf`)
    setUploadStatus('uploading')
    setUploadMessage('')

    const { error } = await supabase.storage.from(CERTIFICATES_BUCKET).upload(finalName, selectedFile, {
      contentType: 'application/pdf',
      upsert: overwrite,
    })

    if (error) {
      if (!overwrite && /exist/i.test(error.message)) {
        setPendingOverwrite(true)
        setUploadStatus('idle')
        setUploadMessage(`A certificate named "${finalName}" already exists.`)
        return
      }
      setUploadStatus('error')
      setUploadMessage(error.message || 'Upload failed. Please try again.')
      return
    }

    setUploadStatus('success')
    setUploadMessage(`"${finalName}" was uploaded successfully.`)
    setPendingOverwrite(false)
    setRecentUploads((prev) => [{ name: finalName, at: new Date().toISOString() }, ...prev].slice(0, 5))
    setSelectedFile(null)
    setCustomName('')

    if (user) {
      await supabase.from('certificate_uploads').upsert(
        { file_name: finalName, uploaded_by: user.id, uploaded_by_name: uploaderName },
        { onConflict: 'file_name' }
      )
    }

    fetchFiles()
  }

  const handleDownload = async (file) => {
    setDownloadingName(file.name)
    setDownloadError('')

    try {
      const { data, error } = await supabase.storage
        .from(CERTIFICATES_BUCKET)
        .createSignedUrl(file.name, 60, { download: file.name })

      if (error || !data?.signedUrl) {
        throw error || new Error('Could not generate a download link.')
      }

      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = file.name
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setDownloadError(err?.message || `Failed to download "${file.name}".`)
    } finally {
      setDownloadingName(null)
    }
  }

  const handleView = async (file) => {
    setViewingName(file.name)
    setViewError('')

    try {
      const { data, error } = await supabase.storage.from(CERTIFICATES_BUCKET).createSignedUrl(file.name, 60)

      if (error || !data?.signedUrl) {
        throw error || new Error('Could not generate a preview link.')
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setViewError(err?.message || `Failed to open "${file.name}".`)
    } finally {
      setViewingName(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    setDeleteError('')

    try {
      const { data, error } = await supabase.storage.from(CERTIFICATES_BUCKET).remove([deleteTarget.name])

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error(
          `"${deleteTarget.name}" was not deleted. Your Supabase project may be missing the delete permission — see SUPABASE_SETUP.md.`
        )
      }

      await supabase.from('certificate_uploads').delete().eq('file_name', deleteTarget.name)

      setFiles((prev) => prev.filter((f) => f.name !== deleteTarget.name))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err?.message || `Failed to delete "${deleteTarget.name}".`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="vault-page animate-fade-in">
      <div className="vault-header">
        <button className="vault-back" onClick={onBack} title="Back to Tools">
          <IconBack />
        </button>
        <div className="vault-header-content">
          <h1>Certificate Repository</h1>
          <p>Upload, search and download certificates &amp; tags in one place</p>
        </div>
        <div className="vault-stats">
          <div className="vault-stat">
            <span className="vault-stat-value">{files.length}</span>
            <span className="vault-stat-label">Files</span>
          </div>
          <div className="vault-stat">
            <span className="vault-stat-value">{formatBytes(totalSize)}</span>
            <span className="vault-stat-label">Storage Used</span>
          </div>
        </div>
      </div>

      {!isSupabaseConfigured ? (
        <div className="vault-setup-notice animate-scale-up">
          <div className="vault-setup-icon">
            <IconArchive />
          </div>
          <h3>Supabase isn't configured yet</h3>
          <p>
            To enable the certificate repository, add your Supabase project URL and anon key to the{' '}
            <code>.env</code> file at the project root.
          </p>
          <pre className="vault-setup-code">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
          </pre>
          <p>
            See <code>SUPABASE_SETUP.md</code> for full step-by-step setup instructions, then restart the dev
            server.
          </p>
        </div>
      ) : (
        <>
          <div className="vault-tabs" data-active={activeTab}>
            <button
              className={`vault-tab ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              <IconSearch />
              <span>Search &amp; Download</span>
            </button>
            <button
              className={`vault-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <IconUploadCloud />
              <span>Upload Certificate</span>
            </button>
            <div className="vault-tab-indicator" />
          </div>

          <div className="vault-content">
            {activeTab === 'upload' ? (
              <div className="vault-panel animate-fade-in">
                <div
                  className={`vault-dropzone ${isDragging ? 'vault-dropzone--dragging' : ''} ${
                    selectedFile ? 'vault-dropzone--has-file' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileInputChange}
                    hidden
                  />

                  {!selectedFile ? (
                    <>
                      <div className="vault-dropzone-icon">
                        <IconUploadCloud />
                      </div>
                      <h3>Drag &amp; drop a PDF here</h3>
                      <p>or click to browse from your computer</p>
                      <span className="vault-dropzone-hint">PDF files only</span>
                    </>
                  ) : (
                    <div className="vault-file-preview animate-scale-up" onClick={(e) => e.stopPropagation()}>
                      <div className="vault-file-icon">
                        <IconPdf />
                      </div>
                      <div className="vault-file-details">
                        <label>File name</label>
                        <div className="vault-rename-row">
                          <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="vault-rename-input"
                          />
                          <span className="vault-extension">.pdf</span>
                        </div>
                        <span className="vault-file-size">{formatBytes(selectedFile.size)}</span>
                      </div>
                      <button className="vault-file-remove" onClick={handleRemoveFile} title="Remove file">
                        <IconClose />
                      </button>
                    </div>
                  )}
                </div>

                {fileError && (
                  <div className="vault-banner vault-banner--error animate-fade-in">
                    <IconAlert />
                    {fileError}
                  </div>
                )}

                {selectedFile && (
                  <div className="vault-upload-actions">
                    {pendingOverwrite ? (
                      <div className="vault-overwrite animate-fade-in">
                        <p>{uploadMessage} Do you want to replace it?</p>
                        <div className="vault-actions-row">
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setPendingOverwrite(false)
                              setUploadMessage('')
                            }}
                          >
                            Cancel
                          </button>
                          <button className="btn btn-primary" onClick={() => handleUpload(true)}>
                            Replace existing file
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-success vault-upload-btn"
                        onClick={() => handleUpload(false)}
                        disabled={uploadStatus === 'uploading' || !customName.trim()}
                      >
                        {uploadStatus === 'uploading' ? (
                          <>
                            <span className="vault-spinner" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <IconUploadCloud />
                            Upload to Repository
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="vault-banner vault-banner--success animate-scale-up">
                    <IconCheck />
                    {uploadMessage}
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="vault-banner vault-banner--error animate-fade-in">
                    <IconAlert />
                    {uploadMessage}
                  </div>
                )}

                {recentUploads.length > 0 && (
                  <div className="vault-recent animate-fade-in">
                    <h4>Recently uploaded this session</h4>
                    <ul>
                      {recentUploads.map((item) => (
                        <li key={`${item.name}-${item.at}`}>
                          <IconPdf />
                          <span className="vault-recent-name">{item.name}</span>
                          <span className="vault-recent-time">{formatDateTime(item.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="vault-panel animate-fade-in">
                <div className="vault-search-bar">
                  <IconSearch className="vault-search-icon" />
                  <input
                    type="text"
                    placeholder="Search certificates by file name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="vault-search-input"
                  />
                  {searchQuery && (
                    <button className="vault-search-clear" onClick={() => setSearchQuery('')} title="Clear search">
                      <IconClose />
                    </button>
                  )}
                  <button
                    className="vault-refresh-btn"
                    onClick={fetchFiles}
                    title="Refresh list"
                    disabled={isLoadingFiles}
                  >
                    <span className={isLoadingFiles ? 'vault-spin' : ''}>
                      <IconRefresh />
                    </span>
                  </button>
                </div>

                {loadError && (
                  <div className="vault-banner vault-banner--error animate-fade-in">
                    <IconAlert />
                    {loadError}
                  </div>
                )}
                {downloadError && (
                  <div className="vault-banner vault-banner--error animate-fade-in">
                    <IconAlert />
                    {downloadError}
                  </div>
                )}
                {viewError && (
                  <div className="vault-banner vault-banner--error animate-fade-in">
                    <IconAlert />
                    {viewError}
                  </div>
                )}

                {isLoadingFiles ? (
                  <div className="vault-grid">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="vault-card vault-card--skeleton" />
                    ))}
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="vault-empty animate-fade-in">
                    <div className="vault-empty-icon">
                      <IconArchive />
                    </div>
                    <h3>{searchQuery ? 'No matching certificates' : 'No certificates yet'}</h3>
                    <p>
                      {searchQuery
                        ? `We couldn't find any PDF matching "${searchQuery}".`
                        : 'Upload your first certificate to see it here.'}
                    </p>
                  </div>
                ) : (
                  <div className="vault-grid">
                    {filteredFiles.map((file, idx) => (
                      <div
                        key={file.id || file.name}
                        className="vault-card animate-scale-up"
                        style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
                      >
                        <div className="vault-card-icon">
                          <IconPdf />
                        </div>
                        <div className="vault-card-info">
                          <h4 title={file.name}>{file.name}</h4>
                          <div className="vault-card-meta">
                            <span>{formatBytes(file.metadata?.size)}</span>
                            <span className="vault-dot">•</span>
                            <span>{formatDateTime(file.updated_at || file.created_at)}</span>
                            {file.uploadedByName && (
                              <>
                                <span className="vault-dot">•</span>
                                <span>Uploaded by {file.uploadedByName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="vault-card-actions">
                          <button
                            className="vault-view-btn"
                            onClick={() => handleView(file)}
                            disabled={viewingName === file.name}
                          >
                            {viewingName === file.name ? (
                              <span className="vault-spinner" />
                            ) : (
                              <IconEye />
                            )}
                            {viewingName === file.name ? 'Opening' : 'View'}
                          </button>
                          <button
                            className="vault-download-btn"
                            onClick={() => handleDownload(file)}
                            disabled={downloadingName === file.name}
                          >
                            {downloadingName === file.name ? (
                              <span className="vault-spinner" />
                            ) : (
                              <IconDownload />
                            )}
                            {downloadingName === file.name ? 'Downloading' : 'Download'}
                          </button>
                          <button
                            className="vault-delete-btn"
                            onClick={() => {
                              setDeleteTarget(file)
                              setDeleteError('')
                            }}
                            title="Delete certificate"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="modal-box vault-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vault-delete-icon">
              <IconTrash />
            </div>
            <h3>Delete this certificate?</h3>
            <p>
              <strong>{deleteTarget.name}</strong> will be permanently removed from the repository. This
              cannot be undone.
            </p>
            {deleteError && (
              <div className="vault-banner vault-banner--error animate-fade-in">
                <IconAlert />
                {deleteError}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <span className="vault-spinner" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <IconTrash />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
