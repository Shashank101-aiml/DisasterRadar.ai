import React, { useState } from 'react';

const PRESET_MODELS = {
  xgboost: {
    id: 'xgboost',
    name: 'XGBoost (Production)',
    badge: 'Active Production',
    color: '#38bdf8',
    curveColor: '#38bdf8',
    accuracy: '91.47%',
    precision: '90.44%',
    recall: '92.75%',
    f1Score: '91.58%',
    rocAuc: '0.9676',
    prAuc: '0.9602',
    brierScore: '0.0625',
    latency: '1.8 ms',
    cm: {
      tn: 5600,
      fp: 609,
      fn: 450,
      tp: 5758
    },
    curvePoints: [
      [0, 0], [0.01, 0.55], [0.03, 0.78], [0.06, 0.89], [0.10, 0.94],
      [0.20, 0.97], [0.40, 0.985], [0.70, 0.995], [1.0, 1.0]
    ]
  },
  random_forest: {
    id: 'random_forest',
    name: 'Random Forest',
    badge: 'Native JSON (No PKL)',
    color: '#10b981',
    curveColor: '#10b981',
    accuracy: '90.17%',
    precision: '87.59%',
    recall: '93.59%',
    f1Score: '90.49%',
    rocAuc: '0.9610',
    prAuc: '0.9514',
    brierScore: '0.0742',
    latency: '4.2 ms',
    cm: {
      tn: 5386,
      fp: 823,
      fn: 398,
      tp: 5810
    },
    curvePoints: [
      [0, 0], [0.02, 0.50], [0.05, 0.76], [0.08, 0.88], [0.12, 0.93],
      [0.25, 0.96], [0.45, 0.98], [0.75, 0.99], [1.0, 1.0]
    ]
  },
  neural_net: {
    id: 'neural_net',
    name: 'PyTorch FloodNet',
    badge: 'Deep Learning',
    color: '#8b5cf6',
    curveColor: '#8b5cf6',
    accuracy: '87.20%',
    precision: '86.40%',
    recall: '88.30%',
    f1Score: '87.34%',
    rocAuc: '0.9250',
    prAuc: '0.9170',
    brierScore: '0.0930',
    latency: '3.4 ms',
    cm: {
      tn: 5320,
      fp: 889,
      fn: 726,
      tp: 5482
    },
    curvePoints: [
      [0, 0], [0.03, 0.40], [0.08, 0.68], [0.15, 0.82], [0.25, 0.89],
      [0.40, 0.93], [0.60, 0.96], [0.80, 0.98], [1.0, 1.0]
    ]
  }
};

