import pandas as pd
import numpy as np

train_df = pd.read_csv("HackSphere_Starter_Kit/train_telemetry.csv")
print(f"Train Shape: {train_df.shape}")
print("Null values:\n", train_df.isnull().sum())
print("\nStats:\n", train_df.describe().round(2))

# Check time range
train_df['dt'] = pd.to_datetime(train_df['timestamp'])
print(f"Date range: {train_df['dt'].min()} to {train_df['dt'].max()}")
print(f"Hours covered: {len(train_df)}")

# Correlation with target_demand_kw
train_df['hour'] = train_df['dt'].dt.hour
train_df['dayofweek'] = train_df['dt'].dt.dayofweek
numeric_cols = ['ambient_temp_c', 'humidity_pct', 'solar_irradiance_wm2', 'hour', 'dayofweek', 'target_demand_kw']
print("\nCorrelations with target_demand_kw:")
print(train_df[numeric_cols].corr()['target_demand_kw'].round(4))

# Check sample test input
test_df = pd.read_csv("HackSphere_Starter_Kit/sample_test_input.csv")
print(f"\nTest Shape: {test_df.shape}")
test_df['dt'] = pd.to_datetime(test_df['timestamp'])
print(f"Test Date range: {test_df['dt'].min()} to {test_df['dt'].max()}")
