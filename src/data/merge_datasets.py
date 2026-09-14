"""
Dataset Merging & Standardization Pipeline
DisasterRadar.ai - Unified Hydrodynamic, Satellite & Vulnerability Dataset
Combines:
1. MODIS Remote Sensing & Hydrology (precip_1d, precip_3d, elevation, slope, NDVI, NDWI, TWI)
2. Kaggle Governance & Environmental Factors (TopographyDrainage, Urbanization, DrainageSystems, FloodProbability)
3. Hydrodynamic 1D-2D Model Network attributes (flow_accumulation, roughness)
Outputs:
- data/processed/processed_data.csv
- data/raw/flood_weather.csv
"""

import os
import numpy as np
import pandas as pd

def merge_and_standardize_data(sample_size: int = 50000, random_seed: int = 42):
    np.random.seed(random_seed)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    modis_path = os.path.join(base_dir, 'modis_flood_features_paling cleaning (1).csv')
    archive_path = os.path.join(base_dir, 'archive', 'flood.csv')
    m_path = os.path.expanduser('~/Downloads/m/Model_1/train')
    
    print(f"Base Directory: {base_dir}")
    print("Loading MODIS Satellite Features...")
    
    # 1. Sample from 1M-row MODIS dataset with balanced stratification
    # MODIS columns: ['date', 'lon', 'lat', 'flooded', 'jrc_perm_water', 'precip_1d', 'precip_3d', 'NDVI', 'NDWI', 'landcover', 'elevation', 'slope', 'aspect', 'upstream_area', 'TWI', 'target']
    chunks = []
    chunksize = 100000
    total_loaded = 0
    for chunk in pd.read_csv(modis_path, chunksize=chunksize):
        # Keep positive and sample negative to enrich flood signal
        pos = chunk[chunk['target'] == 1]
        neg = chunk[chunk['target'] == 0].sample(n=min(len(chunk[chunk['target'] == 0]), len(pos) * 4), random_state=random_seed)
        chunks.append(pd.concat([pos, neg]))
        total_loaded += len(chunk)
        if total_loaded >= 500000:
            break
            
    modis_df = pd.concat(chunks).sample(n=min(sample_size, sum(len(c) for c in chunks)), random_state=random_seed).reset_index(drop=True)
    print(f"Sampled {len(modis_df)} stratified rows from MODIS dataset (Positive rate: {modis_df['target'].mean():.2%})")
    
    # 2. Load Environmental & Vulnerability Features from archive/flood.csv
    print("Loading Environmental & Governance Features from archive/flood.csv...")
    gov_df = pd.read_csv(archive_path)
    gov_sampled = gov_df.sample(n=len(modis_df), replace=True, random_state=random_seed).reset_index(drop=True)
    
    # 3. Load Hydrodynamic node attributes from m/Model_1 if available
    flow_acc_vals = np.zeros(len(modis_df))
    roughness_vals = np.ones(len(modis_df)) * 0.035
    m_2d_nodes = os.path.join(m_path, '2d_nodes_static.csv')
    if os.path.exists(m_2d_nodes):
        print("Loading Hydrodynamic static node features from Downloads/m...")
        try:
            m_df = pd.read_csv(m_2d_nodes, nrows=5000)
            if 'flow_accumulation' in m_df.columns:
                m_sampled = m_df.sample(n=len(modis_df), replace=True, random_state=random_seed).reset_index(drop=True)
                flow_acc_vals = m_sampled['flow_accumulation'].values
            if 'roughness' in m_df.columns:
                roughness_vals = m_sampled['roughness'].values
        except Exception as e:
            print(f"Notice: {e}, falling back to synthetic hydrodynamic priors")
            
    # 4. Construct unified standardized dataset
    print("Synthesizing unified hydrological features...")
    rainfall_24h = modis_df['precip_1d'].clip(0, 300).round(2)
    rainfall_72h = modis_df['precip_3d'].clip(0, 600).round(2)
    elevation = modis_df['elevation'].clip(0, 2500).round(1)
    slope = modis_df['slope'].clip(0, 90).round(2)
    twi = modis_df['TWI'].clip(-5, 25).round(2)
    ndwi = modis_df['NDWI'].clip(-1.0, 1.0).round(3)
    ndvi = (modis_df['NDVI'] / 10000.0).clip(-1.0, 1.0).round(3)
    
    drainage_capacity = (gov_sampled['DrainageSystems'] + gov_sampled['TopographyDrainage']) / 2.0
    urbanization_index = gov_sampled['Urbanization'].clip(1, 10)
    infra_decay = gov_sampled['DeterioratingInfrastructure'].clip(1, 10)
    gov_preparedness = gov_sampled['IneffectiveDisasterPreparedness'].clip(1, 10)
    
    # Ground truth target: combine satellite target with rainfall thresholds & governance risk
    base_target = modis_df['target'].values
    prob_score = (
        0.35 * (rainfall_72h.values / 150.0) +
        0.25 * (rainfall_24h.values / 75.0) +
        0.15 * ((200.0 - np.minimum(elevation.values, 200.0)) / 200.0) +
        0.10 * (twi.values / 10.0) +
        0.15 * (urbanization_index.values / 10.0)
    )
    prob_score = 1.0 / (1.0 + np.exp(-4.0 * (prob_score - 0.65)))
    
    # Target consensus: high probability or satellite confirmed flood
    flood_binary = np.where((base_target == 1) | (prob_score >= 0.62), 1, 0)
    
    merged_df = pd.DataFrame({
        'rainfall_24h': rainfall_24h,
        'rainfall_72h': rainfall_72h,
        'elevation': elevation,
        'slope': slope,
        'twi': twi,
        'ndwi': ndwi,
        'ndvi': ndvi,
        'drainage_capacity': drainage_capacity.round(1),
        'urbanization_index': urbanization_index,
        'infrastructure_decay': infra_decay,
        'disaster_unpreparedness': gov_preparedness,
        'flow_accumulation': np.round(flow_acc_vals, 2),
        'roughness': np.round(roughness_vals, 4),
        'flood_probability': np.round(prob_score, 4),
        'flood_target': flood_binary
    })
    
    # Save datasets
    raw_csv = os.path.join(base_dir, 'data', 'raw', 'flood_weather.csv')
    proc_csv = os.path.join(base_dir, 'data', 'processed', 'processed_data.csv')
    
    os.makedirs(os.path.dirname(raw_csv), exist_ok=True)
    os.makedirs(os.path.dirname(proc_csv), exist_ok=True)
    
    merged_df.to_csv(raw_csv, index=False)
    merged_df.to_csv(proc_csv, index=False)
    
    print(f"Successfully generated merged dataset!")
    print(f"Processed CSV: {proc_csv} ({os.path.getsize(proc_csv) / (1024*1024):.2f} MB)")
    print(f"Total rows: {len(merged_df)}, Features: {merged_df.shape[1] - 2}")
    print(f"Flood Target Distribution:\n{merged_df['flood_target'].value_counts(normalize=True)}")
    return merged_df

if __name__ == '__main__':
    merge_and_standardize_data()
