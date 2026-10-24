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
import { BatteryCharging, Battery, Zap, AlertTriangle, ShieldCheck } from 'lucide-react'
import './BatteryPanel.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function BatteryPanel({ forecast }) {
  const summary = forecast?.forecast?.summary
  const hourly = forecast?.forecast?.hourly || []

  const currentSOC = hourly.length > 0 ? hourly[0].battery_soc_pct : 80.0
  const minSOC = summary?.min_battery_soc_pct ?? 80.0
  const finalSOC = summary?.final_battery_soc_pct ?? 80.0

  const chartData = useMemo(() => {
    if (!hourly.length) return null
    return {
      labels: hourly.map((d) => {
        const date = new Date(d.timestamp)
        return isNaN(date.getTime())
          ? `${d.hour}:00`
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
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
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
        backgroundColor: 'rgba(10, 16, 32, 0.95)',
        titleColor: '#e8eaf6',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        borderWidth: 1,
        callbacks: {
          label: (context) => `SOC: ${context.parsed.y}%`,
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

  // Determine battery level color
  const getBatteryColor = (pct) => {
    if (pct <= 20) return 'var(--accent-red)'
    if (pct <= 45) return 'var(--accent-orange)'
    return 'var(--accent-green)'
  }

  return (
    <div className="battery-panel-card">
      <div className="battery-header">
        <div className="battery-title-group">
          <div className="battery-icon-box">
            <BatteryCharging className="battery-icon" />
          </div>
          <div>
            <h3>500 kWh Storage Simulation</h3>
            <p className="battery-subtitle">
              Dynamic dispatch · 92% Round-trip efficiency · 50 kW Charge rate
            </p>
          </div>
        </div>

        <div className="battery-badge">
          {minSOC <= 15 ? (
            <span className="b-pill warning">
              <AlertTriangle size={12} /> Low Reserve Risk
            </span>
          ) : (
            <span className="b-pill healthy">
              <ShieldCheck size={12} /> Buffer Optimal
            </span>
          )}
        </div>
      </div>

      <div className="battery-body">
        {/* Visual SOC indicator */}
        <div className="battery-visual-section">
          <div className="gauge-container">
            <div className="battery-shell">
              <div
                className="battery-fill"
                style={{
                  width: `${Math.min(100, Math.max(0, currentSOC))}%`,
                  background: `linear-gradient(90deg, ${getBatteryColor(currentSOC)}, #34d399)`,
                }}
              ></div>
              <div className="battery-tip"></div>
            </div>
            <div className="gauge-label">
              <span className="soc-val" style={{ color: getBatteryColor(currentSOC) }}>
                {currentSOC}%
              </span>
              <span className="soc-caption">Current Sim SOC</span>
            </div>
          </div>

          <div className="battery-metrics-grid">
            <div className="b-metric-box">
              <span className="bm-label">Min Forecast SOC</span>
              <span className="bm-val" style={{ color: minSOC <= 20 ? '#ef4444' : '#e2e8f0' }}>
                {minSOC}%
              </span>
            </div>
            <div className="b-metric-box">
              <span className="bm-label">Final 24h SOC</span>
              <span className="bm-val">{finalSOC}%</span>
            </div>
            <div className="b-metric-box">
              <span className="bm-label">Floor Cutoff</span>
              <span className="bm-val">10% (50 kWh)</span>
            </div>
            <div className="b-metric-box">
              <span className="bm-label">Nominal Cap</span>
              <span className="bm-val">500 kWh</span>
            </div>
          </div>
        </div>

        {/* Mini line graph for SOC over time */}
        <div className="soc-sparkline-section">
          <div className="sparkline-header">
            <span>24h State-of-Charge Trajectory</span>
            <span className="sparkline-legend">10% Floor Limit</span>
          </div>
          <div className="sparkline-container">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="sparkline-placeholder">
                <Battery size={24} className="empty-soc-icon" />
                <span>Simulation curve will display after forecast</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
