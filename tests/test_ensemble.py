import os
import sys
import pytest

backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.schemas import PredictionInput
from services.ensemble_predictor import predict_flood_risk_ensemble
from services.predictor import predict_flood_risk
from services.rf_predictor import predict_flood_risk_rf

def test_ensemble_predictor_execution():
    params = PredictionInput(
        rainfall24h=95.0,
        rainfall72h=180.0,
        temperature=24.0,
        humidity=88.0,
        windSpeed=18.0,
        pressure=998.0,
        elevation=6.0,
        latitude=12.9716,
        longitude=77.5946,
        location="Bengaluru, Karnataka",
        drainageCapacity=3.0,
        ndwi=0.35,
        slope=0.3
    )

    # 1. Test individual tree model predictions
    xgb_res = predict_flood_risk(params)
    assert 0.0 <= xgb_res.probability <= 100.0

    rf_prob, rf_level, rf_class, rf_rec = predict_flood_risk_rf(params)
    assert 0.0 <= rf_prob <= 100.0

    # 2. Test Super-Stack Ensemble Soft-Voting prediction
    ens_res = predict_flood_risk_ensemble(params)
    assert 0.0 <= ens_res.probability <= 100.0
    assert ens_res.riskLevel in ("LOW", "MODERATE", "HIGH", "CRITICAL")
    assert ens_res.riskClass in ("low", "moderate", "high")
    assert len(ens_res.riskFactors) > 0

    # 3. Verify weighted blend calculation
    expected_prob = round(0.60 * rf_prob + 0.40 * xgb_res.probability, 1)
    assert ens_res.probability == expected_prob

def test_ensemble_severe_risk_scenario():
    severe_params = PredictionInput(
        rainfall24h=140.0,
        rainfall72h=220.0,
        temperature=22.0,
        humidity=95.0,
        windSpeed=25.0,
        pressure=990.0,
        elevation=2.0,
        latitude=19.2952,
        longitude=72.8544,
        location="Mira Bhayandar, Maharashtra",
        drainageCapacity=2.0,
        ndwi=0.45,
        slope=0.1
    )

    ens_res = predict_flood_risk_ensemble(severe_params)
    assert ens_res.probability >= 50.0
    assert ens_res.riskClass == "high"
    assert "ENSEMBLE CONSENSUS" in ens_res.recommendation
