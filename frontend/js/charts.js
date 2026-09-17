/**
 * FloodRisk AI - Chart Renderers
 * Handles Donut progress circle, Top Risk Factors horizontal bar chart, and ROC curve
 */

const DashboardCharts = {
  /**
   * Updates the donut gauge progress circle
   * @param {number} percentage 
   */
  updateDonutGauge(percentage) {
    const circle = document.getElementById('donutProgressCircle');
    const textElem = document.getElementById('donutPercentText');
    if (!circle || !textElem) return;

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;

    // Color code based on risk
    if (percentage >= 70) {
      circle.style.stroke = '#e53935';
    } else if (percentage >= 40) {
      circle.style.stroke = '#f59e0b';
    } else {
      circle.style.stroke = '#10b981';
    }

    textElem.innerText = `${percentage}%`;
  },

  /**
   * Renders the Top Risk Factors horizontal bar chart
   * @param {Array} factors 
   */
  renderRiskFactors(factors) {
    const container = document.getElementById('riskFactorsContainer');
    if (!container) return;

    container.innerHTML = '';

    factors.forEach(factor => {
      const row = document.createElement('div');
      row.className = 'risk-factor-row';
      row.innerHTML = `
        <span class="factor-label">${factor.name}</span>
        <div class="factor-bar-track">
          <div class="factor-bar-fill" style="width: 0%; background-color: ${factor.color};" data-target="${factor.value}%"></div>
        </div>
        <span class="factor-val">${factor.value}%</span>
      `;
      container.appendChild(row);
    });

    // Trigger smooth animation
    setTimeout(() => {
      const bars = container.querySelectorAll('.factor-bar-fill');
      bars.forEach(bar => {
        bar.style.width = bar.getAttribute('data-target');
      });
    }, 50);
  },

  /**
   * Initializes the SVG ROC Curve with axes, labels, and green curve
   */
  renderROCCurve() {
    const svgContainer = document.getElementById('rocSvgWrapper');
    if (!svgContainer) return;

    // Width 200, Height 120, padding left 28, bottom 22, top 8, right 12
    const w = 210;
    const h = 120;
    const padL = 32;
    const padB = 24;
    const padT = 10;
    const padR = 12;

    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Generate ROC Curve SVG markup
    // Points starting at (0,0) -> steep climb to (0.1, 0.88) -> (0.2, 0.94) -> (0.6, 0.98) -> (1.0, 1.0)
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

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <!-- Axes -->
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#cbd5e1" stroke-width="1"/>
        <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#cbd5e1" stroke-width="1"/>
        
        <!-- Y Axis Ticks & Labels -->
        <text x="${padL - 6}" y="${padT + 4}" font-size="8" fill="#64748b" text-anchor="end">1.0</text>
        <text x="${padL - 6}" y="${padT + plotH * 0.2 + 3}" font-size="8" fill="#64748b" text-anchor="end">0.8</text>
        <text x="${padL - 6}" y="${padT + plotH * 0.4 + 3}" font-size="8" fill="#64748b" text-anchor="end">0.6</text>
        <text x="${padL - 6}" y="${padT + plotH * 0.6 + 3}" font-size="8" fill="#64748b" text-anchor="end">0.4</text>
        <text x="${padL - 6}" y="${padT + plotH * 0.8 + 3}" font-size="8" fill="#64748b" text-anchor="end">0.2</text>
        <text x="${padL - 6}" y="${padT + plotH + 2}" font-size="8" fill="#64748b" text-anchor="end">0.0</text>

        <!-- Y Axis Title -->
        <text x="-${padT + plotH / 2}" y="10" transform="rotate(-90)" font-size="7.5" fill="#64748b" text-anchor="middle">True Positive Rate</text>

        <!-- X Axis Ticks & Labels -->
        <text x="${padL}" y="${padT + plotH + 12}" font-size="8" fill="#64748b" text-anchor="middle">0.0</text>
        <text x="${padL + plotW * 0.2}" y="${padT + plotH + 12}" font-size="8" fill="#64748b" text-anchor="middle">0.2</text>
        <text x="${padL + plotW * 0.4}" y="${padT + plotH + 12}" font-size="8" fill="#64748b" text-anchor="middle">0.4</text>
        <text x="${padL + plotW * 0.6}" y="${padT + plotH + 12}" font-size="8" fill="#64748b" text-anchor="middle">0.6</text>
        <text x="${padL + plotW * 0.8}" y="${padT + plotH + 12}" font-size="8" fill="#64748b" text-anchor="middle">0.8</text>
        <text x="${padL + plotW}" y="${padT + plotH + 12}" font-size="8" fill="#64748b" text-anchor="middle">1.0</text>

        <!-- X Axis Title -->
        <text x="${padL + plotW / 2}" y="${h - 1}" font-size="7.5" fill="#64748b" text-anchor="middle">False Positive Rate</text>

        <!-- Diagonal baseline -->
        <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2"/>

        <!-- ROC Green Curve -->
        <path d="${pathData}" fill="none" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- AUC Badge inside plot -->
        <text x="${padL + plotW - 6}" y="${padT + plotH - 12}" font-size="8.5" font-weight="600" fill="#334155" text-anchor="end">AUC = 0.96</text>
      </svg>
    `;

    svgContainer.innerHTML = svg;
  }
};
