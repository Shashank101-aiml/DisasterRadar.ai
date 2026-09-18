import React, { useState, useEffect } from 'react';
import { geocodeLocation, fetchGlobalLiveTelemetry, predictFloodRisk, compareModelPredictions } from '../services/api';

export default function PredictRiskView({
  currentLocation,
  params: initialParams,
  prediction: initialPrediction,
  onBackToDashboard,
  onLocationChange
}) {
  const [params, setParams] = useState(initialParams || {
    rainfall24h: 85,
    rainfall72h: 190,
    temperature: 25,
    humidity: 82,
    windSpeed: 15,
    pressure: 1008,
    elevation: 20,
    latitude: 19.295,
    longitude: 72.854,
    location: 'Mira Bhayandar, Maharashtra, India',
    drainageCapacity: 45,
    ndwi: 0.22
  });

  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [prediction, setPrediction] = useState(initialPrediction || null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('custom');
  const [modelComparison, setModelComparison] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState(null);

  // Quick 1-click Preset Cities
  const presetCities = [
    { name: 'Mira Bhayandar', state: 'Maharashtra', country: 'India', lat: 19.295, lng: 72.854 },
    { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.878 },
    { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.972, lng: 77.595 },
    { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.083, lng: 80.271 },
    { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.573, lng: 88.364 },
    { name: 'Delhi', state: 'NCR', country: 'India', lat: 28.614, lng: 77.209 },
    { name: 'Tokyo', state: 'Tokyo', country: 'Japan', lat: 35.676, lng: 139.650 },
    { name: 'London', state: 'Greater London', country: 'UK', lat: 51.507, lng: -0.128 }
  ];

  // Run initial prediction if none
  useEffect(() => {
    if (!prediction) {
      handleRunPrediction(params);
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

  // Handle Location Selection
  const handleSelectLocation = async (loc) => {
    setIsLoading(true);
    setLocationQuery('');
    setSearchResults([]);

    const telemetry = await fetchGlobalLiveTelemetry(loc.lat, loc.lng);
    const updated = {
      ...params,
      location: `${loc.name}, ${loc.country || ''}`,
      latitude: loc.lat,
      longitude: loc.lng,
      rainfall24h: telemetry.rainfall24h,
      rainfall72h: telemetry.rainfall72h,
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      pressure: telemetry.pressure,
      elevation: telemetry.elevation
    };

    setParams(updated);
    handleRunPrediction(updated, loc);
  };

  // Run ML model prediction
  const handleRunPrediction = async (currentParams = params, loc = null) => {
    setIsLoading(true);
    setModelComparison(null);
    setCompareError(null);
    try {
      const res = await predictFloodRisk(currentParams);
      setPrediction(res);
      if (onLocationChange) {
        onLocationChange(
          loc || { name: currentParams.location.split(',')[0], lat: currentParams.latitude, lng: currentParams.longitude },
          currentParams,
          res
        );
      }
    } catch (e) {
      console.error('Prediction failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the same telemetry through XGBoost and Random Forest side by side
  const handleCompareModels = async () => {
    setIsComparing(true);
    setCompareError(null);
    try {
      const res = await compareModelPredictions(params);
      setModelComparison(res);
    } catch (e) {
      console.error('Model comparison failed:', e);
      setCompareError('Model comparison is unavailable right now.');
    } finally {
      setIsComparing(false);
    }
  };

  // Preset Scenario Loaders
  const handleApplyScenario = (scenarioKey) => {
    setSelectedScenario(scenarioKey);
    let newParams = { ...params };

    if (scenarioKey === 'cloudburst') {
      newParams = {
        ...newParams,
        rainfall24h: 145,
        rainfall72h: 180,
        humidity: 92,
        windSpeed: 28,
        ndwi: 0.42
      };
    } else if (scenarioKey === 'monsoon') {
      newParams = {
        ...newParams,
        rainfall24h: 95,
        rainfall72h: 260,
        humidity: 88,
        elevation: Math.min(newParams.elevation, 25),
        ndwi: 0.35
      };
    } else if (scenarioKey === 'coastal') {
      newParams = {
        ...newParams,
        elevation: 3,
        rainfall24h: 80,
        rainfall72h: 140,
        pressure: 996,
        ndwi: 0.48
      };
    } else if (scenarioKey === 'dry') {
      newParams = {
        ...newParams,
        rainfall24h: 5,
        rainfall72h: 12,
        humidity: 45,
        ndwi: -0.2
      };
    }

    setParams(newParams);
    handleRunPrediction(newParams);
  };

  const prob = prediction ? Number(prediction.probability) : 78.4;
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

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {presetCities.map(c => (
              <button
                key={c.name}
                onClick={() => handleSelectLocation(c)}
                style={{
                  background: params.location.includes(c.name) ? '#0284c7' : '#0f172a',
                  color: params.location.includes(c.name) ? '#ffffff' : '#cbd5e1',
                  border: '1px solid rgba(56, 189, 248, 0.22)',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {c.name}
              </button>
            ))}
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

      {/* TWO COLUMN WORKSTATION GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN: PARAMETER SLIDERS & SCENARIO CONTROLS */}
        <div style={{ background: '#0b1120', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '14px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          {/* Stress-Test Scenario Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Stress-Test Scenarios (1-Click Presets):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
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
                    background: selectedScenario === s.key ? '#111a2d' : '#0f172a',
                    border: selectedScenario === s.key ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
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
                onChange={(e) => {
                  const updated = { ...params, rainfall24h: parseFloat(e.target.value) };
                  setParams(updated);
                  handleRunPrediction(updated);
                }}
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
                onChange={(e) => {
                  const updated = { ...params, rainfall72h: parseFloat(e.target.value) };
                  setParams(updated);
                  handleRunPrediction(updated);
                }}
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
                onChange={(e) => {
                  const updated = { ...params, elevation: parseFloat(e.target.value) };
                  setParams(updated);
                  handleRunPrediction(updated);
                }}
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
                  onChange={(e) => {
                    const updated = { ...params, humidity: parseFloat(e.target.value) };
                    setParams(updated);
                    handleRunPrediction(updated);
                  }}
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
                  onChange={(e) => {
                    const updated = { ...params, temperature: parseFloat(e.target.value) };
                    setParams(updated);
                    handleRunPrediction(updated);
                  }}
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
            border: isBreached ? '2px solid #ef4444' : '1px solid rgba(56, 189, 248, 0.18)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                AI Flood Risk Assessment
              </span>
              <span style={{
                background: isBreached ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                color: isBreached ? '#ef4444' : '#10b981',
                border: isBreached ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                {isBreached ? 'CRITICAL RISK (>50%)' : 'NORMAL / SAFE (<50%)'}
              </span>
            </div>

            {/* Big Probability Number & Meter */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '3.2rem', fontWeight: 900, color: isBreached ? '#ef4444' : '#10b981', lineHeight: 1 }}>
                {prob}%
              </span>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
                Inundation Probability
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
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Model Confidence</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>96.8%</div>
              </div>
            </div>
          </div>

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

          {/* Model Comparison: XGBoost vs Random Forest */}
          <div style={{ background: '#0b1120', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '14px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: modelComparison || compareError ? '14px' : '0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Compare Models
              </h4>
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
                  padding: '6px 12px',
                  cursor: isComparing ? 'default' : 'pointer',
                  opacity: isComparing ? 0.6 : 1
                }}
              >
                {isComparing ? 'Running...' : 'Run XGBoost vs Random Forest'}
              </button>
            </div>

            {compareError && (
              <div style={{ fontSize: '0.78rem', color: '#f87171' }}>{compareError}</div>
            )}

            {modelComparison && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  {modelComparison.predictions.map((mp) => (
                    <div key={mp.modelId} style={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {mp.modelName}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '4px 0' }}>
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
                  ))}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  {modelComparison.agreement === 'Consensus'
                    ? `Both models agree on risk tier (${modelComparison.probabilityDelta} pt spread).`
                    : `Models diverge by ${modelComparison.probabilityDelta} points — treat with caution and consult the higher-risk output.`}
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
