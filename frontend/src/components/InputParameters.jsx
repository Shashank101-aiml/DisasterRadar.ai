import React, { useState } from 'react';
import {
  fetchLiveWeatherByLocationOrCoords,
  reverseGeocodeCoords,
  submitGroundTruthReport,
  geocodeLocation
} from '../services/api';

export default function InputParameters({
  params,
  homeLocation,
  activeLocation,
  locationTab = 'myLocation',
  onSwitchToMyLocation,
  onSwitchToExplore,
  onUpdateHomeLocation,
  onExploreLocation,
  onChange,
  onPredict,
  isLoading,
  onOpenPredictStudio
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [groundTruthState, setGroundTruthState] = useState({
    verified: false,
    condition: null
  });

  // State for in-place Home Location changer
  const [isChangingHome, setIsChangingHome] = useState(false);
  const [homeInputQuery, setHomeInputQuery] = useState('');
  const [homeSearchResults, setHomeSearchResults] = useState([]);
  const [isSearchingHome, setIsSearchingHome] = useState(false);

  // State for Exploring other locations
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [exploreSearchResults, setExploreSearchResults] = useState([]);
  const [isSearchingExplore, setIsSearchingExplore] = useState(false);

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
    setSyncMessage('Acquiring high-accuracy GPS coordinates...');

    const onGeoSuccess = async (pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lng = parseFloat(pos.coords.longitude.toFixed(4));
      onChange('latitude', lat);
      onChange('longitude', lng);

      let geoRes = await reverseGeocodeCoords(lat, lng);
      let placeName = typeof geoRes === 'object' ? geoRes?.name : geoRes;
      if (!placeName || placeName.startsWith('Location (')) {
        placeName = `GPS Location (${lat}, ${lng})`;
      }

      onChange('location', placeName);
      await handleSyncLiveWeather(lat, lng, placeName);
      setSyncMessage(`📍 GPS locked: ${placeName}`);
      setTimeout(() => setSyncMessage(null), 5000);
    };

    const onGeoError = (err) => {
      console.warn('GPS initial attempt error:', err.message);
      setIsSyncing(false);
      setSyncMessage('GPS unavailable. Click "Change it" to set town.');
      setTimeout(() => setSyncMessage(null), 4000);
    };

    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, {
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 0
    });
  };

  // Search and select new Home Location permanently
  const handleSearchHome = async (query) => {
    if (!query || query.trim().length < 2) return;
    setIsSearchingHome(true);
    try {
      const results = await geocodeLocation(query);
      setHomeSearchResults(results || []);
    } catch (e) {
      console.warn('Home geocode error:', e);
    } finally {
      setIsSearchingHome(false);
    }
  };

  const handleSelectNewHome = async (loc) => {
    setIsChangingHome(false);
    setHomeSearchResults([]);
    setHomeInputQuery('');
    const payload = { ...loc, isUserExplicitHome: true };
    if (onUpdateHomeLocation) {
      await onUpdateHomeLocation(payload);
    }
    setSyncMessage(`✓ Home location saved as ${loc.name}`);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  // Search and explore another location temporarily
  const handleSearchExplore = async (query) => {
    if (!query || query.trim().length < 2) return;
    setIsSearchingExplore(true);
    try {
      const results = await geocodeLocation(query);
      setExploreSearchResults(results || []);
    } catch (e) {
      console.warn('Explore geocode error:', e);
    } finally {
      setIsSearchingExplore(false);
    }
  };

  const handleSelectExploreLoc = async (loc) => {
    setExploreSearchResults([]);
    setExploreSearchQuery('');
    if (onExploreLocation) {
      await onExploreLocation(loc);
    }
    setSyncMessage(`✓ Exploring ${loc.name}`);
    setTimeout(() => setSyncMessage(null), 4000);
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
      
      {/* 2-TAB LOCATION SELECTOR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onSwitchToMyLocation}
            style={{
              background: locationTab === 'myLocation' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: locationTab === 'myLocation' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: locationTab === 'myLocation' ? '0 2px 10px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>🏠</span>
            <span>My Location ({homeLocation?.name?.split(',')[0] || 'Kharupetia'})</span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchToExplore && onSwitchToExplore()}
            style={{
              background: locationTab === 'explore' ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: locationTab === 'explore' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: locationTab === 'explore' ? '0 2px 10px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>🔍</span>
            <span>Explore Other Location</span>
          </button>
        </div>

        {locationTab === 'explore' && onSwitchToMyLocation && (
          <button
            type="button"
            onClick={onSwitchToMyLocation}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>↩️</span>
            <span>Back to My Location</span>
          </button>
        )}
      </div>

      {/* LOCATION TITLE & IN-PLACE CHANGER BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{locationTab === 'myLocation' ? '🏠' : '🌐'}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#f8fafc', lineHeight: 1.2 }}>
                {params.location || (locationTab === 'myLocation' ? homeLocation?.name : activeLocation?.name) || 'Monitored Basin'}
              </div>
              {locationTab === 'explore' && (
                <span style={{
                  fontSize: '0.65rem',
                  background: 'rgba(2, 132, 199, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  EXPLORING
                </span>
              )}
              {locationTab === 'myLocation' && (
                <button
                  type="button"
                  onClick={() => setIsChangingHome(prev => !prev)}
                  style={{
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {isChangingHome ? '✕ Close' : '✏️ Not your location? Change it'}
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
              Lat: {Number(params.latitude || 26.52).toFixed(3)}° | Lon: {Number(params.longitude || 92.14).toFixed(3)}°
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

      {/* INLINE PERMANENT HOME CHANGER (Shown when clicking "Not your location? Change it") */}
      {isChangingHome && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #38bdf8',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
            Set Your Permanent Home Location:
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Search your city or town (e.g. Kharupetia, Guwahati, Silchar)..."
              value={homeInputQuery}
              onChange={(e) => setHomeInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchHome(homeInputQuery)}
              style={{
                flex: 1,
                background: '#070d19',
                border: '1px solid #1e293b',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => handleSearchHome(homeInputQuery)}
              disabled={isSearchingHome}
              style={{
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isSearchingHome ? 'Searching...' : 'Search'}
            </button>
          </div>

          {homeSearchResults.length > 0 && (
            <div style={{ marginTop: '8px', maxHeight: '140px', overflowY: 'auto' }}>
              {homeSearchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectNewHome(r)}
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    color: '#f8fafc',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                >
                  📍 {r.name} {r.country ? `(${r.country})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXPLORE OTHER LOCATION PANEL (Shown when in 'explore' tab) */}
      {locationTab === 'explore' && (
        <div style={{
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
              🔍 Explore Any Location Globally (Live Satellite Weather & Risk):
            </span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              Home remains locked to {homeLocation?.name?.split(',')[0] || 'Kharupetia'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Search any city globally (e.g. Guwahati, Silchar, Mumbai, Tokyo)..."
              value={exploreSearchQuery}
              onChange={(e) => setExploreSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchExplore(exploreSearchQuery)}
              style={{
                flex: 1,
                background: '#070d19',
                border: '1px solid #1e293b',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => handleSearchExplore(exploreSearchQuery)}
              disabled={isSearchingExplore}
              style={{
                background: '#0284c7',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isSearchingExplore ? 'Finding...' : 'Explore'}
            </button>
          </div>

          {exploreSearchResults.length > 0 && (
            <div style={{ marginTop: '8px', maxHeight: '140px', overflowY: 'auto' }}>
              {exploreSearchResults.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectExploreLoc(r)}
                  style={{
                    padding: '6px 8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    color: '#f8fafc',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                >
                  📍 {r.name} {r.country ? `(${r.country})` : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE RAIN / DRY STATUS BAR */}
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

      {/* 2x3 TELEMETRY METRICS GRID */}
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

      {/* GROUND-TRUTH CALIBRATION WIDGET */}
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

      {/* QUICK SYNC ACTION BAR */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <button
          onClick={() => handleSyncLiveWeather()}
          disabled={isSyncing}
          style={{
            flex: 1,
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#38bdf8',
            borderRadius: '6px',
            padding: '7px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          title="Sync live Open-Meteo satellite weather for this location"
        >
          <span>🔄</span>
          <span>{isSyncing ? 'Syncing...' : 'Sync Live Satellite Weather'}</span>
        </button>
        <button
          onClick={handleUseCurrentLocation}
          disabled={isSyncing}
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            color: '#10b981',
            borderRadius: '6px',
            padding: '0 12px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: isSyncing ? 'not-allowed' : 'pointer'
          }}
          title="Sync device hardware GPS"
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
