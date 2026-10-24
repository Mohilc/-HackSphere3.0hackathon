import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import './Header.css'

export default function Header() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={28} />
          </div>
          <div>
            <h1>HackSphere <span className="version">3.0</span></h1>
            <p className="subtitle">Smart Energy Microgrid Dashboard</p>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="system-status">
          <span className="status-dot" />
          <span>System Online</span>
        </div>
        <div className="header-time">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
    </header>
  )
}
