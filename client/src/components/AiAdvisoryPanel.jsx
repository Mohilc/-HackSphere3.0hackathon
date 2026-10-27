import { useState } from 'react'
import {
  BrainCircuit,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Copy,
  Check,
  Download,
  Zap,
  BatteryCharging,
  ListChecks,
  Eye,
  FileCode,
} from 'lucide-react'
import { postAiAdvisory, getDemoForecast } from '../services/api'
import { exportAdvisoryPDF } from '../utils/pdfExport'
import './AiAdvisoryPanel.css'

export default function AiAdvisoryPanel({ forecast, setForecast, addLog }) {
  const [advisory, setAdvisory] = useState(null)
  const [sections, setSections] = useState(null)
  const [viewMode, setViewMode] = useState('executive') // 'executive' or 'raw'
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [meta, setMeta] = useState(null)

  const summary = forecast?.forecast?.summary

  const handleGenerate = async () => {
    let targetSummary = summary

    // If no forecast exists yet, automatically load the 24h baseline simulation first
    if (!targetSummary) {
      try {
        setLoading(true)
        addLog?.('info', 'Loading 24h horizon baseline for AI Advisory...')
        const demoRes = await getDemoForecast()
        if (demoRes.success) {
          setForecast?.(demoRes)
          targetSummary = demoRes.forecast.summary
        } else {
          throw new Error('Could not load simulation baseline')
        }
      } catch (e) {
        addLog?.('error', `Failed to load baseline: ${e.message}`)
        setLoading(false)
        return
      }
    }

    try {
      setLoading(true)
      const res = await postAiAdvisory(targetSummary)

      if (res.success) {
        setAdvisory(res.advisory)
        setSections(res.sections || null)
        setMeta({
          provider: res.provider || 'Autonomous Grid Reasoning Engine',
          model: res.model || 'Edge-Expert-RuleBased-v3.0',
        })
        addLog?.('success', `Advisory synthesized in real-time via [${res.provider || 'Autonomous Engine'}]`)
      } else {
        throw new Error(res.error || 'Failed to generate advisory')
      }
    } catch (err) {
      addLog?.('error', `AI Advisory error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!advisory) return
    navigator.clipboard.writeText(advisory)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addLog?.('info', 'AI Advisory copied to clipboard.')
  }

  const handleDownloadPDF = () => {
    if (!advisory) return
    try {
      exportAdvisoryPDF({ advisory, summary, meta })
      addLog?.('success', 'AI Strategic Advisory PDF report downloaded.')
    } catch (e) {
      addLog?.('error', `Failed to export PDF: ${e.message}`)
    }
  }

  // Derive status fallback if sections not structured
  const isOverload = (summary?.overload_alerts ?? 0) > 0
  const isElevated = (summary?.peak_demand_kw ?? 0) > 160
  const statusLevel = sections?.status_level || (isOverload ? 'CRITICAL' : isElevated ? 'CAUTION' : 'NOMINAL')

  return (
    <div className="ai-advisory-view">
      {/* Intro Header */}
      <div className="view-intro">
        <span className="section-kicker">06 — STRATEGIC DISPATCH REASONING</span>
        <h2 className="editorial-heading">AI Grid Strategic Advisory</h2>
        <p className="section-description">
          Real-time autonomous engineering reasoning engine analyzing 24-hour demand peaks, battery depth-of-discharge,
          and transition risks with instantaneous (<span className="text-emerald">sub-50ms</span>) evaluation.
        </p>
      </div>

      {/* Main Grid Panel */}
      <div className="advisory-layout">
        {/* Left Column: Analysis & Visual Cards */}
        <div className="advisory-main-col">
          <div className="advisory-hero-card">
            <div className="advisory-hero-header">
              <div className="advisory-title-group">
                <div className="advisory-icon-frame">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <div className="advisory-tagline">
                    <h3 className="advisory-title">Autonomous Grid Reasoning & Dispatch Advisory</h3>
                    <span className="engine-badge">
                      <Cpu size={12} /> {meta?.provider || 'Autonomous Engine / NIM Ready'}
                    </span>
                  </div>
                  <p className="advisory-subtitle">
                    Generates operator-ready assessments for relay switching, peak shaving, and reserve protection.
                  </p>
                </div>
              </div>

              <div className="advisory-actions">
                {advisory && (
                  <div className="view-toggle-group">
                    <button
                      type="button"
                      className={`btn-toggle ${viewMode === 'executive' ? 'active' : ''}`}
                      onClick={() => setViewMode('executive')}
                      title="User-friendly visual executive dashboard"
                    >
                      <Eye size={13} /> Visual
                    </button>
                    <button
                      type="button"
                      className={`btn-toggle ${viewMode === 'raw' ? 'active' : ''}`}
                      onClick={() => setViewMode('raw')}
                      title="Raw monospace audit log text"
                    >
                      <FileCode size={13} /> Audit
                    </button>
                  </div>
                )}

                {advisory && (
                  <>
                    <button type="button" className="btn-secondary btn-copy" onClick={handleCopy}>
                      {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-pdf"
                      onClick={handleDownloadPDF}
                      title="Download formatted AI Advisory PDF report"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="btn-spinner" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> {advisory ? 'Re-Evaluate' : 'Generate Advisory'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Metrics context summary strip */}
            {summary && (
              <div className="advisory-context-strip">
                <div className="ctx-item">
                  <span className="ctx-lbl">Peak Demand</span>
                  <span className="ctx-val">{summary.peak_demand_kw} kW</span>
                </div>
                <div className="ctx-item">
                  <span className="ctx-lbl">Critical Overloads</span>
                  <span className={`ctx-val ${summary.overload_alerts > 0 ? 'text-crimson' : ''}`}>
                    {summary.overload_alerts} events
                  </span>
                </div>
                <div className="ctx-item">
                  <span className="ctx-lbl">Renewable Dispatch</span>
                  <span className="ctx-val">{summary.hours_renewable} hrs</span>
                </div>
                <div className="ctx-item">
                  <span className="ctx-lbl">Min Battery SOC</span>
                  <span className={`ctx-val ${summary.min_battery_soc_pct <= 10.5 ? 'text-amber' : ''}`}>
                    {summary.min_battery_soc_pct}%
                  </span>
                </div>
                <div className="ctx-item">
                  <span className="ctx-lbl">Final Battery SOC</span>
                  <span className="ctx-val">{summary.final_battery_soc_pct}%</span>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="advisory-body-card">
              {!advisory && !loading ? (
                <div className="advisory-empty-state">
                  <div className="empty-symbol">
                    <BrainCircuit size={36} />
                  </div>
                  <h4>No Advisory Generated Yet</h4>
                  <p>
                    {summary
                      ? 'Telemetry and 24-hour forecast data are loaded and verified. Click "Generate Advisory" for immediate engineering assessment.'
                      : 'Load or simulate a 24-hour demand forecast, then invoke the reasoning engine to synthesize operator advisories.'}
                  </p>
                  <button type="button" className="btn-primary" onClick={handleGenerate}>
                    <Sparkles size={16} /> Run Evaluation Now
                  </button>
                </div>
              ) : loading ? (
                <div className="advisory-loading-state">
                  <Loader2 size={32} className="btn-spinner" />
                  <h4>Evaluating Horizon Dynamics...</h4>
                  <p>Synthesizing transformer loading, battery reserves, and relay transition margins.</p>
                </div>
              ) : viewMode === 'executive' && sections ? (
                /* Executive Visual Cards Mode */
                <div className="executive-report-container">
                  {/* Status Banner */}
                  <div className={`exec-status-banner level-${statusLevel.toLowerCase()}`}>
                    <div className="banner-badge-col">
                      <span className={`status-pill pill-${statusLevel.toLowerCase()}`}>
                        {statusLevel === 'CRITICAL' && <ShieldAlert size={14} />}
                        {statusLevel === 'CAUTION' && <AlertTriangle size={14} />}
                        {statusLevel === 'NOMINAL' && <ShieldCheck size={14} />}
                        {sections.status_label || statusLevel}
                      </span>
                    </div>
                    <div className="banner-text-col">
                      <h4 className="banner-headline">{sections.headline}</h4>
                      <p className="banner-exec-text">{sections.executive}</p>
                    </div>
                  </div>

                  {/* 3 Detail Action Cards */}
                  <div className="exec-cards-grid">
                    {/* Card 1: Overload & Transitions */}
                    <div className="exec-card anomaly-card">
                      <div className="exec-card-header">
                        <div className="exec-card-ico ico-amber">
                          <Zap size={18} />
                        </div>
                        <div>
                          <span className="exec-card-subtitle">RISK LEVEL: {sections.anomalies.risk_level}</span>
                          <h5 className="exec-card-title">Overload & Transition Profile</h5>
                        </div>
                      </div>
                      <p className="exec-card-body">{sections.anomalies.text}</p>
                      <div className="exec-card-kpi-row">
                        <div className="kpi-micro-box">
                          <span className="kpi-lbl">PEAK LOAD</span>
                          <span className="kpi-val">{sections.anomalies.peak_kw} kW</span>
                        </div>
                        <div className="kpi-micro-box">
                          <span className="kpi-lbl">OVERLOAD HOURS</span>
                          <span className={`kpi-val ${sections.anomalies.overloads > 0 ? 'text-crimson' : ''}`}>
                            {sections.anomalies.overloads} h
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Battery & Reserves */}
                    <div className="exec-card battery-card-exec">
                      <div className="exec-card-header">
                        <div className="exec-card-ico ico-emerald">
                          <BatteryCharging size={18} />
                        </div>
                        <div>
                          <span className="exec-card-subtitle">STATUS: {sections.battery.status}</span>
                          <h5 className="exec-card-title">Battery Storage Health</h5>
                        </div>
                      </div>
                      <p className="exec-card-body">{sections.battery.text}</p>
                      <div className="exec-card-kpi-row">
                        <div className="kpi-micro-box">
                          <span className="kpi-lbl">MIN SOC REACHED</span>
                          <span className="kpi-val">{sections.battery.min_soc}%</span>
                        </div>
                        <div className="kpi-micro-box">
                          <span className="kpi-lbl">FINAL 24H SOC</span>
                          <span className="kpi-val">{sections.battery.final_soc}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Operator Action Checklist */}
                    <div className="exec-card checklist-card">
                      <div className="exec-card-header">
                        <div className="exec-card-ico ico-blue">
                          <ListChecks size={18} />
                        </div>
                        <div>
                          <span className="exec-card-subtitle">MANDATORY PROTOCOLS</span>
                          <h5 className="exec-card-title">Shift Operator Action Checklist</h5>
                        </div>
                      </div>
                      <ul className="exec-checklist">
                        {sections.checklist.map((item, idx) => (
                          <li key={idx} className="checklist-item">
                            <span className="step-num">{idx + 1}</span>
                            <span className="step-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw Monospace Audit View Mode */
                <div className="advisory-result-container">
                  {meta && (
                    <div className="advisory-meta-header">
                      <div className="meta-pill">Provider: <strong>{meta.provider}</strong></div>
                      <div className="meta-pill">Engine: <strong>{meta.model}</strong></div>
                      <div className="meta-pill status-verified"><ShieldCheck size={13} /> Verified Grid Assessment</div>
                    </div>
                  )}
                  <div className="advisory-text-block">
                    <pre className="advisory-pre">{advisory}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reasoning Architecture Guide */}
        <aside className="advisory-aside">
          <div className="guide-card">
            <h3>Engine Architecture</h3>
            <p>
              Dual-tier reasoning pipeline designed for uninterrupted microgrid operations:
            </p>
            <ul className="guide-rules-list">
              <li>
                <strong>Sub-50ms Local Inference:</strong> Deterministic expert reasoning evaluates all thermal, reserve, and switching constraints instantly.
              </li>
              <li>
                <strong>NVIDIA NIM Multi-Model Pool:</strong> DiffusionGemma & Nemotron language models for deep multi-turn strategic planning when configured.
              </li>
              <li>
                <strong>Operator Guidance:</strong> Auto-extracts risk profiles, battery reserve floor protection, and shift action checklists.
              </li>
            </ul>
          </div>

          <div className="guide-card">
            <h3>Key Dispatch Rules Applied</h3>
            <div className="rule-formula">&gt; 160 kW or 18:00–22:00 &rarr; Renewable Mode</div>
            <div className="rule-formula">&ge; 200 kW &rarr; Critical Overload Alarm</div>
            <div className="rule-formula">SOC &le; 10% (50 kWh) &rarr; Reserve Floor Lock</div>
            <p className="mt-8 text-xs text-muted">
              Advisories explicitly account for transformer thermal strain and battery degradation thresholds.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
