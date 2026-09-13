/**
 * FloodRisk AI - Main Application Controller
 * Manages Dashboard state, user inputs, live clock, and events
 */

const App = {
  // Current prediction state
  state: {
    location: 'Bengaluru, Karnataka',
    lat: 12.97,
    lon: 77.59,
    rainfall24h: 85,
    rainfall72h: 190,
    temperature: 25,
    humidity: 82,
    windSpeed: 12,
    pressure: 1005,
    elevation: 900,
    probability: 78.4,
    riskLevel: 'HIGH',
    recommendation: 'Monitor rainfall and drainage conditions closely. Issue early warning for low-lying areas and prepare emergency response resources.'
  },

  init() {
    this.initClock();
    this.bindEvents();
    this.updateDashboardUI();
    DashboardCharts.renderROCCurve();
    RiskMap.init();
  },

  /**
   * Real-time clock formatter matching "10:24 AM | May 15, 2024"
   */
  initClock() {
    const timeElem = document.getElementById('headerClockTime');
    const dateElem = document.getElementById('headerClockDate');

    const updateTime = () => {
      const now = new Date();
      if (timeElem) {
        timeElem.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      if (dateElem) {
        dateElem.innerText = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  },

  /**
   * Binds event listeners for buttons, form inputs, and sidebar navigation
   */
  bindEvents() {
    // Predict Risk Button
    const predictBtn = document.getElementById('predictRiskBtn');
    if (predictBtn) {
      predictBtn.addEventListener('click', () => this.runPrediction());
    }

    // Mobile Sidebar Toggle
    const menuBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('appSidebar');
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Sidebar navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const action = item.getAttribute('data-nav');
        this.handleNav(action, item);
      });
    });

    // Close Modals on click outside or escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  },

  /**
   * Collects input parameter values and triggers model prediction
   */
  runPrediction() {
    const r24 = parseFloat(document.getElementById('inputRainfall24')?.value) || 0;
    const r72 = parseFloat(document.getElementById('inputRainfall72')?.value) || 0;
    const temp = parseFloat(document.getElementById('inputTemperature')?.value) || 0;
    const hum = parseFloat(document.getElementById('inputHumidity')?.value) || 0;
    const wind = parseFloat(document.getElementById('inputWindSpeed')?.value) || 0;
    const press = parseFloat(document.getElementById('inputPressure')?.value) || 1010;
    const elev = parseFloat(document.getElementById('inputElevation')?.value) || 900;
    const lat = parseFloat(document.getElementById('inputLatitude')?.value) || 12.97;
    const lon = parseFloat(document.getElementById('inputLongitude')?.value) || 77.59;

    this.state.rainfall24h = r24;
    this.state.rainfall72h = r72;
    this.state.temperature = temp;
    this.state.humidity = hum;
    this.state.windSpeed = wind;
    this.state.pressure = press;
    this.state.elevation = elev;
    this.state.lat = lat;
    this.state.lon = lon;

    // Run prediction
    const res = FloodPredictor.predict(this.state);
    this.state.probability = parseFloat(res.probability);
    this.state.riskLevel = res.riskLevel;
    this.state.recommendation = res.recommendation;

    // Update UI components
    this.updateDashboardUI(res.riskFactors);

    // Add to Recent Predictions table
    this.addRecentPrediction(this.state.location.split(',')[0], res.probability, res.riskLevel);
  },

  /**
   * Updates all dashboard cards with current state
   */
  updateDashboardUI(customFactors = null) {
    // 1. Top Card: Flood Probability
    DashboardCharts.updateDonutGauge(this.state.probability);

    // 2. Top Card: Risk Level
    const riskLevelElem = document.getElementById('riskLevelText');
    const riskSubtext = document.getElementById('riskLevelSubtext');
    const riskIcon = document.getElementById('riskIconWrapper');

    if (riskLevelElem && riskSubtext && riskIcon) {
      riskLevelElem.innerText = this.state.riskLevel;
      riskLevelElem.className = `metric-value-large risk-level-val ${this.state.riskLevel.toLowerCase()}`;
      riskSubtext.innerText = `${this.state.riskLevel.charAt(0) + this.state.riskLevel.slice(1).toLowerCase()} Risk of Flood`;
      riskIcon.className = `risk-icon-wrapper ${this.state.riskLevel.toLowerCase()}`;
    }

    // 3. Top Card: Location
    const locName = document.getElementById('cardLocationName');
    const locCoords = document.getElementById('cardLocationCoords');
    if (locName) locName.innerText = this.state.location;
    if (locCoords) locCoords.innerText = `Lat: ${this.state.lat} , Lon: ${this.state.lon}`;

    // 4. Top Card: Recommendation
    const recElem = document.getElementById('recommendationText');
    if (recElem) recElem.innerText = this.state.recommendation;

    // 5. Top Risk Factors Horizontal Bars
    const factors = customFactors || [
      { name: 'Rainfall (72h)', value: 31, color: '#ef4444' },
      { name: 'Rainfall (24h)', value: 22, color: '#f97316' },
      { name: 'Humidity', value: 12, color: '#eab308' },
      { name: 'Elevation', value: 8, color: '#a3e635' },
      { name: 'Temperature', value: 8, color: '#84cc16' }
    ];
    DashboardCharts.renderRiskFactors(factors);
  },

  /**
   * Loads a station's values when clicked from the map
   */
  loadStationData(station) {
    this.state.location = `${station.name}, Karnataka`;
    this.state.lat = station.lat;
    this.state.lon = station.lng;
    this.state.rainfall24h = station.r24;
    this.state.rainfall72h = station.r72;
    this.state.temperature = station.temp;
    this.state.humidity = station.hum;
    this.state.elevation = station.elev;

    // Update input fields
    document.getElementById('inputRainfall24').value = station.r24;
    document.getElementById('inputRainfall72').value = station.r72;
    document.getElementById('inputTemperature').value = station.temp;
    document.getElementById('inputHumidity').value = station.hum;
    document.getElementById('inputElevation').value = station.elev;
    document.getElementById('inputLatitude').value = station.lat;
    document.getElementById('inputLongitude').value = station.lng;

    // Re-run prediction
    this.runPrediction();
  },

  /**
   * Adds an entry to Recent Predictions table
   */
  addRecentPrediction(location, probability, riskLevel) {
    const tableBody = document.getElementById('recentPredictionsBody');
    if (!tableBody) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    let badgeClass = 'badge-high';
    if (riskLevel === 'MODERATE') badgeClass = 'badge-moderate';
    if (riskLevel === 'LOW') badgeClass = 'badge-low';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${timeStr}</td>
      <td><strong>${location}</strong></td>
      <td>${probability}%</td>
      <td><span class="badge ${badgeClass}">${riskLevel}</span></td>
    `;

    tableBody.insertBefore(row, tableBody.firstChild);

    // Keep table to max 6 rows
    while (tableBody.children.length > 6) {
      tableBody.removeChild(tableBody.lastChild);
    }
  },

  /**
   * Nav menu click handler
   */
  handleNav(action, targetElem) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (targetElem) targetElem.classList.add('active');

    if (action === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'predict') {
      document.getElementById('inputParamsCard')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'map') {
      document.getElementById('riskMapCard')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'performance') {
      document.getElementById('modelPerfCard')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'about' || action === 'historical' || action === 'alerts') {
      this.openModal(action);
    }
  },

  openModal(type) {
    const modal = document.getElementById('infoModal');
    const title = document.getElementById('modalTitle');
    const content = document.getElementById('modalContent');
    if (!modal) return;

    if (type === 'about') {
      title.innerText = 'About FloodRisk AI';
      content.innerHTML = `
        <p style="margin-bottom:12px; line-height:1.5; color:#475569;">
          <strong>FloodRisk AI</strong> is an advanced data-driven predictive platform that analyzes historical rainfall, real-time telemetry, geographic elevations, and weather data to forecast flood risks across key urban catchments.
        </p>
        <p style="line-height:1.5; color:#475569;">
          Powered by state-of-the-art Gradient Boosted Decision Trees (XGBoost) achieving 91% precision and 0.96 ROC-AUC on testing datasets.
        </p>
      `;
    } else if (type === 'historical') {
      title.innerText = 'Historical Rainfall & Inundation Data';
      content.innerHTML = `
        <p style="margin-bottom:12px; color:#475569;">
          Records dating back from 2018 to 2024 across 42 rainfall telemetry stations in Karnataka are used for continuous retraining.
        </p>
        <ul style="padding-left:20px; color:#475569; font-size:0.85rem; line-height:1.6;">
          <li>September 2022 Urban Inundation Event (Bellandur / Outer Ring Rd)</li>
          <li>August 2020 Severe Catchment Flooding</li>
          <li>October 2021 High Precipitation Runoff</li>
        </ul>
      `;
    } else if (type === 'alerts') {
      title.innerText = 'Active Alerts & Emergency Protocols';
      content.innerHTML = `
        <div style="background:#fee2e2; border-left:4px solid #ef4444; padding:12px; border-radius:6px; margin-bottom:12px;">
          <strong style="color:#b91c1c;">Orange Flood Advisory (Bengaluru Urban)</strong>
          <p style="color:#7f1d1d; font-size:0.82rem; margin-top:4px;">Low-lying drainage channels near Varthur and Hebbal valley under surveillance.</p>
        </div>
        <p style="color:#64748b; font-size:0.8rem;">To broadcast SMS alerts to field personnel, connect the notification API gateway in settings.</p>
      `;
    }

    modal.classList.add('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
