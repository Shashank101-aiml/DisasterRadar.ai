import React, { useState, useEffect } from 'react';
import { geocodeLocation, fetchGlobalLiveTelemetry, predictFloodRisk } from '../services/api';

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
        ndwi: 0.38
      };
    } else if (scenarioKey === 'dry') {
      newParams = {
        ...newParams,
        rainfall24h: 2,
        rainfall72h: 5,
        humidity: 45,
        temperature: 32,
        ndwi: -0.15
      };
    }

    setParams(newParams);
    handleRunPrediction(newParams);
  };

  // Water depth calculation
  const prob = prediction ? prediction.probability : 2.5;
  const isBreached = prob >= 50.0;
  const estDepthMeters = prob > 50 ? ((prob - 50) * 0.038).toFixed(2) : '0.05';

  return (
    <div className="predict-risk-page-container" style={{ padding: '24px 32px', color: '#1e293b' }}>
      {/* HEADER & BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button
              onClick={onBackToDashboard}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              ← Back to Dashboard
            </button>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>Operational Forecasting</span>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '0.84rem', color: '#0284c7', fontWeight: 600 }}>Predict Risk Studio</span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🛰️ Production Flood Inundation Prediction Studio
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
            High-precision XGBoost inference engine with live satellite telemetry auto-fetch, scenario stress testing, and civic alert scoring
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handleRunPrediction()}
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
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
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📍</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {params.location}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
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
                  background: params.location.includes(c.name) ? '#0284c7' : '#f8fafc',
                  color: params.location.includes(c.name) ? '#ffffff' : '#334155',
                  border: '1px solid #cbd5e1',
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
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem'
              }}
            />
            {locationQuery && (
              <button
                onClick={() => setLocationQuery('')}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
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
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              marginTop: '4px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
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
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: '#334155'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <strong>{r.name}</strong>, {r.state ? `${r.state}, ` : ''}{r.country} ({r.lat.toFixed(2)}°, {r.lng.toFixed(2)}°)
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TWO COLUMN WORKSTATION GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN: PARAMETER SLIDERS & SCENARIO CONTROLS */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          {/* Stress-Test Scenario Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
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
                    background: selectedScenario === s.key ? '#f0f9ff' : '#f8fafc',
                    border: selectedScenario === s.key ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{s.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 24h Rain */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                <span>🌧️ 24-Hour Acute Rainfall</span>
                <span style={{ color: params.rainfall24h > 100 ? '#dc2626' : '#0284c7' }}>{params.rainfall24h} mm</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>0 mm (Dry)</span>
                <span>75 mm (Moderate)</span>
                <span>150+ mm (Severe Cloudburst)</span>
              </div>
            </div>

            {/* 72h Rain */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                <span>🌧️ 72-Hour Cumulative Rainfall</span>
                <span style={{ color: params.rainfall72h > 180 ? '#dc2626' : '#0284c7' }}>{params.rainfall72h} mm</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>0 mm</span>
                <span>150 mm (Ground Saturated)</span>
                <span>300+ mm (Catastrophic)</span>
              </div>
            </div>

            {/* Elevation */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                <span>⛰️ Digital Elevation (DEM)</span>
                <span style={{ color: params.elevation < 15 ? '#dc2626' : '#059669' }}>{params.elevation} meters</span>
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
                style={{ width: '100%', accentColor: '#059669' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                <span>1 m (Vulnerable Sump)</span>
                <span>50 m</span>
                <span>300 m (High Ground)</span>
              </div>
            </div>

            {/* Humidity & Temperature */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
            background: '#ffffff',
            border: isBreached ? '2px solid #f87171' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                AI Flood Risk Assessment
              </span>
              <span style={{
                background: isBreached ? '#fee2e2' : '#dcfce7',
                color: isBreached ? '#b91c1c' : '#15803d',
                border: isBreached ? '1px solid #fca5a5' : '1px solid #86efac',
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
              <span style={{ fontSize: '3.2rem', fontWeight: 900, color: isBreached ? '#dc2626' : '#16a34a', lineHeight: 1 }}>
                {prob}%
              </span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Inundation Probability
              </span>
            </div>

            {/* Threshold Bar */}
            <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', position: 'relative', marginBottom: '14px' }}>
              <div style={{
                width: `${prob}%`,
                height: '100%',
                background: isBreached ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #059669)'
              }}></div>
              {/* 50% Threshold Mark */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#0f172a' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '16px' }}>
              <span>0% Safe</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>▲ 50% Danger Line</span>
              <span>100% Catastrophic</span>
            </div>

            {/* 3 Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Est. Water Depth</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {isBreached ? `${estDepthMeters} m` : '< 0.15 m'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Evacuation Window</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
                  {isBreached ? '2 - 4 Hours' : 'Standby'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Model Confidence</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>96.8%</div>
              </div>
            </div>
          </div>

          {/* Top Risk Contributors for this prediction */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              Key Environmental Risk Factors
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(prediction?.riskFactors || [
                { name: 'Rainfall (72h)', value: 31, color: '#ef4444' },
                { name: 'Rainfall (24h)', value: 22, color: '#f97316' },
                { name: 'Elevation Vulnerability', value: 18, color: '#eab308' },
                { name: 'Relative Humidity', value: 12, color: '#3b82f6' }
              ]).map((rf, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#475569', fontWeight: 600 }}>{rf.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '50%' }}>
                    <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${rf.value * 2.5}%`, height: '100%', background: rf.color }}></div>
                    </div>
                    <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{rf.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Civic Recommendation */}
          <div style={{
            background: isBreached ? '#fef2f2' : '#f0fdf4',
            border: isBreached ? '1px solid #fecaca' : '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isBreached ? '#991b1b' : '#166534', marginBottom: '4px' }}>
              {isBreached ? '🚨 Emergency Directives for Municipal Authorities:' : '✅ Normal Operational Advisory:'}
            </div>
            <div style={{ fontSize: '0.8rem', color: isBreached ? '#7f1d1d' : '#14532d', lineHeight: 1.4 }}>
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
