import React, { useState } from 'react';

const PRESET_MODELS = {
  superstack: {
    id: 'superstack',
    name: 'Super-Stack Ensemble',
    shortName: 'Super-Stack',
    badge: '★ Active Flagship Engine',
    color: '#a855f7',
    curveColor: '#c084fc',
    accuracy: '93.85%',
    precision: '92.60%',
    recall: '95.10%',
    f1Score: '93.83%',
    rocAuc: '0.9820',
    prAuc: '0.9780',
    brierScore: '0.0480',
    latency: '4.5 ms',
    cm: {
      tn: 5780,
      fp: 429,
      fn: 304,
      tp: 5904
    },
    curvePoints: [
      [0, 0], [0.005, 0.65], [0.015, 0.85], [0.04, 0.93], [0.08, 0.96],
      [0.15, 0.98], [0.35, 0.992], [0.65, 0.998], [1.0, 1.0]
    ]
  },
  xgboost: {
    id: 'xgboost',
    name: 'XGBoost (Production)',
    shortName: 'XGBoost',
    badge: 'Gradient Boosted Trees',
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
    shortName: 'Random Forest',
    badge: 'Bagging Ensemble',
    color: '#10b981',
    curveColor: '#10b981',
    accuracy: '90.17%',
    precision: '87.59%',
    recall: '93.59%',
    f1Score: '90.49%',
    rocAuc: '0.9610',
    prAuc: '0.9514',
    brierScore: '0.0742',
    latency: '3.8 ms',
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
    shortName: 'PyTorch NN',
    badge: 'Deep Learning',
    color: '#06b6d4',
    curveColor: '#06b6d4',
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
  const [selectedModel, setSelectedModel] = useState('superstack');

  // Dimensions for ROC Curve SVG
  const w = 220;
  const h = 125;
  const padL = 32;
  const padB = 24;
  const padT = 10;
  const padR = 12;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const current = PRESET_MODELS[selectedModel] || PRESET_MODELS.superstack;

  const pathData = current.curvePoints.map((pt, i) => {
    const x = padL + pt[0] * plotW;
    const y = (padT + plotH) - pt[1] * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const totalSamples = current.cm.tn + current.cm.fp + current.cm.fn + current.cm.tp;

  return (
    <div className="card model-performance-card" id="modelPerformanceCard">
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="card-title" style={{ margin: 0 }}>Model Performance Evaluation</span>
          <span style={{
            fontSize: '0.68rem',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontWeight: 800
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
      <div style={{ display: 'flex', gap: '4px', background: '#060911', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '12px', overflowX: 'auto' }}>
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
                fontSize: '0.72rem',
                padding: '6px 6px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#ffffff' : m.color }}></span>
              <span>{m.shortName}</span>
              <span style={{ fontSize: '0.68rem', color: isActive ? '#e0f2fe' : '#64748b' }}>{m.accuracy}</span>
            </button>
          );
        })}
      </div>

      {/* Comprehensive 6-Metric Strip (Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '6px',
        marginBottom: '14px',
        background: '#0a0f1d',
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(56, 189, 248, 0.15)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Accuracy</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f8fafc' }}>{current.accuracy}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Precision</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#38bdf8' }}>{current.precision}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Recall</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#34d399' }}>{current.recall}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>F1-Score</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#c084fc' }}>{current.f1Score}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>ROC-AUC</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#fbbf24' }}>{current.rocAuc}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>PR-AUC</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f43f5e' }}>{current.prAuc}</div>
        </div>
      </div>

      {/* Visual Analytics: Confusion Matrix + High-Res ROC Curve */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '14px', alignItems: 'center' }}>
        
        {/* Confusion Matrix Table */}
        <div style={{ background: '#0a0f1d', padding: '10px 12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Confusion Matrix</span>
            <span style={{ color: '#64748b' }}>{totalSamples.toLocaleString()} Samples</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ padding: '3px', color: '#64748b' }}></th>
                <th style={{ padding: '3px', color: '#94a3b8', fontWeight: 700 }}>Pred Safe</th>
                <th style={{ padding: '3px', color: '#94a3b8', fontWeight: 700 }}>Pred Flood</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '3px', fontWeight: 700, color: '#94a3b8', textAlign: 'left' }}>Safe</td>
                <td style={{ padding: '5px', background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', fontWeight: 800, borderRadius: '4px 0 0 0', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {current.cm.tn.toLocaleString()}
                </td>
                <td style={{ padding: '5px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700, borderRadius: '0 4px 0 0', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {current.cm.fp.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '3px', fontWeight: 700, color: '#94a3b8', textAlign: 'left' }}>Flood</td>
                <td style={{ padding: '5px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700, borderRadius: '0 0 0 4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {current.cm.fn.toLocaleString()}
                </td>
                <td style={{ padding: '5px', background: 'rgba(2, 132, 199, 0.25)', color: '#38bdf8', fontWeight: 800, borderRadius: '0 0 4px 0', border: '1px solid rgba(2, 132, 199, 0.4)' }}>
                  {current.cm.tp.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: '#64748b', marginTop: '6px' }}>
            <span>TN: {current.cm.tn} | FP: {current.cm.fp}</span>
            <span>FN: {current.cm.fn} | TP: {current.cm.tp}</span>
          </div>
        </div>

        {/* High-Resolution ROC Curve */}
        <div style={{ background: '#0a0f1d', padding: '8px 10px', borderRadius: '8px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>ROC Curve</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>AUC = {current.rocAuc}</span>
          </div>

          <svg width={w} height={h} style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            <line x1={padL} y1={padT} x2={padL + plotW} y2={padT} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
            <line x1={padL} y1={padT + plotH / 2} x2={padL + plotW} y2={padT + plotH / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
            <line x1={padL + plotW / 2} y1={padT} x2={padL + plotW / 2} y2={padT + plotH} stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />

            {/* Random Baseline 45 deg line */}
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT} stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* ROC Curve Path */}
            <path d={pathData} fill="none" stroke={current.curveColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Axes */}
            <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#64748b" strokeWidth="1.5" />
            <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#64748b" strokeWidth="1.5" />

            {/* Labels */}
            <text x={padL - 6} y={padT + 8} fill="#94a3b8" fontSize="8" textAnchor="end">1.0</text>
            <text x={padL - 6} y={padT + plotH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="end">0.5</text>
            <text x={padL - 6} y={padT + plotH} fill="#64748b" fontSize="8" textAnchor="end">0.0</text>

            <text x={padL} y={padT + plotH + 12} fill="#64748b" fontSize="8" textAnchor="middle">0.0</text>
            <text x={padL + plotW / 2} y={padT + plotH + 12} fill="#64748b" fontSize="8" textAnchor="middle">0.5</text>
            <text x={padL + plotW} y={padT + plotH + 12} fill="#94a3b8" fontSize="8" textAnchor="middle">1.0</text>

            <text x={padL + plotW - 4} y={padT + plotH - 6} fill="#64748b" fontSize="7" textAnchor="end">Random</text>
          </svg>
        </div>

      </div>

    </div>
  );
}
