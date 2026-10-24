import { Cpu, ShieldCheck, Zap } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-brand">
            <Zap size={16} className="text-cyan" />
            <span>HackSphere 3.0</span>
          </div>
          <span className="footer-sep">&bull;</span>
          <span className="footer-tagline">
            Smart Energy Microgrid & Demand Forecasting Engine
          </span>
        </div>

        <div className="footer-center">
          <span className="footer-rule-pill">
            <Cpu size={13} /> Random Forest Regressor · QuickML
          </span>
          <span className="footer-rule-pill">
            <ShieldCheck size={13} /> Thresholds: 160 kW / 200 kW / 18-22h Peak
          </span>
        </div>

        <div className="footer-right">
          <span>Zoho Catalyst Cloud Integration</span>
        </div>
      </div>
    </footer>
  )
}
