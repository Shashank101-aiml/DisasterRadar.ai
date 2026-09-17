"""
Tests for Native XGBoost Model & Inference Pipeline
DisasterRadar.ai - Automated Testing
"""

import os
import json
import numpy as np
import pandas as pd
import pytest

from src.models.inference import FloodInferencePipeline, get_inference_pipeline

@pytest.fixture
def models_dir():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "models")

def test_native_xgboost_json_exists(models_dir):
    model_json_path = os.path.join(models_dir, "flood_model.json")
    assert os.path.exists(model_json_path), f"Native XGBoost model missing at {model_json_path}"
    # Verify strict absence of .pkl model
    pkl_path = os.path.join(models_dir, "flood_model.pkl")
    assert not os.path.exists(pkl_path), "Deprecated flood_model.pkl found! Model must be native JSON."

def test_inference_pipeline_execution():
    pipeline = get_inference_pipeline()
    assert pipeline.model is not None, "XGBoost model failed to load in inference pipeline"
    
    # Test high risk scenario
    high_risk_input = {
        'rainfall_24h': 110.0,
        'rainfall_72h': 240.0,
        'elevation': 5.0,
        'slope': 0.2,
        'twi': 16.0,
        'ndwi': 0.75,
        'ndvi': 0.10,
        'drainage_capacity': 2.5,
        'urbanization_index': 9.0
    }
    result_high = pipeline.predict(high_risk_input)
    assert 'probability' in result_high
    assert 'risk_level' in result_high
    assert 'top_risk_factors' in result_high
    assert 0.0 <= result_high['probability'] <= 100.0
    assert len(result_high['top_risk_factors']) > 0

def test_metrics_json_integrity(models_dir):
    metrics_path = os.path.join(models_dir, "metrics.json")
    assert os.path.exists(metrics_path), "metrics.json missing"
    
    with open(metrics_path, "r") as f:
        m = json.load(f)
        
    assert m["accuracy"] >= 0.88, f"Accuracy lower than target: {m['accuracy']}"
    assert m["roc_auc"] >= 0.94, f"ROC-AUC lower than target: {m['roc_auc']}"
    assert m["recall"] >= 0.80, f"Recall lower than target: {m['recall']}"
    assert "confusion_matrix" in m, "Missing confusion matrix in metrics.json"
    assert "WELL GENERALIZED" in m.get("generalization_diagnosis", ""), "Model overfitting check failed"
