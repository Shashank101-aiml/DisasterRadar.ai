import React from 'react';

export default function InputParameters({ params, onChange, onPredict, isLoading }) {
  const handleChange = (field, value) => {
    onChange(field, value);
  };

  return (
    <div className="card" id="inputParamsCard">
      <div className="card-title">Input Parameters</div>

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
                className="param-input"
                value={params.elevation}
                onChange={(e) => handleChange('elevation', e.target.value)}
              /> m
            </td>
          </tr>

          <tr>
            <td className="param-name-cell">
              <div className="param-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" x2="22" y1="12" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span>Latitude</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.01"
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
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span>Longitude</span>
            </td>
            <td className="param-val-cell">
              <input
                type="number"
                step="0.01"
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
