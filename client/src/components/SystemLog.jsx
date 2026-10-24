import { useState } from 'react'
import { Terminal, Trash2, CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react'
import './SystemLog.css'

export default function SystemLog({ logs, onClear }) {
  const [filter, setFilter] = useState('all')

  const filteredLogs = logs.filter((l) => {
    if (filter === 'all') return true
    return l.level === filter
  })

  const getIcon = (level) => {
    switch (level) {
      case 'success':
        return <CheckCircle2 size={13} className="log-ico-success" />
      case 'error':
        return <ShieldAlert size={13} className="log-ico-error" />
      default:
        return <Info size={13} className="log-ico-info" />
    }
  }

  return (
    <div className="system-log-card">
      <div className="log-header">
        <div className="log-title-group">
          <Terminal size={18} className="terminal-icon" />
          <h4>Telemetry & Transition System Console</h4>
          <span className="log-count">({filteredLogs.length} events)</span>
        </div>

        <div className="log-controls">
          <div className="log-filter-pills">
            <button
              className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`pill-btn ${filter === 'error' ? 'active' : ''}`}
              onClick={() => setFilter('error')}
            >
              Alerts
            </button>
            <button
              className={`pill-btn ${filter === 'success' ? 'active' : ''}`}
              onClick={() => setFilter('success')}
            >
              Success
            </button>
          </div>

          <button className="clear-btn" onClick={onClear} title="Clear logs">
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      <div className="log-terminal">
        {filteredLogs.length === 0 ? (
          <div className="log-empty">No telemetry events logged yet.</div>
        ) : (
          filteredLogs.map((log, i) => (
            <div key={i} className={`log-entry log-${log.level}`}>
              <span className="log-timestamp">
                {new Date(log.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </span>
              <span className="log-level-tag">[{log.level.toUpperCase()}]</span>
              <span className="log-icon">{getIcon(log.level)}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
