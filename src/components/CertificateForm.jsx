import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { jsPDF } from 'jspdf'
import { meterCatalog, flattenMeterCatalog } from '../config/meterCatalog'
import { mergeMeterAndTagSchemas, buildInitialFormData, TAG_SECTION_TITLE } from '../utils/mergeSchemas'
import { drawCertificate } from '../utils/drawCertificate'
import { drawTag } from '../utils/drawMeterDocuments'
import { getSignatureImageForName, OTHER_CALIBRATED_BY, CALIBRATED_BY_OPTIONS } from '../utils/signatures'
import { validateSignatureImageFile, signatureImageRulesHintText } from '../utils/validateSignatureImage'
import { useAuth, displayName } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured, CERTIFICATES_BUCKET } from '../utils/supabaseClient'
import { fetchFieldSuggestions, recordFieldSuggestions, MAX_SUGGESTIONS_PER_FIELD } from '../utils/fieldSuggestions'
import ComboInput from './ComboInput'
import SuggestionInput from './SuggestionInput'
import TiltCard from './TiltCard'
import './CertificateForm.css'
import tagSchemaList from '..//tagSchemasOnly/tagschema/tag.json'

const WATERMARK_LOGO = new URL('../images/Mlogo.jpeg', import.meta.url).href;
const LEFT_LOGO = new URL('../images/fullLogo.jpg', import.meta.url).href;
const RIGHT_LOGO = new URL('../images/iso.jpg', import.meta.url).href;

const FORM_STATE_STORAGE_KEY = 'mial_certificate_form_state'

