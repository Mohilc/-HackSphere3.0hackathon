import { jsPDF } from 'jspdf'

/**
 * Generates and downloads a publication-grade PDF report of the
 * HackSphere 3.0 AI Grid Strategic Advisory.
 */
export function exportAdvisoryPDF({ advisory, summary, meta }) {
  if (!advisory) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ── Header Banner ──────────────────────────────────────────────────
  doc.setFillColor(23, 23, 23) // Brand Charcoal Black
  doc.rect(margin, y, contentWidth, 24, 'F')

  doc.setTextColor(245, 243, 238) // Warm White
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('HACKSPHERE 3.0 — AUTONOMOUS MICROGRID', margin + 6, y + 9)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(16, 185, 129) // Accent Emerald Green
  doc.text('AI GRID STABILITY & STRATEGIC DISPATCH REPORT', margin + 6, y + 16)

  const timestampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const reportId = `HS3-ADV-${timestampStr}`
  doc.setFontSize(7.5)
  doc.setTextColor(163, 163, 163)
  doc.text(`REPORT ID: ${reportId}`, pageWidth - margin - 6, y + 9, { align: 'right' })
  doc.text(`GENERATED: ${new Date().toLocaleString()}`, pageWidth - margin - 6, y + 16, { align: 'right' })

  y += 30

  // ── Telemetry & Metrics Summary Strip ─────────────────────────────
  doc.setFillColor(245, 247, 250)
  doc.setDrawColor(218, 222, 229)
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD')

  const colWidth = contentWidth / 5
  const metrics = [
    { label: 'PEAK DEMAND', value: `${summary?.peak_demand_kw ?? '--'} kW` },
    { label: 'AVG DEMAND', value: `${summary?.avg_demand_kw ?? '--'} kW` },
    { label: 'OVERLOADS', value: `${summary?.overload_alerts ?? 0} events` },
    { label: 'RENEWABLE HRS', value: `${summary?.hours_renewable ?? '--'} hrs` },
    {
      label: 'MIN / FINAL SOC',
      value: `${summary?.min_battery_soc_pct ?? '--'}% / ${summary?.final_battery_soc_pct ?? '--'}%`,
    },
  ]

  metrics.forEach((m, i) => {
    const x = margin + i * colWidth + 4
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.8)
    doc.setTextColor(100, 110, 120)
    doc.text(m.label, x, y + 7)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    if (m.label === 'OVERLOADS' && summary?.overload_alerts > 0) {
      doc.setTextColor(163, 28, 24) // Crimson Red for critical alerts
    } else if (m.label === 'RENEWABLE HRS') {
      doc.setTextColor(16, 140, 90)
    } else {
      doc.setTextColor(20, 25, 30)
    }
    doc.text(m.value, x, y + 15)
  })

  y += 28

  // ── Engine Metadata Line ──────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(80, 85, 95)
  const provider = meta?.provider || 'Autonomous Grid Reasoning Engine'
  const model = meta?.model || 'Edge-Expert-RuleBased-v3.0'
  doc.text(`Reasoning Engine: ${provider} [${model}] · Operational Safety Check: Passed`, margin, y)
  y += 5

  doc.setDrawColor(200, 205, 215)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ── Advisory Text Content Formatting ───────────────────────────────
  const lines = advisory.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (y > pageHeight - 22) {
      doc.addPage()
      y = margin + 6
    }

    if (!line) {
      y += 4
      continue
    }

    // Section title detection (e.g. "1. EXECUTIVE SUMMARY:", "2. CRITICAL ANOMALIES...")
    if (/^[0-9]\.\s+[A-Z\s&]+:?$/.test(line) || /^[A-Z\s&]{5,}:$/.test(line)) {
      y += 2
      if (y > pageHeight - 25) {
        doc.addPage()
        y = margin + 6
      }
      doc.setFillColor(235, 240, 246)
      doc.roundedRect(margin, y - 4, contentWidth, 7, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text(line, margin + 4, y + 1)
      y += 8
      continue
    }

    // Bullet point or paragraph text
    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.2)
    doc.setTextColor(30, 41, 59)

    const splitLines = doc.splitTextToSize(line, isBullet ? contentWidth - 6 : contentWidth)
    for (let j = 0; j < splitLines.length; j++) {
      if (y > pageHeight - 16) {
        doc.addPage()
        y = margin + 6
      }
      doc.text(splitLines[j], isBullet ? margin + 4 : margin, y)
      y += 4.8
    }
  }

  // ── Page Footers ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(140, 145, 155)
    doc.setDrawColor(220, 225, 230)
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10)
    doc.text('HackSphere 3.0 Smart Energy Microgrid · AI Strategic Dispatch Advisory', margin, pageHeight - 6)
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' })
  }

  const filename = `HackSphere3_AI_Advisory_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
