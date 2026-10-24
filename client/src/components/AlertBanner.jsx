import { X, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import './AlertBanner.css'

export default function AlertBanner({ count, forecast }) {
  const [dismissed, setDismissed] = useState(false)

  if (!count || count === 0 || dismissed) return null

  const overloadHours = forecast?.forecast?.hourly
    ?.filter(h => h.overload_alert)
    ?.map(h => `${String(h.hour).padStart(2, '0')}:00`)
    ?.join(', ') || ''

  return (
    <div className="alert-banner">
      <div className="alert-content">
        <AlertTriangle size={20} className="alert-icon" />
        <span>
          <strong>CRITICAL OVERLOAD:</strong> {count} hour(s) exceed 200 kW threshold
          {overloadHours && ` — at ${overloadHours}`}
        </span>
        <button className="alert-close" onClick={() => setDismissed(true)}>
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
