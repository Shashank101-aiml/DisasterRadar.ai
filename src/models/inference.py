"""
DisasterRadar.ai - Production XGBoost Inference Pipeline (Step 17)
Loads native models/flood_model.json (strictly NO pickle).
Executes:
Raw Input -> Validation -> Hydrological Feature Engineering -> XGBoost Inundation Probability -> Native TreeSHAP Attribution -> Actionable Advisory
"""

import os
import json
import math
import numpy as np
import pandas as pd
import xgboost as xgb

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_JSON_PATH = os.path.join(BASE_DIR, "models", "flood_model.json")
FEATURE_NAMES_PATH = os.path.join(BASE_DIR, "models", "feature_names.json")
METRICS_PATH = os.path.join(BASE_DIR, "models", "metrics.json")

class FloodInferencePipeline:
    def __init__(self, model_path: str = MODEL_JSON_PATH):
        self.model_path = model_path
        self.model = None
        self.features = []
        self.metrics = {}
        self.load_artifacts()
        
    def load_artifacts(self):
        if os.path.exists(self.model_path):
            self.model = xgb.XGBClassifier()
            self.model.load_model(self.model_path)
            print(f"[InferencePipeline] Loaded native XGBoost model from: {self.model_path}")
        else:
            print(f"[InferencePipeline] Warning: Model file {self.model_path} not found.")
            
        if os.path.exists(FEATURE_NAMES_PATH):
            with open(FEATURE_NAMES_PATH, 'r') as f:
                self.features = json.load(f).get('features', [])
                
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, 'r') as f:
                self.metrics = json.load(f)

    def predict(self, raw_input: dict) -> dict:
        """
        Executes end-to-end inference from raw sensor telemetry or municipal inputs.
        """
        # 1. Extraction and Physical Bound Validation
        r24 = max(0.0, float(raw_input.get("rainfall_24h", raw_input.get("rainfall24h", 85.0))))
        r72 = max(0.0, float(raw_input.get("rainfall_72h", raw_input.get("rainfall72h", 190.0))))
        elev = max(0.0, float(raw_input.get("elevation", 15.0)))
        slope = max(0.01, min(90.0, float(raw_input.get("slope", 0.8))))
        twi = max(-5.0, min(25.0, float(raw_input.get("twi", 12.0))))
        ndwi = max(-1.0, min(1.0, float(raw_input.get("ndwi", 0.45))))
        ndvi = max(-1.0, min(1.0, float(raw_input.get("ndvi", 0.20))))
        
        drainage = max(1.0, min(10.0, float(raw_input.get("drainage_capacity", 4.0))))
        urban = max(1.0, min(10.0, float(raw_input.get("urbanization_index", 7.5))))
        infra = max(1.0, min(10.0, float(raw_input.get("infrastructure_decay", 6.5))))
        unprepared = max(1.0, min(10.0, float(raw_input.get("disaster_unpreparedness", 7.0))))
        
        # 2. Exact Domain Feature Transformations (matching training)
        precip_ratio = round(r72 / (r24 + 1.0), 3)
        ponding_hazard = round((100.0 - min(elev, 100.0)) / (slope + 0.1), 3)
        water_contrast = round(ndwi - ndvi, 3)
        drainage_stress = round(r24 / (drainage * 10.0), 3)
        
        # 3. Assemble Feature DataFrame in Exact Training Order
        row_dict = {
            'rainfall_24h': round(r24, 2),
            'rainfall_72h': round(r72, 2),
            'elevation': round(elev, 1),
            'slope': round(slope, 2),
            'twi': round(twi, 2),
            'ndwi': round(ndwi, 3),
            'ndvi': round(ndvi, 3),
            'drainage_capacity': round(drainage, 1),
            'urbanization_index': urban,
            'infrastructure_decay': infra,
            'disaster_unpreparedness': unprepared,
            'precip_ratio': precip_ratio,
            'ponding_hazard': ponding_hazard,
            'water_contrast': water_contrast,
            'drainage_stress': drainage_stress
        }
        
        # Ensure column order matches feature_names
        cols = self.features if self.features else list(row_dict.keys())
        df_input = pd.DataFrame([row_dict])[cols]
        
        # 4. Native Model Inference
        if self.model is not None:
            prob_raw = float(self.model.predict_proba(df_input)[0, 1])
            
            # 5. TreeSHAP Instance Contribution
            dmatrix = xgb.DMatrix(df_input)
            contribs = self.model.get_booster().predict(dmatrix, pred_contribs=True)[0]
            feature_contribs = contribs[:-1]
            bias = contribs[-1]
            
            shap_breakdown = sorted(
                zip(cols, feature_contribs),
                key=lambda x: abs(x[1]),
                reverse=True
            )
        else:
            # Fallback
            prob_raw = 0.5
            shap_breakdown = [(c, 0.0) for c in cols]
            
        prob_percent = round(min(99.4, max(2.5, prob_raw * 100.0)), 1)
        
        # 6. Risk Stratification & Actionable Advisory
        if prob_percent >= 70.0:
            risk_level = "HIGH"
            risk_class = "high"
            recommendation = "CRITICAL: Torrential rainfall and drainage congestion threshold breached. Activate municipal flood sirens, mobilize NDRF pumps, and begin low-lying evacuation."
        elif prob_percent >= 40.0:
            risk_level = "MODERATE"
            risk_class = "moderate"
            recommendation = "ADVISORY: Waterlogging expected across arterial storm channels. Deploy culvert inspection squads and issue traffic diversion bulletins."
        else:
            risk_level = "LOW"
            risk_class = "low"
            recommendation = "NORMAL: Environmental conditions within catchment capacity. Continue standard radar surveillance."
            
        # Top 5 contributing factors
        top_factors = []
        color_map = {
            'rainfall_72h': '#ef4444',
            'rainfall_24h': '#f97316',
            'elevation': '#eab308',
            'ponding_hazard': '#a3e635',
            'water_contrast': '#38bdf8',
            'drainage_stress': '#ec4899',
            'twi': '#8b5cf6'
        }
        for f, val in shap_breakdown[:5]:
            top_factors.append({
                'name': f.replace('_', ' ').title(),
                'shap_impact': round(float(val), 4),
                'direction': 'Increasing Risk' if val > 0 else 'Mitigating Risk',
                'color': color_map.get(f, '#64748b')
            })
            
        return {
            'probability': prob_percent,
            'risk_level': risk_level,
            'risk_class': risk_class,
            'recommendation': recommendation,
            'top_risk_factors': top_factors,
            'input_features': row_dict,
            'model_source': 'flood_model.json (Native XGBoost)'
        }

_pipeline = None

def get_inference_pipeline() -> FloodInferencePipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = FloodInferencePipeline()
    return _pipeline

if __name__ == '__main__':
    pipeline = get_inference_pipeline()
    # Test extreme monsoon scenario
    test_event = {
        'rainfall_24h': 95.0,
        'rainfall_72h': 210.0,
        'elevation': 8.0,
        'slope': 0.4,
        'twi': 14.5,
        'ndwi': 0.65,
        'ndvi': 0.15,
        'drainage_capacity': 3.0,
        'urbanization_index': 8.5
    }
    result = pipeline.predict(test_event)
    print("\n--- INFERENCE RESULT ---")
    print(f"Flood Probability: {result['probability']}% | Level: {result['risk_level']}")
    print(f"Advisory: {result['recommendation']}")
    print("Top SHAP Drivers:")
    for f in result['top_risk_factors']:
        print(f"  • {f['name']}: {f['shap_impact']:+.4f} ({f['direction']})")
