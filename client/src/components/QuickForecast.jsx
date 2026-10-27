import { useState } from 'react'
import { Play, Loader2, Sparkles, Database } from 'lucide-react'
import { getDemoForecast, getFullForecast } from '../services/api'
import './QuickForecast.css'

export default function QuickForecast({ onForecast, addLog }) {
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [loadingFull, setLoadingFull] = useState(false)
  const [lastAction, setLastAction] = useState(null)

  const handleDemo = async () => {
    try {
      setLoadingDemo(true)
      addLog('info', 'Requesting 24-hour demand forecast from engine...')
      const res = await getDemoForecast()
      if (res.success) {
        onForecast(res)
        setLastAction('demo')
      }
    } catch (err) {
      addLog('error', `24h simulation failed: ${err.message}`)
    } finally {
      setLoadingDemo(false)
    }
  }

  const handleFull = async () => {
    try {
      setLoadingFull(true)
      addLog('info', 'Evaluating full sample test dataset (1,000 rows)...')
      const res = await getFullForecast()
      if (res.success) {
        onForecast(res)
        setLastAction('full')
      }
    } catch (err) {
      addLog('error', `Full evaluation failed: ${err.message}`)
    } finally {
      setLoadingFull(false)
    }
  }

  return (
    <div className="control-card">
      <div className="card-top">
        <div className="icon-wrapper icon-green">
          <Sparkles size={20} />
        </div>
        <div>
          <h4>Instant Forecasting</h4>
          <p className="card-desc">Simulate pre-loaded 24h & test telemetry</p>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="btn-primary"
          onClick={handleDemo}
          disabled={loadingDemo || loadingFull}
        >
          {loadingDemo ? (
            <>
              <Loader2 size={16} className="btn-spinner" /> Running 24h Forecast...
            </>
          ) : (
            <>
              <Play size={16} /> Run 24h Demo Forecast
            </>
          )}
        </button>

        <button
          className="btn-secondary"
          onClick={handleFull}
          disabled={loadingDemo || loadingFull}
        >
          {loadingFull ? (
            <>
              <Loader2 size={16} className="btn-spinner" /> Evaluating Test Set...
            </>
          ) : (
            <>
              <Database size={16} /> Evaluate Full Test Set (1,000 rows)
            </>
          )}
        </button>
      </div>

      <div className="card-footer-info">
        {lastAction === 'demo' ? (
          <span className="status-note green-note">Active: 24h Horizon Forecast Loaded</span>
        ) : lastAction === 'full' ? (
          <span className="status-note green-note">Active: Full 1,000-Row Dataset Evaluated</span>
        ) : (
          <span className="status-note">Ready to simulate 24-hour microgrid load</span>
        )}
      </div>
    </div>
  )
}
