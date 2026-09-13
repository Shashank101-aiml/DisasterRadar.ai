import React from 'react';

export default function ModelPerformance({ metrics }) {
  const modelData = metrics || {
    modelName: 'XGBoost',
    accuracy: 0.91,
    precision: 0.91,
    recall: 0.90,
    f1Score: 0.90,
    rocAuc: 0.96,
    confusionMatrix: {
      actualNoFlood_predictedNoFlood: 120,
      actualNoFlood_predictedFlood: 15,
      actualFlood_predictedNoFlood: 10,
      actualFlood_predictedFlood: 130
    }
  };

  // Dimensions for ROC Curve SVG
  const w = 210;
  const h = 120;
  const padL = 32;
  const padB = 24;
  const padT = 10;
  const padR = 12;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const points = [
    [0, 0],
    [0.02, 0.45],
    [0.05, 0.72],
    [0.10, 0.88],
    [0.20, 0.93],
    [0.40, 0.96],
    [0.60, 0.98],
    [0.80, 0.99],
    [1.00, 1.00]
  ];

  const pathData = points.map((pt, i) => {
    const x = padL + pt[0] * plotW;
    const y = (padT + plotH) - pt[1] * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const cm = modelData.confusionMatrix;

  return (
    <div className="card" id="modelPerfCard">
      <div className="card-title">Model Performance (Best Model - XGBoost)</div>

      {/* 5 Metrics Strip */}
      <div className="model-perf-metrics-strip">
        <div className="perf-metric-item">
          <div className="perf-label">Accuracy</div>
          <div className="perf-val">{modelData.accuracy}</div>
        </div>
        <div className="perf-metric-item">
          <div className="perf-label">Precision</div>
          <div className="perf-val">{modelData.precision}</div>
        </div>
        <div className="perf-metric-item">
          <div className="perf-label">Recall</div>
          <div className="perf-val">{modelData.recall}</div>
        </div>
        <div className="perf-metric-item">
          <div className="perf-label">F1-Score</div>
          <div className="perf-val">{modelData.f1Score}</div>
        </div>
        <div className="perf-metric-item">
          <div className="perf-label">ROC-AUC</div>
          <div className="perf-val">{modelData.rocAuc}</div>
        </div>
      </div>

      {/* Charts Split */}
      <div className="model-charts-split">
        {/* Confusion Matrix */}
        <div className="matrix-container">
          <div className="matrix-title">Confusion Matrix</div>

          <div className="matrix-wrapper">
            <div className="matrix-actual-label">Actual</div>

            <table className="matrix-table">
              <thead>
                <tr>
                  <th></th>
                  <th>No Flood</th>
                  <th>Flood</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th style={{ textAlign: 'right', paddingRight: '6px' }}>No Flood</th>
                  <td className="highlight">{cm.actualNoFlood_predictedNoFlood}</td>
                  <td>{cm.actualNoFlood_predictedFlood}</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'right', paddingRight: '6px' }}>Flood</th>
                  <td>{cm.actualFlood_predictedNoFlood}</td>
                  <td className="highlight">{cm.actualFlood_predictedFlood}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="matrix-pred-label">Predicted</div>
        </div>

        {/* ROC Curve SVG */}
        <div className="roc-container">
          <div className="roc-title">ROC Curve</div>
          <div className="roc-svg-wrapper">
            <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
              {/* Axes */}
              <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#cbd5e1" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x={padL - 6} y={padT + 4} fontSize="8" fill="#64748b" textAnchor="end">1.0</text>
              <text x={padL - 6} y={padT + plotH * 0.2 + 3} fontSize="8" fill="#64748b" textAnchor="end">0.8</text>
              <text x={padL - 6} y={padT + plotH * 0.4 + 3} fontSize="8" fill="#64748b" textAnchor="end">0.6</text>
              <text x={padL - 6} y={padT + plotH * 0.6 + 3} fontSize="8" fill="#64748b" textAnchor="end">0.4</text>
              <text x={padL - 6} y={padT + plotH * 0.8 + 3} fontSize="8" fill="#64748b" textAnchor="end">0.2</text>
              <text x={padL - 6} y={padT + plotH + 2} fontSize="8" fill="#64748b" textAnchor="end">0.0</text>

              {/* Y Axis Title */}
              <text x={-(padT + plotH / 2)} y="10" transform="rotate(-90)" fontSize="7.5" fill="#64748b" textAnchor="middle">
                True Positive Rate
              </text>

              {/* X Axis Labels */}
              <text x={padL} y={padT + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">0.0</text>
              <text x={padL + plotW * 0.2} y={padT + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">0.2</text>
              <text x={padL + plotW * 0.4} y={padT + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">0.4</text>
              <text x={padL + plotW * 0.6} y={padT + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">0.6</text>
              <text x={padL + plotW * 0.8} y={padT + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">0.8</text>
              <text x={padL + plotW} y={padT + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">1.0</text>

              {/* X Axis Title */}
              <text x={padL + plotW / 2} y={h - 1} fontSize="7.5" fill="#64748b" textAnchor="middle">
                False Positive Rate
              </text>

              {/* Baseline */}
              <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />

              {/* ROC Curve */}
              <path d={pathData} fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

              {/* AUC Label */}
              <text x={padL + plotW - 6} y={padT + plotH - 12} fontSize="8.5" fontWeight="600" fill="#334155" textAnchor="end">
                AUC = {modelData.rocAuc}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
