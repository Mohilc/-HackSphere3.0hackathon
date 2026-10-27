import { useMemo } from 'react'
import { GitCommit, ArrowRightLeft, ShieldAlert, Clock, Sun, Power } from 'lucide-react'
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
            <ArrowRightLeft className="timeline-icon" size={18} />
          </div>
          <div>
            <h3>Grid Transition Sequence</h3>
            <p className="timeline-subtitle">
              Automated power-source routing timeline: Main Grid (&le;160 kW) &harr; Renewable Storage (&gt;160 kW or 18–22h)
            </p>
          </div>
        </div>

        {hourly.length > 0 && (
          <div className="timeline-stats">
            <span className="stat-pill">
              <Clock size={12} /> {hourly.length}h Horizon
            </span>
            <span className="stat-pill highlight">
              Mode Switches: {switchCount}
            </span>
          </div>
        )}
      </div>

      <div className="timeline-body">
        {hourly.length === 0 ? (
          <div className="timeline-empty">
            <GitCommit size={36} className="empty-icon-sm" />
            <p>Run a 24-hour simulation or upload telemetry CSV to view hourly power dispatch signals.</p>
          </div>
        ) : (
          <div className="timeline-track">
            {hourly.map((item, idx) => {
              const isRenewable = item.grid_mode === 'Renewable Storage'
              const date = new Date(item.timestamp)
              const hourLabel = isNaN(date.getTime())
                ? `${String(item.hour).padStart(2, '0')}:00`
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
                    <div className="switch-indicator" title="Grid Dispatch Transition Triggered">
                      SWITCH
                    </div>
                  )}

                  <div className="node-time">{hourLabel}</div>
                  
                  <div className="node-status-bar" />

                  <div className="node-content">
                    <span className="node-mode">
                      {isRenewable ? (
                        <>
                          <Sun size={11} className="inline-icon" /> Renewable
                        </>
                      ) : (
                        <>
                          <Power size={11} className="inline-icon" /> Main Grid
                        </>
                      )}
                    </span>
                    <span className="node-kw">{item.predicted_demand_kw} kW</span>
                  </div>

                  <div className="node-tags">
                    {item.overload_alert && (
                      <span className="node-tag alert" title="Critical Overload: Demand ≥ 200 kW">
                        <ShieldAlert size={10} /> OVERLOAD
                      </span>
                    )}
                    {item.is_peak_hour && (
                      <span className="node-tag peak" title="Peak window: 18:00–22:00">
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

      {/* Legend Footer */}
      <div className="timeline-footer">
        <span className="tl-legend-item">
          <span className="legend-indicator ren" /> Green = Renewable Storage Mode
        </span>
        <span className="tl-legend-item">
          <span className="legend-indicator grid" /> Dark Neutral = Main Grid Mode
        </span>
        <span className="tl-legend-item">
          <span className="legend-indicator ovl" /> Red = Critical Overload (&ge;200 kW)
        </span>
      </div>
    </div>
  )
}
