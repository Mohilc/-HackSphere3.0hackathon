import { useState } from 'react'
import { Sliders, Send, Loader2, Zap, AlertTriangle, ShieldCheck } from 'lucide-react'
import { postManualPredict } from '../services/api'
import './ManualInput.css'

export default function ManualInput({ addLog }) {
  const [form, setForm] = useState({
    time: '19:00',
    temp: 32.5,
    humidity: 65,
    solar: 120,
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const now = new Date()
      const [h, m] = form.time.split(':')
      now.setHours(parseInt(h || '12', 10), parseInt(m || '0', 10), 0, 0)
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ')

      const payload = {
        timestamp,
        ambient_temp_c: parseFloat(form.temp),
        humidity_pct: parseFloat(form.humidity),
        solar_irradiance_wm2: parseFloat(form.solar),
      }

      addLog('info', `Evaluating point telemetry: ${form.temp}°C, ${form.humidity}%, ${form.solar} W/m² at ${form.time}...`)

      const res = await postManualPredict(payload)
      if (res.success) {
        setResult(res)
        addLog(
          res.state.overload_alert ? 'error' : 'success',
          `Manual Eval: ${res.prediction_kw} kW → Dispatched to [${res.state.grid_mode}]`
        )
      }
    } catch (err) {
      addLog('error', `Manual prediction failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="control-card">
      <div className="card-top">
        <div className="icon-wrapper icon-blue">
          <Sliders size={20} />
        </div>
        <div>
          <h4>Manual Parameter Probe</h4>
          <p className="card-desc">Simulate custom environmental sensor conditions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="manual-form">
        <div className="form-grid">
          <div className="input-group">
            <label>Time of Day</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              name="temp"
              value={form.temp}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Humidity (%)</label>
            <input
              type="number"
              step="1"
              name="humidity"
              value={form.humidity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Solar (W/m²)</label>
            <input
              type="number"
              step="1"
              name="solar"
              value={form.solar}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-secondary probe-btn" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="btn-spinner" /> Probing Controller...
            </>
          ) : (
            <>
              <Send size={15} /> Evaluate Point Prediction
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="probe-result-card">
          <div className="pr-row">
            <span className="pr-kw">{result.prediction_kw} kW</span>
            <span
              className={`pr-mode-badge ${
                result.state.grid_mode === 'Renewable Storage' ? 'mode-ren' : 'mode-grid'
              }`}
            >
              <Zap size={12} /> {result.state.grid_mode}
            </span>
          </div>
          <div className="pr-meta">
            {result.state.overload_alert ? (
              <span className="pr-alert">
                <AlertTriangle size={12} /> Overload Alert Triggered
              </span>
            ) : (
              <span className="pr-safe">
                <ShieldCheck size={12} /> Stable Grid Load
              </span>
            )}
            {result.state.is_peak_hour && <span className="pr-peak">Peak Hour (18-22h)</span>}
          </div>
        </div>
      )}
    </div>
  )
}
