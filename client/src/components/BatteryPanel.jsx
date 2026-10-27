import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { BatteryCharging, Battery, Zap, AlertTriangle, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import './BatteryPanel.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function BatteryPanel({ forecast }) {
  const summary = forecast?.forecast?.summary
  const hourly = forecast?.forecast?.hourly || []

  const currentItem = hourly.length > 0 ? hourly[0] : null
  const currentSOC = currentItem?.battery_soc_pct ?? 80.0
  const currentKwh = currentItem?.battery_soc_kwh ?? 400.0
  const currentFlow = currentItem?.energy_flow_kw ?? 0.0

  const minSOC = summary?.min_battery_soc_pct ?? 80.0
  const finalSOC = summary?.final_battery_soc_pct ?? 80.0

  const chartData = useMemo(() => {
    if (!hourly.length) return null
    return {
      labels: hourly.map((d) => {
        const date = new Date(d.timestamp)
        return isNaN(date.getTime())
          ? `${String(d.hour).padStart(2, '0')}:00`
          : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      }),
      datasets: [
        {
          label: 'Battery SOC (%)',
          data: hourly.map((d) => d.battery_soc_pct),
          borderColor: '#10b981',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 160)
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)')
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)')
            return gradient
          },
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: '#10b981',
          fill: true,
          tension: 0.3,
        },
      ],
    }
  }, [hourly])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0c0f17',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#262d3d',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const idx = context.dataIndex
            const item = hourly[idx]
            return `SOC: ${context.parsed.y}% (${item?.battery_soc_kwh || ''} kWh)`
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 10 },
          callback: (v) => `${v}%`,
          stepSize: 25,
        },
      },
    },
  }

  const isDischarging = currentFlow < 0
  const isCharging = currentFlow > 0

  return (
    <div className="battery-panel-card">
      <div className="battery-header">
        <div className="battery-title-group">
          <div className="battery-icon-box">
            <BatteryCharging className="battery-icon" size={18} />
          </div>
          <div>
            <h3>500 kWh Energy Storage Status</h3>
            <p className="battery-subtitle">
              92% Round-trip efficiency · 50 kW Charge rate · 10% Reserve limit
            </p>
          </div>
        </div>

        <div className="battery-badge">
          {minSOC <= 15 ? (
            <span className="b-pill warning">
              <AlertTriangle size={12} /> Near Safety Reserve (10%)
            </span>
          ) : (
            <span className="b-pill healthy">
              <ShieldCheck size={12} /> Buffer Optimal
            </span>
          )}
        </div>
      </div>

      <div className="battery-body">
        {/* SOC & Energy level */}
        <div className="battery-visual-section">
          <div className="gauge-container">
            <div className="battery-shell">
              <div
                className="battery-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, currentSOC))}%`,
                  background: currentSOC <= 20 ? 'var(--accent-red)' : 'var(--accent-green)',
                }}
              />
              <div className="battery-tip" />
            </div>

            <div className="gauge-label">
              <div className="soc-val-group">
                <span className={`soc-val ${currentSOC <= 20 ? 'red-text' : 'green-text'}`}>
                  {currentSOC}%
                </span>
                <span className="soc-kwh">({currentKwh} kWh)</span>
              </div>
              <span className="soc-caption">Current State-of-Charge</span>
            </div>
          </div>

          {/* Dynamic Flow Indicator */}
          <div className="flow-indicator-box">
            {isDischarging ? (
              <span className="flow-pill discharging">
                <ArrowDownRight size={13} /> Discharging to Microgrid: {Math.abs(currentFlow)} kW
              </span>
            ) : isCharging ? (
              <span className="flow-pill charging">
                <ArrowUpRight size={13} /> Charging from Main Grid: +{currentFlow} kW
              </span>
            ) : (
              <span className="flow-pill standby">
                <Zap size={13} /> Storage Standby
              </span>
            )}
          </div>

          <div className="battery-metrics-grid">
            <div className="b-metric-box">
              <span className="bm-label">Min Forecast SOC</span>
              <span className="bm-val" style={{ color: minSOC <= 20 ? 'var(--accent-red)' : 'inherit' }}>
                {minSOC}%
              </span>
            </div>
            <div className="b-metric-box">
              <span className="bm-label">Final 24h SOC</span>
              <span className="bm-val">{finalSOC}%</span>
            </div>
            <div className="b-metric-box">
              <span className="bm-label">Safety Cutoff</span>
              <span className="bm-val">10% (50 kWh)</span>
            </div>
            <div className="b-metric-box">
              <span className="bm-label">Nominal Storage</span>
              <span className="bm-val">500 kWh</span>
            </div>
          </div>
        </div>

        {/* 24h SOC Trajectory Sparkline */}
        <div className="soc-sparkline-section">
          <div className="sparkline-header">
            <span>24-Hour SOC Trajectory (%)</span>
            <span className="sparkline-legend">Safety Floor: 10% (50 kWh)</span>
          </div>
          <div className="sparkline-container">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="sparkline-placeholder">
                <Battery size={22} className="empty-soc-icon" />
                <span>Simulation curve will display after forecast</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
