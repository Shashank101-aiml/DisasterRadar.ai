"""
Native Random Forest Comparison Predictor
Loads models/random_forest_model.json (JSON format, strictly no pickle).
Reuses the same 15-feature hydrological schema and decision tiers as the
XGBoost predictor (see feature_engineering.py) so the two models' outputs
are directly comparable for the /api/predict/compare endpoint.
"""

import os
import json
import numpy as np
from models.schemas import PredictionInput
from config import settings
from services.feature_engineering import build_feature_row, classify_risk

_rf_model = None

def get_rf_model():
    global _rf_model
    model_path = settings.RF_MODEL_PATH
    if _rf_model is None and os.path.exists(model_path):
        try:
            with open(model_path, "r") as f:
                data = json.load(f)
            _rf_model = {
                "trees": data.get("trees", []),
                "feature_names": data.get("feature_names", []),
            }
            print(f"Loaded native Random Forest model ({len(_rf_model['trees'])} trees) from {model_path}")
        except Exception as e:
            print(f"Error loading native Random Forest model from {model_path}: {e}")
    return _rf_model

def _predict_tree(tree: dict, sample_vec: np.ndarray) -> np.ndarray:
    """Traverse a single tree down to its leaf node."""
    node = 0
    children_left = tree['children_left']
    children_right = tree['children_right']
    features = tree['feature']
    thresholds = tree['threshold']
    probs = tree['probs']

    while children_left[node] != children_right[node]:
        val = sample_vec[features[node]]
        node = children_left[node] if val <= thresholds[node] else children_right[node]

    return np.array(probs[node])

def predict_flood_risk_rf(params: PredictionInput):
    """Returns (probability_percent, risk_level, risk_class, recommendation)."""
    model = get_rf_model()
    features = build_feature_row(params)

    if model is not None and model["trees"]:
        sample = np.array([features[name] for name in model["feature_names"]])
        tree_probs = [_predict_tree(tree, sample) for tree in model["trees"]]
        prob_raw = float(np.mean(tree_probs, axis=0)[1])
        prob_percent = round(min(99.4, max(2.5, prob_raw * 100.0)), 1)
    else:
        # Neutral fallback if the model file is not present
        prob_percent = 50.0

    risk_level, risk_class, recommendation = classify_risk(prob_percent)
    return prob_percent, risk_level, risk_class, recommendation
