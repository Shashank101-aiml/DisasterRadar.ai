"""
Automated Tests for Native Random Forest Model & Inference Pipeline
DisasterRadar.ai - Testing Suite (STRICTLY NO PICKLE)
"""

import os
import json
import pytest
from src.models.inference_rf import NativeRandomForestPredictor

@pytest.fixture
def models_dir():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "models")

def test_random_forest_json_exists(models_dir):
    model_json_path = os.path.join(models_dir, "random_forest_model.json")
    assert os.path.exists(model_json_path), f"Native Random Forest model missing at {model_json_path}"
    
    # Strictly enforce NO .pkl file exists for random forest
    pkl_path = os.path.join(models_dir, "random_forest.pkl")
    assert not os.path.exists(pkl_path), "Forbidden random_forest.pkl found! Model must be strictly JSON."
    
    rf_pkl_path = os.path.join(models_dir, "random_forest_model.pkl")
    assert not os.path.exists(rf_pkl_path), "Forbidden random_forest_model.pkl found! Model must be strictly JSON."

def test_random_forest_metrics_integrity(models_dir):
    metrics_path = os.path.join(models_dir, "random_forest_metrics.json")
    assert os.path.exists(metrics_path), "random_forest_metrics.json is missing"
    
    with open(metrics_path, "r") as f:
        metrics = json.load(f)
        
    assert metrics["accuracy"] >= 0.85, f"Accuracy too low: {metrics['accuracy']}"
    assert metrics["roc_auc"] >= 0.90, f"ROC-AUC too low: {metrics['roc_auc']}"
    assert metrics["recall"] >= 0.85, f"Recall too low: {metrics['recall']}"
    assert "confusion_matrix" in metrics, "Missing confusion matrix in RF metrics"
    assert metrics["serialization_format"] == "native_json", "Serialization must be native_json"

def test_random_forest_inference_execution():
    predictor = NativeRandomForestPredictor()
    assert predictor.n_estimators > 0, "Zero estimators loaded"
    assert len(predictor.feature_names) == 15, "Feature schema mismatch"
    
    # Realistic high-risk flood inundation profile (low elevation, high ponding hazard, flat slope)
    high_risk_input = {
        'rainfall_24h': 18.0,
        'rainfall_72h': 75.0,
        'elevation': 5.0,
        'slope': 0.30,
        'twi': 2.5,
        'ndwi': 0.25,
        'ndvi': 0.58,
        'drainage_capacity': 3.5,
        'urbanization_index': 8.0,
        'infrastructure_decay': 6.0,
        'disaster_unpreparedness': 6.0,
        'precip_ratio': 4.15,
        'ponding_hazard': 237.5,
        'water_contrast': -0.33,
        'drainage_stress': 0.51
    }
    
    res = predictor.explain(high_risk_input)
    assert res["flood_probability"] >= 60.0, f"Expected high risk, got {res['flood_probability']}"
    assert res["risk_level"] in ("HIGH", "CRITICAL")
    
    # Realistic low-risk elevated highland profile
    low_risk_input = {
        'rainfall_24h': 1.0,
        'rainfall_72h': 4.0,
        'elevation': 650.0,
        'slope': 18.0,
        'twi': -1.5,
        'ndwi': -0.35,
        'ndvi': 0.72,
        'drainage_capacity': 8.5,
        'urbanization_index': 2.0,
        'infrastructure_decay': 1.5,
        'disaster_unpreparedness': 1.0,
        'precip_ratio': 2.0,
        'ponding_hazard': 0.0,
        'water_contrast': -1.07,
        'drainage_stress': 0.01
    }
    
    res_low = predictor.explain(low_risk_input)
    assert res_low["flood_probability"] < 35.0, f"Expected low risk, got {res_low['flood_probability']}"
    assert res_low["risk_level"] in ("LOW", "MODERATE")
