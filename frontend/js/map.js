/**
 * FloodRisk AI - Interactive Risk Map
 * Integrates Leaflet.js with regional monitoring stations around Bengaluru
 */

const RiskMap = {
  mapInstance: null,
  markers: [],

  stations: [
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, risk: 'severe', level: 'Severe Risk', prob: 78.4, r24: 85, r72: 190, elev: 900, temp: 25, hum: 82 },
    { name: 'Nelamangala', lat: 13.0970, lng: 77.3912, risk: 'moderate', level: 'Moderate', prob: 42.0, r24: 45, r72: 95, elev: 882, temp: 26, hum: 68 },
    { name: 'Yelahanka', lat: 13.1007, lng: 77.5963, risk: 'high', level: 'High Risk', prob: 64.5, r24: 68, r72: 140, elev: 915, temp: 25, hum: 76 },
    { name: 'Hoskote', lat: 13.0700, lng: 77.7981, risk: 'high', level: 'High Risk', prob: 68.2, r24: 72, r72: 155, elev: 875, temp: 24, hum: 78 },
    { name: 'Kolar', lat: 13.1367, lng: 78.1291, risk: 'low', level: 'Low Risk', prob: 18.5, r24: 15, r72: 30, elev: 822, temp: 28, hum: 55 },
    { name: 'Hosur', lat: 12.7409, lng: 77.8253, risk: 'severe', level: 'Severe Risk', prob: 82.1, r24: 92, r72: 205, elev: 879, temp: 24, hum: 85 },
    { name: 'Anekal', lat: 12.7107, lng: 77.6974, risk: 'high', level: 'High Risk', prob: 65.0, r24: 66, r72: 145, elev: 915, temp: 25, hum: 74 },
    { name: 'Kanakapura', lat: 12.5461, lng: 77.4190, risk: 'moderate', level: 'Moderate', prob: 48.3, r24: 48, r72: 110, elev: 638, temp: 27, hum: 65 },
    { name: 'Ramanagara', lat: 12.7209, lng: 77.2799, risk: 'moderate', level: 'Moderate', prob: 44.7, r24: 42, r72: 105, elev: 747, temp: 27, hum: 67 },
    { name: 'Magadi', lat: 12.9562, lng: 77.2289, risk: 'low', level: 'Low Risk', prob: 24.1, r24: 20, r72: 45, elev: 925, temp: 26, hum: 60 }
  ],

  /**
   * Initializes the Leaflet map and station markers
   */
  init() {
    const mapElement = document.getElementById('leafletMap');
    if (!mapElement) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet library is loading or offline; initializing fallback');
      mapElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:0.85rem;">Interactive Map Active (Bengaluru Metropolitan Region)</div>';
      return;
    }

    // Initialize Map with Bengaluru coordinates
    this.mapInstance = L.map('leafletMap', {
      center: [12.9716, 77.5946],
      zoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // Clean CartoDB Positron tiles matching the light aesthetic in the screenshot
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(this.mapInstance);

    this.renderStations();
  },

  /**
   * Renders the risk stations as custom circular markers with tooltips
   */
  renderStations() {
    if (!this.mapInstance) return;

    this.stations.forEach(station => {
      // Color based on risk level
      let color = '#84cc16'; // low
      if (station.risk === 'moderate') color = '#eab308';
      if (station.risk === 'high') color = '#f97316';
      if (station.risk === 'severe') color = '#ef4444';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.35);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(this.mapInstance);

      // Tooltip popup
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; padding: 2px 4px;">
          <div style="font-weight: 700; font-size: 0.88rem; color: #1e293b; margin-bottom: 2px;">${station.name}</div>
          <div style="font-size: 0.75rem; color: #64748b;">Risk: <strong style="color: ${color}; text-transform: uppercase;">${station.risk}</strong> (${station.prob}%)</div>
          <button onclick="RiskMap.selectStation('${station.name}')" style="margin-top: 6px; padding: 4px 8px; font-size: 0.72rem; background: #1d64d8; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Load Parameters
          </button>
        </div>
      `);

      this.markers.push(marker);
    });
  },

  /**
   * Selects a station and loads its parameters into the dashboard
   * @param {string} stationName 
   */
  selectStation(stationName) {
    const station = this.stations.find(s => s.name === stationName);
    if (!station) return;

    if (window.App) {
      window.App.loadStationData(station);
    }
  }
};