const readSavedFormState = () => {
  try {
    const raw = sessionStorage.getItem(FORM_STATE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearSavedFormState = () => {
  try {
    sessionStorage.removeItem(FORM_STATE_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const sanitizeFileName = (name) =>
  name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim()

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7"></path>
  </svg>
)

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12"></path>
  </svg>
)

const IconGauge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9"></circle>
    <path d="M12 12 16 8"></path>
    <circle cx="12" cy="12" r="1" fill="currentColor"></circle>
  </svg>
)

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 5l7 7-7 7"></path>
  </svg>
)

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 11l9-8 9 8"></path>
    <path d="M5 10v10h14V10"></path>
    <path d="M9 20v-6h6v6"></path>
  </svg>
)

export default function CertificateForm({ meter, formType = 'both', onBack, onSubmit }) {
  const { user } = useAuth()
  const uploaderName = displayName(user)

  const [savedFormState] = useState(() => {
    const saved = readSavedFormState()
    return saved && saved.formType === formType ? saved : null
  })

  const [selectedMeter, setSelectedMeter] = useState(() => {
    if (meter) return meter
    if (savedFormState?.meterId) {
      return flattenMeterCatalog().find((m) => m.id === savedFormState.meterId) || null
    }
    return null
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSection, setCurrentSection] = useState(() => savedFormState?.currentSection ?? 0)
  const [showCertificatePreview, setShowCertificatePreview] = useState(false)
  const [showTagPreview, setShowTagPreview] = useState(false)
  const [certificateData, setCertificateData] = useState(null)
  const [tagData, setTagData] = useState(null)
  const [isRenderingCertificate, setIsRenderingCertificate] = useState(false)
  const [isRenderingTag, setIsRenderingTag] = useState(false)
  const [isDownloadingCertificate, setIsDownloadingCertificate] = useState(false)
  const [isDownloadingTag, setIsDownloadingTag] = useState(false)
  const [certificateUploadState, setCertificateUploadState] = useState({ action: null, status: 'idle', message: '' })
  const [tagUploadState, setTagUploadState] = useState({ action: null, status: 'idle', message: '' })
  const [useCustomSignature, setUseCustomSignature] = useState(false)
  const [signatureImageDataUrl, setSignatureImageDataUrl] = useState(null)
  const [signatureImageError, setSignatureImageError] = useState(null)
  const [fieldSuggestions, setFieldSuggestions] = useState({})
  const certificateCanvasRef = useRef(null)
  const tagCanvasRef = useRef(null)

  // Load previously entered values once, used for the double-space suggestion dropdown
  useEffect(() => {
    fetchFieldSuggestions().then(setFieldSuggestions)
  }, [])

  const mergeFieldSuggestions = (prevMap, rows) => {
    const next = { ...prevMap }
    rows.forEach(({ field_key, value }) => {
      const list = next[field_key] ? [...next[field_key]] : []
      const existingIndex = list.indexOf(value)
      if (existingIndex !== -1) list.splice(existingIndex, 1)
      list.unshift(value)
      next[field_key] = list.slice(0, MAX_SUGGESTIONS_PER_FIELD)
    })
    return next
  }

  // Get flattened meter catalog for search
  const allMeters = useMemo(() => flattenMeterCatalog(), [])

  const filteredMeters = useMemo(() => {
    if (!searchQuery) return allMeters
    const query = searchQuery.toLowerCase()
    return allMeters.filter(m =>
      m.label.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query)
    )
  }, [searchQuery, allMeters])

  // Get schema-based form data structure
  const { fieldMeta, sections } = useMemo(() => {
    if (!selectedMeter?.meterSchema) return { fieldMeta: {}, sections: [] }

    const merged = mergeMeterAndTagSchemas(
      selectedMeter.meterSchema,
      selectedMeter.tagSchema,
      selectedMeter.certificateConfig,
      selectedMeter.tagDrawConfig
    )

    // Filter sections based on form type
    let filteredSections = merged.sections
    if (formType === 'certificate') {
      // Certificate only: exclude tag-specific sections
      filteredSections = merged.sections.filter(s => s.title !== TAG_SECTION_TITLE)
    } else if (formType === 'tag') {
      filteredSections = tagSchemaList.filter(s => s.id == selectedMeter.code )
    } else {
      // Both: include all sections
      filteredSections = merged.sections
    }

    return { fieldMeta: merged.fieldMeta, sections: filteredSections }
  }, [selectedMeter, formType])

  const [formData, setFormData] = useState(() => {
    const initial = buildInitialFormData(fieldMeta)
    return savedFormState?.formData ? { ...initial, ...savedFormState.formData } : initial
  })

  // Only reset the form when fieldMeta actually changes (i.e. the user picked a
  // different meter) — not on initial mount, even under StrictMode's double-effect.
  const prevFieldMetaRef = useRef(fieldMeta)

  useEffect(() => {
    if (prevFieldMetaRef.current === fieldMeta) return
    prevFieldMetaRef.current = fieldMeta
    setFormData(buildInitialFormData(fieldMeta))
    setCurrentSection(0)
    setUseCustomSignature(false)
    setSignatureImageDataUrl(null)
    setSignatureImageError(null)
  }, [fieldMeta])

  // Persist form progress so a background-tab reload doesn't wipe out what the user typed
  useEffect(() => {
    if (!selectedMeter) {
      clearSavedFormState()
      return
    }
    try {
      sessionStorage.setItem(FORM_STATE_STORAGE_KEY, JSON.stringify({
        formType,
        meterId: selectedMeter.id,
        currentSection,
        formData,
      }))
    } catch {
      // ignore storage errors
    }
  }, [selectedMeter, formType, currentSection, formData])

  const handleSelectMeter = (selectedMeterOption) => {
    setSelectedMeter(selectedMeterOption)
    setFormData(buildInitialFormData(selectedMeterOption.meterSchema?.fieldMeta || {}))
    setCurrentSection(0)
    setUseCustomSignature(false)
    setSignatureImageDataUrl(null)
    setSignatureImageError(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDropdownFieldChange = (fieldKey, nextValue) => {
    if (fieldKey === 'calibratedBy') {
      if (nextValue === OTHER_CALIBRATED_BY) {
        setUseCustomSignature(true)
        setSignatureImageError(null)
        setFormData((prev) => ({ ...prev, calibratedBy: '' }))
        return
      }
      if (CALIBRATED_BY_OPTIONS.includes(nextValue)) {
        setUseCustomSignature(false)
        setSignatureImageDataUrl(null)
        setSignatureImageError(null)
      }
    }
    setFormData((prev) => ({ ...prev, [fieldKey]: nextValue }))
  }

  const handleSignatureFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      setSignatureImageDataUrl(null)
      setSignatureImageError(null)
      return
    }
    const result = await validateSignatureImageFile(file)
    if (!result.ok) {
      setSignatureImageError(result.error)
      setSignatureImageDataUrl(null)
      return
    }
    setSignatureImageError(null)
    setSignatureImageDataUrl(result.dataUrl)
  }

  const renderFieldInput = (fieldKey) => {
    const currentFieldMeta = fieldMeta[fieldKey] || {}
    const isDisabled = currentFieldMeta.disabled ?? false
    const isDateField = currentFieldMeta.inputType === 'date'
    const isDropdownField = currentFieldMeta.dropdown === true
    const dropdownOptions = Array.isArray(currentFieldMeta.options) ? currentFieldMeta.options : []

    if (isDateField) {
      return (
        <input
          type="date"
          name={fieldKey}
          value={formData[fieldKey]}
          onChange={handleInputChange}
          disabled={isDisabled}
          className="form-input"
        />
      );
    }

    if (isDropdownField) {
      return (
        <ComboInput
          value={formData[fieldKey]}
          placeholder={currentFieldMeta.placeholder || ''}
          disabled={isDisabled}
          options={dropdownOptions}
          onChange={(nextValue) => handleDropdownFieldChange(fieldKey, nextValue)}
        />
      );
    }

    return (
      <SuggestionInput
        name={fieldKey}
        value={formData[fieldKey]}
        onChange={(nextValue) => setFormData((prev) => ({ ...prev, [fieldKey]: nextValue }))}
        placeholder={currentFieldMeta.placeholder || ''}
        disabled={isDisabled}
        suggestions={fieldSuggestions[fieldKey] || []}
      />
    );
  };

  const signatureImageUrl = useMemo(
    () => (useCustomSignature ? signatureImageDataUrl : getSignatureImageForName(formData.calibratedBy)),
    [useCustomSignature, signatureImageDataUrl, formData.calibratedBy],
  )

  useEffect(() => {
    if (showCertificatePreview && certificateData && certificateCanvasRef.current) {
      let cancelled = false
      setIsRenderingCertificate(true)
      ;(async () => {
        await drawCertificate({
          canvas: certificateCanvasRef.current,
          certificateData,
          fieldMeta,
          certificateConfig: selectedMeter.certificateConfig,
          loadImage,
          watermarkLogo: WATERMARK_LOGO,
          leftLogo: LEFT_LOGO,
          rightLogo: RIGHT_LOGO,
        });
        if (!cancelled) setIsRenderingCertificate(false)
      })()
      return () => { cancelled = true }
    }
  }, [showCertificatePreview, certificateData, fieldMeta, selectedMeter])

  useEffect(() => {
    if (showTagPreview && tagData && tagCanvasRef.current) {
      let cancelled = false
      setIsRenderingTag(true)
      ;(async () => {
        await drawTag({
          canvasElement: tagCanvasRef.current,
          dataToRender: tagData,
          tagDrawConfig: selectedMeter.tagDrawConfig,
          leftLogo: LEFT_LOGO,
          loadImage,
        });
        if (!cancelled) setIsRenderingTag(false)
      })()
      return () => { cancelled = true }
    }
  }, [showTagPreview, tagData, selectedMeter])

  const buildCertificatePdf = () => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(
      certificateCanvasRef.current.toDataURL('image/png'),
      'PNG',
      0,
      0,
      297,
      210,
    );
    const fileName = sanitizeFileName(`${certificateData.serialNo || 'unnamed'}-certificate.pdf`)
    return { pdf, fileName }
  }

  const buildTagPdf = () => {
    const canvas = tagCanvasRef.current
    const hasOutputsBox = !!selectedMeter?.tagDrawConfig?.outputsBox
    const pdfHeight = 90
    const pdfWidth = hasOutputsBox ? pdfHeight * (canvas.width / canvas.height) : 150
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pdfWidth, pdfHeight] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight);
    const fileName = sanitizeFileName(`${tagData.serialNo || 'file'}-tag.pdf`)
    return { pdf, fileName }
  }

  const uploadPdfToRepository = async (pdf, fileName) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured, so the file could not be uploaded.' }
    }

    const blob = pdf.output('blob')
    const baseName = fileName.replace(/\.pdf$/i, '')
    let finalName = fileName
    let attempt = 0

    while (true) {
      const { error } = await supabase.storage.from(CERTIFICATES_BUCKET).upload(finalName, blob, {
        contentType: 'application/pdf',
        upsert: false,
      })

      if (!error) break

      if (attempt < 50 && /exist/i.test(error.message)) {
        attempt += 1
        finalName = sanitizeFileName(`${baseName} (${attempt}).pdf`)
        continue
      }

      return { error: error.message || 'Upload failed. Please try again.' }
    }

    if (user) {
      await supabase.from('certificate_uploads').upsert(
        { file_name: finalName, uploaded_by: user.id, uploaded_by_name: uploaderName },
        { onConflict: 'file_name' }
      )
    }

    return { fileName: finalName }
  }

  const downloadCertificatePdf = () => {
    if (!certificateCanvasRef.current || !certificateData) return;
    setIsDownloadingCertificate(true)
    setTimeout(() => {
      const { pdf, fileName } = buildCertificatePdf()
      pdf.save(fileName);
      setIsDownloadingCertificate(false)
    }, 0)
  }

  const downloadTagPdf = () => {
    if (!tagCanvasRef.current || !tagData) return;
    setIsDownloadingTag(true)
    setTimeout(() => {
      const { pdf, fileName } = buildTagPdf()
      pdf.save(fileName);
      setIsDownloadingTag(false)
    }, 0)
  }

  const handleCertificateUploadAction = (action) => {
    if (!certificateCanvasRef.current || !certificateData) return;
    setCertificateUploadState({ action, status: 'working', message: '' })
    setTimeout(async () => {
      const { pdf, fileName } = buildCertificatePdf()
      if (action === 'download-upload') {
        pdf.save(fileName)
      }
      const { error, fileName: uploadedName } = await uploadPdfToRepository(pdf, fileName)
      setCertificateUploadState({
        action,
        status: error ? 'error' : 'success',
        message: error || `"${uploadedName}" was uploaded to the Certificate Repository.`,
      })
    }, 0)
  }

  const handleTagUploadAction = (action) => {
    if (!tagCanvasRef.current || !tagData) return;
    setTagUploadState({ action, status: 'working', message: '' })
    setTimeout(async () => {
      const { pdf, fileName } = buildTagPdf()
      if (action === 'download-upload') {
        pdf.save(fileName)
      }
      const { error, fileName: uploadedName } = await uploadPdfToRepository(pdf, fileName)
      setTagUploadState({
        action,
        status: error ? 'error' : 'success',
        message: error || `"${uploadedName}" was uploaded to the Certificate Repository.`,
      })
    }, 0)
  }

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handleBackToMeterSelection = () => {
    clearSavedFormState()
    setSelectedMeter(null)
    setCurrentSection(0)
    setSearchQuery('')
  }

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    } else {
      clearSavedFormState()
      onBack?.()
    }
  }

  const handlePreviewCertificate = () => {
    setCertificateData({ ...formData, signatureImageDataUrl: signatureImageUrl })
    setCertificateUploadState({ action: null, status: 'idle', message: '' })
    setShowCertificatePreview(true)
    recordFieldSuggestions(fieldMeta, formData).then((rows) => {
      if (rows.length) setFieldSuggestions((prev) => mergeFieldSuggestions(prev, rows))
    })
  }

  const handlePreviewTag = () => {
    setTagData(formData)
    setTagUploadState({ action: null, status: 'idle', message: '' })
    setShowTagPreview(true)
    recordFieldSuggestions(fieldMeta, formData).then((rows) => {
      if (rows.length) setFieldSuggestions((prev) => mergeFieldSuggestions(prev, rows))
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    clearSavedFormState()
    onSubmit?.(formData)
  }

  const formTitle = formType === 'certificate'
    ? 'Certificate Generator'
    : formType === 'tag'
    ? 'Tag Generator'
    : 'Generate Certificate & Tags'

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="form-back" onClick={() => { clearSavedFormState(); onBack?.() }} title="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h2>{formTitle}{selectedMeter && ` - ${selectedMeter.label}`}</h2>
        <div className="form-header-spacer">
          {selectedMeter && sections.length > 1 && (
            <div className="form-progress">
              {sections.map((_, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`progress-step ${idx < currentSection ? 'completed' : ''} ${idx === currentSection ? 'active' : ''}`}
                    title={sections[idx]?.title}
                  >
                    <span className="progress-step-circle">
                      {idx < currentSection ? <IconCheck /> : idx + 1}
                    </span>
                  </div>
                  {idx < sections.length - 1 && (
                    <div className={`progress-line ${idx < currentSection ? 'completed' : ''}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
          {selectedMeter && (
            <button className="form-home" onClick={handleBackToMeterSelection} title="Back to meter selection">
              <IconHome />
            </button>
          )}
        </div>
      </div>

      {/* Meter Selection Step */}
      {!selectedMeter && (
        <div className="form-content animate-fade-in">
          <div className="meter-selection">
            <div className="selection-header">
              <h3>Select a Meter</h3>
              <p>Choose the meter to generate {formType === 'certificate' ? 'a certificate' : formType === 'tag' ? 'a tag' : 'certificate and tags'} for</p>
            </div>

            <div className="search-box">
              <span className="search-box-icon"><IconSearch /></span>
              <input
                type="text"
                placeholder="Search meters by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="meter-grid">
              {filteredMeters.map((m, idx) => (
                <TiltCard
                  key={m.id}
                  className="glass-card meter-option"
                  style={{ animationDelay: `${Math.min(idx * 0.02, 0.6)}s` }}
                  onClick={() => handleSelectMeter(m)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectMeter(m)
                    }
                  }}
                >
                  <div className="meter-option-icon">
                    <IconGauge />
                  </div>
                  <div className="meter-option-info">
                    <h4>{m.label}</h4>
                    <p>{m.code}</p>
                  </div>
                  <div className="meter-option-arrow">
                    <IconArrowRight />
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMeter && (
        <form onSubmit={handleSubmit} className="form-content">
          {/* Form Steps */}
          {sections[currentSection] && (
            <div className="form-step animate-fade-in">
              <div className="form-section">
                <h3>{sections[currentSection].title}</h3>

                <div className="form-grid">
                  {sections[currentSection].fields.map((field) => (
                    <label key={field} className="field-group">
                      <span>{fieldMeta[field]?.label || field}</span>
                      {renderFieldInput(field)}
                    </label>
                  ))}
                </div>

                {useCustomSignature && sections[currentSection].fields.includes('calibratedBy') && (
                  <div className="field-group signature-upload-group">
                    <span>Signature image (for certificate)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleSignatureFileChange}
                    />
                    <p className="signature-upload-hint">{signatureImageRulesHintText()}</p>
                    {signatureImageError && (
                      <p className="field-error" role="alert">
                        {signatureImageError}
                      </p>
                    )}
                    {signatureImageDataUrl && !signatureImageError && (
                      <p className="signature-upload-ok">Signature image uploaded successfully</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Footer */}
          <div className="form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
            >
              {currentSection === 0 ? 'Cancel' : 'Previous'}
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <>
                {(formType === 'certificate' || formType === 'both') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePreviewCertificate}
                  >
                    Preview Certificate
                  </button>
                )}
                {(formType === 'tag' || formType === 'both') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handlePreviewTag}
                  >
                    Preview Tag
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      )}

      {/* Certificate Preview Modal */}
      {showCertificatePreview && createPortal(
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '95%', maxHeight: '95vh', overflow: 'auto' }}>
            <button className="modal-close" onClick={() => setShowCertificatePreview(false)} title="Close" aria-label="Close">
              <IconClose />
            </button>
            <h3>Certificate Preview</h3>
            <div className="canvas-wrapper">
              <canvas ref={certificateCanvasRef} />
              {isRenderingCertificate && (
                <div className="canvas-loading-overlay">
                  <span className="spinner spinner--lg"></span>
                  <p>Rendering certificate...</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={downloadCertificatePdf}
                disabled={isDownloadingCertificate || isRenderingCertificate || certificateUploadState.status === 'working'}
              >
                {isDownloadingCertificate ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleCertificateUploadAction('download-upload')}
                disabled={isDownloadingCertificate || isRenderingCertificate || certificateUploadState.status === 'working'}
              >
                {certificateUploadState.status === 'working' && certificateUploadState.action === 'download-upload' ? (
                  <>
                    <span className="spinner"></span>
                    Uploading...
                  </>
                ) : (
                  'Download & Upload'
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleCertificateUploadAction('upload')}
                disabled={isDownloadingCertificate || isRenderingCertificate || certificateUploadState.status === 'working'}
              >
                {certificateUploadState.status === 'working' && certificateUploadState.action === 'upload' ? (
                  <>
                    <span className="spinner"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCertificatePreview(false)}>
                Close
              </button>
            </div>
            {certificateUploadState.message && (
              <p className={`upload-status-banner ${certificateUploadState.status === 'error' ? 'upload-status-banner--error' : 'upload-status-banner--success'}`}>
                {certificateUploadState.message}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Tag Preview Modal */}
      {showTagPreview && createPortal(
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowTagPreview(false)} title="Close" aria-label="Close">
              <IconClose />
            </button>
            <h3>Tag Preview</h3>
            <div className="canvas-wrapper">
              <canvas ref={tagCanvasRef} />
              {isRenderingTag && (
                <div className="canvas-loading-overlay">
                  <span className="spinner spinner--lg"></span>
                  <p>Rendering tag...</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={downloadTagPdf}
                disabled={isDownloadingTag || isRenderingTag || tagUploadState.status === 'working'}
              >
                {isDownloadingTag ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  'Download Tag'
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleTagUploadAction('download-upload')}
                disabled={isDownloadingTag || isRenderingTag || tagUploadState.status === 'working'}
              >
                {tagUploadState.status === 'working' && tagUploadState.action === 'download-upload' ? (
                  <>
                    <span className="spinner"></span>
                    Uploading...
                  </>
                ) : (
                  'Download & Upload'
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleTagUploadAction('upload')}
                disabled={isDownloadingTag || isRenderingTag || tagUploadState.status === 'working'}
              >
                {tagUploadState.status === 'working' && tagUploadState.action === 'upload' ? (
                  <>
                    <span className="spinner"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowTagPreview(false)}>
                Close
              </button>
            </div>
            {tagUploadState.message && (
              <p className={`upload-status-banner ${tagUploadState.status === 'error' ? 'upload-status-banner--error' : 'upload-status-banner--success'}`}>
                {tagUploadState.message}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