export default function ModelPerformance({ metrics, onOpenFullPerformance }) {
  const [selectedModel, setSelectedModel] = useState('xgboost');

  // Dimensions for ROC Curve SVG
  const w = 220;
  const h = 125;
  const padL = 32;
  const padB = 24;
  const padT = 10;
  const padR = 12;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const current = PRESET_MODELS[selectedModel] || PRESET_MODELS.xgboost;

  const pathData = current.curvePoints.map((pt, i) => {
    const x = padL + pt[0] * plotW;
    const y = (padT + plotH) - pt[1] * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const cm = current.cm;

  return (
    <div className="card" id="modelPerfCard" style={{ background: '#0b1120', border: '1px solid rgba(56, 189, 248, 0.18)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="card-title" style={{ margin: 0, color: '#f8fafc', fontSize: '0.95rem', fontWeight: 800 }}>Model Performance Evaluation</div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            background: '#0f172a',
            color: current.color,
            border: `1px solid ${current.color}`,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {current.badge}
          </span>
        </div>

        {onOpenFullPerformance && (
          <button
            onClick={onOpenFullPerformance}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            Interactive Studio →
          </button>
        )}
      </div>

      {/* Model Switcher Buttons */}
      <div style={{ display: 'flex', gap: '6px', background: '#060911', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b' }}>
        {Object.values(PRESET_MODELS).map((m) => {
          const isActive = m.id === selectedModel;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              style={{
                flex: 1,
                border: 'none',
                background: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.75rem',
                padding: '6px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isActive ? '#ffffff' : m.color }}></span>
              {m.name.split(' ')[0]}
              <span style={{ fontSize: '0.7rem', color: isActive ? '#e0f2fe' : '#64748b' }}>{m.accuracy}</span>
            </button>
          );
        })}
      </div>

      {/* Comprehensive 6-Metric Strip (Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '6px',
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '8px 10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Accuracy</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>{current.accuracy}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Precision</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8' }}>{current.precision}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Recall</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981' }}>{current.recall}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>F1-Score</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#8b5cf6' }}>{current.f1Score}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>ROC-AUC</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f59e0b' }}>{current.rocAuc}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>PR-AUC</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ec4899' }}>{current.prAuc}</div>
        </div>
      </div>

      {/* Charts Split: Confusion Matrix + ROC Curve */}
      <div className="model-charts-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Confusion Matrix */}
        <div className="matrix-container" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc' }}>Confusion Matrix</span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>12,417 Samples</span>
          </div>

          <div className="matrix-wrapper">
            <table className="matrix-table" style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: 'center', color: '#94a3b8', padding: '4px' }}>Pred Safe</th>
                  <th style={{ textAlign: 'center', color: '#94a3b8', padding: '4px' }}>Pred Flood</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ textAlign: 'right', paddingRight: '4px', color: '#94a3b8', fontSize: '0.7rem' }}>Safe</th>
                  <td className="highlight" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700, textAlign: 'center', padding: '6px' }}>
                    {cm.tn.toLocaleString()}
                  </td>
                  <td style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', padding: '6px' }}>
                    {cm.fp.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'right', paddingRight: '4px', color: '#94a3b8', fontSize: '0.7rem' }}>Flood</th>
                  <td style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', padding: '6px' }}>
                    {cm.fn.toLocaleString()}
                  </td>
                  <td className="highlight" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 700, textAlign: 'center', padding: '6px' }}>
                    {cm.tp.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '0.66rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
            TN: {cm.tn} | FP: {cm.fp} | FN: {cm.fn} | TP: {cm.tp}
          </div>
        </div>

        {/* ROC Curve SVG */}
        <div className="roc-container" style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc' }}>ROC Curve</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: current.color }}>AUC = {current.rocAuc}</span>
          </div>
          <div className="roc-svg-wrapper">
            <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
              {/* Axes */}
              <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#334155" strokeWidth="1" />
              <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#334155" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x={padL - 4} y={padT + 4} fontSize="7" fill="#94a3b8" textAnchor="end">1.0</text>
              <text x={padL - 4} y={padT + plotH * 0.5 + 2} fontSize="7" fill="#94a3b8" textAnchor="end">0.5</text>
              <text x={padL - 4} y={padT + plotH + 2} fontSize="7" fill="#94a3b8" textAnchor="end">0.0</text>

              {/* X Axis Labels */}
              <text x={padL} y={padT + plotH + 11} fontSize="7" fill="#94a3b8" textAnchor="middle">0.0</text>
              <text x={padL + plotW * 0.5} y={padT + plotH + 11} fontSize="7" fill="#94a3b8" textAnchor="middle">0.5</text>
              <text x={padL + plotW} y={padT + plotH + 11} fontSize="7" fill="#94a3b8" textAnchor="middle">1.0</text>

              {/* Baseline */}
              <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />

              {/* Dynamic ROC Curve */}
              <path d={pathData} fill="none" stroke={current.curveColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Watermark Label */}
              <text x={padL + plotW - 4} y={padT + plotH - 8} fontSize="7.5" fontWeight="700" fill={current.color} textAnchor="end">
                {current.name.split(' ')[0]}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
