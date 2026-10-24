# HackSphere 3.0: Smart Energy Microgrid & Demand Forecasting Engine

An end-to-end intelligent microgrid energy forecasting and automated power-source transition control system built for **HackSphere 3.0**. 

---

## ⚡ Problem Overview

Modern microgrids require real-time demand forecasting to switch seamlessly between **Main Grid power** and localized **Renewable Battery Storage**. Sudden load shifts and peak windows must be proactively managed to avoid blackout risks and ensure battery state-of-charge (SOC) preservation.

This platform provides:
1. **Machine Learning Demand Forecasting**: Trained on environmental telemetry (`ambient_temp_c`, `humidity_pct`, `solar_irradiance_wm2`) to forecast hourly power demand (kW) for a 24-hour horizon.
2. **Transition Controller Engine**: Automatically evaluates load levels and peak windows to emit power dispatch signals and overload alerts.
3. **500 kWh Battery Storage Simulation**: Simulates dynamic charge/discharge flows, round-trip efficiency (92%), and minimum safety cutoff limits (10%).
4. **Interactive High-Performance Web Dashboard**: Built with **React 19**, **Vite**, **Chart.js**, and modern UI aesthetics.

---

## 🏗️ Architecture & System Design

```
                     ┌───────────────────────────────────────────────┐
                     │          Telemetry Ingestion Sources          │
                     │  (CSV Upload / Live UI Probe / Demo Data)     │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │           Feature Engineering Engine          │
                     │  - Cyclical Hours (sin/cos)                   │
                     │  - Peak Window Flags (18:00 - 22:00)          │
                     │  - Morning Ramp Flags (06:00 - 09:00)         │
                     │  - Meteorological Interaction Ratios          │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │       Predictive Engine (QuickML Pipeline)    │
                     │    Gradient Boosting Regressor (CV: 10.03 kW) │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │          Transition Controller Logic          │
                     │  - Demand > 160 kW or 18-22h → Renewable      │
                     │  - Demand <= 160 kW & Off-Peak → Main Grid   │
                     │  - Demand >= 200 kW → CRITICAL OVERLOAD ALERT │
                     │  - 500 kWh Dynamic Battery State-of-Charge    │
                     └──────────────────────┬────────────────────────┘
                                            │
                                            ▼
                     ┌───────────────────────────────────────────────┐
                     │          React Live Operator Dashboard        │
                     │  Demand Charts · Grid Timeline · Battery SOC  │
                     └───────────────────────────────────────────────┘
```

---

## 📊 Transition Controller Logic

For every forecast hour, the controller evaluates predicted demand and temporal constraints:

| Condition | Grid Mode / Alert Status | Action Taken |
| :--- | :--- | :--- |
| **Demand > 160 kW** OR **Hour $\in [18, 22]$** | **Renewable Storage Mode** | Discharge battery to cover localized high demand |
| **Demand $\le$ 160 kW** AND **Outside Peak** | **Main Grid Mode** | Main grid serves base load; battery recharges at 50 kW |
| **Demand $\ge$ 200 kW** | **Critical Overload Alert** | Independent critical alarm triggered for operators |

### Battery Storage Parameters
- **Capacity**: 500.0 kWh
- **Initial SOC**: 80% (400 kWh)
- **Charging Rate**: 50.0 kW
- **Efficiency**: 92% round-trip efficiency
- **Reserve Floor**: 10% (50 kWh minimum safety limit)

---

## 📈 Model Performance & Validation

- **Algorithm**: `GradientBoostingRegressor` (500 estimators, max depth 5, learning rate 0.05, subsample 0.8)
- **5-Fold Cross-Validation RMSE**: **10.03 kW**
- **Train RMSE**: **5.83 kW**
- **Starter Kit Self-Tester**: Fully verified against `HackSphere_Starter_Kit/test_eval.py` (`SUCCESS` on 1,000 test rows).

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.10+ (or `uv`)
- Node.js 18+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/Mohilc/-HackSphere3.0hackathon.git
cd -HackSphere3.0hackathon
```

### 2. Backend Setup
```bash
# Create virtual environment and install dependencies
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt

# Start the Flask API server (running on port 5000)
python server.py
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

- **Frontend Dev Server**: [http://localhost:3000](http://localhost:3000) (Proxies `/api` to Flask)
- **Production Server**: [http://localhost:5000](http://localhost:5000) (Flask serves compiled React SPA directly)

---

## 🔌 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and server timestamp |
| `/api/model-info` | `GET` | Model hyperparameters and feature metadata |
| `/api/demo-forecast` | `GET` | Evaluates 24-hour demo forecast using starter dataset |
| `/api/full-forecast` | `GET` | Runs predictions and controller evaluation on full test set |
| `/api/predict` | `POST` | Batch predictions from JSON telemetry array |
| `/api/predict-manual` | `POST` | Single telemetry probe (Temp, Humidity, Solar, Timestamp) |
| `/api/upload-csv` | `POST` | Multipart CSV file upload and evaluation |

---

## 📁 Project Structure

```
├── client/                     # React 19 Frontend
│   ├── src/
│   │   ├── components/         # Modular dashboard components
│   │   │   ├── AlertBanner.jsx # Critical overload notification banner
│   │   │   ├── BatteryPanel.jsx# 500 kWh battery SOC & sparkline
│   │   │   ├── CSVUpload.jsx   # Drag-and-drop CSV telemetry ingestion
│   │   │   ├── DemandChart.jsx # 24h interactive demand curve with thresholds
│   │   │   ├── Footer.jsx      # System metadata footer
│   │   │   ├── GridTimeline.jsx# Hourly power-source transition sequence
│   │   │   ├── Header.jsx      # Live clock and status bar
│   │   │   ├── KPIStrip.jsx    # Real-time metrics strip
│   │   │   ├── ManualInput.jsx # Environmental probe form
│   │   │   ├── QuickForecast.jsx# 1-click simulation triggers
│   │   │   └── SystemLog.jsx   # Live system activity terminal
│   │   ├── services/           # Centralized API service layer (api.js)
│   │   ├── App.jsx             # Main dashboard layout orchestration
│   │   └── index.css           # Design tokens, variables, & animations
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy
├── HackSphere_Starter_Kit/     # Official starter kit dataset & contract
│   ├── train_telemetry.csv     # Training dataset
│   ├── sample_test_input.csv   # Validation test dataset
│   ├── predict.py              # Inference function with ML model binding
│   └── test_eval.py            # Official validation tester
├── model.py                    # Feature engineering & ML training pipeline
├── server.py                   # Flask REST API & SPA static server
├── transition.py               # Microgrid switching & battery controller
├── requirements.txt            # Python dependencies
└── trained_model.pkl           # Persisted trained model artifact
```
