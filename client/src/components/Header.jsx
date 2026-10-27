import { useState, useEffect } from 'react'
import { Activity, Play, Menu, X, Cpu, Clock, CheckCircle2 } from 'lucide-react'
import './Header.css'

export default function Header({ activeTab, onTabChange, onTriggerForecast, loading }) {
  const [time, setTime] = useState(new Date())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const navItems = [
    { id: 'overview', index: '01', label: 'Overview' },
    { id: 'manual', index: '02', label: 'Manual Input' },
    { id: 'upload', index: '03', label: 'File Upload' },
    { id: 'analysis', index: '04', label: 'Forecast Analysis' },
    { id: 'control', index: '05', label: 'Energy Control' },
    { id: 'advisory', index: '06', label: 'AI Advisory' },
    { id: 'reports', index: '07', label: 'Reports' },
  ]

  const handleSelectTab = (id) => {
    onTabChange(id)
    setMobileMenuOpen(false)
  }

  return (
    <header className="global-header">
      {/* Top Banner Masthead */}
      <div className="masthead-container">
        <div className="brand-lockup" onClick={() => handleSelectTab('overview')}>
          <div className="brand-symbol">
            <Activity size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">MICROGRID <span className="brand-slash">/</span> INTELLIGENCE</span>
            <span className="brand-subtitle">Smart Energy Engine · HackSphere 3.0</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-index">{item.index}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="nav-active-pip" />}
              </button>
            )
          })}
        </nav>

        {/* Global Right Actions & Telemetry Status */}
        <div className="header-meta">
          <div className="telemetry-status" title="Zoho Catalyst QuickML Pipeline & Automatic Controller Active">
            <span className="telemetry-indicator" />
            <span className="telemetry-label">QUICKML ACTIVE</span>
          </div>

          <div className="telemetry-time" title="System Local Clock">
            <Clock size={12} className="clock-icon" />
            <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
          </div>

          <button
            type="button"
            className="btn-primary header-cta"
            onClick={onTriggerForecast}
            disabled={loading}
          >
            <Play size={13} />
            <span>RUN 24H SIM</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-nav-list">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleSelectTab(item.id)}
              >
                <span className="nav-index">{item.index}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
