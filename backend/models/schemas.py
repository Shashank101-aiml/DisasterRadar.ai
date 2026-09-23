from pydantic import BaseModel, Field
from typing import List, Optional

class PredictionInput(BaseModel):
    rainfall24h: float = Field(85.0, description="Rainfall in the last 24 hours in mm")
    rainfall72h: float = Field(190.0, description="Cumulative rainfall in the last 72 hours in mm")
    temperature: float = Field(25.0, description="Temperature in Celsius")
    humidity: float = Field(82.0, description="Relative humidity in percentage")
    windSpeed: float = Field(12.0, description="Wind speed in km/h")
    pressure: float = Field(1005.0, description="Atmospheric pressure in hPa")
    elevation: float = Field(900.0, description="Elevation above sea level in meters")
    latitude: float = Field(12.97, description="Latitude coordinate")
    longitude: float = Field(77.59, description="Longitude coordinate")
    location: Optional[str] = Field("Bengaluru, Karnataka", description="Location name")

class RiskFactor(BaseModel):
    name: str
    value: int
    color: str

class PredictionResponse(BaseModel):
    probability: float
    riskLevel: str
    riskClass: str
    recommendation: str
    location: str
    latitude: float
    longitude: float
    riskFactors: List[RiskFactor]

class StationData(BaseModel):
    name: str
    lat: float
    lng: float
    risk: str
    level: str
    prob: float
    r24: float
    r72: float
    elev: float
    temp: float
    hum: float

class ConfusionMatrix(BaseModel):
    actualNoFlood_predictedNoFlood: int
    actualNoFlood_predictedFlood: int
    actualFlood_predictedNoFlood: int
    actualFlood_predictedFlood: int

class ModelMetrics(BaseModel):
    modelName: str
    accuracy: float
    precision: float
    recall: float
    f1Score: float
    rocAuc: float
    confusionMatrix: ConfusionMatrix

class RecentPrediction(BaseModel):
    time: str
    location: str
    probability: float
    riskLevel: str

class ModelPrediction(BaseModel):
    modelId: str
    modelName: str
    probability: float
    riskLevel: str
    riskClass: str
    recommendation: str

class PredictionCompareResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    predictions: List[ModelPrediction]
    agreement: str
    probabilityDelta: float

class ActiveAlertItem(BaseModel):
    id: str
    location: str
    latitude: float
    longitude: float
    probability: float
    riskLevel: str
    alertTier: str
    headline: str
    actionRequired: str
    rainfall24h: float
    rainfall72h: float
    waterDepthEstCm: float
    timestamp: str

class AlertsListResponse(BaseModel):
    totalActive: int
    threshold: float
    alerts: List[ActiveAlertItem]
    generatedAt: str

class CitizenReportCreate(BaseModel):
    location: str
    latitude: float
    longitude: float
    waterDepthCm: float = Field(..., ge=0, le=1000)
    severity: str = Field("MODERATE", description="LOW, MODERATE, HIGH, CRITICAL")
    description: str
    reporterName: Optional[str] = "Anonymous Citizen"
    photoUrl: Optional[str] = None

class CitizenReportResponse(BaseModel):
    id: int
    timestamp: str
    location: str
    latitude: float
    longitude: float
    waterDepthCm: float
    severity: str
    description: str
    reporterName: str
    photoUrl: Optional[str]
    status: str

class TelemetryIngestRequest(BaseModel):
    stationId: str
    stationName: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rainfall24h: float
    rainfall72h: float
    elevation: Optional[float] = 15.0
    waterLevelMeters: float = 0.0
    temperature: Optional[float] = 26.0
    humidity: Optional[float] = 75.0
    status: Optional[str] = "ONLINE"

class TelemetryIngestResponse(BaseModel):
    status: str
    stationId: str
    recordedAt: str
    evaluatedRiskProbability: float
    evaluatedRiskLevel: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    fullName: Optional[str] = "Citizen User"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    fullName: str
    createdAt: str

class AuthTokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserResponse

