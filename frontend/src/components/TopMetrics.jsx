import React from 'react';

export default function TopMetrics({ probability, riskLevel, location, latitude, longitude, recommendation, onOpenExplainer }) {
  // Compute SVG Donut Progress Circle offset
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(100, Math.max(0, probability || 0));
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Determine colors based on risk
  const isHigh = riskLevel === 'HIGH' || probability >= 70;
  const isModerate = riskLevel === 'MODERATE' || (probability >= 40 && probability < 70);

  let donutStroke = '#10b981';
  let riskColorClass = 'low';
  if (isHigh) {
    donutStroke = '#e53935';
    riskColorClass = 'high';
  } else if (isModerate) {
    donutStroke = '#f59e0b';
    riskColorClass = 'moderate';
  }

  return (
    <section className="top-metrics-grid">
      {/* 1. Flood Probability */}
      <div className="card metric-card">
        <div className="metric-header">Flood Probability</div>
        <div className="metric-body">
          <div className="donut-gauge-container">
            <svg className="donut-gauge-svg" viewBox="0 0 64 64">
              <circle className="donut-bg-circle" cx="32" cy="32" r={radius} />
              <circle
                className="donut-progress-circle"
                cx="32"
                cy="32"
                r={radius}
                style={{
                  stroke: donutStroke,
                  strokeDasharray: `${circumference} ${circumference}`,
                  strokeDashoffset: strokeDashoffset
                }}
              />
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value-large" style={{ color: donutStroke }}>
              {probability}%
            </span>
            <span className="metric-subtext">
              {isHigh ? 'High probability of flood' : (isModerate ? 'Moderate probability of flood' : 'Low probability of flood')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Risk Level */}
      <div className="card metric-card">
        <div className="metric-header">Risk Level</div>
        <div className="metric-body">
          <div className={`risk-icon-wrapper ${riskColorClass}`}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v5"/>
              <path d="M9 22V12h6v2"/>
              <path d="M2 17c2-1 4-1 6 0 2 1 4 1 6 0 2-1 4-1 6 0"/>
              <path d="M2 21c2-1 4-1 6 0 2 1 4 1 6 0 2-1 4-1 6 0"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className={`metric-value-large risk-level-val ${riskColorClass}`}>
              {riskLevel}
            </span>
            <span className="metric-subtext">
              {riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()} Risk of Flood
            </span>
          </div>
        </div>
      </div>

      {/* 3. Location */}
      <div className="card metric-card">
        <div className="metric-header">Location</div>
        <div className="metric-body">
          <div className="location-pin-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="location-name">{location || 'Bengaluru, Karnataka'}</span>
            <span className="location-coords">
              Lat: {latitude} , Lon: {longitude}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Recommendation */}
      <div className="card metric-card recommendation-card">
        <div className="rec-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span>Recommendation</span>
          </div>
          {onOpenExplainer && (
            <button
              onClick={onOpenExplainer}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              AI Flood Evacuation SOP →
            </button>
          )}
        </div>
        <div className="rec-body">
          {recommendation || 'Monitor rainfall and drainage conditions closely. Issue early warning for low-lying areas and prepare emergency response resources.'}
        </div>
      </div>
    </section>
  );
}
