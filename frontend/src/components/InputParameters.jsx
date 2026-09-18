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

  // Preset quick locations
  const presets = [
    { label: 'Mira Bhayandar', name: 'Mira Bhayandar, India', lat: 19.2952, lng: 72.8544 },
    { label: 'Mumbai', name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { label: 'Bengaluru', name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946 },
    { label: 'Chennai', name: 'Chennai, India', lat: 13.0827, lng: 80.2707 }
  ];

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

        setSyncMessage(`Live data synced from Open-Meteo (${liveData.rainfall24h}mm 24h rain)`);
        setTimeout(() => setSyncMessage(null), 4000);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>
            📍 Location (City Name or Coords):
          </span>
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
            {isSyncing ? 'Syncing...' : '⚡ Sync Open-Meteo'}
          </button>
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

        {/* Quick 1-Click Presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {presets.map(p => {
            const isSelected = params.location && params.location.includes(p.label);
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p)}
                style={{
                  fontSize: '0.72rem',
                  background: isSelected ? '#0284c7' : '#0b1120',
                  border: isSelected ? '1px solid #0284c7' : '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            );
          })}
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
