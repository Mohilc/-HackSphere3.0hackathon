import { X, AlertTriangle, ShieldCheck, Zap } from 'lucide-react'
import { useState } from 'react'
import './AlertBanner.css'

export default function AlertBanner({ count, forecast }) {
  const [dismissed, setDismissed] = useState(false)

  if (!count || count === 0 || dismissed) return null

  const overloadHours = forecast?.forecast?.hourly
    ?.filter((h) => h.overload_alert)
    ?.map((h) => `${String(h.hour).padStart(2, '0')}:00`)
    ?.join(', ') || ''

  return (
    <div className="alert-banner">
      <div className="alert-content">
        <div className="alert-icon-box">
          <AlertTriangle size={18} />
        </div>
        <div className="alert-text-block">
          <span className="alert-badge">CRITICAL OVERLOAD ALARM</span>
          <span className="alert-details">
            <strong>{count} Forecast Hour(s)</strong> exceed the <strong>200 kW</strong> safety threshold
            {overloadHours && ` [Hours: ${overloadHours}]`}. Transition Controller issuing emergency storage dispatch.
          </span>
        </div>
        <button className="alert-close" onClick={() => setDismissed(true)} title="Acknowledge Alert">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
