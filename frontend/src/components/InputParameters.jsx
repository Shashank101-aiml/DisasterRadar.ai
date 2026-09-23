import React, { useState } from 'react';
import { fetchLiveWeatherByLocationOrCoords } from '../services/api';

export default function InputParameters({
  params,
  onChange,
  onPredict,
  isLoading,
  onOpenPredictStudio
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const handleChange = (field, value) => {
    onChange(field, value);
  };

  // 2 Ways to fetch live Open-Meteo Weather:
  // Way 1: Based on direct Coordinates (lat & lng)
  // Way 2: Based on Location / City Name
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
        if (liveData.temperature !== undefined) onChange('temperature', liveData.temperature);
        if (liveData.humidity !== undefined) onChange('humidity', liveData.humidity);
        if (liveData.pressure !== undefined) onChange('pressure', liveData.pressure);
        if (liveData.windSpeed !== undefined) onChange('windSpeed', liveData.windSpeed);
        if (liveData.elevation !== undefined) onChange('elevation', liveData.elevation);
        if (liveData.latitude !== undefined) onChange('latitude', liveData.latitude);
        if (liveData.longitude !== undefined) onChange('longitude', liveData.longitude);
        if (liveData.location) onChange('location', liveData.location);

        const currRain = liveData.currentRainfall !== undefined ? liveData.currentRainfall : 0;
        const rainStatus = currRain === 0 ? '☀️ 0.0 mm/h (Dry / No Rain)' : `🌧️ ${currRain} mm/h Rain`;
        setSyncMessage(`Live synced: ${rainStatus} • Past 24h: ${liveData.rainfall24h}mm`);
        setTimeout(() => setSyncMessage(null), 5000);
      } else {
        setSyncMessage('Could not retrieve live data. Using current values.');
        setTimeout(() => setSyncMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error syncing live weather:', err);
      setSyncMessage('Sync error. Please check network.');
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectPreset = (p) => {
    onChange('location', p.name);
    onChange('latitude', p.lat);
    onChange('longitude', p.lng);
    handleSyncLiveWeather(p.lat, p.lng, p.name);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSyncMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setSyncMessage(null), 3000);
      return;
    }
    setIsSyncing(true);
    setSyncMessage('Reading your device GPS/Wi-Fi location...');

    const onGeoSuccess = async (pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(4));
      const lng = parseFloat(pos.coords.longitude.toFixed(4));
      onChange('latitude', lat);
      onChange('longitude', lng);

      // Reverse-geocode to get real place/town name
      let placeName = `Device Location (${lat}, ${lng})`;
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const nRes = await fetch(nomUrl, { headers: { 'User-Agent': 'DisasterRadar-FloodRiskAI/1.0' } });
        if (nRes.ok) {
          const nData = await nRes.json();
          const addr = nData.address || {};
          const cityOrTown = addr.city || addr.town || addr.suburb || addr.village || addr.county || nData.display_name.split(',')[0];
          const stateOrCountry = addr.state || addr.country || '';
          placeName = `${cityOrTown}, ${stateOrCountry}`.trim().replace(/^,|,$/g, '');
        }
      } catch (e) {
        console.warn('Reverse geocoding error:', e);
      }

      onChange('location', placeName);
      await handleSyncLiveWeather(lat, lng, placeName);
      setSyncMessage(`📍 Locked to device: ${placeName}`);
      setTimeout(() => setSyncMessage(null), 5000);
    };

    const onGeoError = (err) => {
      console.warn('GPS initial attempt error:', err.message, 'Retrying with standard Wi-Fi mode...');
      // 2nd stage: standard accuracy without requiring satellite hardware
      navigator.geolocation.getCurrentPosition(
        onGeoSuccess,
        (secondErr) => {
          setIsSyncing(false);
          let reason = secondErr.message;
          if (secondErr.code === 1) {
            reason = '⚠️ Permission blocked. Click the 🔒 icon in your browser URL bar and set Location to "Allow".';
          } else if (secondErr.code === 2) {
            reason = '⚠️ Position unavailable. Enable "Location" in Windows Settings.';
          } else if (secondErr.code === 3) {
            reason = '⚠️ Location timed out. Retrying...';
          }
          setSyncMessage(reason);
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

  return (
    <div className="card" id="inputParamsCard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="card-title" style={{ margin: 0 }}>Input Parameters</div>
        {onOpenPredictStudio && (
          <button
            onClick={onOpenPredictStudio}
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Full Predict Studio →
          </button>
        )}
      </div>

      {/* LOCATION SELECTION: 2 WAYS PRESENT */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            📍 Location (City Name or Coords):
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isSyncing}
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '5px',
                padding: '4px 9px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Detect my current live GPS coordinates and fetch real weather"
            >
              📍 My Location
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('rainfall24h', 0);
                onChange('rainfall72h', 0);
                setSyncMessage('Rainfall set to 0.0 mm (Completely Dry / Clear)');
                setTimeout(() => setSyncMessage(null), 4000);
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '5px',
                padding: '4px 9px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Force rainfall to 0.0 mm if your location currently has no rain"
            >
              ☀️ 0 mm (Dry)
            </button>
            <button
              type="button"
              onClick={() => handleSyncLiveWeather()}
              disabled={isSyncing}
              style={{
                background: isSyncing ? '#475569' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Fetch real live rainfall, humidity, and temperature from Open-Meteo"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              {isSyncing ? 'Syncing...' : '⚡ Sync Live'}
            </button>
          </div>
        </div>

        {/* Way 2: City / Location Name Input */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <input
            type="text"
            className="param-input"
            style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem', textAlign: 'left', background: '#0b1120', border: '1px solid #1e293b', color: '#f8fafc' }}
            placeholder="Type city (e.g. Mira Bhayandar, Mumbai)..."
            value={params.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSyncLiveWeather(null, null, e.target.value);
            }}
          />
          <button
            type="button"
            onClick={() => handleSyncLiveWeather(null, null, params.location)}
            style={{
              background: '#0284c7',
              border: '1px solid #0284c7',
              color: '#ffffff',
              borderRadius: '4px',
              padding: '0 12px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Find
          </button>
        </div>

        {syncMessage && (
          <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
            ✓ {syncMessage}
          </div>
        )}
      </div>

      <table className="params-table">
        <tbody>
          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                  <path d="M16 14v6M8 14v6M12 16v6"/>
                </svg>
              </div>
              <span>Rainfall (24h)</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.1"
                className="param-input"
                value={params.rainfall24h}
                onChange={(e) => handleChange('rainfall24h', e.target.value)}
              /> mm
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                  <path d="M16 14v6M8 14v6M12 16v6M10 18v3M14 18v3"/>
                </svg>
              </div>
              <span>Rainfall (72h)</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.1"
                className="param-input"
                value={params.rainfall72h}
                onChange={(e) => handleChange('rainfall72h', e.target.value)}
              /> mm
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                </svg>
              </div>
              <span>Temperature</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.1"
                className="param-input"
                value={params.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
              /> °C
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <span>Humidity</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="1"
                className="param-input"
                value={params.humidity}
                onChange={(e) => handleChange('humidity', e.target.value)}
              /> %
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
                  <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
                  <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
                </svg>
              </div>
              <span>Wind Speed</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.1"
                className="param-input"
                value={params.windSpeed}
                onChange={(e) => handleChange('windSpeed', e.target.value)}
              /> km/h
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 14 10"/>
                </svg>
              </div>
              <span>Atmospheric Pressure</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="1"
                className="param-input"
                value={params.pressure}
                onChange={(e) => handleChange('pressure', e.target.value)}
              /> hPa
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                </svg>
              </div>
              <span>Elevation</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="1"
                className="param-input"
                value={params.elevation}
                onChange={(e) => handleChange('elevation', e.target.value)}
              /> m
            </td>
          </tr>

          {/* Way 1: Latitude & Longitude Direct Coordinates */}
          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" x2="22" y1="12" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span>Latitude</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.0001"
                className="param-input"
                value={params.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
              />
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span>Longitude</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.0001"
                className="param-input"
                value={params.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button className="predict-btn" onClick={onPredict} disabled={isLoading}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
        <span>{isLoading ? 'Predicting...' : 'Predict Risk'}</span>
      </button>
    </div>
  );
}
