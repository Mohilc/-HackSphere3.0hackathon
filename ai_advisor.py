"""
HackSphere 3.0 — AI Grid Reasoning & Advisory Engine
Powered by NVIDIA NIM Multi-Model Pool (DiffusionGemma / Nemotron)
Analyzes 24-hour demand forecasts, battery reserves, and emits
actionable grid management advisories for microgrid operators.
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


def generate_ai_advisory(summary: dict, hourly: list = None) -> dict:
    """
    Generate real-time AI strategic guidance on power transitions and battery health.
    """
    if not NVIDIA_GENERAL_KEY:
        return {
            "success": False,
            "error": "NVIDIA_GENERAL_KEY not configured in .env",
            "provider": "NVIDIA NIM",
        }

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
        res = requests.post(url, headers=headers, json=payload, timeout=20)
        if res.status_code == 200:
            data = res.json()
            analysis_text = data["choices"][0]["message"]["content"]
            return {
                "success": True,
                "provider": "NVIDIA NIM",
                "model": NVIDIA_GENERAL_MODEL,
                "advisory": analysis_text,
            }
        else:
            return {
                "success": False,
                "error": f"NVIDIA NIM returned {res.status_code}: {res.text}",
                "provider": "NVIDIA NIM",
            }
    except Exception as e:
        return {"success": False, "error": str(e), "provider": "NVIDIA NIM"}
