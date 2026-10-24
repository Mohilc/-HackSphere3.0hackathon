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
import './App.css'

export default function App() {
  const [forecast, setForecast] = useState(null)
  const [logs, setLogs] = useState([
    { time: new Date(), level: 'info', message: 'System initialized. Ready for forecast.' },
  ])

  const addLog = useCallback((level, message) => {
    setLogs(prev => [{ time: new Date(), level, message }, ...prev].slice(0, 100))
  }, [])

  const handleForecast = useCallback((data) => {
    setForecast(data)
    addLog('success', `Forecast complete: ${data.forecast.summary.total_hours} hours processed.`)
    if (data.forecast.summary.overload_alerts > 0) {
      addLog('error', `⚠ ${data.forecast.summary.overload_alerts} CRITICAL OVERLOAD alert(s) detected!`)
    }
  }, [addLog])

  const overloadCount = forecast?.forecast?.summary?.overload_alerts ?? 0

  return (
    <div className="app">
      <AlertBanner count={overloadCount} forecast={forecast} />
      <Header />

      <main className="main-content">
        <KPIStrip forecast={forecast} />

        <section className="charts-row">
          <DemandChart forecast={forecast} />
        </section>

        <section className="dual-row">
          <GridTimeline forecast={forecast} />
          <BatteryPanel forecast={forecast} />
        </section>

        <AiAdvisoryPanel forecast={forecast} addLog={addLog} />

        <section className="controls-row">
          <QuickForecast onForecast={handleForecast} addLog={addLog} />
          <CSVUpload onForecast={handleForecast} addLog={addLog} />
          <ManualInput addLog={addLog} />
        </section>

        <SystemLog logs={logs} onClear={() => setLogs([])} />
      </main>

      <Footer />
    </div>
  )
}
