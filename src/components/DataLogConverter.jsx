import React, { useState, useRef, useCallback, useEffect } from 'react'
import TiltCard from './TiltCard'
import { METER_CONFIGS, buildSampleFormat } from '../workers/datalogFields'
import './DataLogConverter.css'

const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const IconUploadCloud = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.9A7 7 0 0 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
)

const IconFileText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h8M8 9h2" />
  </svg>
)

const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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

const IconDroplet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69 17.66 8.35a8 8 0 1 1-11.31 0z" />
  </svg>
)

const IconThermometer = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z" />
  </svg>
)

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

const IconSwap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

export default function DataLogConverter({ onBack }) {
  const [meterType, setMeterType] = useState(null) // null | 'flow' | 'btu'
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle | converting | done | error
  const [progress, setProgress] = useState(0)
  const [rowCount, setRowCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [outputName, setOutputName] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const workerRef = useRef(null)
  const fileInputRef = useRef(null)
  const downloadUrlRef = useRef(null)
  downloadUrlRef.current = downloadUrl

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current)
    }
  }, [])

  const reset = () => {
    workerRef.current?.terminate()
    workerRef.current = null
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setFile(null)
    setStatus('idle')
    setProgress(0)
    setRowCount(0)
    setErrorMsg('')
    setDownloadUrl(null)
    setOutputName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileSelect = (selected) => {
    if (!selected) return
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setFile(selected)
    setStatus('idle')
    setProgress(0)
    setRowCount(0)
    setErrorMsg('')
    setDownloadUrl(null)
    setOutputName('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    if (status === 'converting') return
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFileSelect(dropped)
  }

  const handleConvert = useCallback(() => {
    if (!file) return
    setStatus('converting')
    setProgress(0)
    setRowCount(0)
    setErrorMsg('')

    const worker = new Worker(new URL('../workers/datalogConverter.worker.js', import.meta.url), { type: 'module' })
    workerRef.current = worker

    worker.onmessage = (e) => {
      const data = e.data
      if (data.type === 'progress') {
        setProgress(data.progress)
        setRowCount(data.rowCount)
      } else if (data.type === 'done') {
        const blob = new Blob([data.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setOutputName(file.name.replace(/\.[^.]+$/, '') + '.xlsx')
        setRowCount(data.rowCount)
        setProgress(100)
        setStatus('done')
        worker.terminate()
        workerRef.current = null
      } else if (data.type === 'error') {
        setErrorMsg(data.message)
        setStatus('error')
        worker.terminate()
        workerRef.current = null
      }
    }

    worker.onerror = (err) => {
      setErrorMsg(err.message || 'Something went wrong while converting the file.')
      setStatus('error')
      worker.terminate()
      workerRef.current = null
    }

    worker.postMessage({ file, meterType })
  }, [file, meterType])

  const handleChangeMeterType = () => {
    reset()
    setMeterType(null)
  }

  const config = meterType ? METER_CONFIGS[meterType] : null

  return (
    <div className="form-container datalog-converter">
      <div className="form-header">
        <button className="form-back" onClick={onBack} title="Back to tools">
          <IconBack />
        </button>
        <h2>Datalog to Excel Converter</h2>
      </div>

      <div className="form-content animate-fade-in">
        {!meterType ? (
          <>
            <p className="datalog-intro">
              Select the meter type to generate the right columns for your Excel report.
            </p>

            <div className="datalog-meter-grid">
              {Object.values(METER_CONFIGS).map((cfg) => (
                <TiltCard
                  key={cfg.id}
                  className="glass-card datalog-meter-option"
                  onClick={() => setMeterType(cfg.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setMeterType(cfg.id)
                    }
                  }}
                >
                  <div className="datalog-meter-option__icon">
                    {cfg.id === 'flow' ? <IconDroplet /> : <IconThermometer />}
                  </div>
                  <div className="datalog-meter-option__info">
                    <h4>{cfg.label}</h4>
                    <p>{cfg.description}</p>
                  </div>
                  <div className="datalog-meter-option__arrow">
                    <IconArrowRight />
                  </div>
                </TiltCard>
              ))}
            </div>
          </>
        ) : (
        <>
        <div className="datalog-meter-banner">
          <span className="datalog-meter-banner__icon">
            {meterType === 'flow' ? <IconDroplet /> : <IconThermometer />}
          </span>
          <span className="datalog-meter-banner__label">{config.label}</span>
          <button
            type="button"
            className="datalog-meter-banner__change"
            onClick={handleChangeMeterType}
            disabled={status === 'converting'}
          >
            <IconSwap /> Change meter type
          </button>
        </div>

        <p className="datalog-intro">
          Upload a {config.label.toLowerCase()} log file to generate a formatted Excel report with date, time
          and value/unit columns for each measurement. Everything is processed locally in your browser — no file is uploaded anywhere.
        </p>

        <div
          className={[
            'datalog-dropzone',
            dragActive ? 'datalog-dropzone--active' : '',
            file ? 'datalog-dropzone--has-file' : '',
            status === 'converting' ? 'datalog-dropzone--disabled' : '',
          ].filter(Boolean).join(' ')}
          onDragOver={(e) => { e.preventDefault(); if (status !== 'converting') setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => status !== 'converting' && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.log,.csv"
            hidden
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />

          {!file ? (
            <>
              <div className="datalog-dropzone__icon"><IconUploadCloud /></div>
              <p className="datalog-dropzone__title">Drag &amp; drop your log file here</p>
              <p className="datalog-dropzone__subtitle">or click to browse · .txt files</p>
            </>
          ) : (
            <div className="datalog-file-info">
              <div className="datalog-file-info__icon"><IconFileText /></div>
              <div className="datalog-file-info__details">
                <p className="datalog-file-info__name">{file.name}</p>
                <p className="datalog-file-info__size">{formatBytes(file.size)}</p>
              </div>
              {status !== 'converting' && (
                <button
                  className="datalog-file-info__remove"
                  onClick={(e) => { e.stopPropagation(); reset() }}
                  title="Remove file"
                >
                  <IconClose />
                </button>
              )}
            </div>
          )}
        </div>

        {status === 'converting' && (
          <div className="datalog-progress">
            <div className="datalog-progress__bar">
              <div className="datalog-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="datalog-progress__label">
              <span className="spinner" />
              {progress >= 95 ? 'Finalizing Excel file…' : `Converting… ${progress}%`}
              {rowCount > 0 ? ` · ${rowCount.toLocaleString()} records processed` : ''}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="datalog-banner datalog-banner--error">
            <IconAlert />
            <p>{errorMsg}</p>
          </div>
        )}

        {status === 'done' && (
          <div className="datalog-banner datalog-banner--success">
            <IconCheck />
            <p>Converted {rowCount.toLocaleString()} records successfully.</p>
          </div>
        )}

        <div className="datalog-actions">
          {status === 'done' ? (
            <>
              <a className="btn btn-success" href={downloadUrl} download={outputName}>
                <IconDownload /> Download Excel File
              </a>
              <button className="btn btn-secondary" onClick={reset}>Convert Another File</button>
            </>
          ) : status === 'error' ? (
            <button className="btn btn-secondary" onClick={reset}>Try Again</button>
          ) : (
            <button className="btn btn-primary" disabled={!file || status === 'converting'} onClick={handleConvert}>
              {status === 'converting' ? (<><span className="spinner" /> Converting…</>) : 'Convert to Excel'}
            </button>
          )}
        </div>

        <div className="datalog-format-card glass-card">
          <h3>Expected file format</h3>
          <p>Each {config.fields.length + 1}-line block in the text file becomes one row in the Excel sheet:</p>
          <pre className="datalog-format-sample">{buildSampleFormat(config)}</pre>
          <ul className="datalog-format-list">
            <li><strong>a</strong> → Date &amp; Time (split into two columns)</li>
            {config.fields.map((field) => (
              <li key={field.key}><strong>{field.key}</strong> → {field.label} (Value + Unit columns)</li>
            ))}
          </ul>
          <p>Each measurement is split into its own <strong>Value</strong> and <strong>Unit</strong> columns, with the unit taken directly from the log file.</p>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
