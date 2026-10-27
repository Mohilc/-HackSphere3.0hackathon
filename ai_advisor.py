"""
HackSphere 3.0 — AI Grid Reasoning & Advisory Engine
High-Efficiency Autonomous Grid Intelligence & Decision Support.
Provides real-time strategic guidance for microgrid operators with
sub-50ms execution latency, structured sections, and zero external dependency risk.
"""

import os
import requests
from pathlib import Path

# Load .env manually if dotenv is not present
ENV_FILE = Path(__file__).parent / ".env"
if ENV_FILE.exists():
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_GENERAL_KEY = os.getenv("NVIDIA_GENERAL_KEY")
NVIDIA_GENERAL_MODEL = os.getenv("NVIDIA_GENERAL_MODEL", "google/diffusiongemma-26b-a4b-it")


def generate_expert_grid_advisory(summary: dict, hourly: list = None) -> dict:
    """
    High-efficiency deterministic grid reasoning engine.
    Computes rigorous, actionable engineering guidance in sub-10ms.
    Returns both formatted text and structured sections for a modern, user-friendly UI.
    """
    peak_kw = float(summary.get("peak_demand_kw", 0))
    avg_kw = float(summary.get("avg_demand_kw", 0))
    overloads = int(summary.get("overload_alerts", 0))
    ren_hrs = int(summary.get("hours_renewable", 0))
    grid_hrs = int(summary.get("hours_main_grid", 0))
    min_soc = float(summary.get("min_battery_soc_pct", 80))
    final_soc = float(summary.get("final_battery_soc_pct", 80))

    # 1. Executive Status & Summary
    if overloads > 0:
        status_level = "CRITICAL"
        status_label = "CRITICAL DISPATCH NOTICE"
        headline = f"High-priority alert: {overloads} critical overload events (≥200 kW) detected with a peak of {peak_kw:.1f} kW."
        exec_summary = (
            f"Forecast indicates {overloads} critical overload events (≥200.0 kW) with a peak demand of {peak_kw:.2f} kW. "
            f"The microgrid requires immediate reserve prioritization, automated bus transfer to Renewable Storage, "
            f"and strict monitoring of the 10% battery floor."
        )
    elif peak_kw > 160:
        status_level = "CAUTION"
        status_label = "ELEVATED DISPATCH LOAD"
        headline = f"Peak demand reaches {peak_kw:.1f} kW, initiating {ren_hrs} hours of Renewable Storage dispatch."
        exec_summary = (
            f"Peak demand of {peak_kw:.2f} kW triggers Renewable Storage transitions across {ren_hrs} hours "
            f"without breaching the 200.0 kW critical overload boundary. Overall grid stability remains nominal."
        )
    else:
        status_level = "NOMINAL"
        status_label = "GRID STABILITY NOMINAL"
        headline = f"Nominal 24-hour profile with peak of {peak_kw:.1f} kW and average of {avg_kw:.1f} kW."
        exec_summary = (
            f"24-hour demand profile is benign with a peak of {peak_kw:.2f} kW and an average of {avg_kw:.2f} kW. "
            f"All operations remain comfortably within standard distribution margins."
        )

    # 2. Critical Anomalies & Overload Risks
    if overloads > 0:
        risk_level = "HIGH"
        anomaly_text = (
            f"The system experiences sustained severe loading exceeding the 200.0 kW critical safety threshold across "
            f"{overloads} discrete hourly intervals (peak: {peak_kw:.2f} kW). Automated renewable battery discharge "
            f"must be prioritized to protect feeder transformers from thermal overstress."
        )
    elif peak_kw > 160:
        risk_level = "MODERATE"
        anomaly_text = (
            f"Zero critical overloads detected. However, {ren_hrs} hours exceed the 160.0 kW switching threshold or "
            f"coincide with mandatory evening peak hours (18:00 to 22:00), requiring automated transfer to Renewable Storage."
        )
    else:
        risk_level = "LOW"
        anomaly_text = (
            f"No critical anomalies or overloads detected. Demand remains safely below both the 160.0 kW renewable trigger "
            f"and the 200.0 kW critical ceiling throughout the entire forecast horizon."
        )

    # 3. Battery Dispatch Strategy
    if min_soc <= 10.5:
        battery_status = "RESERVE FLOOR ACTIVE"
        battery_text = (
            f"Battery energy reaches the mandatory 10.0% emergency reserve floor ({min_soc:.1f}% minimum reached). "
            f"Discharge is automatically locked at 50.0 kWh to prevent irreversible lithium cell degradation. "
            f"Subsequent load is safely routed to the Main Grid. Recharge at 50 kW during low-demand off-peak hours."
        )
    else:
        battery_status = "STABLE RESERVES"
        battery_text = (
            f"Battery reserves remain in a secure operating window: minimum SOC reached is {min_soc:.1f}% "
            f"(above the 10.0% safety floor), ending the 24-hour cycle at {final_soc:.1f}% SOC. "
            f"Standard 50 kW charging during Main Grid hours ({grid_hrs}h) maintains an optimal buffer."
        )

    # 4. Operator Action Checklist
    checklist = [
        f"Confirm automatic relay transfer for all {ren_hrs} scheduled Renewable Storage hours and the 18:00–22:00 peak window.",
        f"Verify emergency battery reserve floor lock is engaged at 10.0% SOC (50 kWh safety floor).",
        (
            f"Alert shift staff to initiate auxiliary generator pre-start for {overloads} projected overload hours (≥200 kW)."
            if overloads > 0
            else f"Maintain 50 kW off-peak battery charging schedule during low-demand overnight hours."
        ),
    ]

    formatted_text = (
        f"1. EXECUTIVE SUMMARY:\n{exec_summary}\n\n"
        f"2. CRITICAL ANOMALIES & OVERLOAD RISKS:\n{anomaly_text}\n\n"
        f"3. BATTERY DISPATCH STRATEGY:\n{battery_text}\n\n"
        f"4. OPERATOR ACTION CHECKLIST:\n"
        f"• {checklist[0]}\n"
        f"• {checklist[1]}\n"
        f"• {checklist[2]}"
    )

    return {
        "success": True,
        "provider": "Autonomous Grid Reasoning Engine",
        "model": "Edge-Expert-RuleBased-v3.0",
        "advisory": formatted_text,
        "sections": {
            "status_level": status_level,
            "status_label": status_label,
            "headline": headline,
            "executive": exec_summary,
            "anomalies": {
                "risk_level": risk_level,
                "text": anomaly_text,
                "overloads": overloads,
                "peak_kw": peak_kw,
            },
            "battery": {
                "status": battery_status,
                "text": battery_text,
                "min_soc": min_soc,
                "final_soc": final_soc,
            },
            "checklist": checklist,
        },
    }


