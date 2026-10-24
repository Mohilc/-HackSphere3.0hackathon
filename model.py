"""
HackSphere 3.0 — ML Model Training & Prediction Module
Trains a GradientBoostingRegressor on train_telemetry.csv and provides
a predict() function compatible with the HackSphere inference contract.
"""

import os
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_squared_error

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.pkl")
TRAIN_CSV = os.path.join(
    os.path.dirname(__file__),
    "HackSphere_Starter_Kit",
    "train_telemetry.csv",
)


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract time-based and interaction features from raw telemetry."""
    out = df.copy()
    dt = pd.to_datetime(out["timestamp"])

    # Cyclical hour encoding
    out["hour"] = dt.dt.hour
    out["hour_sin"] = np.sin(2 * np.pi * out["hour"] / 24)
    out["hour_cos"] = np.cos(2 * np.pi * out["hour"] / 24)

    # Calendar features
    out["month"] = dt.dt.month
    out["day_of_week"] = dt.dt.dayofweek
    out["is_weekend"] = (out["day_of_week"] >= 5).astype(int)

    # Peak-hour flag (18:00-22:00)
    out["is_peak_hour"] = ((out["hour"] >= 18) & (out["hour"] <= 22)).astype(int)

    # Morning ramp flag (6:00-9:00)
    out["is_morning_ramp"] = ((out["hour"] >= 6) & (out["hour"] <= 9)).astype(int)

    # Interaction features
    out["temp_humidity"] = out["ambient_temp_c"] * out["humidity_pct"] / 100
    out["cooling_load"] = np.maximum(0.0, out["ambient_temp_c"] - 24.0) * 8.5
    out["solar_temp_ratio"] = out["solar_irradiance_wm2"] / (out["ambient_temp_c"] + 10)

    return out


FEATURE_COLS = [
    "ambient_temp_c",
    "humidity_pct",
    "solar_irradiance_wm2",
    "hour",
    "hour_sin",
    "hour_cos",
    "month",
    "day_of_week",
    "is_weekend",
    "is_peak_hour",
    "is_morning_ramp",
    "temp_humidity",
    "cooling_load",
    "solar_temp_ratio",
]


def train_model(csv_path: str = None, save_path: str = None) -> dict:
    """
    Train the demand forecasting model and persist it to disk.
    Returns training metrics.
    """
    csv_path = csv_path or TRAIN_CSV
    save_path = save_path or MODEL_PATH

    print(f"[Model] Loading training data from {csv_path}")
    df = pd.read_csv(csv_path)
    df = engineer_features(df)

    X = df[FEATURE_COLS].values
    y = df["target_demand_kw"].values

    model = GradientBoostingRegressor(
        n_estimators=500,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
    )

    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring="neg_root_mean_squared_error")
    cv_rmse = -cv_scores.mean()
    print(f"[Model] 5-Fold CV RMSE: {cv_rmse:.2f} kW")

    # Fit on full training data
    model.fit(X, y)
    train_preds = model.predict(X)
    train_rmse = np.sqrt(mean_squared_error(y, train_preds))
    print(f"[Model] Train RMSE: {train_rmse:.2f} kW")

    # Feature importances
    importances = dict(zip(FEATURE_COLS, model.feature_importances_))
    sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("[Model] Feature importances:")
    for name, imp in sorted_imp:
        print(f"        {name}: {imp:.4f}")

    joblib.dump(model, save_path)
    print(f"[Model] Saved to {save_path}")

    return {
        "cv_rmse": round(cv_rmse, 2),
        "train_rmse": round(train_rmse, 2),
        "n_samples": len(df),
        "n_features": len(FEATURE_COLS),
        "feature_importances": {k: round(v, 4) for k, v in sorted_imp},
    }


def load_model(path: str = None):
    """Load a persisted model from disk."""
    path = path or MODEL_PATH
    if not os.path.exists(path):
        print("[Model] No saved model found — training now...")
        train_model()
    return joblib.load(path)


_model_cache = None


def get_model():
    """Lazy-load and cache the model."""
    global _model_cache
    if _model_cache is None:
        _model_cache = load_model()
    return _model_cache


def predict(input_df: pd.DataFrame) -> np.ndarray:
    """
    Predict energy demand for each row in input_df.
    Compatible with the HackSphere inference contract.
    """
    model = get_model()
    featured = engineer_features(input_df)
    X = featured[FEATURE_COLS].values
    predictions = model.predict(X)
    return np.array(predictions, dtype=float)


if __name__ == "__main__":
    metrics = train_model()
    print(f"\n[Model] Training complete. CV RMSE = {metrics['cv_rmse']} kW")

    # Quick sanity check on sample test input
    test_csv = os.path.join(
        os.path.dirname(__file__),
        "HackSphere_Starter_Kit",
        "sample_test_input.csv",
    )
    if os.path.exists(test_csv):
        test_df = pd.read_csv(test_csv)
        preds = predict(test_df)
        print(f"[Model] Test predictions: {len(preds)} rows, first 5: {preds[:5].round(2)}")
