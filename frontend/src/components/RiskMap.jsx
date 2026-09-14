import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RiskMap({ stations, onSelectStation, onOpenMiraMap }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization in React StrictMode

    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 10,
      zoomControl: true,
      attributionControl: false
    });

    // OpenStreetMap Clean Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);


    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever stations change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !stations || stations.length === 0) return;

    const markers = [];

    stations.forEach(station => {
      let color = '#84cc16'; // low
      if (station.risk === 'moderate') color = '#eab308';
      if (station.risk === 'high') color = '#f97316';
      if (station.risk === 'severe') color = '#ef4444';

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; border: 2px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.35); cursor: pointer;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'Inter, sans-serif';
      popupDiv.style.padding = '2px 4px';
      popupDiv.innerHTML = `
        <div style="font-weight: 700; font-size: 0.88rem; color: #1e293b; margin-bottom: 2px;">${station.name}</div>
        <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 6px;">
          Risk: <strong style="color: ${color}; text-transform: uppercase;">${station.risk}</strong> (${station.prob}%)
        </div>
      `;

      const loadBtn = document.createElement('button');
      loadBtn.innerText = 'Load Parameters';
      loadBtn.style.cssText = 'padding: 4px 8px; font-size: 0.72rem; background: #1d64d8; color: white; border: none; border-radius: 4px; cursor: pointer;';
      loadBtn.onclick = () => {
        onSelectStation(station);
        marker.closePopup();
      };

      popupDiv.appendChild(loadBtn);
      marker.bindPopup(popupDiv);
      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.remove());
    };
  }, [stations, onSelectStation]);

  return (
    <div className="card map-card" id="riskMapCard">
      <div className="map-card-header">
        <span className="card-title" style={{ marginBottom: 0 }}>Risk Map</span>
        <button
          onClick={onOpenMiraMap}
          style={{
            background: '#eff6ff',
            color: '#1d64d8',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span>Explore 3D World Globe Flood Radar</span>
          <span>→</span>
        </button>

      </div>

      <div className="map-container-wrapper">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Legend */}
        <div className="map-legend-box">
          <div className="legend-title">Risk Level</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot low"></span>
              <span>Low</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot moderate"></span>
              <span>Moderate</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot high"></span>
              <span>High</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot severe"></span>
              <span>Severe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
