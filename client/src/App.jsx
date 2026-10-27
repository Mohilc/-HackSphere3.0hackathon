import { useState, useCallback } from 'react'
import Header from './components/Header'
import AlertBanner from './components/AlertBanner'
import KPIStrip from './components/KPIStrip'
import DemandChart from './components/DemandChart'
import GridTimeline from './components/GridTimeline'
import BatteryPanel from './components/BatteryPanel'
import QuickForecast from './components/QuickForecast'
import CSVUpload from './components/CSVUpload'
import ManualInput from './components/ManualInput'
import SystemLog from './components/SystemLog'
import AiAdvisoryPanel from './components/AiAdvisoryPanel'
import Footer from './components/Footer'
import { getDemoForecast } from './services/api'
import { Download, Table, Layers, ShieldCheck, Sun, Power, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [forecast, setForecast] = useState(null)
  const [loadingSim, setLoadingSim] = useState(false)
  const [logs, setLogs] = useState([
    { time: new Date(), level: 'info', message: 'MICROGRID / INTELLIGENCE operational. Ready for telemetry stream.' },
  ])

  const addLog = useCallback((level, message) => {
    setLogs((prev) => [{ time: new Date(), level, message }, ...prev].slice(0, 100))
  }, [])

  const handleForecast = useCallback(
    (data) => {
      setForecast(data)
      addLog('success', `Forecast generated: ${data.forecast.summary.total_hours} hourly horizons computed.`)
      if (data.forecast.summary.overload_alerts > 0) {
        addLog('error', `CRITICAL ALARM: ${data.forecast.summary.overload_alerts} hour(s) exceed 200 kW overload limit!`)
      }
    },
    [addLog]
  )

  const handleHeaderQuickSim = async () => {
    try {
      setLoadingSim(true)
      addLog('info', 'Invoking QuickML 24-hour simulation from global navigation...')
      const res = await getDemoForecast()
      if (res.success) {
        handleForecast(res)
      }
    } catch (err) {
      addLog('error', `Simulation failed: ${err.message}`)
    } finally {
      setLoadingSim(false)
    }
  }

  // Export current forecast predictions to CSV
  const handleExportCSV = () => {
    if (!forecast?.forecast?.hourly) return
    const headers = 'timestamp,predicted_demand_kw,grid_mode,is_peak_hour,overload_alert,battery_soc_pct,battery_soc_kwh,energy_flow_kw\n'
    const rows = forecast.forecast.hourly
      .map(
        (h) =>
          `"${h.timestamp}",${h.predicted_demand_kw},"${h.grid_mode}",${h.is_peak_hour},${h.overload_alert},${h.battery_soc_pct},${h.battery_soc_kwh},${h.energy_flow_kw}`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `microgrid_forecast_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addLog('success', 'Forecast report CSV exported to local filesystem.')
  }

  const overloadCount = forecast?.forecast?.summary?.overload_alerts ?? 0
  const hourlyData = forecast?.forecast?.hourly || []

  return (
    <div className="app">
      <AlertBanner count={overloadCount} forecast={forecast} />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTriggerForecast={handleHeaderQuickSim}
        loading={loadingSim}
      />

      <main className="main-content">
        {/* ════════════════════════════════════════════════════════════════
            01 — OVERVIEW
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="view-container">
            <div className="view-intro">
              <span className="section-kicker">01 / Operational Overview</span>
              <h2 className="editorial-heading">Microgrid Demand & Storage Cockpit</h2>
              <p className="section-description">
                Real-time 24-hour demand projections, automated power routing status, and 500 kWh localized energy storage telemetry.
              </p>
            </div>

            <KPIStrip forecast={forecast} />

            <section className="charts-row">
              <DemandChart forecast={forecast} />
            </section>

            <section className="charts-row">
              <GridTimeline forecast={forecast} />
            </section>

            <section className="dual-row">
              <BatteryPanel forecast={forecast} />
              <QuickForecast onForecast={handleForecast} addLog={addLog} />
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            02 — MANUAL INPUT
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'manual' && (
          <div className="view-container">
            <div className="view-intro">
              <span className="section-kicker">02 / Telemetry Ingestion</span>
              <h2 className="editorial-heading">Manual Environmental Telemetry Probe</h2>
              <p className="section-description">
                Directly simulate point sensor readings for outdoor ambient temperature, relative humidity, and solar potential to observe instantaneous transition dispatch decisions.
              </p>
            </div>

            <div className="split-view">
              <div className="split-main">
                <ManualInput addLog={addLog} />
              </div>
              <div className="split-aside">
                <div className="guide-card">
                  <div className="guide-header">
                    <ShieldCheck size={18} className="text-green" />
                    <h4>Controller Decision Rules</h4>
                  </div>
                  <ul className="guide-rules-list">
                    <li>
                      <strong>Renewable Storage Mode:</strong> Dispatched if predicted demand exceeds <strong>160 kW</strong> OR hour is within the evening peak window (<strong>18:00–22:00</strong>).
                    </li>
                    <li>
                      <strong>Main Grid Mode:</strong> Active when demand is <strong>&le; 160 kW</strong> during off-peak hours to recharge the battery.
                    </li>
                    <li>
                      <strong>Critical Overload:</strong> Independently flagged when demand is <strong>&ge; 200 kW</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            03 — FILE UPLOAD
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'upload' && (
          <div className="view-container">
            <div className="view-intro">
              <span className="section-kicker">03 / Data Ingestion</span>
              <h2 className="editorial-heading">Batch Telemetry File Upload</h2>
              <p className="section-description">
                Import CSV files containing weather features and timestamps to evaluate 24-hour demand schedules and generate transition timelines.
              </p>
            </div>

            <div className="split-view">
              <div className="split-main">
                <CSVUpload onForecast={handleForecast} addLog={addLog} />
              </div>
              <div className="split-aside">
                <div className="guide-card">
                  <div className="guide-header">
                    <FileSpreadsheet size={18} className="text-green" />
                    <h4>Ingestion Specifications</h4>
                  </div>
                  <div className="schema-table-wrap">
                    <table className="schema-table">
                      <thead>
                        <tr>
                          <th>Column</th>
                          <th>Type</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>timestamp</code></td>
                          <td>Date/Time</td>
                          <td>YYYY-MM-DD HH:MM:SS</td>
                        </tr>
                        <tr>
                          <td><code>ambient_temp_c</code></td>
                          <td>Float</td>
                          <td>Outdoor ambient °C</td>
                        </tr>
                        <tr>
                          <td><code>humidity_pct</code></td>
                          <td>Float</td>
                          <td>Relative humidity %</td>
                        </tr>
                        <tr>
                          <td><code>solar_irradiance_wm2</code></td>
                          <td>Float</td>
                          <td>Solar potential W/m²</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="doc-note">
                    <strong>Document Notice:</strong> Telemetry ingestion strictly requires structured numerical CSV data. PDF documents (such as problem briefs) are not valid telemetry series and will not be parsed into numeric predictions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            04 — FORECAST ANALYSIS
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analysis' && (
          <div className="view-container">
            <div className="view-intro">
              <span className="section-kicker">04 / Predictive Insights</span>
              <h2 className="editorial-heading">24-Hour Horizon Demand Analysis</h2>
              <p className="section-description">
                Inspect load peaks, average baselines, threshold crossings, and hour-by-hour forecast figures.
              </p>
            </div>

            <KPIStrip forecast={forecast} />

            <section className="charts-row">
              <DemandChart forecast={forecast} />
            </section>

            {/* Detailed Hourly Table */}
            <div className="analysis-card">
              <div className="analysis-header">
                <div className="analysis-title">
                  <Table size={18} />
                  <h3>Hourly Forecast & Dispatch Schedule</h3>
                </div>
                {hourlyData.length > 0 && (
                  <span className="analysis-badge">{hourlyData.length} Intervals Evaluated</span>
                )}
              </div>

              {hourlyData.length === 0 ? (
                <div className="table-empty-state">
                  <p>No active forecast loaded. Run a 24h simulation or upload a CSV to inspect hourly data.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Interval</th>
                        <th>Predicted Demand</th>
                        <th>Threshold Status</th>
                        <th>Dispatched Mode</th>
                        <th>Peak Window</th>
                        <th>Battery SOC</th>
                        <th>Net Flow</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hourlyData.map((row, idx) => (
                        <tr key={idx} className={row.overload_alert ? 'row-overload' : ''}>
                          <td className="font-mono">{row.timestamp}</td>
                          <td className="font-mono font-bold">{row.predicted_demand_kw} kW</td>
                          <td>
                            {row.overload_alert ? (
                              <span className="badge-critical">CRITICAL OVERLOAD (&ge;200 kW)</span>
                            ) : row.predicted_demand_kw > 160 ? (
                              <span className="badge-warning">High Demand (&gt;160 kW)</span>
                            ) : (
                              <span className="badge-normal">Normal Base</span>
                            )}
                          </td>
                          <td>
                            <span className={row.grid_mode === 'Renewable Storage' ? 'text-renewable' : 'text-grid'}>
                              {row.grid_mode}
                            </span>
                          </td>
                          <td>{row.is_peak_hour ? <span className="tag-peak">18:00–22:00</span> : '—'}</td>
                          <td className="font-mono">{row.battery_soc_pct}% ({row.battery_soc_kwh} kWh)</td>
                          <td className="font-mono">{row.energy_flow_kw > 0 ? `+${row.energy_flow_kw}` : row.energy_flow_kw} kW</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            05 — ENERGY CONTROL
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'control' && (
          <div className="view-container">
            <div className="view-intro">
              <span className="section-kicker">05 / Transition Routing</span>
              <h2 className="editorial-heading">Automated Grid & Storage Controller</h2>
              <p className="section-description">
                Autonomous power dispatch routing between Main Grid base and 500 kWh localized Battery Storage based on predicted demand and peak windows.
              </p>
            </div>

            <section className="dual-row">
              <GridTimeline forecast={forecast} />
              <BatteryPanel forecast={forecast} />
            </section>

            <div className="control-rules-grid">
              <div className="rule-card">
                <div className="rule-badge ren">
                  <Sun size={14} /> RULE 1: RENEWABLE DISPATCH
                </div>
                <h4>Peak Shaving & Evening Protection</h4>
                <p>
                  Triggered whenever predicted demand exceeds <strong>160.0 kW</strong> OR the timestamp falls within <strong>18:00 to 22:00 inclusive</strong>. The 500 kWh battery discharges to support local load.
                </p>
              </div>

              <div className="rule-card">
                <div className="rule-badge grid">
                  <Power size={14} /> RULE 2: MAIN GRID DISPATCH
                </div>
                <h4>Base Load & Overnight Charging</h4>
                <p>
                  Active when demand is <strong>&le; 160.0 kW</strong> outside peak windows. Main grid supplies base load while the battery recharges at <strong>50 kW</strong> (92% roundtrip efficiency).
                </p>
              </div>

              <div className="rule-card">
                <div className="rule-badge ovl">
                  <AlertTriangle size={14} /> RULE 3: CRITICAL OVERLOAD
                </div>
                <h4>System Protection Threshold</h4>
                <p>
                  Independently triggered whenever demand reaches or exceeds <strong>200.0 kW</strong>. Emits high-priority alarms to grid operators regardless of active mode.
                </p>
              </div>

              <div className="rule-card">
                <div className="rule-badge" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}>
                  <ShieldCheck size={14} /> RULE 4: RESERVE FLOOR LOCK
                </div>
                <h4>Emergency Cell Protection</h4>
                <p>
                  Automatic cutoff engaged at <strong>10.0% SOC (50 kWh reserve floor)</strong>. Battery discharge is immediately suspended to preserve lithium health, routing demand safely to Main Grid.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            06 — AI ADVISORY
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'advisory' && (
          <AiAdvisoryPanel
            forecast={forecast}
            setForecast={setForecast}
            addLog={addLog}
          />
        )}

        {/* ════════════════════════════════════════════════════════════════
            07 — REPORTS
            ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reports' && (
          <div className="view-container">
            <div className="view-intro">
              <span className="section-kicker">07 / Operational Reports</span>
              <h2 className="editorial-heading">24-Hour Horizon Operational Report</h2>
              <p className="section-description">
                Comprehensive summary of forecasting results, mode dispatches, and overload events ready for audit and CSV export.
              </p>
            </div>

            <div className="reports-card">
              <div className="reports-top-bar">
                <div>
                  <h3>Forecast Horizon Audit Summary</h3>
                  <p className="reports-subtitle">Generated by Catalyst QuickML Engine</p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleExportCSV}
                  disabled={hourlyData.length === 0}
                >
                  <Download size={15} /> Export Forecast CSV
                </button>
              </div>

              {forecast?.forecast?.summary ? (
                <div className="summary-grid">
                  <div className="summary-stat-box">
                    <span className="stat-title">Horizon Coverage</span>
                    <span className="stat-num">{forecast.forecast.summary.total_hours} Hours</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Average Demand</span>
                    <span className="stat-num">{forecast.forecast.summary.avg_demand_kw} kW</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Peak Demand</span>
                    <span className="stat-num">{forecast.forecast.summary.peak_demand_kw} kW</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Renewable Hours</span>
                    <span className="stat-num text-green">{forecast.forecast.summary.hours_renewable} Hours</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Main Grid Hours</span>
                    <span className="stat-num">{forecast.forecast.summary.hours_main_grid} Hours</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Critical Overloads</span>
                    <span className={`stat-num ${forecast.forecast.summary.overload_alerts > 0 ? 'text-red' : ''}`}>
                      {forecast.forecast.summary.overload_alerts} Events
                    </span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Min Battery SOC</span>
                    <span className="stat-num">{forecast.forecast.summary.min_battery_soc_pct}%</span>
                  </div>
                  <div className="summary-stat-box">
                    <span className="stat-title">Final Battery SOC</span>
                    <span className="stat-num">{forecast.forecast.summary.final_battery_soc_pct}%</span>
                  </div>
                </div>
              ) : (
                <div className="table-empty-state">
                  <p>No forecast report generated yet. Run a simulation or upload telemetry data to view the report.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <SystemLog logs={logs} onClear={() => setLogs([])} />
      </main>

      <Footer />
    </div>
  )
}
