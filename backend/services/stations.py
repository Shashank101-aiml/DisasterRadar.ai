import time
import requests
from typing import List, Dict, Any
from models.schemas import StationData

# Regional & National Flood Monitoring Stations
STATION_METADATA = [
    {"name": "Mira Bhayandar", "lat": 19.2952, "lng": 72.8544, "base_elev": 5.0},
    {"name": "Mumbai Mithi", "lat": 19.0760, "lng": 72.8777, "base_elev": 6.0},
    {"name": "Thane Creek", "lat": 19.2183, "lng": 72.9781, "base_elev": 12.0},
    {"name": "Bengaluru Central", "lat": 12.9716, "lng": 77.5946, "base_elev": 900.0},
    {"name": "Yelahanka", "lat": 13.1007, "lng": 77.5963, "base_elev": 915.0},
    {"name": "Nelamangala", "lat": 13.0970, "lng": 77.3912, "base_elev": 882.0},
    {"name": "Hoskote", "lat": 13.0700, "lng": 77.7981, "base_elev": 875.0},
    {"name": "Hosur", "lat": 12.7409, "lng": 77.8253, "base_elev": 879.0},
    {"name": "Chennai Basin", "lat": 13.0827, "lng": 80.2707, "base_elev": 7.0},
    {"name": "Kolkata Hooghly", "lat": 22.5726, "lng": 88.3639, "base_elev": 9.0},
]

# Cache state: refresh every 5 minutes (300 seconds)
_CACHED_STATIONS: List[StationData] = []
_LAST_FETCH_TIME: float = 0.0
CACHE_TTL_SECONDS: float = 300.0

def _compute_risk_level(prob: float) -> tuple[str, str]:
    if prob >= 70.0:
        return "severe", "Severe Risk"
    elif prob >= 50.0:
        return "high", "High Risk"
    elif prob >= 30.0:
        return "moderate", "Moderate"
    return "low", "Low Risk"

def fetch_live_stations_from_open_meteo() -> List[StationData]:
    """
    Batches all stations into a single Open-Meteo multi-location request.
    Fetches real live rainfall (24h/72h), temperature, humidity, and elevation.
    Computes flood probability dynamically.
    """
    lats = ",".join([str(s["lat"]) for s in STATION_METADATA])
    lngs = ",".join([str(s["lng"]) for s in STATION_METADATA])
    
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lats}&longitude={lngs}&"
        f"hourly=precipitation,rain,temperature_2m,relative_humidity_2m&"
        f"past_days=3&forecast_days=1&timezone=auto"
    )

    results: List[StationData] = []

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, dict):
                data = [data]  # single location edge case
            
            for idx, loc_data in enumerate(data):
                meta = STATION_METADATA[idx] if idx < len(STATION_METADATA) else {"name": f"Station {idx}", "lat": 0, "lng": 0, "base_elev": 15.0}
                hourly = loc_data.get("hourly", {})
                precip = hourly.get("precipitation", []) or hourly.get("rain", [])
                
                # Compute 24h and 72h actual rainfall
                if len(precip) >= 72:
                    r72 = sum(precip[-72:])
                    r24 = sum(precip[-24:])
                elif len(precip) > 0:
                    r72 = sum(precip)
                    r24 = sum(precip[-min(24, len(precip)):])
                else:
                    r24, r72 = 0.0, 0.0

                r24 = round(float(r24), 1)
                r72 = round(float(r72), 1)

                temps = hourly.get("temperature_2m", [26.0])
                hums = hourly.get("relative_humidity_2m", [75.0])
                cur_temp = round(float(temps[-1]), 1) if temps else 26.0
                cur_hum = round(float(hums[-1]), 1) if hums else 75.0
                elev = float(loc_data.get("elevation", meta.get("base_elev", 15.0)))

                # Dynamic flood probability calculation based on real Open-Meteo inputs
                elev_factor = max(0.0, min(1.0, (800.0 - elev) / 800.0))
                rain_score = (r72 / 180.0) * 0.45 + (r24 / 90.0) * 0.35
                hum_factor = ((cur_hum - 50.0) / 50.0) * 0.10
                
                raw_score = rain_score + (elev_factor * 0.10) + hum_factor
                prob = round(max(3.5, min(96.8, (raw_score * 75.0) + (15.0 if r24 > 30 else 5.0))), 1)

                risk_key, risk_label = _compute_risk_level(prob)

                results.append(StationData(
                    name=meta["name"],
                    lat=meta["lat"],
                    lng=meta["lng"],
                    risk=risk_key,
                    level=risk_label,
                    prob=prob,
                    r24=r24,
                    r72=r72,
                    elev=elev,
                    temp=cur_temp,
                    hum=cur_hum
                ))

            if results:
                return results
    except Exception as e:
        print(f"Failed to fetch live stations from Open-Meteo: {e}")

    # Graceful fallback baseline if completely offline
    fallback_list = []
    for s in STATION_METADATA:
        fallback_list.append(StationData(
            name=s["name"],
            lat=s["lat"],
            lng=s["lng"],
            risk="moderate",
            level="Moderate",
            prob=42.0,
            r24=15.0,
            r72=35.0,
            elev=s["base_elev"],
            temp=26.0,
            hum=75.0
        ))
    return fallback_list

def get_all_stations() -> List[StationData]:
    """
    Returns station list with in-memory caching to avoid slamming Open-Meteo.
    Refreshes automatically every 5 minutes.
    """
    global _CACHED_STATIONS, _LAST_FETCH_TIME
    now = time.time()
    
    if not _CACHED_STATIONS or (now - _LAST_FETCH_TIME) > CACHE_TTL_SECONDS:
        _CACHED_STATIONS = fetch_live_stations_from_open_meteo()
        _LAST_FETCH_TIME = now

    return _CACHED_STATIONS
