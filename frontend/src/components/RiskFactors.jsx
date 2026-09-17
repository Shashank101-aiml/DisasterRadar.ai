import React from 'react';

export default function RiskFactors({ factors }) {
  const defaultFactors = [
    { name: 'Rainfall (72h)', value: 31, color: '#ef4444' },
    { name: 'Rainfall (24h)', value: 22, color: '#f97316' },
    { name: 'Humidity', value: 12, color: '#eab308' },
    { name: 'Elevation', value: 8, color: '#06b6d4' },
    { name: 'Temperature', value: 8, color: '#3b82f6' }
  ];

  const items = factors && factors.length > 0 ? factors : defaultFactors;

  // Hydrological physics explanations
  const getExplanation = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('72h')) return 'Soil reaches saturation capacity > 120mm; excess becomes direct surface runoff.';
    if (lower.includes('24h')) return 'Acute cloudburst surge volume exceeding storm sewer flow capacity.';
    if (lower.includes('humid')) return 'High atmospheric moisture prevents evaporation and increases storm intensity.';
    if (lower.includes('elev')) return 'Low-lying basin terrain (< 25m) naturally collects pooling floodwaters.';
    if (lower.includes('temp')) return 'Warm surface air drives convective storm clouds and rapid precipitation.';
    return 'Key environmental parameter contributing to hydrodynamic flood risk.';
  };

  return (
    <div
      className="card"
      style={{
        background: '#0b1120',
        border: '1px solid rgba(56, 189, 248, 0.18)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        marginTop: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div className="card-title" style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#f8fafc' }}>
          Why is this Location at Risk?
        </div>
        <span style={{ fontSize: '0.66rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '2px 6px', borderRadius: '4px' }}>
          SHAP DRIVERS
        </span>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '14px' }}>
        Top hydrological and physical factors identified by the AI model.
      </div>

      <div className="risk-factors-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((factor, idx) => (
          <div key={idx} className="risk-factor-row" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{factor.name}</span>
              <span style={{ fontWeight: 800, color: factor.color || '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                +{factor.value}%
              </span>
            </div>

            {/* Single Solid Color Bar (Strictly no linear-gradient) */}
            <div
              style={{
                width: '100%',
                height: '8px',
                background: '#1e293b',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, factor.value * 2.5)}%`,
                  height: '100%',
                  backgroundColor: factor.color || '#38bdf8',
                  borderRadius: '4px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748b', lineHeight: 1.3 }}>
              {getExplanation(factor.name)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
