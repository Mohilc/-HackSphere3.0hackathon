import { Activity, TrendingUp, Sun, Power, AlertTriangle, BatteryCharging } from 'lucide-react'
import './KPIStrip.css'

export default function KPIStrip({ forecast }) {
  const s = forecast?.forecast?.summary

  const avgDemand = s?.avg_demand_kw != null ? `${s.avg_demand_kw} kW` : '—'
  const peakDemand = s?.peak_demand_kw != null ? `${s.peak_demand_kw} kW` : '—'
  const hoursRenewable = s?.hours_renewable != null ? `${s.hours_renewable}h` : '—'
  const hoursGrid = s?.hours_main_grid != null ? `${s.hours_main_grid}h` : '—'
  const overloadCount = s?.overload_alerts ?? 0
  
  const minSoc = s?.min_battery_soc_pct != null ? `${s.min_battery_soc_pct}%` : '—'
  const finalSoc = s?.final_battery_soc_pct != null ? `${s.final_battery_soc_pct}%` : '—'

  return (
    <section className="kpi-strip">
      {/* 1. Average Demand */}
      <div className="kpi-card">
        <div className="kpi-top">
          <span className="kpi-label">Average Demand</span>
          <div className="kpi-icon-wrap neutral">
            <Activity size={18} />
          </div>
        </div>
        <div className="kpi-bottom">
          <span className="kpi-value">{avgDemand}</span>
          <span className="kpi-sub">24h mean load</span>
        </div>
      </div>

      {/* 2. Peak Demand */}
      <div className={`kpi-card ${s?.peak_demand_kw >= 200 ? 'card-alert' : ''}`}>
        <div className="kpi-top">
          <span className="kpi-label">Peak Demand</span>
          <div className="kpi-icon-wrap peak">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="kpi-bottom">
          <span className="kpi-value">{peakDemand}</span>
          <span className="kpi-sub">
            {s?.peak_demand_kw >= 200 ? 'Exceeds 200 kW Overload' : 'Within normal limits'}
          </span>
        </div>
      </div>

      {/* 3. Renewable Storage Hours */}
      <div className="kpi-card card-renewable">
        <div className="kpi-top">
          <span className="kpi-label">Renewable Mode</span>
          <div className="kpi-icon-wrap renewable">
            <Sun size={18} />
          </div>
        </div>
        <div className="kpi-bottom">
          <span className="kpi-value green-text">{hoursRenewable}</span>
          <span className="kpi-sub">&gt;160 kW or 18:00–22:00</span>
        </div>
      </div>

      {/* 4. Main Grid Hours */}
      <div className="kpi-card card-grid">
        <div className="kpi-top">
          <span className="kpi-label">Main Grid Mode</span>
          <div className="kpi-icon-wrap grid">
            <Power size={18} />
          </div>
        </div>
        <div className="kpi-bottom">
          <span className="kpi-value neutral-text">{hoursGrid}</span>
          <span className="kpi-sub">&le;160 kW off-peak base</span>
        </div>
      </div>

      {/* 5. Critical Overload Events */}
      <div className={`kpi-card ${overloadCount > 0 ? 'card-overload' : ''}`}>
        <div className="kpi-top">
          <span className="kpi-label">Overload Events</span>
          <div className={`kpi-icon-wrap ${overloadCount > 0 ? 'overload' : 'neutral'}`}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="kpi-bottom">
          <span className={`kpi-value ${overloadCount > 0 ? 'red-text' : ''}`}>
            {overloadCount}
          </span>
          <span className="kpi-sub">
            {overloadCount > 0 ? 'Demand &ge; 200 kW detected' : '0 critical alarms'}
          </span>
        </div>
      </div>

      {/* 6. Battery SOC Min & Final */}
      <div className="kpi-card card-battery">
        <div className="kpi-top">
          <span className="kpi-label">Battery SOC (Min / Final)</span>
          <div className="kpi-icon-wrap battery">
            <BatteryCharging size={18} />
          </div>
        </div>
        <div className="kpi-bottom">
          <span className="kpi-value font-compact">
            {minSoc} <span className="soc-divider">/</span> {finalSoc}
          </span>
          <span className="kpi-sub">Reserve Floor 10% (50 kWh)</span>
        </div>
      </div>
    </section>
  )
}
