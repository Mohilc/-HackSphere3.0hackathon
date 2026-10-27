"""
HackSphere 3.0 — Transition Controller
Evaluates grid switching rules and battery state-of-charge for each forecast hour.
"""

import numpy as np
import pandas as pd


# ── Grid thresholds ──────────────────────────────────────────────────
DEMAND_THRESHOLD_RENEWABLE = 160.0   # kW → switch to renewable
DEMAND_THRESHOLD_OVERLOAD  = 200.0   # kW → critical overload alert
PEAK_HOUR_START = 18
PEAK_HOUR_END   = 22

# ── Battery simulation parameters ────────────────────────────────────
BATTERY_CAPACITY_KWH  = 500.0
BATTERY_INITIAL_SOC   = 0.80     # 80%
BATTERY_CHARGE_RATE   = 50.0     # kW charge rate from main grid
BATTERY_MIN_SOC       = 0.10     # 10% floor
BATTERY_MAX_SOC       = 1.00     # 100% ceiling
BATTERY_EFFICIENCY    = 0.92     # round-trip efficiency


def evaluate_grid_state(demand_kw: float, hour: int) -> dict:
    """
    Determine grid mode and alerts for a single forecast hour.

    Rules:
      • Demand > 160 kW OR hour ∈ [18, 22]  →  Renewable Storage Mode
      • Otherwise                             →  Main Grid Mode
      • Demand ≥ 200 kW                       →  Critical Overload Alert (independent)
    """
    is_peak = PEAK_HOUR_START <= hour <= PEAK_HOUR_END
    is_high_demand = demand_kw > DEMAND_THRESHOLD_RENEWABLE
    is_overload = demand_kw >= DEMAND_THRESHOLD_OVERLOAD

    if is_high_demand or is_peak:
        grid_mode = "Renewable Storage"
    else:
        grid_mode = "Main Grid"

    return {
        "grid_mode": grid_mode,
        "is_peak_hour": is_peak,
        "is_high_demand": is_high_demand,
        "overload_alert": is_overload,
        "demand_kw": round(float(demand_kw), 2),
    }


def simulate_battery(forecast_df: pd.DataFrame) -> list:
    """
    Simulate battery state-of-charge over a 24-hour forecast window.
    Returns a list of dicts with SOC, charge/discharge info per hour.
    """
    soc = BATTERY_INITIAL_SOC * BATTERY_CAPACITY_KWH  # in kWh
    results = []

    for _, row in forecast_df.iterrows():
        demand = row["predicted_demand_kw"]
        hour = pd.to_datetime(row["timestamp"]).hour
        state = evaluate_grid_state(demand, hour)

        if state["grid_mode"] == "Renewable Storage":
            # Battery discharges to meet demand
            discharge = demand * (1.0 / BATTERY_EFFICIENCY)
            soc = max(soc - discharge, BATTERY_MIN_SOC * BATTERY_CAPACITY_KWH)
            energy_flow = -demand
        else:
            # Main Grid active — battery charges
            charge = BATTERY_CHARGE_RATE * BATTERY_EFFICIENCY
            soc = min(soc + charge, BATTERY_MAX_SOC * BATTERY_CAPACITY_KWH)
            energy_flow = BATTERY_CHARGE_RATE

        soc_pct = round((soc / BATTERY_CAPACITY_KWH) * 100, 1)

        results.append({
            "timestamp": row["timestamp"],
            "hour": hour,
            "predicted_demand_kw": round(float(demand), 2),
            "grid_mode": state["grid_mode"],
            "is_peak_hour": state["is_peak_hour"],
            "overload_alert": state["overload_alert"],
            "battery_soc_pct": soc_pct,
            "battery_soc_kwh": round(soc, 1),
            "energy_flow_kw": round(energy_flow, 1),
        })

    return results


def evaluate_forecast(timestamps: list, predictions: list) -> dict:
    """
    Full transition-controller evaluation for a 24-hour forecast.
    Returns structured data ready for the dashboard.
    """
    df = pd.DataFrame({
        "timestamp": timestamps,
        "predicted_demand_kw": predictions,
    })

    battery_states = simulate_battery(df)

    # Summary statistics
    demands = np.array(predictions)
    n_renewable = sum(1 for s in battery_states if s["grid_mode"] == "Renewable Storage")
    n_grid = sum(1 for s in battery_states if s["grid_mode"] == "Main Grid")
    n_overload = sum(1 for s in battery_states if s["overload_alert"])
    min_soc = min(s["battery_soc_pct"] for s in battery_states)
    final_soc = battery_states[-1]["battery_soc_pct"] if battery_states else 0

    summary = {
        "total_hours": len(predictions),
        "avg_demand_kw": round(float(demands.mean()), 2),
        "peak_demand_kw": round(float(demands.max()), 2),
        "min_demand_kw": round(float(demands.min()), 2),
        "hours_renewable": n_renewable,
        "hours_main_grid": n_grid,
        "overload_alerts": n_overload,
        "min_battery_soc_pct": min_soc,
        "final_battery_soc_pct": final_soc,
    }

    return {
        "summary": summary,
        "hourly": battery_states,
    }
