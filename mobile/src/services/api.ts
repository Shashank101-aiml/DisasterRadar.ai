// Unlike the web app's services/api.js, these calls do NOT silently swallow errors and
// return fabricated client-side fallback data. Screens/stores handle failures explicitly
// (loading/error/retry state) so the app never presents synthetic numbers as live data.
import axios from 'axios';
import Constants from 'expo-constants';
import type {
  PredictionInput,
  PredictionResponse,
  PredictionCompareResponse,
  StationData,
  ModelMetrics,
  RecentPrediction,
  HistoricalEvent,
  HistoricalStats,
  PredictionAuditRow,
  MiraBhayandarGisData,
  DetailedModelAnalytics,
  GeospatialProviders,
  LiveWeatherResponse,
  GeocodeResult,
  AlertScoringResponse,
  RainfallImpactResponse,
  WeeklyReportResponse
} from '../types/api';

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? 'http://10.0.2.2:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

export async function healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
  const { data } = await apiClient.get('/health');
  return data;
}

export async function predictFloodRisk(params: PredictionInput): Promise<PredictionResponse> {
  const { data } = await apiClient.post<PredictionResponse>('/predict', params);
  return data;
}

export async function compareModelPredictions(params: PredictionInput): Promise<PredictionCompareResponse> {
  const { data } = await apiClient.post<PredictionCompareResponse>('/predict/compare', params);
  return data;
}

export async function fetchStations(): Promise<StationData[]> {
  const { data } = await apiClient.get<StationData[]>('/stations');
  return data;
}

export async function fetchModelPerformance(): Promise<ModelMetrics> {
  const { data } = await apiClient.get<ModelMetrics>('/model/performance');
  return data;
}

export async function fetchDetailedModelAnalytics(): Promise<DetailedModelAnalytics> {
  const { data } = await apiClient.get<DetailedModelAnalytics>('/model/detailed-analytics');
  return data;
}

export async function fetchRecentPredictions(): Promise<RecentPrediction[]> {
  const { data } = await apiClient.get<RecentPrediction[]>('/predictions/recent');
  return data;
}

export async function fetchMiraBhayandarGIS(): Promise<MiraBhayandarGisData> {
  const { data } = await apiClient.get<MiraBhayandarGisData>('/gis/mira-bhayandar');
  return data;
}

export async function fetchHistoricalEvents(params?: {
  search?: string;
  severity?: string;
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<HistoricalEvent[]> {
  const { data } = await apiClient.get<HistoricalEvent[]>('/history/events', { params });
  return data;
}

export async function fetchHistoricalStats(): Promise<HistoricalStats> {
  const { data } = await apiClient.get<HistoricalStats>('/history/stats');
  return data;
}

export async function fetchPredictionAuditLog(limit = 50): Promise<PredictionAuditRow[]> {
  const { data } = await apiClient.get<PredictionAuditRow[]>('/history/predictions', { params: { limit } });
  return data;
}

export async function fetchGeospatialProviders(): Promise<GeospatialProviders> {
  const { data } = await apiClient.get<GeospatialProviders>('/geospatial/providers');
  return data;
}

export async function fetchLiveWeather(opts: {
  latitude?: number;
  longitude?: number;
  location?: string;
}): Promise<LiveWeatherResponse> {
  const { data } = await apiClient.get<LiveWeatherResponse>('/geospatial/weather', { params: opts });
  return data;
}

export async function geocodeViaBackend(query: string): Promise<GeocodeResult> {
  const { data } = await apiClient.get<GeocodeResult>('/geospatial/geocode', { params: { query } });
  return data;
}

export async function fetchAlertScoring(params: PredictionInput): Promise<AlertScoringResponse> {
  const { data } = await apiClient.post<AlertScoringResponse>('/alerts/scoring', params);
  return data;
}

export async function fetchRainfallImpact(params: PredictionInput): Promise<RainfallImpactResponse> {
  const { data } = await apiClient.post<RainfallImpactResponse>('/reports/rainfall-impact', params);
  return data;
}

export async function fetchWeeklyReports(
  location = 'Mira Bhayandar',
  lat = 19.295,
  lng = 72.854
): Promise<WeeklyReportResponse> {
  const { data } = await apiClient.get<WeeklyReportResponse>('/reports/weekly', {
    params: { location, lat, lng }
  });
  return data;
}
