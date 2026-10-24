import { useMemo, useState } from 'react'
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
import { Activity, ShieldAlert, Zap, Layers } from 'lucide-react'
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
  const [filterMode, setFilterMode] = useState('all') // 'all', 'peak', 'overload'

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
      if (d.overload_alert) return '#ef4444' // Red alert
      if (d.is_peak_hour || d.predicted_demand_kw > 160) return '#f59e0b' // Orange renewable
      return '#00f0ff' // Cyan normal
    })

    const pointRadius = hourlyData.map((d) => {
      if (d.overload_alert) return 6
      if (d.is_peak_hour) return 5
      return 3.5
    })

    return {
      labels,
      datasets: [
        {
          label: 'Critical Overload (200 kW)',
          data: threshold200,
          borderColor: 'rgba(239, 68, 68, 0.7)',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Renewable Storage Threshold (160 kW)',
          data: threshold160,
          borderColor: 'rgba(245, 158, 11, 0.7)',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
        {
          label: 'Predicted Demand (kW)',
          data: demands,
          borderColor: '#00f0ff',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 360)
            gradient.addColorStop(0, 'rgba(0, 240, 255, 0.35)')
            gradient.addColorStop(0.6, 'rgba(139, 92, 246, 0.12)')
            gradient.addColorStop(1, 'rgba(12, 18, 34, 0.0)')
            return gradient
          },
          borderWidth: 2.5,
          pointBackgroundColor: pointBg,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: pointRadius,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.35,
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
          color: '#8892a8',
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 16, 32, 0.95)',
        titleColor: '#e8eaf6',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(0, 240, 255, 0.3)',
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
              `Grid Mode: ${item.grid_mode}`,
              `Peak Window (18-22h): ${item.is_peak_hour ? 'YES' : 'NO'}`,
              `Battery SOC: ${item.battery_soc_pct}%`,
              item.overload_alert ? '🚨 CRITICAL OVERLOAD ALERT' : '',
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
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
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
            <Activity className="chart-icon" />
          </div>
          <div>
            <h3>24-Hour Microgrid Demand Forecast</h3>
            <p className="chart-subtitle">
              Real-time predictive telemetry · QuickML ML Engine · Dynamic Switch Thresholds
            </p>
          </div>
        </div>

        <div className="chart-badges">
          <span className="badge badge-cyan">
            <Zap size={13} /> Main &lt; 160 kW
          </span>
          <span className="badge badge-amber">
            <Layers size={13} /> Renewable &ge; 160 kW | 18-22h
          </span>
          <span className="badge badge-red">
            <ShieldAlert size={13} /> Overload &ge; 200 kW
          </span>
        </div>
      </div>

      <div className="chart-container">
        {chartData ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="chart-empty-state">
            <Activity size={48} className="empty-icon pulse-animation" />
            <h4>No Active Telemetry Forecast</h4>
            <p>
              Trigger a 24-hour simulation below or upload a custom CSV dataset to view real-time energy demand curves and controller decisions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
