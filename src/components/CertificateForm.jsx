import React, { useState, useRef, useEffect, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import { meterCatalog, flattenMeterCatalog } from '../config/meterCatalog'
import { mergeMeterAndTagSchemas, buildInitialFormData, TAG_SECTION_TITLE } from '../utils/mergeSchemas'
import { drawCertificate } from '../utils/drawCertificate'
import { drawTag } from '../utils/drawMeterDocuments'
import { validateSignatureImageFile, signatureImageRulesHintText } from '../utils/validateSignatureImage'
import ComboInput from './ComboInput'
import './CertificateForm.css'
import tagSchemaList from '..//tagSchemasOnly/tagschema/tag.json'

const WATERMARK_LOGO = new URL('../images/Mlogo.jpeg', import.meta.url).href;
const LEFT_LOGO = new URL('../images/fullLogo.jpg', import.meta.url).href;
const RIGHT_LOGO = new URL('../images/iso.jpg', import.meta.url).href;

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

export default function CertificateForm({ meter, formType = 'both', onBack, onSubmit }) {
  const [selectedMeter, setSelectedMeter] = useState(meter)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSection, setCurrentSection] = useState(0)
  const [showCertificatePreview, setShowCertificatePreview] = useState(false)
  const [showTagPreview, setShowTagPreview] = useState(false)
  const [certificateData, setCertificateData] = useState(null)
  const [tagData, setTagData] = useState(null)
  const [signatureImageDataUrl, setSignatureImageDataUrl] = useState(null)
  const [signatureImageError, setSignatureImageError] = useState(null)
  const certificateCanvasRef = useRef(null)
  const tagCanvasRef = useRef(null)

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
    console.log('meter', selectedMeter);
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

  const [formData, setFormData] = useState(() => buildInitialFormData(fieldMeta))

  useEffect(() => {
    setFormData(buildInitialFormData(fieldMeta))
    setCurrentSection(0)
  }, [fieldMeta])

  const handleSelectMeter = (selectedMeterOption) => {
    setSelectedMeter(selectedMeterOption)
    setFormData(buildInitialFormData(selectedMeterOption.meterSchema?.fieldMeta || {}))
    setCurrentSection(0)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
          onChange={(nextValue) => setFormData((prev) => ({ ...prev, [fieldKey]: nextValue }))}
        />
      );
    }

    return (
      <input
        type="text"
        name={fieldKey}
        value={formData[fieldKey]}
        onChange={handleInputChange}
        placeholder={currentFieldMeta.placeholder || ''}
        disabled={isDisabled}
        className="form-input"
      />
    );
  };

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

  useEffect(() => {
    if (showCertificatePreview && certificateData && certificateCanvasRef.current) {
      drawCertificate({
        canvas: certificateCanvasRef.current,
        certificateData,
        fieldMeta,
        certificateConfig: selectedMeter.certificateConfig,
        loadImage,
        watermarkLogo: WATERMARK_LOGO,
        leftLogo: LEFT_LOGO,
        rightLogo: RIGHT_LOGO,
      });
    }
  }, [showCertificatePreview, certificateData, fieldMeta, selectedMeter])

  useEffect(() => {
    if (showTagPreview && tagData && tagCanvasRef.current) {
      drawTag({
        canvasElement: tagCanvasRef.current,
        dataToRender: tagData,
        tagDrawConfig: selectedMeter.tagDrawConfig,
        leftLogo: LEFT_LOGO,
        loadImage,
      });
    }
  }, [showTagPreview, tagData, selectedMeter])

  const downloadCertificatePdf = () => {
    if (!certificateCanvasRef.current || !certificateData) return;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(
      certificateCanvasRef.current.toDataURL('image/png'),
      'PNG',
      0,
      0,
      297,
      210,
    );
    pdf.save(`${certificateData.serialNo || 'unnamed'}-certificate.pdf`);
  }

  const downloadTagPdf = () => {
    if (!tagCanvasRef.current || !tagData) return;
    const tagPdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [150, 90] });
    tagPdf.addImage(tagCanvasRef.current.toDataURL('image/png'), 'PNG', 0, 0, 150, 90);
    tagPdf.save(`${tagData.serialNo || 'file'}-tag.pdf`);
  }

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    } else {
      onBack?.()
    }
  }

  const handlePreviewCertificate = () => {
    setCertificateData({ ...formData, signatureImageDataUrl })
    setShowCertificatePreview(true)
  }

  const handlePreviewTag = () => {
    setTagData(formData)
    setShowTagPreview(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const isCalibrationSignOffSection = 
    (formType !== 'tag') &&
    sections[currentSection]?.fields?.includes('calibratedBy') &&
    sections[currentSection]?.fields?.includes('date');

  const formTitle = formType === 'certificate' 
    ? 'Certificate Generator'
    : formType === 'tag'
    ? 'Tag Generator'
    : 'Generate Certificate & Tags'

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="form-back" onClick={onBack} title="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h2>{formTitle}{selectedMeter && ` - ${selectedMeter.label}`}</h2>
        {selectedMeter && (
          <div className="form-progress">
            {sections.length > 1 && sections.map((_, idx) => (
              <span 
                key={idx}
                className={`progress-step ${idx <= currentSection ? 'active' : ''}`}
              >
                {idx + 1}
              </span>
            ))}
          </div>
        )}
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
              <input
                type="text"
                placeholder="Search meters by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="meter-grid">
              {filteredMeters.map(m => (
                <button
                  key={m.id}
                  className="meter-option"
                  onClick={() => handleSelectMeter(m)}
                >
                  <div className="meter-option-info">
                    <h4>{m.label}</h4>
                    <p>{m.code}</p>
                  </div>
                  <div className="meter-option-arrow">→</div>
                </button>
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

                {isCalibrationSignOffSection && (
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
      {showCertificatePreview && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '95%', maxHeight: '95vh', overflow: 'auto' }}>
            <canvas ref={certificateCanvasRef} />
            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={downloadCertificatePdf}
              >
                Download PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCertificatePreview(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Preview Modal */}
      {showTagPreview && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Tag Preview</h3>
            <canvas ref={tagCanvasRef} />
            <div className="modal-actions">
              <button className="btn btn-success" onClick={downloadTagPdf}>
                Download Tag
              </button>
              <button className="btn btn-secondary" onClick={() => setShowTagPreview(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
