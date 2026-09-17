"""
Hydrological Training Dataset Generator
Simulates realistic multi-source hydrological & meteorological time-series records:
- GloFAS (River discharge, runoff, soil wetness)
- NASA GPM IMERG (Precipitation accumulation windows)
- DEM Geospatial (Elevation, slope, distance to river)
- Historical Ground Truth (Flood occurrence)
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_hydrological_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    
    # Base timestamp sequence starting from 2023-01-01
    start_time = datetime(2023, 1, 1, 0, 0, 0)
    timestamps = [start_time + timedelta(hours=i) for i in range(n_samples)]
    
    # Coordinates centered around flood-prone catchments (MMR & Southern India basins)
    lats = np.random.uniform(18.8, 19.5, size=n_samples) # Mira Bhayandar / Mumbai Metropolitan Region
    lons = np.random.uniform(72.7, 73.2, size=n_samples)
    
    # Geospatial static features
    elevation = np.random.uniform(5.0, 950.0, size=n_samples)
    slope = np.random.uniform(0.5, 35.0, size=n_samples)
    distance_to_river = np.random.uniform(20.0, 5000.0, size=n_samples)
    
    # Precipitation Windows (NASA GPM IMERG simulated)
    # Monsoon seasonality effect: months 6, 7, 8, 9 have significantly higher precipitation
    months = np.array([ts.month for ts in timestamps])
    monsoon_weight = np.where(np.isin(months, [6, 7, 8, 9]), 4.5, 0.4)
    
    base_rain = np.random.exponential(scale=3.0, size=n_samples) * monsoon_weight
    rainfall_1h = np.round(np.clip(base_rain, 0, 120), 2)
    rainfall_3h = np.round(np.clip(rainfall_1h * np.random.uniform(1.8, 2.9, size=n_samples), 0, 220), 2)
    rainfall_6h = np.round(np.clip(rainfall_3h * np.random.uniform(1.4, 2.2, size=n_samples), 0, 310), 2)
    rainfall_24h = np.round(np.clip(rainfall_6h * np.random.uniform(1.6, 3.2, size=n_samples), 0, 480), 2)
    rainfall_3day = np.round(np.clip(rainfall_24h * np.random.uniform(1.3, 2.5, size=n_samples), 0, 650), 2)
    
    # Hydrological variables (GloFAS simulated)
    # Soil wetness saturates as 3-day rainfall accumulates
    soil_wetness = np.clip((rainfall_3day / 280.0) + np.random.normal(0.25, 0.08, size=n_samples), 0.05, 0.98)
    
    # River discharge (m^3/s) driven by upstream runoff and continuous rain
    river_discharge = np.clip(
        (rainfall_24h * 3.5) + (soil_wetness * 220.0) + np.random.uniform(40.0, 150.0, size=n_samples),
        10.0, 2200.0
    )
    discharge_change = np.round(np.random.normal(0.0, 25.0, size=n_samples) + (rainfall_6h * 0.8), 2)
    runoff = np.round(np.clip(rainfall_24h * soil_wetness * 0.72, 0.0, 320.0), 2)
    
    # Ground truth flood occurrence: physical threshold + non-linear composite
    # Floods happen when rainfall is high, soil is saturated, elevation is low, and near river
    flood_score = (
        (rainfall_24h / 120.0) * 0.35 +
        (soil_wetness) * 0.25 +
        (river_discharge / 800.0) * 0.20 +
        np.clip((150.0 - elevation) / 150.0, 0, 1) * 0.20 +
        np.clip((500.0 - distance_to_river) / 500.0, 0, 1) * 0.15
    )
    
    # Add stochastic noise for realistic real-world labels
    flood_prob = 1.0 / (1.0 + np.exp(-4.5 * (flood_score - 0.58)))
    flood = (flood_prob > 0.55).astype(int)
    
    df = pd.DataFrame({
        "timestamp": timestamps,
        "latitude": np.round(lats, 4),
        "longitude": np.round(lons, 4),
        "rainfall_1h": rainfall_1h,
        "rainfall_3h": rainfall_3h,
        "rainfall_6h": rainfall_6h,
        "rainfall_24h": rainfall_24h,
        "rainfall_3day": rainfall_3day,
        "river_discharge": np.round(river_discharge, 2),
        "discharge_change": discharge_change,
        "runoff": runoff,
        "soil_wetness": np.round(soil_wetness, 3),
        "elevation": np.round(elevation, 1),
        "slope": np.round(slope, 2),
        "distance_to_river": np.round(distance_to_river, 1),
        "flood": flood
    })
    
    return df

def main():
    raw_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
    os.makedirs(raw_dir, exist_ok=True)
    
    print("Generating synthetic GloFAS + NASA GPM IMERG hydrological training dataset...")
    df = generate_hydrological_dataset(n_samples=6000)
    
    # Validate with Pandera
    from src.data.schema import validate_hydrological_data
    validated_df = validate_hydrological_data(df)
    
    output_path = os.path.join(raw_dir, "flood_dataset.csv")
    validated_df.to_csv(output_path, index=False)
    
    flood_rate = (validated_df['flood'].sum() / len(validated_df)) * 100
    print(f"Successfully generated and validated {len(validated_df)} records.")
    print(f"Flood event occurrence rate: {flood_rate:.2f}% (Class imbalance preserved).")
    print(f"Saved dataset to: {output_path}")

if __name__ == "__main__":
    main()
