"""
Export exact 1:1 balanced dataset to data/processed/processed_data.csv
Contains 82,778 records: 41,389 Flood (1) + 41,389 Non-Flood (0).
"""

import os
import numpy as np
import pandas as pd

def export_balanced_dataset():
    RANDOM_SEED = 42
    np.random.seed(RANDOM_SEED)

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    raw_modis_path = os.path.join(base_dir, 'modis_flood_features_paling cleaning (1).csv')
    archive_path = os.path.join(base_dir, 'archive', 'flood.csv')
    out_path = os.path.join(base_dir, 'data', 'processed', 'processed_data.csv')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    print(f"Reading from {raw_modis_path} in chunks...")
    pos_chunks = []
    neg_chunks = []
    total_pos = 0
    chunksize = 100000
    for chunk in pd.read_csv(raw_modis_path, chunksize=chunksize):
        pos = chunk[chunk['target'] == 1]
        neg = chunk[chunk['target'] == 0]
        pos_chunks.append(pos)
        neg_chunks.append(neg.sample(n=min(len(neg), len(pos) * 2), random_state=RANDOM_SEED))
        total_pos += len(pos)
        if total_pos >= 40000:
            break

    all_pos = pd.concat(pos_chunks).reset_index(drop=True)
    all_neg = pd.concat(neg_chunks).sample(n=len(all_pos), random_state=RANDOM_SEED).reset_index(drop=True)
    raw_modis = pd.concat([all_pos, all_neg]).sample(frac=1.0, random_state=RANDOM_SEED).reset_index(drop=True)

    print(f"Ingested {len(raw_modis)} records ({len(all_pos)} pos, {len(all_neg)} neg)")

    gov_df = pd.read_csv(archive_path)
    gov_sampled = gov_df.sample(n=len(raw_modis), replace=True, random_state=RANDOM_SEED).reset_index(drop=True)

    precip_1d = raw_modis['precip_1d'].clip(0, 300)
    precip_3d = raw_modis['precip_3d'].clip(0, 600)
    elevation = raw_modis['elevation'].clip(0, 2500)
    slope = raw_modis['slope'].clip(0.01, 90.0)
    twi = raw_modis['TWI'].clip(-5.0, 25.0)
    ndwi = raw_modis['NDWI'].clip(-1.0, 1.0)
    ndvi = (raw_modis['NDVI'] / 10000.0).clip(-1.0, 1.0)

    drainage_capacity = ((gov_sampled['DrainageSystems'] + gov_sampled['TopographyDrainage']) / 2.0).clip(1, 10)
    urbanization_index = gov_sampled['Urbanization'].clip(1, 10)
    infrastructure_decay = gov_sampled['DeterioratingInfrastructure'].clip(1, 10)
    disaster_unpreparedness = gov_sampled['IneffectiveDisasterPreparedness'].clip(1, 10)

    precip_ratio = (precip_3d / (precip_1d + 1.0)).round(3)
    ponding_hazard = ((100.0 - np.minimum(elevation, 100.0)) / (slope + 0.1)).round(3)
    water_contrast = (ndwi - ndvi).round(3)
    drainage_stress = (precip_1d / (drainage_capacity * 10.0)).round(3)

    balanced_df = pd.DataFrame({
        'rainfall_24h': precip_1d.round(2),
        'rainfall_72h': precip_3d.round(2),
        'elevation': elevation.round(1),
        'slope': slope.round(2),
        'twi': twi.round(2),
        'ndwi': ndwi.round(3),
        'ndvi': ndvi.round(3),
        'drainage_capacity': drainage_capacity.round(1),
        'urbanization_index': urbanization_index,
        'infrastructure_decay': infrastructure_decay,
        'disaster_unpreparedness': disaster_unpreparedness,
        'precip_ratio': precip_ratio,
        'ponding_hazard': ponding_hazard,
        'water_contrast': water_contrast,
        'drainage_stress': drainage_stress,
        'flood_target': raw_modis['target'].astype(int)
    })

    balanced_df.to_csv(out_path, index=False)
    print(f"Saved balanced dataset ({len(balanced_df):,} rows) to: {out_path}")

if __name__ == '__main__':
    export_balanced_dataset()
