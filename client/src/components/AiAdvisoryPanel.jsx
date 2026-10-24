import { useState } from 'react'
import { BrainCircuit, Sparkles, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react'
import { postAiAdvisory } from '../services/api'
import './AiAdvisoryPanel.css'

export default function AiAdvisoryPanel({ forecast, addLog }) {
  const [advisory, setAdvisory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelName, setModelName] = useState(null)

  const summary = forecast?.forecast?.summary

  const handleGenerate = async () => {
    if (!summary) {
      addLog?.('error', 'Please run a demand forecast before generating an AI Advisory.')
      return
    }

    try {
      setLoading(true)
      addLog?.('info', 'Invoking NVIDIA NIM Multi-Model Pool for grid stability reasoning...')
      const res = await postAiAdvisory(summary)

      if (res.success) {
        setAdvisory(res.advisory)
        setModelName(res.model)
        addLog?.('success', `NVIDIA NIM Advisory generated using [${res.model}]`)
      } else {
        throw new Error(res.error || 'Failed to generate advisory')
      }
    } catch (err) {
      addLog?.('error', `AI Advisory error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-advisory-card">
      <div className="ai-header">
        <div className="ai-title-group">
          <div className="ai-icon-box">
            <BrainCircuit className="ai-icon" />
          </div>
          <div>
            <div className="ai-tag-row">
              <h3>NVIDIA NIM Autonomous Grid Advisory</h3>
              <span className="nim-pill">
                <Cpu size={12} /> NVIDIA NIM Pool
              </span>
            </div>
            <p className="ai-subtitle">
              Deep reasoning & automated power dispatch recommendations (DiffusionGemma / Nemotron)
            </p>
          </div>
        </div>

        <button
          className="ai-gen-btn"
          onClick={handleGenerate}
          disabled={loading || !forecast}
          title={!forecast ? 'Run a forecast first' : 'Generate AI dispatch analysis'}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="btn-spinner" /> Generating Advisory...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Generate AI Strategic Advisory
            </>
          )}
        </button>
      </div>

      <div className="ai-body">
        {!forecast ? (
          <div className="ai-empty-prompt">
            <BrainCircuit size={32} className="ai-empty-ico" />
            <p>Run a 24-hour simulation or upload a CSV to enable AI grid dispatch reasoning.</p>
          </div>
        ) : !advisory ? (
          <div className="ai-ready-banner">
            <div className="ready-info">
              <span className="ready-title">Forecast Data Ready for AI Evaluation</span>
              <span className="ready-meta">
                Peak: {summary?.peak_demand_kw} kW · Overloads: {summary?.overload_alerts} · Final SOC: {summary?.final_battery_soc_pct}%
              </span>
            </div>
            <span className="click-hint">Click &ldquo;Generate AI Strategic Advisory&rdquo; to analyze</span>
          </div>
        ) : (
          <div className="ai-result-content">
            {modelName && (
              <div className="ai-meta-bar">
                <span>Model: <strong>{modelName}</strong></span>
                <span>Latency: Real-Time Stream</span>
                <span>Status: Verified Safe Dispatch Plan</span>
              </div>
            )}
            <div className="ai-text-formatted">
              <pre>{advisory}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
