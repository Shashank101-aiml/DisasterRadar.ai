import React, { useState } from 'react';
import { fetchLiveWeatherByLocationOrCoords, reverseGeocodeCoords, submitGroundTruthReport } from '../services/api';

export default function InputParameters({
  params,
  onChange,
  onPredict,
  isLoading,
  onOpenPredictStudio
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [groundTruthState, setGroundTruthState] = useState({
    verified: false,
    condition: null
  });

  const handleSyncLiveWeather = async (overrideLat = null, overrideLng = null, overrideLoc = null) => {
    setIsSyncing(true);
    setSyncMessage(null);

    const latToUse = overrideLat !== null ? overrideLat : parseFloat(params.latitude);
    const lngToUse = overrideLng !== null ? overrideLng : parseFloat(params.longitude);
    const locToUse = overrideLoc !== null ? overrideLoc : (params.location || '');

    try {
      const liveData = await fetchLiveWeatherByLocationOrCoords({
        latitude: !isNaN(latToUse) ? latToUse : undefined,
        longitude: !isNaN(lngToUse) ? lngToUse : undefined,
        location: locToUse
      });

      if (liveData) {
        if (liveData.rainfall24h !== undefined) onChange('rainfall24h', liveData.rainfall24h);
        if (liveData.rainfall72h !== undefined) onChange('rainfall72h', liveData.rainfall72h);
        if (liveData.currentRainfall !== undefined) onChange('currentRainfall', liveData.currentRainfall);
        if (liveData.isRaining !== undefined) onChange('isRaining', liveData.isRaining);
        if (liveData.temperature !== undefined) onChange('temperature', liveData.temperature);
        if (liveData.humidity !== undefined) onChange('humidity', liveData.humidity);
        if (liveData.pressure !== undefined) onChange('pressure', liveData.pressure);
        if (liveData.windSpeed !== undefined) onChange('windSpeed', liveData.windSpeed);
        if (liveData.elevation !== undefined) onChange('elevation', liveData.elevation);
        if (liveData.latitude !== undefined) onChange('latitude', liveData.latitude);
        if (liveData.longitude !== undefined) onChange('longitude', liveData.longitude);
        if (liveData.location) onChange('location', liveData.location);

        setGroundTruthState({ verified: false, condition: null });
        const currRain = liveData.currentRainfall !== undefined ? liveData.currentRainfall : 0;
        const rainStatus = currRain === 0 ? '☀️ 0.0 mm/h (Dry)' : `🌧️ ${currRain} mm/h Rain`;
        setSyncMessage(`Live synced: ${rainStatus} • Past 24h: ${liveData.rainfall24h}mm`);
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        setSyncMessage('Using active values.');
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error syncing live weather:', err);
      setSyncMessage('Network error syncing weather.');
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSyncMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Reading GPS location...');

    const onGeoSuccess = async (pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lng = parseFloat(pos.coords.longitude.toFixed(4));
      onChange('latitude', lat);
      onChange('longitude', lng);

      let geoRes = await reverseGeocodeCoords(lat, lng);
      let placeName = typeof geoRes === 'object' ? geoRes?.name : geoRes;
      if (!placeName || placeName.startsWith('Location (')) {
        placeName = `Device Location (${lat}, ${lng})`;
      }

      onChange('location', placeName);
      await handleSyncLiveWeather(lat, lng, placeName);
      setSyncMessage(`📍 Locked to device: ${placeName}`);
      setTimeout(() => setSyncMessage(null), 5000);
    };

    const onGeoError = (err) => {
      console.warn('GPS initial attempt error:', err.message);
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (secondErr) => {
          setIsSyncing(false);
          setSyncMessage(secondErr.message || 'Position unavailable');
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  };

  const handleGroundTruthVerify = async (isRain) => {
    const nextCondition = isRain ? 'RAIN' : 'DRY';
    setGroundTruthState({ verified: true, condition: nextCondition });

    if (isRain) {
      const target24 = Math.max(15.0, Number(params.rainfall24h || 0) + 12.0);
      const target72 = Math.max(35.0, Number(params.rainfall72h || 0) + 20.0);
      onChange('rainfall24h', target24);
      onChange('rainfall72h', target72);
      onChange('currentRainfall', 3.5);
      onChange('isRaining', true);
      setSyncMessage(`Calibrated: Active Rain confirmed (${target24.toFixed(1)}mm 24h)`);
    } else {
      onChange('rainfall24h', 0.0);
      onChange('rainfall72h', 0.0);
      onChange('currentRainfall', 0.0);
      onChange('isRaining', false);
      setSyncMessage('Calibrated: Bone Dry (0.0mm)');
    }

    try {
      submitGroundTruthReport({
        location: params.location,
        latitude: params.latitude,
        longitude: params.longitude,
        isRaining: isRain,
        observedCondition: isRain ? 'ACTIVE_RAIN' : 'BONE_DRY',
        rainfallOverride: isRain ? 3.5 : 0.0
      });
    } catch (e) {}

    setTimeout(() => {
      if (onPredict) onPredict();
    }, 150);
  };

  const isRainingNow = Boolean(params.isRaining || (params.currentRainfall || 0) > 0);
  const rainRate = (params.currentRainfall || (isRainingNow ? 2.0 : 0)).toFixed(1);

  return (
    <div className="card" id="inputParamsCard" style={{ padding: '16px' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>📍</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#f8fafc', lineHeight: 1.2 }}>
              {params.location || 'Monitored Basin'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
              Lat: {Number(params.latitude || 12.96).toFixed(3)}° | Lon: {Number(params.longitude || 77.71).toFixed(3)}°
            </div>
          </div>
        </div>

        {onOpenPredictStudio && (
          <button
            onClick={onOpenPredictStudio}
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              color: '#10b981',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '4px 8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Full Studio →
          </button>
        )}
      </div>

      {/* ACTIVE RAIN / DRY STATUS BAR (Matches Image 2) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        marginBottom: '10px',
        background: isRainingNow ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.12)',
        border: isRainingNow ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>{isRainingNow ? '🌧️' : '☀️'}</span>
          <div>
            <div style={{ color: isRainingNow ? '#38bdf8' : '#10b981', fontWeight: 800, fontSize: '0.82rem' }}>
              {isRainingNow ? 'Active Rain' : 'Currently Dry / Clear'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Rain Rate: {rainRate} mm/h {groundTruthState.verified ? '(Ground Verified)' : ''}
            </div>
          </div>
        </div>
        <span style={{
          background: isRainingNow ? 'rgba(56, 189, 248, 0.25)' : 'rgba(16, 185, 129, 0.25)',
          color: isRainingNow ? '#38bdf8' : '#34d399',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.04em'
        }}>
          {isRainingNow ? 'RAINING' : 'NO RAIN'}
        </span>
      </div>

      {/* 2x3 TELEMETRY METRICS GRID (Matches Image 2) */}
      <div className="telemetry-metrics-grid" style={{ marginBottom: '12px' }}>
        <div className="metric-pill">
          <div className="metric-label">Past 24h Rain</div>
          <div className="metric-value highlight">{params.rainfall24h ?? 0} <span className="unit">mm</span></div>
        </div>
        <div className="metric-pill">
          <div className="metric-label">Past 72h Rain</div>
          <div className="metric-value highlight-orange">{params.rainfall72h ?? 0} <span className="unit">mm</span></div>
        </div>
        <div className="metric-pill">
          <div className="metric-label">Ground Elevation</div>
          <div className="metric-value">{params.elevation ?? 15} <span className="unit">m</span></div>
        </div>
        <div className="metric-pill">
          <div className="metric-label">Humidity</div>
          <div className="metric-value">{params.humidity ?? 60} <span className="unit">%</span></div>
        </div>
        <div className="metric-pill">
          <div className="metric-label">Temperature</div>
          <div className="metric-value">{params.temperature ?? 25} <span className="unit">°C</span></div>
        </div>
        <div className="metric-pill">
          <div className="metric-label">Atm. Pressure</div>
          <div className="metric-value">{params.pressure ?? 1013} <span className="unit">hPa</span></div>
        </div>
      </div>

      {/* GROUND-TRUTH CALIBRATION WIDGET (Matches Image 2) */}
      <div style={{
        padding: '12px',
        background: groundTruthState.verified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
        border: groundTruthState.verified ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.4px' }}>
            GROUND-TRUTH CALIBRATION
          </span>
          {groundTruthState.verified && (
            <span style={{
              fontSize: '0.64rem',
              background: '#10b981',
              color: '#0f172a',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              ✓ VERIFIED
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px', lineHeight: 1.35 }}>
          Are skies clear outside your window? Calibrate AI models to your exact ground observations:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={() => handleGroundTruthVerify(false)}
            style={{
              background: groundTruthState.condition === 'DRY' ? '#10b981' : 'rgba(16, 185, 129, 0.15)',
              color: groundTruthState.condition === 'DRY' ? '#0f172a' : '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '8px 6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
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
              padding: '8px 6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s'
            }}
            title="Calibrate model: Verify active rain on ground and recalculate flood probability"
          >
            🌧️ Active Rain
          </button>
        </div>
      </div>

      {/* QUICK LOCATION ACTIONS & SEARCH ROW */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search city (e.g. Mumbai, Guwahati)..."
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSyncLiveWeather(null, null, locationQuery);
          }}
          style={{
            flex: 1,
            padding: '7px 10px',
            fontSize: '0.78rem',
            background: '#070d19',
            border: '1px solid #1e293b',
            color: '#f8fafc',
            borderRadius: '6px',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSyncLiveWeather(null, null, locationQuery)}
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#38bdf8',
            borderRadius: '6px',
            padding: '0 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Find
        </button>
        <button
          onClick={handleUseCurrentLocation}
          disabled={isSyncing}
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#10b981',
            borderRadius: '6px',
            padding: '0 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: isSyncing ? 'not-allowed' : 'pointer'
          }}
          title="Sync device GPS"
        >
          📍 GPS
        </button>
      </div>

      {syncMessage && (
        <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, marginBottom: '8px' }}>
          ✓ {syncMessage}
        </div>
      )}

      {/* PRIMARY ACTION BUTTON */}
      <button
        className="predict-btn"
        onClick={onPredict}
        disabled={isLoading || isSyncing}
        style={{
          margin: 0,
          padding: '11px',
          borderRadius: '8px',
          background: '#0284c7',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
          fontWeight: 800,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
        <span>{isLoading ? 'Running ML Inference...' : '⚡ Predict Flood Risk'}</span>
      </button>

    </div>
  );
}
