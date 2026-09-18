// Typed interfaces for the DisasterRadar.ai backend (backend/main.py, backend/models/schemas.py).
// Endpoints backed by a Pydantic response_model are typed exactly; endpoints that return
// raw dicts (no response_model) are typed as best-effort/manually-maintained — the backend
// won't validate their shape, so treat these as advisory, not guaranteed.

export interface PredictionInput {
  rainfall24h: number;
  rainfall72h: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  elevation: number;
  latitude: number;
  longitude: number;
  location?: string;
}

export interface RiskFactor {
  name: string;
  value: number;
  color: string;
}

export interface PredictionResponse {
  probability: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskClass: 'low' | 'moderate' | 'high';
  recommendation: string;
  location: string;
  latitude: number;
  longitude: number;
  riskFactors: RiskFactor[];
}

export interface ModelPrediction {
  modelId: string;
  modelName: string;
  probability: number;
  riskLevel: string;
  riskClass: string;
  recommendation: string;
}

export interface PredictionCompareResponse {
  location: string;
  latitude: number;
  longitude: number;
  predictions: ModelPrediction[];
  agreement: 'Consensus' | 'Divergent';
  probabilityDelta: number;
}

export interface StationData {
  name: string;
  lat: number;
  lng: number;
  risk: string;
  level: string;
  prob: number;
  r24: number;
  r72: number;
  elev: number;
  temp: number;
  hum: number;
}

export interface ConfusionMatrix {
  actualNoFlood_predictedNoFlood: number;
  actualNoFlood_predictedFlood: number;
  actualFlood_predictedNoFlood: number;
  actualFlood_predictedFlood: number;
}

export interface ModelMetrics {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: ConfusionMatrix;
}

export interface RecentPrediction {
  time: string;
  location: string;
  probability: number;
  riskLevel: string;
}

// --- Below: raw-dict endpoints, no backend response_model — best-effort shapes ---

export interface HistoricalEvent {
  id: number;
  event_name: string;
  location: string;
  region: string;
  state: string;
  event_date: string;
  year: number;
  rainfall_24h_mm: number;
  rainfall_72h_mm: number;
  peak_water_level_m: number;
  severity: string;
  primary_cause: string;
  damage_assessment: string;
  evacuated_count: number;
  verified_source: string;
}

export interface HistoricalStats {
  database_engine: string;
  total_historical_events: number;
  max_recorded_rainfall_24h_mm: number;
  avg_flood_depth_m: number;
  total_documented_evacuations: number;
  critical_disasters_count: number;
  total_prediction_audits: number;
  // Note: the next 3 fields are hardcoded constants server-side, not derived from
  // live data — do not present them to users as real-time metrics.
  indexed_modis_records: number;
  indexed_governance_records: number;
  active_telemetry_stations: number;
}

export interface PredictionAuditRow {
  id: number;
  timestamp: string;
  location: string;
  rainfall_24h: number;
  rainfall_72h: number;
  elevation: number;
  drainage_capacity: number;
  probability: number;
  risk_level: string;
  primary_driver: string;
  advisory: string;
}

export interface GisZone {
  id: string;
  name: string;
  riskLevel: string;
  color: string;
  fillOpacity: number;
  floodDepth: string;
  coordinates: [number, number][];
}

export interface GisHotspot {
  name: string;
  lat: number;
  lng: number;
  depth: string;
  status: string;
}

export interface MiraBhayandarGisData {
  metadata: { title: string; location: string; date: string; center: [number, number]; zoom: number };
  zones: GisZone[];
  railway: [number, number][];
  roads: [number, number][][];
  hotspots: GisHotspot[];
}

export interface DetailedModelComparisonEntry {
  id: string;
  name: string;
  badge: string;
  isActive: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  latencyMs: number;
  modelSizeMb: number;
  trainingTimeSec: number;
  architecture: string;
  confusionMatrix: { tn: number; fp: number; fn: number; tp: number };
  pros: string[];
  cons: string[];
}

export interface DetailedModelAnalytics {
  status: string;
  primaryModel: string;
  datasetSummary: Record<string, unknown>;
  models: DetailedModelComparisonEntry[];
  features: Array<{
    name: string;
    label: string;
    category: string;
    unit: string;
    shapImpact: number;
    description: string;
  }>;
}

export interface GeospatialProviderStatus {
  active?: boolean;
  configured?: boolean;
  type: string;
  has_custom_key?: boolean;
}

export interface GeospatialProviders {
  open_meteo: GeospatialProviderStatus;
  copernicus_sentinel_hub: GeospatialProviderStatus;
  google_earth_engine: GeospatialProviderStatus;
  openstreetmap: GeospatialProviderStatus;
  mapbox: GeospatialProviderStatus;
}

export interface LiveWeatherResponse {
  status: 'success' | 'fallback';
  source: string;
  location: string;
  latitude: number;
  longitude: number;
  elevation: number;
  rainfall_24h: number;
  rainfall_72h: number;
  precip_ratio: number;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
}

export interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  country: string;
  admin1: string;
}

export interface AlertScoringResponse {
  location: string;
  latitude: number;
  longitude: number;
  probability: number;
  threshold: number;
  threshold_crossed: boolean;
  delta_from_threshold: number;
  alert_tier: string;
  alert_badge: string;
  color: string;
  headline: string;
  description: string;
  action_required: string;
  timestamp: string;
}

export interface RainfallImpactResponse {
  base_probability: number;
  base_rainfall_24h: number;
  base_rainfall_72h: number;
  elevation: number;
  increase_scenarios: unknown[];
  decrease_scenarios: unknown[];
  safe_absorption_buffer_mm: number;
  current_safety_rating: string;
  safety_status_code: string;
  estimated_drain_time_hours: number;
  soil_saturation_pct: number;
}

export interface PrecautionItem {
  title: string;
  action: string;
  importance: string;
}

export interface WeeklyReportResponse {
  location: string;
  latitude: number;
  longitude: number;
  threshold: number;
  weekly_records: unknown[];
  precautions: {
    citizens: PrecautionItem[];
    commuters: PrecautionItem[];
    municipal_responders: PrecautionItem[];
  };
}
