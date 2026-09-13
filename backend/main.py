from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import os

from models.schemas import (
    PredictionInput,
    PredictionResponse,
    StationData,
    ModelMetrics,
    ConfusionMatrix,
    RecentPrediction
)
from services.predictor import predict_flood_risk
from services.stations import get_all_stations
from services.gis_data import get_mira_bhayandar_gis_data

app = FastAPI(
    title="FloodRisk AI - Backend API",
    description="AI-Based Flood Risk Prediction System REST API for realtime telemetry, risk forecasting, and model metrics",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory recent predictions cache (initialized with default data matching screenshot)
RECENT_PREDICTIONS: List[RecentPrediction] = [
    RecentPrediction(time="10:20 AM", location="Bengaluru", probability=78.4, riskLevel="HIGH"),
    RecentPrediction(time="10:18 AM", location="Mysuru", probability=45.2, riskLevel="MODERATE"),
    RecentPrediction(time="10:15 AM", location="Mandya", probability=62.1, riskLevel="HIGH"),
    RecentPrediction(time="10:12 AM", location="Tumakuru", probability=28.3, riskLevel="LOW"),
    RecentPrediction(time="10:10 AM", location="Kolar", probability=71.6, riskLevel="HIGH"),
]

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "FloodRisk AI Backend", "timestamp": datetime.now().isoformat()}

@app.post("/api/predict", response_model=PredictionResponse)
def predict(input_data: PredictionInput):
    try:
        result = predict_flood_risk(input_data)
        
        # Log to recent predictions
        time_str = datetime.now().strftime("%I:%M %p")
        loc_name = input_data.location.split(",")[0] if input_data.location else "Custom Point"
        new_entry = RecentPrediction(
            time=time_str,
            location=loc_name,
            probability=result.probability,
            riskLevel=result.riskLevel
        )
        RECENT_PREDICTIONS.insert(0, new_entry)
        if len(RECENT_PREDICTIONS) > 10:
            RECENT_PREDICTIONS.pop()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stations", response_model=List[StationData])
def list_stations():
    return get_all_stations()

@app.get("/api/gis/mira-bhayandar")
def get_mira_bhayandar_gis():
    return get_mira_bhayandar_gis_data()

@app.get("/api/model/performance", response_model=ModelMetrics)
def model_performance():
    return ModelMetrics(
        modelName="XGBoost (Optimized)",
        accuracy=0.91,
        precision=0.91,
        recall=0.90,
        f1Score=0.90,
        rocAuc=0.96,
        confusionMatrix=ConfusionMatrix(
            actualNoFlood_predictedNoFlood=120,
            actualNoFlood_predictedFlood=15,
            actualFlood_predictedNoFlood=10,
            actualFlood_predictedFlood=130
        )
    )

@app.get("/api/predictions/recent", response_model=List[RecentPrediction])
def recent_predictions():
    return RECENT_PREDICTIONS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
