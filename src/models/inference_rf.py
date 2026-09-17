"""
DisasterRadar.ai - Native JSON Random Forest Inference Engine
Executes Random Forest inference directly from models/random_forest_model.json.
STRICTLY NO PICKLE. Pure NumPy & JSON execution.
"""

import os
import json
import numpy as np
from typing import Dict, List, Union, Any

class NativeRandomForestPredictor:
    def __init__(self, model_json_path: str = None):
        if model_json_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_json_path = os.path.join(base_dir, "models", "random_forest_model.json")
            
        self.model_json_path = model_json_path
        self.trees = []
        self.feature_names = []
        self.n_estimators = 0
        self.load_model()

    def load_model(self):
        if not os.path.exists(self.model_json_path):
            raise FileNotFoundError(f"Native Random Forest model JSON not found at {self.model_json_path}")
            
        with open(self.model_json_path, "r") as f:
            data = json.load(f)
            
        self.feature_names = data.get("feature_names", [])
        self.n_estimators = data.get("n_estimators", 0)
        self.trees = data.get("trees", [])
        print(f"Loaded Native Random Forest ({self.n_estimators} trees, {len(self.feature_names)} features) from {self.model_json_path}")

    def _predict_tree(self, tree: dict, sample_vec: np.ndarray) -> np.ndarray:
        """Traverse a single tree down to its leaf node."""
        node = 0
        children_left = tree['children_left']
        children_right = tree['children_right']
        features = tree['feature']
        thresholds = tree['threshold']
        probs = tree['probs']
        
        while children_left[node] != children_right[node]:
            f_idx = features[node]
            thresh = thresholds[node]
            val = sample_vec[f_idx]
            if val <= thresh:
                node = children_left[node]
            else:
                node = children_right[node]
                
        return np.array(probs[node])

    def predict_proba(self, X: Union[Dict[str, float], List[float], np.ndarray]) -> np.ndarray:
        """
        Predict class probabilities for single sample or batch.
        Returns array of [P(Safe), P(Flood)].
        """
        if isinstance(X, dict):
            sample = np.array([float(X.get(col, 0.0)) for col in self.feature_names])
            is_single = True
        elif isinstance(X, (list, tuple)):
            sample = np.array(X, dtype=float)
            is_single = sample.ndim == 1
        elif isinstance(X, np.ndarray):
            sample = X
            is_single = sample.ndim == 1
        else:
            raise ValueError(f"Unsupported input type: {type(X)}")

        if is_single:
            # Single sample evaluation
            tree_probs = [self._predict_tree(t, sample) for t in self.trees]
            return np.mean(tree_probs, axis=0)
        else:
            # Batch evaluation
            batch_probs = []
            for row in sample:
                tp = [self._predict_tree(t, row) for t in self.trees]
                batch_probs.append(np.mean(tp, axis=0))
            return np.array(batch_probs)

    def predict(self, X: Union[Dict[str, float], List[float], np.ndarray], threshold: float = 0.50) -> Union[int, np.ndarray]:
        """Predict binary class 0 (Safe) or 1 (Flood)."""
        proba = self.predict_proba(X)
        if proba.ndim == 1:
            return int(proba[1] >= threshold)
        else:
            return (proba[:, 1] >= threshold).astype(int)

    def explain(self, X_dict: Dict[str, float]) -> Dict[str, Any]:
        """Produce risk severity, probability, and primary risk contributors."""
        proba = self.predict_proba(X_dict)
        flood_prob = round(float(proba[1]) * 100.0, 2)
        
        if flood_prob >= 75.0:
            level = "CRITICAL"
        elif flood_prob >= 50.0:
            level = "HIGH"
        elif flood_prob >= 25.0:
            level = "MODERATE"
        else:
            level = "LOW"
            
        return {
            "model": "Random Forest (Native JSON)",
            "flood_probability": flood_prob,
            "risk_level": level,
            "prediction": "Flood Warning" if flood_prob >= 50.0 else "Safe / Normal"
        }

if __name__ == "__main__":
    predictor = NativeRandomForestPredictor()
    test_sample = {
        'rainfall_24h': 120.0,
        'rainfall_72h': 260.0,
        'elevation': 8.0,
        'slope': 0.4,
        'twi': 15.2,
        'ndwi': 0.72,
        'ndvi': 0.12,
        'drainage_capacity': 2.0,
        'urbanization_index': 8.5,
        'infrastructure_decay': 7.0,
        'disaster_unpreparedness': 6.5,
        'precip_ratio': 2.15,
        'ponding_hazard': 184.0,
        'water_contrast': 0.60,
        'drainage_stress': 6.0
    }
    result = predictor.explain(test_sample)
    print("\n--- Test Prediction from Native JSON Random Forest ---")
    for k, v in result.items():
        print(f"{k}: {v}")
