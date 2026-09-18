import axios from 'axios';
import type { GeocodeResult } from '../types/api';

const directClient = axios.create({ timeout: 6000 });

export interface GeocodeMatch {
  name: string;
  country: string;
  admin: string;
  lat: number;
  lng: number;
  elevation: number;
}

/**
 * Geocode a free-text place name (or "lat, lng" pair), trying Open-Meteo geocoding
 * first, then falling back to OSM Nominatim. Ported from web's geocodeLocation().
 */
export async function geocodeLocation(query: string): Promise<GeocodeMatch[]> {
  const q = query.trim();
  if (!q) return [];

  const coordMatch = q.match(/^\s*(-?\d+(\.\d+)?)\s*[, ]\s*(-?\d+(\.\d+)?)\s*$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [{ name: `Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`, country: 'Coordinates', admin: '', lat, lng, elevation: 15 }];
    }
  }

  try {
    const cleanQ = q.replace(/,\s*/g, ' ');
    const { data } = await directClient.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: cleanQ, count: 5, language: 'en', format: 'json' }
    });
    if (data?.results?.length > 0) {
      return data.results.map((item: any) => ({
        name: item.name,
        country: item.country ?? '',
        admin: item.admin1 ?? '',
        lat: parseFloat(item.latitude),
        lng: parseFloat(item.longitude),
        elevation: item.elevation ?? 10
      }));
    }
  } catch {
    // fall through to Nominatim
  }

  try {
    const { data } = await directClient.get('https://nominatim.openstreetmap.org/search', {
      params: { q, format: 'json', limit: 5, addressdetails: 1 },
      headers: { 'Accept-Language': 'en' }
    });
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        name: String(item.display_name).split(',')[0],
        country: item.address?.country ?? '',
        admin: item.address?.state ?? item.address?.county ?? '',
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        elevation: 15
      }));
    }
  } catch {
    // no matches from either provider
  }

  return [];
}

export interface LiveTelemetry {
  status: 'live' | 'fallback';
  source: string;
  rainfall24h: number;
  rainfall72h: number;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  elevation: number;
}

/**
 * Direct-from-device real-time weather + elevation telemetry for any coordinate,
 * bypassing the backend (mirrors web's fetchGlobalLiveTelemetry()). Throws on total
 * failure so the caller can show an explicit error rather than silently faking data.
 */
export async function fetchGlobalLiveTelemetry(lat: number, lng: number): Promise<LiveTelemetry> {
  const [weatherRes, elevRes] = await Promise.allSettled([
    directClient.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'precipitation,rain,temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m',
        past_days: 3,
        forecast_days: 1,
        timezone: 'auto'
      }
    }),
    directClient.get('https://api.open-meteo.com/v1/elevation', { params: { latitude: lat, longitude: lng } })
  ]);

  if (weatherRes.status === 'rejected' && elevRes.status === 'rejected') {
    throw new Error('Live telemetry unavailable — both weather and elevation lookups failed.');
  }

  let r24 = 0, r72 = 0, temp = 0, hum = 0, press = 0, wind = 0, elev = 0;

  if (weatherRes.status === 'fulfilled') {
    const hourly = weatherRes.value.data?.hourly ?? {};
    const precip: number[] = hourly.precipitation ?? hourly.rain ?? [];
    if (precip.length >= 72) {
      r72 = precip.slice(-72).reduce((a, b) => a + (b || 0), 0);
      r24 = precip.slice(-24).reduce((a, b) => a + (b || 0), 0);
    } else if (precip.length > 0) {
      r72 = precip.reduce((a, b) => a + (b || 0), 0);
      r24 = precip.slice(-Math.min(24, precip.length)).reduce((a, b) => a + (b || 0), 0);
    }
    const temps: number[] = hourly.temperature_2m ?? [];
    const hums: number[] = hourly.relative_humidity_2m ?? [];
    const presses: number[] = hourly.surface_pressure ?? [];
    const winds: number[] = hourly.wind_speed_10m ?? [];
    temp = temps.at(-1) ?? 0;
    hum = hums.at(-1) ?? 0;
    press = presses.at(-1) ?? 0;
    wind = winds.at(-1) ?? 0;
  }

  if (elevRes.status === 'fulfilled') {
    elev = elevRes.value.data?.elevation?.[0] ?? 0;
  }

  return {
    status: weatherRes.status === 'fulfilled' ? 'live' : 'fallback',
    source: 'Open-Meteo Global Satellite & DEM',
    rainfall24h: Math.round(r24 * 10) / 10,
    rainfall72h: Math.round(r72 * 10) / 10,
    temperature: Math.round(temp * 10) / 10,
    humidity: Math.round(hum),
    pressure: Math.round(press),
    windSpeed: Math.round(wind * 10) / 10,
    elevation: Math.round(elev)
  };
}
