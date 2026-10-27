import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Activity, ShieldAlert, Sun, Power } from 'lucide-react'
import './DemandChart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function DemandChart({ forecast }) {
  const hourlyData = forecast?.forecast?.hourly || []

  const chartData = useMemo(() => {
    if (!hourlyData.length) return null

    const labels = hourlyData.map((d) => {
      const date = new Date(d.timestamp)
      const hourStr = isNaN(date.getTime())
        ? `H+${d.hour || 0}`
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      return hourStr
    })

    const demands = hourlyData.map((d) => d.predicted_demand_kw)
    const threshold160 = hourlyData.map(() => 160)
    const threshold200 = hourlyData.map(() => 200)

    const pointBg = hourlyData.map((d) => {
      if (d.overload_alert) return '#ef4444' // Red for overload >= 200 kW
      if (d.grid_mode === 'Renewable Storage') return '#10b981' // Green for Renewable Mode
      return '#64748b' // Dark Neutral for Main Grid
    })

    const pointRadius = hourlyData.map((d) => {
      if (d.overload_alert) return 6.5
      if (d.grid_mode === 'Renewable Storage') return 4.5
      return 3.5
    })

    return {
      labels,
      datasets: [
        {
          label: 'Critical Overload (200 kW)',
          data: threshold200,
          borderColor: 'rgba(239, 68, 68, 0.85)',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Renewable Threshold (160 kW)',
          data: threshold160,
          borderColor: 'rgba(16, 185, 129, 0.75)',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Predicted Demand (kW)',
          data: demands,
          borderColor: '#10b981',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 360)
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.22)')
            gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)')
            gradient.addColorStop(1, 'rgba(8, 10, 15, 0.0)')
            return gradient
          },
          borderWidth: 2.5,
          pointBackgroundColor: pointBg,
          pointBorderColor: '#0a0d14',
          pointBorderWidth: 2,
          pointRadius: pointRadius,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.32,
        },
      ],
    }
  }, [hourlyData])

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#94a3b8',
          boxWidth: 14,
          boxHeight: 14,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: '#0c0f17',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#262d3d',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          afterBody: (context) => {
            const idx = context[0]?.dataIndex
            if (idx === undefined || !hourlyData[idx]) return []
            const item = hourlyData[idx]
            return [
              `⚡ Mode: ${item.grid_mode}`,
              `🔋 Battery SOC: ${item.battery_soc_pct}% (${item.battery_soc_kwh} kWh)`,
              `⏱ Peak Window (18–22h): ${item.is_peak_hour ? 'ACTIVE' : 'NO'}`,
              item.overload_alert ? '🚨 CRITICAL OVERLOAD (≥200 kW)' : '',
            ].filter(Boolean)
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
      },
      y: {
        min: 0,
        suggestedMax: 240,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `${value} kW`,
        },
      },
    },
  }), [hourlyData])

  return (
    <div className="demand-chart-card">
      <div className="chart-header">
        <div className="chart-title-group">
          <div className="chart-icon-box">
            <Activity className="chart-icon" size={20} />
          </div>
          <div>
            <h3>24-Hour Microgrid Demand Forecast</h3>
            <p className="chart-subtitle">
              Predicted load (kW) vs. Automated Power Source Switching Thresholds
            </p>
          </div>
        </div>

        <div className="chart-legend-pills">
          <span className="pill pill-renewable">
            <Sun size={12} /> Renewable (&gt;160 kW or 18–22h)
          </span>
          <span className="pill pill-grid">
            <Power size={12} /> Main Grid (&le;160 kW)
          </span>
          <span className="pill pill-overload">
            <ShieldAlert size={12} /> Overload (&ge;200 kW)
          </span>
        </div>
      </div>

      <div className="chart-container">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="chart-empty-state">
            <Activity size={44} className="empty-icon" />
            <h4>No Active Telemetry Forecast</h4>
            <p>
              Run the 24-hour simulation below or upload a custom telemetry CSV to generate predictive demand curves.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
