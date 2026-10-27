# HackSphere 3.0: Smart Energy Microgrid & Demand Forecasting Engine

An end-to-end intelligent microgrid energy forecasting and automated power-source transition control platform built for **HackSphere 3.0**. 

* **Live Deployment (Zoho Catalyst AppSail):** [https://hacksphere-microgrid-1-50047153149.development.catalystappsail.in](https://hacksphere-microgrid-1-50047153149.development.catalystappsail.in)
* **GitHub Repository:** [https://github.com/Bharadwajcs-AI/HackSphere3.0-Microgrid](https://github.com/Bharadwajcs-AI/HackSphere3.0-Microgrid)
* **Pre-Submission Self-Tester Status:** `SUCCESS` (Verified with `HackSphere_Starter_Kit/test_eval.py` on 1,000 test rows)

---

## ⚡ Problem Overview

Modern microgrids require real-time demand forecasting to switch seamlessly between **Main Grid power** and localized **Renewable Battery Storage**. Sudden load shifts and peak windows must be proactively managed to avoid blackout risks and ensure battery state-of-charge (SOC) preservation.

This platform provides:
1. **Machine Learning Demand Forecasting**: Trained on environmental telemetry (`ambient_temp_c`, `humidity_pct`, `solar_irradiance_wm2`) to forecast hourly power demand (kW) for a 24-hour horizon using Zoho Catalyst QuickML pipelines and high-accuracy Gradient Boosting.
2. **Transition Controller Engine**: Automatically determines power dispatch routing and emits critical overload alerts based on official competition rules.
3. **500 kWh Battery Storage Simulation**: Simulates dynamic charge/discharge flows, round-trip efficiency (92%), and emergency reserve cutoff limits (10% floor).
4. **AI Strategic Advisory & Reporting**: Sub-50ms engineering reasoning with visual executive diagnostic cards, actionable shift checklists, and one-click PDF & CSV report exports.
5. **Interactive Operator Dashboard**: High-density editorial-industrial UI built with **React 19**, **Vite**, **Chart.js**, and glassmorphic aesthetics.

---

## 🏗️ Architecture & System Design

```
                     ┌───────────────────────────────────────────────┐
                     │          Telemetry Ingestion Sources          │
                     │  (CSV Drag-and-Drop / Live Manual Probe)      │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │           Feature Engineering Engine          │
                     │  - Cyclical Hours (sin/cos encoding)          │
                     │  - Peak Window Flags (18:00 - 22:00)          │
                     │  - Morning Ramp Flags (06:00 - 09:00)         │
                     │  - Meteorological Interaction Ratios          │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │       Predictive Engine (QuickML Pipeline)    │
                     │    Published Catalyst QuickML Endpoint        │
                     │    High-Accuracy GBR Fallback (CV: 10.03 kW)  │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │          Transition Controller Logic          │
                     │  - Demand > 160 kW or 18-22h → Renewable      │
                     │  - Demand <= 160 kW & Off-Peak → Main Grid    │
                     │  - Demand >= 200 kW → CRITICAL OVERLOAD ALERT │
                     │  - 500 kWh Dynamic Battery SOC & 10% Cutoff   │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │          React Live Operator Cockpit          │
                     │  Demand Curves · 24h Sequence · AI Advisory   │
                     └───────────────────────────────────────────────┘
```

---

## 📊 Transition Controller Logic

For every forecast hour, the automated transition controller evaluates predicted demand and temporal constraints:

| Condition | Grid Mode / Alert Status | Automated Controller Action |
| :--- | :--- | :--- |
| **Demand > 160 kW** OR **Hour $\in [18, 22]$** | **Renewable Storage Mode** | Discharge 500 kWh battery to cover localized high demand |
| **Demand $\le$ 160 kW** AND **Hour $\notin [18, 22]$** | **Main Grid Mode** | Main grid serves base load; battery recharges at 50 kW |
| **Demand $\ge$ 200 kW** | **Critical Overload Alert** | Independent critical alarm triggered for operators |
| **Battery SOC $\le$ 10% (50 kWh)** | **Reserve Floor Cutoff** | Discharge automatically suspended to protect battery cells |

### Battery Storage Parameters
- **Capacity**: 500.0 kWh
- **Initial SOC**: 80% (400.0 kWh)
- **Charging Rate**: 50.0 kW (active during Main Grid mode)
- **Efficiency**: 92% round-trip efficiency
- **Emergency Reserve Floor**: 10.0% (50.0 kWh minimum safety limit)

---

## 📈 Model Performance & Validation

- **Primary Pipeline**: Published Zoho Catalyst QuickML Endpoint
- **Local Fallback Pipeline**: `GradientBoostingRegressor` (CV RMSE: **10.03 kW**, Train RMSE: **5.83 kW**)
- **Contract Verification**: Validated via `HackSphere_Starter_Kit/test_eval.py` (`SUCCESS` on 1,000 test rows).

---

## 🖥️ Navigation & User Interface Structure

The application is structured into 7 dedicated operational views:

1. **`01 — Overview`**: High-level cockpit featuring the 6 official KPIs, 24h interactive demand curve, full-width grid transition sequence, battery state, and live telemetry console.
2. **`02 — Manual Input`**: Single-point telemetry probe form (Ambient Temp $-30\text{ to }65^\circ\text{C}$, Humidity $0\text{--}100\%$, Solar $0\text{--}1500\text{ W/m}^2$) with instant point dispatch evaluation.
3. **`03 — File Upload`**: Validated CSV drag-and-drop batch ingestion with schema preview and automatic 24-hour horizon simulation.
4. **`04 — Forecast Analysis`**: Granular 24-hour tabular breakdown with peak hour tags, operating mode badges, and overload markers.
5. **`05 — Energy Control`**: Transparent technical breakdown of the 4 transition decision rules, relay mechanisms, and battery safety constraints.
6. **`06 — AI Advisory`**: Sub-50ms autonomous grid reasoning engine providing executive health banners, risk analysis, battery guidance, shift checklists, and one-click PDF report export.
7. **`07 — Reports`**: Complete 24-hour operational audit report with one-click CSV data export.

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.10+ (or Python 3.11)
- Node.js 18+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/Bharadwajcs-AI/HackSphere3.0-Microgrid.git
cd HackSphere3.0-Microgrid
```

### 2. Backend Setup
```bash
# Create virtual environment and install dependencies
python -m venv .venv

# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt

# Start the Flask API server (running on port 9000 / 5000)
python server.py
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

* **Frontend Dev Server:** [http://localhost:5173](http://localhost:5173) (Proxies `/api` to Flask)
* **Production Build:** `npm run build` (outputs to `client/dist`, served directly by Flask)

---

## 🔌 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and server timestamp |
| `/api/model-info` | `GET` | Model hyperparameters, QuickML pipeline status, and decision rules |
| `/api/demo-forecast` | `GET` | Evaluates 24-hour demo forecast using starter dataset |
| `/api/full-forecast` | `GET` | Runs predictions and controller evaluation on full test set |
| `/api/predict` | `POST` | Batch predictions from JSON telemetry array |
| `/api/predict-manual` | `POST` | Single telemetry probe (Temp, Humidity, Solar, Timestamp) |
| `/api/upload-csv` | `POST` | Multipart CSV file upload and evaluation |
| `/api/ai-advisory` | `POST` | Real-time autonomous AI strategic dispatch analysis |

---

## 🔒 Security & Environment Configuration

Copy `.env.example` to `.env` to configure optional external services (the system operates autonomously with built-in zero-downtime fallbacks if omitted):

```env
APP_ENV=production
PORT=9000

# Optional: Zoho Catalyst QuickML Configuration
QUICKML_ENDPOINT_URL=https://api.catalyst.zoho.in/quickml/v1/project/<PROJECT_ID>/endpoints/predict
QUICKML_ENDPOINT_KEY=your_catalyst_quickml_key_here
CATALYST_ORG=your_catalyst_org_here
QUICKML_ACCESS_TOKEN=

# Optional: NVIDIA NIM Configuration
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_GENERAL_KEY=your_nvidia_api_key_here
NVIDIA_GENERAL_MODEL=google/diffusiongemma-26b-a4b-it
```
