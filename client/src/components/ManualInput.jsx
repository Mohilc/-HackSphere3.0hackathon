import { useState } from 'react'
import { Sliders, Send, Loader2, Zap, ShieldAlert, Sun, Power, AlertCircle } from 'lucide-react'
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
  const [errorMsg, setErrorMsg] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrorMsg(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    // Validation
    const tempNum = parseFloat(form.temp)
    const humNum = parseFloat(form.humidity)
    const solarNum = parseFloat(form.solar)

    if (isNaN(tempNum) || tempNum < -30 || tempNum > 65) {
      setErrorMsg('Ambient temperature must be between -30°C and 65°C.')
      return
    }
    if (isNaN(humNum) || humNum < 0 || humNum > 100) {
      setErrorMsg('Relative humidity must be between 0% and 100%.')
      return
    }
    if (isNaN(solarNum) || solarNum < 0 || solarNum > 1500) {
      setErrorMsg('Solar irradiance must be between 0 and 1500 W/m².')
      return
    }

    try {
      setLoading(true)
      const now = new Date()
      const [h, m] = (form.time || '12:00').split(':')
      now.setHours(parseInt(h || '12', 10), parseInt(m || '0', 10), 0, 0)
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ')

      const payload = {
        timestamp,
        ambient_temp_c: tempNum,
        humidity_pct: humNum,
        solar_irradiance_wm2: solarNum,
      }

      addLog('info', `Probing point telemetry: ${form.temp}°C, ${form.humidity}%, ${form.solar} W/m² at ${form.time}...`)

      const res = await postManualPredict(payload)
      if (res.success) {
        setResult(res)
        addLog(
          res.state.overload_alert ? 'error' : 'success',
          `Point Forecast: ${res.prediction_kw} kW → Dispatched to [${res.state.grid_mode}]`
        )
      }
    } catch (err) {
      setErrorMsg(err.message || 'Prediction failed')
      addLog('error', `Manual prediction failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="control-card">
      <div className="card-top">
        <div className="icon-wrapper icon-green">
          <Sliders size={20} />
        </div>
        <div>
          <h4>Manual Telemetry Input</h4>
          <p className="card-desc">Simulate single-point environmental telemetry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="manual-form">
        <div className="form-grid">
          <div className="input-group">
            <label>Timestamp / Hour</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Ambient Temp (°C)</label>
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
              min="0"
              max="100"
              name="humidity"
              value={form.humidity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Solar Irradiance (W/m²)</label>
            <input
              type="number"
              step="1"
              min="0"
              name="solar"
              value={form.solar}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="manual-error-alert">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <button type="submit" className="btn-primary probe-btn" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="btn-spinner" /> Evaluating Telemetry...
            </>
          ) : (
            <>
              <Send size={15} /> Predict Electricity Demand
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`probe-result-card ${result.state.overload_alert ? 'card-has-overload' : ''}`}>
          <div className="pr-row">
            <div className="pr-kw-group">
              <span className="pr-kw">{result.prediction_kw} kW</span>
              <span className="pr-label">Predicted Demand</span>
            </div>
            <span
              className={`pr-mode-badge ${
                result.state.grid_mode === 'Renewable Storage' ? 'mode-ren' : 'mode-grid'
              }`}
            >
              {result.state.grid_mode === 'Renewable Storage' ? (
                <>
                  <Sun size={12} /> Renewable Storage
                </>
              ) : (
                <>
                  <Power size={12} /> Main Grid Mode
                </>
              )}
            </span>
          </div>

          <div className="pr-details">
            {result.state.overload_alert ? (
              <span className="pr-alert-pill">
                <ShieldAlert size={12} /> CRITICAL OVERLOAD (&ge;200 kW)
              </span>
            ) : (
              <span className="pr-safe-pill">
                <Zap size={11} /> Normal Load
              </span>
            )}
            {result.state.is_peak_hour && (
              <span className="pr-tag-pill">Peak Window (18:00–22:00)</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
