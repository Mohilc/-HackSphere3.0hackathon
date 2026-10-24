import { useState } from 'react'
import { Play, Flame, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { getDemoForecast, getFullForecast } from '../services/api'
import './QuickForecast.css'

export default function QuickForecast({ onForecast, addLog }) {
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [loadingFull, setLoadingFull] = useState(false)
  const [lastAction, setLastAction] = useState(null)

  const handleDemo = async () => {
    try {
      setLoadingDemo(true)
      addLog('info', 'Requesting 24-hour demo forecast from QuickML engine...')
      const res = await getDemoForecast()
      if (res.success) {
        onForecast(res)
        setLastAction('demo')
      }
    } catch (err) {
      addLog('error', `Demo forecast failed: ${err.message}`)
    } finally {
      setLoadingDemo(false)
    }
  }

  const handleFull = async () => {
    try {
      setLoadingFull(true)
      addLog('info', 'Executing full dataset forecast across sample test input...')
      const res = await getFullForecast()
      if (res.success) {
        onForecast(res)
        setLastAction('full')
      }
    } catch (err) {
      addLog('error', `Full forecast failed: ${err.message}`)
    } finally {
      setLoadingFull(false)
    }
  }

  return (
    <div className="control-card">
      <div className="card-top">
        <div className="icon-wrapper icon-cyan">
          <Sparkles size={20} />
        </div>
        <div>
          <h4>Instant Forecasting</h4>
          <p className="card-desc">Simulate with pre-loaded telemetry data</p>
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
              <Loader2 size={16} className="btn-spinner" /> Running 24h Sim...
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
              <Flame size={16} /> Run Full Test Dataset
            </>
          )}
        </button>
      </div>

      {lastAction && (
        <div className="last-run-status">
          <CheckCircle2 size={14} className="text-green" />
          <span>Last ran: {lastAction === 'demo' ? '24-Hour Horizon' : 'Full Evaluation'}</span>
        </div>
      )}
    </div>
  )
}
