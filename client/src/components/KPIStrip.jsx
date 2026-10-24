import { BarChart3, TrendingUp, Plug, Battery, AlertTriangle } from 'lucide-react'
import './KPIStrip.css'

export default function KPIStrip({ forecast }) {
  const s = forecast?.forecast?.summary
  const currentHour = forecast?.forecast?.hourly?.[0]

  const avgDemand = s?.avg_demand_kw ?? '—'
  const peakDemand = s?.peak_demand_kw ?? '—'
  const gridMode = currentHour?.grid_mode ?? '—'
  const batterySoc = s?.final_battery_soc_pct != null ? `${s.final_battery_soc_pct}%` : '—'
  const overloads = s?.overload_alerts ?? 0

  const gridClass = gridMode === 'Renewable Storage'
    ? 'state-renewable'
    : gridMode === 'Main Grid'
      ? 'state-grid'
      : ''

  return (
    <section className="kpi-strip">
      <div className="kpi-card" style={{ animationDelay: '0.05s' }}>
        <div className="kpi-icon-wrap"><BarChart3 size={24} /></div>
        <div className="kpi-data">
          <span className="kpi-value">{avgDemand}</span>
          <span className="kpi-label">Avg Demand (kW)</span>
        </div>
      </div>

      <div className="kpi-card" style={{ animationDelay: '0.1s' }}>
        <div className="kpi-icon-wrap peak"><TrendingUp size={24} /></div>
        <div className="kpi-data">
          <span className="kpi-value">{peakDemand}</span>
          <span className="kpi-label">Peak Demand (kW)</span>
        </div>
      </div>

      <div className={`kpi-card active-mode ${gridClass}`} style={{ animationDelay: '0.15s' }}>
        <div className="kpi-icon-wrap mode"><Plug size={24} /></div>
        <div className="kpi-data">
          <span className="kpi-value kpi-mode-value">{gridMode}</span>
          <span className="kpi-label">Active Grid Mode</span>
        </div>
      </div>

      <div className="kpi-card" style={{ animationDelay: '0.2s' }}>
        <div className="kpi-icon-wrap battery"><Battery size={24} /></div>
        <div className="kpi-data">
          <span className="kpi-value">{batterySoc}</span>
          <span className="kpi-label">Battery SOC</span>
        </div>
      </div>

      <div className={`kpi-card ${overloads > 0 ? 'state-overload' : ''}`} style={{ animationDelay: '0.25s' }}>
        <div className="kpi-icon-wrap alert"><AlertTriangle size={24} /></div>
        <div className="kpi-data">
          <span className="kpi-value">{overloads}</span>
          <span className="kpi-label">Overload Alerts</span>
        </div>
      </div>
    </section>
  )
}
