import { useState, useRef } from 'react'
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, FileUp } from 'lucide-react'
import { uploadCSV } from '../services/api'
import './CSVUpload.css'

export default function CSVUpload({ onForecast, addLog }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [fileStats, setFileStats] = useState(null)
  const [validationError, setValidationError] = useState(null)
  const fileInputRef = useRef(null)

  const validateAndProcessFile = async (file) => {
    if (!file) return
    setValidationError(null)

    // 1. Strict extension check
    if (!file.name.toLowerCase().endsWith('.csv')) {
      const msg = `Unsupported file type "${file.name}". Only standard telemetry .csv files are supported.`
      setValidationError(msg)
      addLog('error', msg)
      return
    }

    // 2. Client-side header preview check
    try {
      const textPreview = await file.slice(0, 1024).text()
      const firstLine = textPreview.split('\n')[0].toLowerCase()
      const requiredCols = ['timestamp', 'ambient_temp_c', 'humidity_pct', 'solar_irradiance_wm2']
      const missing = requiredCols.filter(col => !firstLine.includes(col))
      
      if (missing.length > 0) {
        const msg = `CSV missing required column(s): ${missing.join(', ')}`
        setValidationError(msg)
        addLog('error', msg)
        return
      }
    } catch {
      // If preview fails, proceed to backend validation
    }

    // 3. Send to Backend
    try {
      setUploading(true)
      setFileName(file.name)
      addLog('info', `Ingesting telemetry CSV: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`)

      const res = await uploadCSV(file)
      if (res.success) {
        onForecast(res)
        setFileStats({
          rows: res.rows_processed,
          alerts: res.forecast.summary.overload_alerts,
        })
        addLog('success', `CSV Ingestion complete: ${res.rows_processed} rows evaluated.`)
      }
    } catch (err) {
      const msg = `CSV upload failed: ${err.message}`
      setValidationError(msg)
      addLog('error', msg)
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    validateAndProcessFile(file)
  }

  const handleSelect = (e) => {
    const file = e.target.files[0]
    validateAndProcessFile(file)
    e.target.value = '' // Reset so same file can be re-selected
  }

  return (
    <div className="control-card">
      <div className="card-top">
        <div className="icon-wrapper icon-green">
          <UploadCloud size={20} />
        </div>
        <div>
          <h4>Upload Telemetry CSV</h4>
          <p className="card-desc">Batch evaluate custom microgrid readings</p>
        </div>
      </div>

      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'disabled' : ''} ${
          validationError ? 'dz-has-error' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleSelect}
          accept=".csv"
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div className="dz-content">
            <Loader2 size={24} className="btn-spinner text-green" />
            <span className="dz-text">Parsing telemetry and scoring features...</span>
          </div>
        ) : fileName ? (
          <div className="dz-content">
            <FileSpreadsheet size={24} className="text-green" />
            <span className="dz-filename">{fileName}</span>
            {fileStats && (
              <span className="dz-meta">
                <CheckCircle2 size={12} className="inline-check" />
                {fileStats.rows} rows · {fileStats.alerts} overload event(s)
              </span>
            )}
          </div>
        ) : (
          <div className="dz-content">
            <FileUp size={24} className="dz-icon" />
            <span className="dz-text">Drop .csv file or click to browse</span>
            <span className="dz-sub">Accepts hourly weather & irradiance records</span>
          </div>
        )}
      </div>

      {validationError && (
        <div className="dz-error-banner">
          <AlertTriangle size={14} />
          <span>{validationError}</span>
        </div>
      )}

      <div className="card-footer-info">
        <span className="hint-text">
          Required: <code>timestamp</code>, <code>ambient_temp_c</code>, <code>humidity_pct</code>, <code>solar_irradiance_wm2</code>
        </span>
      </div>
    </div>
  )
}
