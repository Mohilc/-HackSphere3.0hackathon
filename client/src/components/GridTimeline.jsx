import { useMemo } from 'react'
import { GitCommit, ArrowRightLeft, ShieldAlert, Sparkles, Clock } from 'lucide-react'
import './GridTimeline.css'

export default function GridTimeline({ forecast }) {
  const hourly = forecast?.forecast?.hourly || []

  // Count transitions between consecutive hours
  const switchCount = useMemo(() => {
    if (hourly.length < 2) return 0
    let count = 0
    for (let i = 1; i < hourly.length; i++) {
      if (hourly[i].grid_mode !== hourly[i - 1].grid_mode) {
        count++
      }
    }
    return count
  }, [hourly])

  return (
    <div className="grid-timeline-card">
      <div className="timeline-header">
        <div className="timeline-title-group">
          <div className="timeline-icon-box">
            <ArrowRightLeft className="timeline-icon" />
          </div>
          <div>
            <h3>Grid Transition Timeline</h3>
            <p className="timeline-subtitle">
              Automated power-source routing schedule (Main Grid &harr; Renewable Storage)
            </p>
          </div>
        </div>

        {hourly.length > 0 && (
          <div className="timeline-stats">
            <span className="stat-pill">
              <Clock size={12} /> {hourly.length}h Horizon
            </span>
            <span className="stat-pill highlight">
              <Sparkles size={12} /> {switchCount} Mode Switches
            </span>
          </div>
        )}
      </div>

      <div className="timeline-body">
        {hourly.length === 0 ? (
          <div className="timeline-empty">
            <GitCommit size={36} className="empty-icon-sm" />
            <p>Run a forecast to view hourly power source transition sequence.</p>
          </div>
        ) : (
          <div className="timeline-track">
            {hourly.map((item, idx) => {
              const isRenewable = item.grid_mode === 'Renewable Storage'
              const date = new Date(item.timestamp)
              const hourLabel = isNaN(date.getTime())
                ? `${item.hour}:00`
                : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

              const isSwitchPoint =
                idx > 0 && item.grid_mode !== hourly[idx - 1].grid_mode

              return (
                <div
                  key={idx}
                  className={`timeline-node ${isRenewable ? 'node-renewable' : 'node-grid'} ${
                    item.overload_alert ? 'node-overload' : ''
                  }`}
                >
                  {isSwitchPoint && (
                    <div className="switch-indicator" title="Source Transition Triggered">
                      &bull; SWITCH &bull;
                    </div>
                  )}

                  <div className="node-time">{hourLabel}</div>
                  
                  <div className="node-status-bar"></div>

                  <div className="node-content">
                    <span className="node-mode">
                      {isRenewable ? 'Renewable' : 'Main Grid'}
                    </span>
                    <span className="node-kw">{item.predicted_demand_kw} kW</span>
                  </div>

                  <div className="node-tags">
                    {item.overload_alert && (
                      <span className="node-tag alert" title="Demand &ge; 200 kW">
                        <ShieldAlert size={10} /> Overload
                      </span>
                    )}
                    {item.is_peak_hour && (
                      <span className="node-tag peak" title="Peak window 18-22h">
                        Peak
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
