"""
Feature Engineering & Temporal Split Pipeline
Builds inference-compatible features and enforces temporal split to avoid lookahead leakage.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "rainfall_1h",
    "rainfall_3h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_3day",
    "river_discharge",
    "discharge_change",
    "runoff",
    "soil_wetness",
    "elevation",
    "slope",
    "distance_to_river",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos",
    "discharge_to_elevation"
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Transforms raw hydrological records into ML-ready features."""
    df = df.copy()
    
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df["timestamp"]):
        df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Cyclical temporal encoding
    hours = df["timestamp"].dt.hour
    months = df["timestamp"].dt.month
    
    df["hour_sin"] = np.sin(2 * np.pi * hours / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * hours / 24.0)
    df["month_sin"] = np.sin(2 * np.pi * (months - 1) / 12.0)
    df["month_cos"] = np.cos(2 * np.pi * (months - 1) / 12.0)
    
    # Hydraulic derived signals
    # Low elevation + high discharge = heavy stagnation risk
    safe_elev = np.maximum(df["elevation"], 1.0)
    df["discharge_to_elevation"] = np.round(df["river_discharge"] / safe_elev, 3)
    
    return df

def process_and_split_data(raw_csv_path: str, output_dir: str, train_ratio: float = 0.8):
    """Performs leakage-free temporal split and fits standard scaler."""
    df = pd.read_csv(raw_csv_path)
    df = engineer_features(df)
    
    # Sort strictly by timestamp for temporal integrity
    df = df.sort_values(by="timestamp").reset_index(drop=True)
    
    split_idx = int(len(df) * train_ratio)
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()
    
    print(f"Total records: {len(df)}")
    print(f"Training set: {len(train_df)} ({train_df['timestamp'].min()} to {train_df['timestamp'].max()})")
    print(f"Test set:     {len(test_df)} ({test_df['timestamp'].min()} to {test_df['timestamp'].max()})")
    
    # Fit scaler strictly on training data
    scaler = StandardScaler()
    scaler.fit(train_df[FEATURE_COLUMNS])
    
    os.makedirs(output_dir, exist_ok=True)
    models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save processed datasets
    train_path = os.path.join(output_dir, "train.parquet")
    test_path = os.path.join(output_dir, "test.parquet")
    scaler_path = os.path.join(models_dir, "scaler.joblib")
    
    train_df.to_parquet(train_path, index=False)
    test_df.to_parquet(test_path, index=False)
    joblib.dump(scaler, scaler_path)
    
    print(f"Saved processed train split to: {train_path}")
    print(f"Saved processed test split to:  {test_path}")
    print(f"Saved fitted scaler to:         {scaler_path}")
    
    return train_path, test_path

def main():
    raw_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "flood_dataset.csv")
    proc_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")
    if not os.path.exists(raw_path):
        from src.data.make_dataset import main as gen_data
        gen_data()
    process_and_split_data(raw_path, proc_dir)

if __name__ == "__main__":
    main()
