import { useState } from 'react'
import { Terminal, Trash2, CheckCircle2, ShieldAlert, Info, Radio } from 'lucide-react'
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

  const getLevelLabel = (level) => {
    switch (level) {
      case 'success':
        return 'DISPATCH'
      case 'error':
        return 'CRITICAL'
      default:
        return 'TELEMETRY'
    }
  }

  return (
    <div className="system-log-card">
      <div className="log-header">
        <div className="log-title-group">
          <div className="log-status-dot-frame">
            <span className="log-status-dot" />
            <Terminal size={17} className="terminal-icon" />
          </div>
          <div>
            <h4 className="log-title">Telemetry & Transition System Console</h4>
            <span className="log-sub">Live audit bus · {logs.length} events recorded</span>
          </div>
        </div>

        <div className="log-controls">
          <div className="log-filter-pills">
            <button
              type="button"
              className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Events ({logs.length})
            </button>
            <button
              type="button"
              className={`pill-btn alert-pill ${filter === 'error' ? 'active' : ''}`}
              onClick={() => setFilter('error')}
            >
              Alerts ({logs.filter(l => l.level === 'error').length})
            </button>
            <button
              type="button"
              className={`pill-btn success-pill ${filter === 'success' ? 'active' : ''}`}
              onClick={() => setFilter('success')}
            >
              Success ({logs.filter(l => l.level === 'success').length})
            </button>
          </div>

          <button type="button" className="clear-btn" onClick={onClear} title="Clear event logs">
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      <div className="log-terminal-viewport">
        {filteredLogs.length === 0 ? (
          <div className="log-empty">
            <Radio size={24} className="log-empty-ico" />
            <p>No telemetry events matching current filter. Awaiting microgrid dispatch signals...</p>
          </div>
        ) : (
          <div className="log-entries-list">
            {filteredLogs.map((log, i) => (
              <div key={i} className={`log-entry-row log-lvl-${log.level}`}>
                <div className="log-meta-group">
                  <span className="log-timestamp-pill">
                    {new Date(log.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </span>
                  <span className={`log-level-badge badge-${log.level}`}>
                    {getIcon(log.level)}
                    {getLevelLabel(log.level)}
                  </span>
                </div>
                <div className="log-message-content">
                  <span className="log-text">{log.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="log-terminal-footer">
        <span className="term-indicator">STATUS: TELEMETRY STREAM ONLINE</span>
        <span className="term-indicator">BUFFER: RING BUFFER (1000 MAX)</span>
        <span className="term-indicator">ENCRYPTION: TLS 1.3 / CATALYST APPSAIL</span>
      </div>
    </div>
  )
}
