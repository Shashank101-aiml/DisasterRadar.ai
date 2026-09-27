import React, { useState, useEffect } from 'react';
import {
  geocodeLocation,
  fetchGlobalLiveTelemetry,
  predictFloodRisk,
  compareModelPredictions,
  reverseGeocodeCoords,
  submitGroundTruthReport
} from '../services/api';

export default function PredictRiskView({
  currentLocation,
  params: initialParams,
  prediction: initialPrediction,
  onBackToDashboard,
  onLocationChange
}) {
  // 1. Live Ground Telemetry for active physical location (preserved strictly from satellites & Copernicus DEM)
  const [liveParams, setLiveParams] = useState(initialParams || {
    rainfall24h: 0.0,
    rainfall72h: 0.0,
    temperature: 21.2,
    humidity: 78,
    windSpeed: 12,
    pressure: 910,
    elevation: 897,
    latitude: currentLocation?.lat || 12.9603,
    longitude: currentLocation?.lng || 77.7151,
    location: currentLocation?.name || 'Bengaluru, Karnataka',
    drainageCapacity: 45,
    ndwi: 0.12
  });
  const [livePrediction, setLivePrediction] = useState(initialPrediction || null);

  // 2. Independent Stress-Test Scenario Simulation State (does NOT overwrite live location)
  const [activeMode, setActiveMode] = useState('live'); // 'live' | 'scenario'
  const [selectedScenario, setSelectedScenario] = useState('live'); // 'live' | 'cloudburst' | 'monsoon' | 'coastal' | 'dry' | 'custom'
  const [scenarioParams, setScenarioParams] = useState(null);
  const [scenarioPrediction, setScenarioPrediction] = useState(null);

  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modelComparison, setModelComparison] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [groundTruthState, setGroundTruthState] = useState({ verified: false, condition: null });
  const [selectedEngine, setSelectedEngine] = useState('ensemble'); // 'ensemble' (93.8% Best) | 'random_forest' (90.2%) | 'xgboost' (81.0%)

  // Active Parameters & Prediction based on current mode (Live vs Scenario)
  const displayParams = activeMode === 'scenario' && scenarioParams ? scenarioParams : liveParams;
  const displayPrediction = activeMode === 'scenario' && scenarioPrediction ? scenarioPrediction : livePrediction;
  const params = displayParams;
  const prediction = displayPrediction;

  // 1-Tap Ground-Truth Verification (for active live location)
  const handleGroundTruthVerify = async (isRaining) => {
    setGroundTruthState({ verified: true, condition: isRaining ? 'RAIN' : 'DRY' });
    const r24 = isRaining ? 45.0 : 0.0;
    const r72 = isRaining ? 95.0 : 0.0;
    const updated = {
      ...liveParams,
      rainfall24h: r24,
      rainfall72h: r72,
      isRaining: isRaining,
      currentRainfall: isRaining ? 8.5 : 0.0
    };
    setLiveParams(updated);
    setActiveMode('live');
    setSelectedScenario('live');
    setScenarioParams(null);
    setScenarioPrediction(null);

    try {
      await submitGroundTruthReport({
        location: liveParams.location,
        latitude: liveParams.latitude,
        longitude: liveParams.longitude,
        isRaining: isRaining,
        observedCondition: isRaining ? 'ACTIVE_RAIN_REPORTED' : 'USER_VERIFIED_DRY',
        rainfallOverride: isRaining ? 8.5 : 0.0
      });
    } catch (e) {
      console.warn('Ground truth submission error:', e);
    }

    await handleRunLivePrediction(updated);
  };

  // Sync with parent props if updated externally
  useEffect(() => {
    if (initialParams) {
      setLiveParams(initialParams);
    }
  }, [initialParams]);

  useEffect(() => {
    if (initialPrediction) {
      setLivePrediction(initialPrediction);
    }
  }, [initialPrediction]);

  // Sync when currentLocation changes from parent
  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      if (currentLocation.lat !== liveParams.latitude || currentLocation.lng !== liveParams.longitude) {
        handleSelectLocation({
          name: currentLocation.name,
          country: currentLocation.country || '',
          lat: currentLocation.lat,
          lng: currentLocation.lng
        });
      }
    }
  }, [currentLocation?.lat, currentLocation?.lng]);

  const handleDetectDeviceGPS = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('GPS not supported by browser');
      if (!livePrediction) handleRunLivePrediction(liveParams);
      return;
    }
    setIsLoading(true);
    setGpsStatus('Acquiring device GPS...');

    const onPosSuccess = async (pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lng = parseFloat(pos.coords.longitude.toFixed(4));
      setGpsStatus('Resolving location...');

      let placeName = `Device Location (${lat}, ${lng})`;
      let country = '';
      try {
        const geoInfo = await reverseGeocodeCoords(lat, lng);
        if (geoInfo && geoInfo.name) {
          placeName = geoInfo.name;
          country = geoInfo.country || '';
        }
      } catch (e) {
        console.warn('Reverse geocode error:', e);
      }

      setGpsStatus(`Syncing weather for ${placeName}...`);
      try {
        const telemetry = await fetchGlobalLiveTelemetry(lat, lng);
        const updated = {
          ...liveParams,
          location: placeName,
          latitude: lat,
          longitude: lng,
          elevation: !isNaN(Number(telemetry.elevation)) ? Number(telemetry.elevation) : 15.0,
          rainfall24h: !isNaN(Number(telemetry.rainfall24h)) ? Number(telemetry.rainfall24h) : 0.0,
          rainfall72h: !isNaN(Number(telemetry.rainfall72h)) ? Number(telemetry.rainfall72h) : 0.0,
          currentRainfall: !isNaN(Number(telemetry.currentRainfall)) ? Number(telemetry.currentRainfall) : 0.0,
          isRaining: Boolean(telemetry.isRaining),
          temperature: !isNaN(Number(telemetry.temperature)) ? Number(telemetry.temperature) : 25.0,
          humidity: !isNaN(Number(telemetry.humidity)) ? Number(telemetry.humidity) : 60.0,
          pressure: !isNaN(Number(telemetry.pressure)) ? Number(telemetry.pressure) : 1013.0,
          windSpeed: !isNaN(Number(telemetry.windSpeed)) ? Number(telemetry.windSpeed) : 10.0
        };
        setLiveParams(updated);
        setActiveMode('live');
        setSelectedScenario('live');
        setScenarioParams(null);
        setScenarioPrediction(null);
        const currRain = telemetry.currentRainfall !== undefined ? telemetry.currentRainfall : 0;
        const rainLabel = currRain === 0 ? '☀️ 0.0 mm/h (Dry)' : `🌧️ ${currRain} mm/h`;
        setGpsStatus(`📍 ${placeName.split(',')[0]} (${rainLabel})`);
        await handleRunLivePrediction(updated, { name: placeName, country, lat, lng });
      } catch (err) {
        console.error('GPS telemetry error:', err);
      } finally {
        setIsLoading(false);
        setTimeout(() => setGpsStatus(null), 5000);
      }
    };

    const onPosError = (err) => {
      console.warn('Geolocation high-accuracy failed, falling back:', err);
      navigator.geolocation.getCurrentPosition(
        onPosSuccess,
        (fallbackErr) => {
          setIsLoading(false);
          setGpsStatus(`GPS unavailable (${fallbackErr.message})`);
          setTimeout(() => setGpsStatus(null), 5000);
          if (!livePrediction) handleRunLivePrediction(liveParams);
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onPosSuccess,
      onPosError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Only auto-detect GPS on mount if no initial location was passed
  useEffect(() => {
    if (!currentLocation?.lat && !initialParams?.latitude) {
      handleDetectDeviceGPS();
    }
  }, []);

  // Debounced location search
  useEffect(() => {
    if (!locationQuery || locationQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await geocodeLocation(locationQuery.trim());
      setSearchResults(results.slice(0, 6));
      setIsSearching(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  // Handle Location Selection: updates live ground telemetry
  const handleSelectLocation = async (loc) => {
    setIsLoading(true);
    setLocationQuery('');
    setSearchResults([]);
    setActiveMode('live');
    setSelectedScenario('live');
    setScenarioParams(null);
    setScenarioPrediction(null);

    const telemetry = await fetchGlobalLiveTelemetry(loc.lat, loc.lng);
    const updated = {
      ...liveParams,
      location: `${loc.name}${loc.country ? ', ' + loc.country : ''}`.trim(),
      latitude: loc.lat,
      longitude: loc.lng,
      rainfall24h: !isNaN(Number(telemetry.rainfall24h)) ? Number(telemetry.rainfall24h) : 0.0,
      rainfall72h: !isNaN(Number(telemetry.rainfall72h)) ? Number(telemetry.rainfall72h) : 0.0,
      currentRainfall: !isNaN(Number(telemetry.currentRainfall)) ? Number(telemetry.currentRainfall) : 0.0,
      isRaining: Boolean(telemetry.isRaining),
      temperature: !isNaN(Number(telemetry.temperature)) ? Number(telemetry.temperature) : 25.0,
      humidity: !isNaN(Number(telemetry.humidity)) ? Number(telemetry.humidity) : 60.0,
      pressure: !isNaN(Number(telemetry.pressure)) ? Number(telemetry.pressure) : 1013.0,
      elevation: !isNaN(Number(telemetry.elevation)) ? Number(telemetry.elevation) : 15.0
    };

    setLiveParams(updated);
    await handleRunLivePrediction(updated, loc);
  };

  // Run ML model prediction for LIVE Location (and sync with parent dashboard)
  const handleRunLivePrediction = async (currentLiveParams = liveParams, loc = null, engine = selectedEngine) => {
    setIsLoading(true);
    setModelComparison(null);
    setCompareError(null);
    const safeParams = {
      ...currentLiveParams,
      rainfall24h: !isNaN(Number(currentLiveParams.rainfall24h)) ? Number(currentLiveParams.rainfall24h) : 0.0,
      rainfall72h: !isNaN(Number(currentLiveParams.rainfall72h)) ? Number(currentLiveParams.rainfall72h) : 0.0,
      elevation: !isNaN(Number(currentLiveParams.elevation)) ? Number(currentLiveParams.elevation) : 15.0,
      humidity: !isNaN(Number(currentLiveParams.humidity)) ? Number(currentLiveParams.humidity) : 60.0,
      temperature: !isNaN(Number(currentLiveParams.temperature)) ? Number(currentLiveParams.temperature) : 25.0
    };
    try {
      const res = await predictFloodRisk(safeParams, engine);
      if (res) {
        setLivePrediction(res);
        if (onLocationChange) {
          onLocationChange(
            loc || { name: safeParams.location.split(',')[0], lat: safeParams.latitude, lng: safeParams.longitude },
            safeParams,
            res
          );
        }
      }
    } catch (e) {
      console.error('Live location prediction failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Run ML model prediction for STRESS-TEST SCENARIOS (strictly independent simulation)
  const handleRunScenarioPrediction = async (scenParams, engine = selectedEngine) => {
    setIsLoading(true);
    setModelComparison(null);
    setCompareError(null);
    const safeParams = {
      ...scenParams,
      rainfall24h: !isNaN(Number(scenParams.rainfall24h)) ? Number(scenParams.rainfall24h) : 0.0,
      rainfall72h: !isNaN(Number(scenParams.rainfall72h)) ? Number(scenParams.rainfall72h) : 0.0,
      elevation: !isNaN(Number(scenParams.elevation)) ? Number(scenParams.elevation) : 15.0,
      humidity: !isNaN(Number(scenParams.humidity)) ? Number(scenParams.humidity) : 60.0,
      temperature: !isNaN(Number(scenParams.temperature)) ? Number(scenParams.temperature) : 25.0
    };
    try {
      const res = await predictFloodRisk(safeParams, engine);
      if (res) {
        setScenarioPrediction(res);
      }
    } catch (e) {
      console.error('Scenario prediction failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Unified runner handling either scenario or live based on active mode
  const handleRunPrediction = async (customParams = null, engine = selectedEngine) => {
    if (activeMode === 'scenario' && (customParams || scenarioParams)) {
      await handleRunScenarioPrediction(customParams || scenarioParams, engine);
    } else {
      await handleRunLivePrediction(customParams || liveParams, null, engine);
    }
  };

  // Switch ML model engine live and re-score currently active parameters
  const handleSelectEngine = async (engineId) => {
    setSelectedEngine(engineId);
    if (activeMode === 'scenario' && scenarioParams) {
      await handleRunScenarioPrediction(scenarioParams, engineId);
    } else {
      await handleRunLivePrediction(liveParams, null, engineId);
    }
  };

  // 1-Click Reset: Return from Simulation back to Real-World Ground Reality
  const handleResetToLive = () => {
    setActiveMode('live');
    setSelectedScenario('live');
    setScenarioParams(null);
    setScenarioPrediction(null);
    setModelComparison(null);
  };

  // Apply Stress-Test Scenario (Does NOT alter or overwrite real location telemetry)
  const handleApplyScenario = async (scenarioKey) => {
    if (scenarioKey === 'live') {
      handleResetToLive();
      return;
    }

    setSelectedScenario(scenarioKey);
    setActiveMode('scenario');
    let newScen = {
      ...liveParams,
      location: `[Simulated: ${scenarioKey.toUpperCase()}] ${liveParams.location}`
    };

    if (scenarioKey === 'cloudburst') {
      newScen = {
        ...newScen,
        rainfall24h: 145,
        rainfall72h: 210,
        slope: 0.25,
        drainageCapacity: 3.0,
        humidity: 95,
        windSpeed: 28,
        ndwi: 0.25,
        ndvi: 0.52
      };
    } else if (scenarioKey === 'monsoon') {
      newScen = {
        ...newScen,
        rainfall24h: 85,
        rainfall72h: 260,
        slope: 0.35,
        drainageCapacity: 4.0,
        humidity: 92,
        ndwi: 0.20,
        ndvi: 0.50
      };
    } else if (scenarioKey === 'coastal') {
      newScen = {
        ...newScen,
        elevation: 3,
        rainfall24h: 45,
        rainfall72h: 110,
        slope: 0.20,
        pressure: 996,
        drainageCapacity: 3.5,
        ndwi: 0.26,
        ndvi: 0.48
      };
    } else if (scenarioKey === 'dry') {
      newScen = {
        ...newScen,
        rainfall24h: 0,
        rainfall72h: 0,
        slope: 1.5,
        drainageCapacity: 6.0,
        humidity: 45,
        ndwi: -0.1,
        ndvi: 0.60
      };
    }

    setScenarioParams(newScen);
    await handleRunScenarioPrediction(newScen);
  };

  // Slider change: adjusts simulation parameters without modifying live location
  const handleSliderChange = async (field, value) => {
    const base = activeMode === 'scenario' && scenarioParams ? scenarioParams : liveParams;
    const updated = {
      ...base,
      [field]: value,
      location: `[Custom What-If] ${liveParams.location}`
    };
    setActiveMode('scenario');
    setSelectedScenario('custom');
    setScenarioParams(updated);
    await handleRunScenarioPrediction(updated);
  };

  // Run XGBoost vs Random Forest side by side on currently displayed parameters
  const handleCompareModels = async () => {
    setIsComparing(true);
    setCompareError(null);
    try {
      const res = await compareModelPredictions(displayParams);
      setModelComparison(res);
    } catch (e) {
      console.error('Model comparison failed:', e);
      setCompareError('Model comparison is unavailable right now.');
    } finally {
      setIsComparing(false);
    }
  };

  const prob = displayPrediction ? Number(displayPrediction.probability) : (livePrediction ? Number(livePrediction.probability) : 2.4);
  const isBreached = prob >= 50.0;
  const estDepthMeters = prob > 50 ? ((prob - 50) * 0.038).toFixed(2) : '0.05';

  return (
    <div className="predict-risk-page-container" style={{ padding: '24px 32px', color: '#f8fafc', background: '#060911', minHeight: '100vh' }}>
      {/* HEADER & BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button
              onClick={onBackToDashboard}
              style={{
                background: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ← Back to Dashboard
            </button>
            <span style={{ color: '#64748b' }}>/</span>
            <span style={{ fontSize: '0.84rem', color: '#94a3b8', fontWeight: 500 }}>Operational Forecasting</span>
            <span style={{ color: '#64748b' }}>/</span>
            <span style={{ fontSize: '0.84rem', color: '#38bdf8', fontWeight: 600 }}>Predict Risk Studio</span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            🛰️ Production Flood Inundation Prediction Studio
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '4px' }}>
            High-precision XGBoost inference engine with live satellite telemetry auto-fetch, scenario stress testing, and civic alert scoring
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handleRunPrediction()}
            disabled={isLoading}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 20px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isLoading ? 'Running Inference...' : '⚡ Re-Compute Prediction'}
          </button>
        </div>
      </div>

      {/* TOP GLOBAL LOCATION BAR */}
      <div style={{
        background: '#0b1120',
        border: '1px solid rgba(56, 189, 248, 0.18)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📍</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                {params.location}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                Lat: {Number(params.latitude).toFixed(3)}° | Lon: {Number(params.longitude).toFixed(3)}° | Elevation: {params.elevation}m
              </div>
            </div>
          </div>

          {/* Live Device Location Auto-Detect Button */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleDetectDeviceGPS}
              disabled={isLoading}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: '0 2px 10px rgba(5, 150, 105, 0.3)'
              }}
              title="Lock onto your device's exact GPS coordinates and pull real-time weather"
            >
              📍 {gpsStatus || 'Sync My Device Location'}
            </button>

            <button
              onClick={() => {
                const updated = {
                  ...params,
                  rainfall24h: 0,
                  rainfall72h: 0
                };
                setParams(updated);
                handleRunPrediction(updated);
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Force rainfall to 0.0 mm if your location currently has no rain"
            >
              ☀️ 0 mm (Dry)
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search any global city or district to auto-fetch live weather & DEM elevation (e.g. Mumbai, Tokyo, Houston)..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '0.84rem'
              }}
            />
            {locationQuery && (
              <button
                onClick={() => setLocationQuery('')}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  padding: '0 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#0b1120',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              marginTop: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              zIndex: 30,
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectLocation(r)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: '#cbd5e1'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#111a2d'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0b1120'}
                >
                  <strong style={{ color: '#f8fafc' }}>{r.name}</strong>, {r.state ? `${r.state}, ` : ''}{r.country} ({r.lat.toFixed(2)}°, {r.lng.toFixed(2)}°)
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODEL ARCHITECTURE SELECTOR BAR */}
      <div style={{
        background: '#0b1120',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.25rem' }}>🧠</span>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Inference Architecture:
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Switch production ML engines live to benchmark sensitivity & decision boundaries
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'xgboost', name: 'XGBoost Fast', badge: '81.0% Acc · 1.8ms', color: '#38bdf8' },
            { id: 'random_forest', name: 'Random Forest Bagging', badge: '90.2% Acc · 93.6% Recall', color: '#10b981' },
            { id: 'ensemble', name: 'Super-Stack Ensemble', badge: '★ 93.85% Acc · 0.982 AUC', color: '#c084fc' }
          ].map((m) => {
            const isSel = selectedEngine === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectEngine(m.id)}
                disabled={isLoading}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.14)' : '#0f172a',
                  border: isSel ? `1.5px solid ${m.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSel ? '#f8fafc' : '#94a3b8',
                  borderRadius: '10px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: isSel ? 700 : 500,
                  cursor: isLoading ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSel ? `0 0 16px ${m.color}33` : 'none',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <span>{m.name}</span>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: isSel ? `${m.color}28` : 'rgba(255, 255, 255, 0.06)',
                  color: isSel ? m.color : '#94a3b8'
                }}>
                  {m.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN WORKSTATION GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN: PARAMETER SLIDERS & SCENARIO CONTROLS */}
        <div style={{ background: '#0b1120', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '14px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          {/* Stress-Test Scenario Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Stress-Test Scenarios (1-Click Presets):
              </div>
              {activeMode === 'scenario' && (
                <button
                  onClick={handleResetToLive}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ↺ Reset to Live Location
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: '8px' }}>
              <button
                onClick={() => handleApplyScenario('live')}
                style={{
                  background: activeMode === 'live' ? '#111a2d' : '#0f172a',
                  border: activeMode === 'live' ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: activeMode === 'live' ? '#10b981' : '#f8fafc' }}>
                  🛰️ Live Reality
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Real-Time Satellites</div>
              </button>
              {[
                { key: 'cloudburst', label: '⛈️ Cloudburst Shock', desc: '145mm 24h Rain' },
                { key: 'monsoon', label: '🌧️ Monsoon Saturated', desc: '260mm 72h Rain' },
                { key: 'coastal', label: '🌊 Coastal Surge', desc: 'Elevation 3m' },
                { key: 'dry', label: '☀️ Dry Baseline', desc: 'Minimal Rain' }
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => handleApplyScenario(s.key)}
                  style={{
                    background: activeMode === 'scenario' && selectedScenario === s.key ? '#111a2d' : '#0f172a',
                    border: activeMode === 'scenario' && selectedScenario === s.key ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{s.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Simulation Alert Banner */}
          {activeMode === 'scenario' && (
            <div style={{
              background: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8' }}>
                  🧪 INDEPENDENT STRESS-TEST SIMULATION
                </div>
                <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Testing hypothetical conditions. Actual live forecast for <strong>{liveParams.location}</strong> ({livePrediction ? livePrediction.probability : 2.4}%) is preserved independently.
                </div>
              </div>
              <button
                onClick={handleResetToLive}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ↺ View Live Reality
              </button>
            </div>
          )}

          {/* Option A: 1-Tap Ground-Truth Calibration Widget */}
          <div style={{
            background: groundTruthState.verified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: groundTruthState.verified ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem' }}>🎯</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.4px' }}>
                  GROUND-TRUTH CALIBRATION (OPTION A)
                </span>
              </div>
              {groundTruthState.verified && (
                <span style={{
                  fontSize: '0.68rem',
                  background: '#10b981',
                  color: '#0f172a',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  ✓ GROUND-TRUTH VERIFIED
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
              Are skies dry outside? Satellites often detect trace clouds/virga. Calibrate telemetry immediately to ground reality:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => handleGroundTruthVerify(false)}
                style={{
                  background: groundTruthState.condition === 'DRY' ? '#10b981' : 'rgba(16, 185, 129, 0.15)',
                  color: groundTruthState.condition === 'DRY' ? '#0f172a' : '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                title="Calibrate model: Verify zero rainfall on ground and recalculate flood probability"
              >
                ☀️ Bone Dry (0 mm)
              </button>
              <button
                onClick={() => handleGroundTruthVerify(true)}
                style={{
                  background: groundTruthState.condition === 'RAIN' ? '#38bdf8' : 'rgba(56, 189, 248, 0.15)',
                  color: groundTruthState.condition === 'RAIN' ? '#0f172a' : '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                title="Calibrate model: Verify active rain on ground and recalculate flood probability"
              >
                🌧️ Active Rain
              </button>
            </div>
          </div>

          {/* Sliders Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 24h Rain */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                <span>🌧️ 24-Hour Acute Rainfall</span>
                <span style={{ color: params.rainfall24h > 100 ? '#ef4444' : '#38bdf8' }}>{params.rainfall24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={params.rainfall24h}
                onChange={(e) => handleSliderChange('rainfall24h', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                <span>0 mm</span>
                <span>80 mm (Critical Municipal Sump Threshold)</span>
                <span>250 mm (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* 72h Rain */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                <span>🌧️ 72-Hour Cumulative Rainfall</span>
                <span style={{ color: params.rainfall72h > 180 ? '#ef4444' : '#38bdf8' }}>{params.rainfall72h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                value={params.rainfall72h}
                onChange={(e) => handleSliderChange('rainfall72h', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                <span>0 mm</span>
                <span>150 mm (Ground Saturated)</span>
                <span>300+ mm (Catastrophic)</span>
              </div>
            </div>

            {/* Elevation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                <span>⛰️ Digital Elevation (DEM)</span>
                <span style={{ color: params.elevation < 15 ? '#ef4444' : '#10b981' }}>{params.elevation} meters</span>
              </div>
              <input
                type="range"
                min="1"
                max="300"
                value={params.elevation}
                onChange={(e) => handleSliderChange('elevation', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                <span>1 m (Vulnerable Sump)</span>
                <span>50 m</span>
                <span>300 m (High Ground)</span>
              </div>
            </div>

            {/* Humidity & Temperature */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>💧 Humidity</span>
                  <span>{params.humidity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={params.humidity}
                  onChange={(e) => handleSliderChange('humidity', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                  <span>🌡️ Temperature</span>
                  <span>{params.temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={params.temperature}
                  onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREDICTION RESULTS, GAUGE & ADVISORIES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Risk Score Card */}
          <div style={{
            background: '#0b1120',
            border: isBreached ? '2px solid #ef4444' : (activeMode === 'scenario' ? '1.5px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(56, 189, 248, 0.18)'),
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: activeMode === 'scenario' ? '#38bdf8' : '#94a3b8', textTransform: 'uppercase' }}>
                  {activeMode === 'scenario' ? '🧪 Stress-Test Scenario Assessment' : '📡 Live Location Risk Assessment'}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  {activeMode === 'scenario' ? 'Hypothetical what-if simulation (does not affect live location)' : `Real-time satellite & DEM observation for ${liveParams.location}`}
                </div>
              </div>
              <span style={{
                background: isBreached ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                color: isBreached ? '#ef4444' : '#10b981',
                border: isBreached ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                {activeMode === 'scenario' ? `SIMULATION: ${isBreached ? 'CRITICAL RISK' : 'NORMAL'}` : (isBreached ? 'CRITICAL RISK (>50%)' : 'NORMAL / SAFE (<50%)')}
              </span>
            </div>

            {/* Big Probability Number & Meter */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '3.2rem', fontWeight: 900, color: isBreached ? '#ef4444' : '#10b981', lineHeight: 1 }}>
                {prob}%
              </span>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
                {activeMode === 'scenario' ? 'Simulated Inundation Probability' : 'Inundation Probability'}
              </span>
            </div>

            {/* Threshold Bar with Solid Single Color */}
            <div style={{ width: '100%', height: '10px', background: '#1e293b', borderRadius: '5px', overflow: 'hidden', position: 'relative', marginBottom: '14px' }}>
              <div style={{
                width: `${prob}%`,
                height: '100%',
                backgroundColor: isBreached ? '#ef4444' : '#10b981'
              }}></div>
              {/* 50% Threshold Mark */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#ffffff' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '16px' }}>
              <span>0% Safe</span>
              <span style={{ fontWeight: 700, color: '#f8fafc' }}>▲ 50% Danger Line</span>
              <span>100% Catastrophic</span>
            </div>

            {/* 3 Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Est. Water Depth</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {isBreached ? `${estDepthMeters} m` : '< 0.15 m'}
                </div>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Evacuation Window</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                  {isBreached ? '2 - 4 Hours' : 'Standby'}
                </div>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Active Model</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: selectedEngine === 'ensemble' ? '#c084fc' : (selectedEngine === 'random_forest' ? '#34d399' : '#38bdf8'), whiteSpace: 'nowrap' }}>
                  {selectedEngine === 'ensemble' ? 'Ensemble 93.8%' : (selectedEngine === 'random_forest' ? 'Random Forest 90.2%' : 'XGBoost 81.0%')}
                </div>
              </div>
            </div>
          </div>

          {/* Active Live Location Reference Card (Shown when testing a simulation scenario) */}
          {activeMode === 'scenario' && (
            <div style={{
              background: '#0b1120',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '12px',
              padding: '14px 18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                    📍 Actual Ground Reality: {liveParams.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: (livePrediction?.probability || 0) >= 50 ? '#ef4444' : '#10b981' }}>
                      {livePrediction ? livePrediction.probability : 2.4}%
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {livePrediction?.riskLevel || 'LOW RISK'} • {liveParams.rainfall24h} mm live 24h rain
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleResetToLive}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View Live Reality →
                </button>
              </div>
            </div>
          )}

          {/* Top Risk Contributors for this prediction */}
          <div style={{ background: '#0b1120', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '14px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0' }}>
              Key Environmental Risk Factors
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(prediction?.riskFactors || [
                { name: 'Rainfall (72h)', value: 31, color: '#ef4444' },
                { name: 'Rainfall (24h)', value: 22, color: '#f97316' },
                { name: 'Elevation Vulnerability', value: 18, color: '#eab308' },
                { name: 'Relative Humidity', value: 12, color: '#06b6d4' }
              ]).map((rf, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{rf.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '50%' }}>
                    <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${rf.value * 2.5}%`, height: '100%', backgroundColor: rf.color || '#38bdf8' }}></div>
                    </div>
                    <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: '#f8fafc' }}>{rf.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Model Consensus & Comparison: XGBoost vs Random Forest vs Super-Stack */}
          <div style={{ background: '#0b1120', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '14px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: modelComparison || compareError ? '14px' : '0', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Multi-Model Consensus & Comparison
                </h4>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  Evaluates all 3 architectures simultaneously on active telemetry
                </div>
              </div>
              <button
                onClick={handleCompareModels}
                disabled={isComparing}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: isComparing ? 'default' : 'pointer',
                  opacity: isComparing ? 0.6 : 1
                }}
              >
                {isComparing ? 'Running 3 Engines...' : '⚡ Compare All 3 Models'}
              </button>
            </div>

            {compareError && (
              <div style={{ fontSize: '0.78rem', color: '#f87171' }}>{compareError}</div>
            )}

            {modelComparison && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                  {modelComparison.predictions.map((mp) => {
                    const isEns = mp.modelId.includes('ensemble');
                    return (
                      <div key={mp.modelId} style={{
                        background: isEns ? 'rgba(168, 85, 247, 0.08)' : '#0f172a',
                        border: isEns ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '12px 10px'
                      }}>
                        <div style={{ fontSize: '0.64rem', color: isEns ? '#c084fc' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          {mp.modelName}
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', margin: '4px 0' }}>
                          {mp.probability}%
                        </div>
                        <div style={{
                          display: 'inline-block',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          color: mp.riskClass === 'high' ? '#ef4444' : (mp.riskClass === 'moderate' ? '#eab308' : '#10b981'),
                          background: mp.riskClass === 'high' ? 'rgba(239, 68, 68, 0.15)' : (mp.riskClass === 'moderate' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(16, 185, 129, 0.15)')
                        }}>
                          {mp.riskLevel}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontWeight: 800, color: modelComparison.agreement === 'Consensus' ? '#34d399' : '#f59e0b' }}>
                    Status: {modelComparison.agreement}
                  </span>
                  {' — '}
                  <span>Spread Delta: {modelComparison.probabilityDelta}%.</span>
                  {' '}
                  <span style={{ color: '#94a3b8' }}>
                    {modelComparison.agreement === 'Consensus'
                      ? 'Unanimous decision boundary reached across all algorithms.'
                      : 'Tree decision boundaries diverge — consider Super-Stack weighted consensus as authority.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Civic Recommendation */}
          <div style={{
            background: isBreached ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: isBreached ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isBreached ? '#ef4444' : '#10b981', marginBottom: '4px' }}>
              {isBreached ? '🚨 Emergency Directives for Municipal Authorities:' : '✅ Normal Operational Advisory:'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>
              {prediction?.recommendation || (isBreached 
                ? 'Issue immediate evacuation directives for ground floor residents in basin zones. Deploy high-capacity municipal de-watering pumps to storm sluices.'
                : 'Environmental parameters safe. Continue routine hydrologic monitoring.'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
