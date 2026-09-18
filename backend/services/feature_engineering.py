"""
Shared Hydrological Feature Engineering
Builds the 15-feature vector consumed by every model (XGBoost, Random Forest,
FloodNet) from the same raw telemetry inputs, and applies the shared decision
thresholds so predictions across models stay directly comparable.
"""

import math
from models.schemas import PredictionInput, RiskFactor


def build_feature_row(params: PredictionInput) -> dict:
    r24 = float(params.rainfall24h)
    r72 = float(params.rainfall72h)
    hum = float(params.humidity)
    elev = float(params.elevation)

    slope = max(0.2, min(15.0, (1000.0 - min(elev, 950.0)) / 100.0))
    slope_rad = math.radians(max(0.1, slope))
    twi = round(math.log(max(10.0, (100.0 - min(elev, 95.0)) * 5.0) / max(0.01, math.tan(slope_rad))), 2)
    twi = max(-4.0, min(24.0, twi))

    ndwi = round(max(-0.8, min(0.9, (hum - 45.0) / 60.0)), 3)
    ndvi = round(max(0.05, min(0.85, 0.48 - (r24 / 500.0))), 3)

    # Socioeconomic & Infrastructure Proxies
    drainage_capacity = 5.5
    urbanization_index = 7.5
    infrastructure_decay = 6.0
    disaster_unpreparedness = 6.0

    precip_ratio = round(r72 / (r24 + 1.0), 3)
    ponding_hazard = round((100.0 - min(elev, 100.0)) / (slope + 0.1), 3)
    water_contrast = round(ndwi - ndvi, 3)
    drainage_stress = round(r24 / (drainage_capacity * 10.0), 3)

    return {
        'rainfall_24h': r24,
        'rainfall_72h': r72,
        'elevation': elev,
        'slope': slope,
        'twi': twi,
        'ndwi': ndwi,
        'ndvi': ndvi,
        'drainage_capacity': drainage_capacity,
        'urbanization_index': urbanization_index,
        'infrastructure_decay': infrastructure_decay,
        'disaster_unpreparedness': disaster_unpreparedness,
        'precip_ratio': precip_ratio,
        'ponding_hazard': ponding_hazard,
        'water_contrast': water_contrast,
        'drainage_stress': drainage_stress,
    }


def classify_risk(prob_percent: float) -> tuple[str, str, str]:
    """Shared decision tiers so every model's output maps to the same advisory language."""
    if prob_percent >= 70.0:
        return (
            "CRITICAL", "high",
            "EMERGENCY: High likelihood of inundation. Low-lying basements and underpasses flooding imminent. Deploy NDRF and dewatering pumps."
        )
    elif prob_percent >= 50.0:
        return (
            "HIGH", "high",
            "WARNING: Heavy storm runoff exceeding storm drain capacity. Issue citizen safety alert and clear blocked culverts."
        )
    elif prob_percent >= 30.0:
        return (
            "MODERATE", "moderate",
            "CAUTION: Water accumulation likely at known chronic bottlenecks. Municipal road crews should inspect drains."
        )
    else:
        return (
            "LOW", "low",
            "SAFE: Environmental conditions well within absorption thresholds. Continue routine hydrological monitoring."
        )


def compute_risk_factors(params: PredictionInput) -> list[RiskFactor]:
    r24 = float(params.rainfall24h)
    r72 = float(params.rainfall72h)
    hum = float(params.humidity)
    elev = float(params.elevation)

    denom = r72 + r24 + hum + 50.0
    factor_72h = min(50, round((r72 / denom) * 68.0))
    factor_24h = min(40, round((r24 / denom) * 52.0))
    factor_hum = min(25, round((hum / 100.0) * 15.0))
    factor_elev = min(20, round(max(0, 1100 - elev) / 1100 * 12.0))
    factor_temp = 8

    return [
        RiskFactor(name="Rainfall (72h)", value=max(5, factor_72h), color="#ef4444"),
        RiskFactor(name="Rainfall (24h)", value=max(4, factor_24h), color="#f97316"),
        RiskFactor(name="Humidity", value=max(3, factor_hum), color="#eab308"),
        RiskFactor(name="Elevation", value=max(2, factor_elev), color="#a3e635"),
        RiskFactor(name="Temperature", value=factor_temp, color="#84cc16"),
    ]
