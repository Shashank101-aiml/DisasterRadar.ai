import React from 'react';

export default function RiskFactors({ factors }) {
  const defaultFactors = [
    { name: 'Rainfall (72h)', value: 31, color: '#ef4444' },
    { name: 'Rainfall (24h)', value: 22, color: '#f97316' },
    { name: 'Humidity', value: 12, color: '#eab308' },
    { name: 'Elevation', value: 8, color: '#a3e635' },
    { name: 'Temperature', value: 8, color: '#84cc16' }
  ];

  const items = factors && factors.length > 0 ? factors : defaultFactors;

  return (
    <div className="card">
      <div className="card-title">Top Risk Factors</div>

      <div className="risk-factors-container">
        {items.map((factor, idx) => (
          <div key={idx} className="risk-factor-row">
            <span className="factor-label">{factor.name}</span>
            <div className="factor-bar-track">
              <div
                className="factor-bar-fill"
                style={{
                  width: `${factor.value}%`,
                  backgroundColor: factor.color
                }}
              />
            </div>
            <span className="factor-val">{factor.value}%</span>
          </div>
        ))}
      </div>

      <div className="factors-axis-wrapper">
        <div className="factors-ticks">
          <span>0%</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%</span>
          <span>40%</span>
        </div>
        <div className="factors-axis-label">Impact (%)</div>
      </div>
    </div>
  );
}
