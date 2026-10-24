"""
HackSphere 3.0 — Flask Backend Server
Serves the dashboard and exposes REST API endpoints for
predictions, forecasts, CSV upload, and transition evaluation.
"""

import io
import os
import json
import traceback
from datetime import datetime

import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from model import predict, get_model, train_model, engineer_features, FEATURE_COLS
from transition import evaluate_forecast

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLIENT_DIST = os.path.join(BASE_DIR, "client", "dist")
STATIC_DIR = CLIENT_DIST if os.path.isdir(CLIENT_DIST) else os.path.join(BASE_DIR, "static")

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)


# ── Startup: ensure model is trained ─────────────────────────────────
@app.before_request
def ensure_model():
    """Lazy-load the model on first request."""
    app.before_request_funcs[None].remove(ensure_model)
    try:
        get_model()
        print("[Server] Model loaded successfully.")
    except Exception:
        print("[Server] Training model for the first time...")
        train_model()
        print("[Server] Model trained and ready.")


# ── Static files ─────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    if os.path.exists(os.path.join(STATIC_DIR, path)):
        return send_from_directory(STATIC_DIR, path)
    return send_from_directory(STATIC_DIR, "index.html")


# ── API: Health check ────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})


# ── API: Model info ──────────────────────────────────────────────────
@app.route("/api/model-info")
def model_info():
    try:
        model = get_model()
        return jsonify({
            "status": "loaded",
            "type": type(model).__name__,
            "n_estimators": model.n_estimators,
            "max_depth": model.max_depth,
            "features": FEATURE_COLS,
            "n_features": len(FEATURE_COLS),
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ── API: Predict from JSON ───────────────────────────────────────────
@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    Accept JSON body with telemetry rows:
    { "data": [ { "timestamp": "...", "ambient_temp_c": ..., ... }, ... ] }
    Returns predictions and transition controller output.
    """
    try:
        body = request.get_json(force=True)
        rows = body.get("data", [])
        if not rows:
            return jsonify({"error": "No data provided"}), 400

        input_df = pd.DataFrame(rows)

        # Validate required columns
        required = ["timestamp", "ambient_temp_c", "humidity_pct", "solar_irradiance_wm2"]
        missing = [c for c in required if c not in input_df.columns]
        if missing:
            return jsonify({"error": f"Missing columns: {missing}"}), 400

        # Clean data
        input_df = clean_dataframe(input_df)

        # Predict
        predictions = predict(input_df)

        # Evaluate transition
        result = evaluate_forecast(
            input_df["timestamp"].tolist(),
            predictions.tolist(),
        )

        return jsonify({
            "success": True,
            "predictions": [round(float(p), 2) for p in predictions],
            "forecast": result,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── API: Upload CSV ──────────────────────────────────────────────────
@app.route("/api/upload-csv", methods=["POST"])
def api_upload_csv():
    """
    Accept a CSV file upload with telemetry data.
    Returns predictions and transition controller output.
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if not file.filename.endswith(".csv"):
            return jsonify({"error": "Only CSV files are accepted"}), 400

        content = file.read().decode("utf-8")
        input_df = pd.read_csv(io.StringIO(content))

        # Validate
        required = ["timestamp", "ambient_temp_c", "humidity_pct", "solar_irradiance_wm2"]
        missing = [c for c in required if c not in input_df.columns]
        if missing:
            return jsonify({"error": f"Missing columns: {missing}"}), 400

        input_df = clean_dataframe(input_df)
        predictions = predict(input_df)
        result = evaluate_forecast(
            input_df["timestamp"].tolist(),
            predictions.tolist(),
        )

        return jsonify({
            "success": True,
            "predictions": [round(float(p), 2) for p in predictions],
            "forecast": result,
            "rows_processed": len(input_df),
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── API: Demo forecast (uses sample test data) ──────────────────────
@app.route("/api/demo-forecast")
def api_demo_forecast():
    """
    Run a demo 24-hour forecast using the first 24 rows of sample_test_input.csv.
    """
    try:
        test_csv = os.path.join(BASE_DIR, "HackSphere_Starter_Kit", "sample_test_input.csv")
        if not os.path.exists(test_csv):
            return jsonify({"error": "sample_test_input.csv not found"}), 404

        df = pd.read_csv(test_csv)
        demo_df = df.head(24).copy()

        predictions = predict(demo_df)
        result = evaluate_forecast(
            demo_df["timestamp"].tolist(),
            predictions.tolist(),
        )

        return jsonify({
            "success": True,
            "predictions": [round(float(p), 2) for p in predictions],
            "forecast": result,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── API: Full test forecast (all sample_test_input rows) ─────────────
@app.route("/api/full-forecast")
def api_full_forecast():
    """Run predictions on all sample_test_input.csv rows."""
    try:
        test_csv = os.path.join(BASE_DIR, "HackSphere_Starter_Kit", "sample_test_input.csv")
        df = pd.read_csv(test_csv)
        predictions = predict(df)
        result = evaluate_forecast(
            df["timestamp"].tolist(),
            predictions.tolist(),
        )

        return jsonify({
            "success": True,
            "total_rows": len(df),
            "predictions": [round(float(p), 2) for p in predictions],
            "forecast": result,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── API: Manual single-row prediction ────────────────────────────────
@app.route("/api/predict-manual", methods=["POST"])
def api_predict_manual():
    """
    Accept a single telemetry reading from the manual form.
    """
    try:
        body = request.get_json(force=True)
        row = {
            "timestamp": body["timestamp"],
            "ambient_temp_c": float(body["ambient_temp_c"]),
            "humidity_pct": float(body["humidity_pct"]),
            "solar_irradiance_wm2": float(body["solar_irradiance_wm2"]),
        }
        input_df = pd.DataFrame([row])
        preds = predict(input_df)
        result = evaluate_forecast([row["timestamp"]], preds.tolist())

        return jsonify({
            "success": True,
            "prediction_kw": round(float(preds[0]), 2),
            "state": result["hourly"][0],
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── API: Training data stats ─────────────────────────────────────────
@app.route("/api/training-stats")
def api_training_stats():
    """Return summary statistics of the training dataset."""
    try:
        csv_path = os.path.join(BASE_DIR, "HackSphere_Starter_Kit", "train_telemetry.csv")
        df = pd.read_csv(csv_path)
        stats = df.describe().round(2).to_dict()
        return jsonify({
            "success": True,
            "shape": list(df.shape),
            "stats": stats,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── API: AI Grid Advisory (NVIDIA NIM) ────────────────────────────────
@app.route("/api/ai-advisory", methods=["POST"])
def api_ai_advisory():
    """Generate an AI-powered grid health & dispatch strategy assessment."""
    try:
        from ai_advisor import generate_ai_advisory
        body = request.get_json(silent=True) or {}
        summary = body.get("summary")
        if not summary:
            return jsonify({"error": "No forecast summary provided"}), 400

        res = generate_ai_advisory(summary)
        return jsonify(res)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── Helper: data cleaning ────────────────────────────────────────────
def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Handle missing values and validate data types."""
    numeric_cols = ["ambient_temp_c", "humidity_pct", "solar_irradiance_wm2"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Forward-fill then back-fill missing numeric values
    df[numeric_cols] = df[numeric_cols].ffill().bfill()

    # Fill any remaining NaN with column means from training data
    defaults = {"ambient_temp_c": 18.5, "humidity_pct": 70.0, "solar_irradiance_wm2": 88.0}
    for col in numeric_cols:
        if df[col].isna().any():
            df[col] = df[col].fillna(defaults.get(col, 0))

    return df


# ── Main ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  HackSphere 3.0 — Smart Energy Microgrid Dashboard")
    port = int(os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", os.environ.get("PORT", 5000)))
    debug_mode = os.environ.get("CATALYST_ENV", "dev").lower() == "dev" and port == 5000
    print(f"  Starting server on port {port} (Catalyst AppSail compatible)")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
