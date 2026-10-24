import { useState, useRef } from 'react'
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { uploadCSV } from '../services/api'
import './CSVUpload.css'

export default function CSVUpload({ onForecast, addLog }) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [fileStats, setFileStats] = useState(null)
  const fileInputRef = useRef(null)

  const processFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      addLog('error', 'Invalid file type. Please upload a .csv file.')
      return
    }

    try {
      setUploading(true)
      setFileName(file.name)
      addLog('info', `Uploading & evaluating telemetry file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`)

      const res = await uploadCSV(file)
      if (res.success) {
        onForecast(res)
        setFileStats({
          rows: res.rows_processed,
          alerts: res.forecast.summary.overload_alerts,
        })
        addLog('success', `CSV processed: ${res.rows_processed} rows evaluated.`)
      }
    } catch (err) {
      addLog('error', `CSV Processing failed: ${err.message}`)
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  const handleSelect = (e) => {
    const file = e.target.files[0]
    processFile(file)
    e.target.value = '' // Reset so same file can be re-selected
  }

  return (
    <div className="control-card">
      <div className="card-top">
        <div className="icon-wrapper icon-purple">
          <UploadCloud size={20} />
        </div>
        <div>
          <h4>Upload Telemetry CSV</h4>
          <p className="card-desc">Batch evaluate custom microgrid readings</p>
        </div>
      </div>

      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'disabled' : ''}`}
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
            <Loader2 size={24} className="btn-spinner text-purple" />
            <span className="dz-text">Parsing and scoring features...</span>
          </div>
        ) : fileName ? (
          <div className="dz-content">
            <FileSpreadsheet size={24} className="text-purple" />
            <span className="dz-filename">{fileName}</span>
            {fileStats && (
              <span className="dz-meta">
                {fileStats.rows} rows · {fileStats.alerts} overload events
              </span>
            )}
          </div>
        ) : (
          <div className="dz-content">
            <UploadCloud size={24} className="dz-icon" />
            <span className="dz-text">Drop test_telemetry.csv or click to browse</span>
            <span className="dz-sub">Accepts standard weather & demand schema</span>
          </div>
        )}
      </div>

      <div className="card-footer-info">
        <span className="hint-text">Required: timestamp, ambient_temp_c, humidity_pct, solar_irradiance_wm2</span>
      </div>
    </div>
  )
}