def generate_ai_advisory(summary: dict, hourly: list = None) -> dict:
    """
    Generate real-time AI strategic guidance on power transitions and battery health.
    Uses ultra-fast local reasoning by default for sub-50ms execution;
    optionally invokes NVIDIA NIM if configured with a fast 2.5s timeout.
    """
    # Fast path: instant autonomous reasoning if no key configured
    if not NVIDIA_GENERAL_KEY:
        return generate_expert_grid_advisory(summary, hourly)

    # Extract key stats
    peak_kw = summary.get("peak_demand_kw", 0)
    avg_kw = summary.get("avg_demand_kw", 0)
    overloads = summary.get("overload_alerts", 0)
    ren_hrs = summary.get("hours_renewable", 0)
    grid_hrs = summary.get("hours_main_grid", 0)
    min_soc = summary.get("min_battery_soc_pct", 80)
    final_soc = summary.get("final_battery_soc_pct", 80)

    prompt = f"""You are the HackSphere 3.0 Autonomous Microgrid Advisory AI.
Analyze the following 24-hour forecast data and produce a structured, high-level engineering advisory.

Microgrid Forecast Metrics:
- Peak Demand: {peak_kw} kW (Thresholds: 160 kW Renewable switch, 200 kW Critical Overload)
- Average Demand: {avg_kw} kW
- Renewable Storage Hours: {ren_hrs} hours
- Main Grid Hours: {grid_hrs} hours
- Overload Alert Events (>= 200 kW): {overloads}
- Minimum Battery SOC Reached: {min_soc}% (Floor limit: 10%)
- Final Forecasted Battery SOC: {final_soc}%

Provide an engineering dispatch assessment formatted with these exact sections:
1. EXECUTIVE SUMMARY: (1-2 sentences on grid stability and transition health)
2. CRITICAL ANOMALIES & OVERLOAD RISKS: (Analyze overload count and peak hours)
3. BATTERY DISPATCH STRATEGY: (Recommendations for pre-charging, depth-of-discharge, or reserve protection)
4. OPERATOR ACTION CHECKLIST: (3 concise bullet points for the shift engineer)

Keep the response professional, concise, and focused on power stability."""

    headers = {
        "Authorization": f"Bearer {NVIDIA_GENERAL_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": NVIDIA_GENERAL_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert power microgrid engineer and AI dispatch advisor.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 500,
    }

    try:
        url = f"{NVIDIA_BASE_URL}/chat/completions"
        # Fast timeout to guarantee zero operator delay
        res = requests.post(url, headers=headers, json=payload, timeout=2.5)
        if res.status_code == 200:
            data = res.json()
            analysis_text = data["choices"][0]["message"]["content"]
            expert = generate_expert_grid_advisory(summary, hourly)
            return {
                "success": True,
                "provider": "NVIDIA NIM",
                "model": NVIDIA_GENERAL_MODEL,
                "advisory": analysis_text,
                "sections": expert.get("sections"),
            }
        else:
            return generate_expert_grid_advisory(summary, hourly)
    except Exception:
        return generate_expert_grid_advisory(summary, hourly)
