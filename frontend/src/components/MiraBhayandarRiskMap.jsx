import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMiraBhayandarGIS } from '../services/api';

export default function MiraBhayandarRiskMap({ onSelectLocationForPredict, onBackToDashboard }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [gisData, setGisData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    zones: true,
    railway: true,
    roads: true,
    hotspots: true,
    terrain: true
  });

  // Fetch GIS Data
  useEffect(() => {
    async function loadGIS() {
      const data = await fetchMiraBhayandarGIS();
      if (data) {
        setGisData(data);
      } else {
        // Built-in fallback
        setGisData({
          metadata: {
            title: "FLOOD RISK",
            location: "Mira Bhayandar",
            date: "15 December, 2024",
            coordinateSystem: "GCS WGS 1984",
            datum: "WGS 1984",
            dataSource: "Multiple Spatial Data"
          },
          zones: [
            {
              id: "zone-vh-1",
              name: "Bhayandar Creek Basin & Station Lowlands",
              riskLevel: "Very High",
              color: "#f44336",
              fillOpacity: 0.68,
              floodDepth: "1.5 - 2.2 m",
              coordinates: [
                [19.310, 72.845], [19.318, 72.850], [19.322, 72.858],
                [19.315, 72.868], [19.302, 72.862], [19.298, 72.852],
                [19.303, 72.846]
              ]
            },
            {
              id: "zone-vh-2",
              name: "Navghar & Penkarpada Inundation Pocket",
              riskLevel: "Very High",
              color: "#f44336",
              fillOpacity: 0.68,
              floodDepth: "1.2 - 1.8 m",
              coordinates: [
                [19.295, 72.860], [19.301, 72.868], [19.298, 72.876],
                [19.288, 72.872], [19.289, 72.862]
              ]
            },
            {
              id: "zone-h-1",
              name: "Mira Road Central Urban Grid",
              riskLevel: "High",
              color: "#ff9800",
              fillOpacity: 0.62,
              floodDepth: "0.8 - 1.4 m",
              coordinates: [
                [19.285, 72.850], [19.295, 72.852], [19.302, 72.862],
                [19.295, 72.875], [19.282, 72.882], [19.275, 72.868],
                [19.278, 72.855]
              ]
            },
            {
              id: "zone-h-2",
              name: "Uttan Coastal Inundation Belt",
              riskLevel: "High",
              color: "#ff9800",
              fillOpacity: 0.62,
              floodDepth: "0.7 - 1.2 m",
              coordinates: [
                [19.280, 72.780], [19.300, 72.795], [19.295, 72.815],
                [19.270, 72.805], [19.265, 72.785]
              ]
            },
            {
              id: "zone-m-1",
              name: "Rai-Morva & Murdha Agricultural Plain",
              riskLevel: "Moderate",
              color: "#ffeb3b",
              fillOpacity: 0.58,
              floodDepth: "0.3 - 0.7 m",
              coordinates: [
                [19.300, 72.795], [19.315, 72.815], [19.320, 72.840],
                [19.305, 72.845], [19.295, 72.825], [19.285, 72.810]
              ]
            },
            {
              id: "zone-m-2",
              name: "Western Express Highway Corridor",
              riskLevel: "Moderate",
              color: "#ffeb3b",
              fillOpacity: 0.58,
              floodDepth: "0.4 - 0.6 m",
              coordinates: [
                [19.275, 72.868], [19.282, 72.882], [19.288, 72.890],
                [19.272, 72.895], [19.268, 72.875]
              ]
            },
            {
              id: "zone-l-1",
              name: "Ghodbunder Foothills Transition",
              riskLevel: "Low",
              color: "#4caf50",
              fillOpacity: 0.65,
              floodDepth: "0.1 - 0.3 m",
              coordinates: [
                [19.288, 72.890], [19.300, 72.905], [19.290, 72.915],
                [19.275, 72.912], [19.272, 72.895]
              ]
            },
            {
              id: "zone-vl-1",
              name: "Sanjay Gandhi National Park & Chena Forest Ridge",
              riskLevel: "Very Low",
              color: "#1b5e20",
              fillOpacity: 0.8,
              floodDepth: "< 0.05 m (Safe)",
              coordinates: [
                [19.275, 72.912], [19.290, 72.915], [19.285, 72.930],
                [19.255, 72.925], [19.252, 72.905], [19.268, 72.900]
              ]
            }
          ],
          railway: [
            [19.325, 72.852],
            [19.314, 72.853],
            [19.298, 72.856],
            [19.282, 72.858],
            [19.265, 72.860]
          ],
          roads: [
            [[19.262, 72.870], [19.275, 72.873], [19.290, 72.880], [19.305, 72.892], [19.315, 72.905]],
            [[19.278, 72.785], [19.295, 72.815], [19.305, 72.835], [19.312, 72.850]],
            [[19.290, 72.850], [19.292, 72.865], [19.294, 72.880]],
            [[19.308, 72.842], [19.312, 72.855], [19.305, 72.870]],
            [[19.296, 72.848], [19.302, 72.858], [19.292, 72.865]],
            [[19.285, 72.854], [19.288, 72.864], [19.282, 72.872]]
          ],
          hotspots: [
            { name: "Bhayandar West Station Subway", lat: 19.3135, lng: 72.8525, depth: "1.8 m", status: "Critical" },
            { name: "Golden Nest Circle", lat: 19.2950, lng: 72.8580, depth: "1.4 m", status: "High Inundation" },
            { name: "Silver Park Junction", lat: 19.2880, lng: 72.8640, depth: "1.2 m", status: "Waterlogged" },
            { name: "Beverly Park Low-Lying Zone", lat: 19.2840, lng: 72.8680, depth: "1.1 m", status: "Submerged Drain" },
            { name: "Shital Garden Nullah", lat: 19.2990, lng: 72.8620, depth: "1.6 m", status: "Overflowing" },
            { name: "Kashimira Police Station Basin", lat: 19.2780, lng: 72.8740, depth: "1.3 m", status: "Traffic Diverted" },
            { name: "Penkarpada Culvert", lat: 19.2910, lng: 72.8710, depth: "1.5 m", status: "Severe" },
            { name: "Rai Village Estuary", lat: 19.3080, lng: 72.8120, depth: "0.9 m", status: "Tidal Inflow" },
            { name: "Navghar Khadi Bridge", lat: 19.3170, lng: 72.8610, depth: "1.7 m", status: "High Tide Warning" }
          ]
        });
      }
    }
    loadGIS();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center on Mira Bhayandar (19.2952, 72.8544)
    const map = L.map(mapRef.current, {
      center: [19.292, 72.854],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Custom Topo / Relief Tiles matching the hill relief aesthetic in the screenshot
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render GIS Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !gisData) return;

    const layerGroup = L.layerGroup().addTo(map);

    // 1. Render City Boundary (Outer grey dashed line)
    const cityBoundaryCoords = [
      [19.260, 72.775], [19.290, 72.770], [19.315, 72.780],
      [19.325, 72.810], [19.332, 72.845], [19.330, 72.865],
      [19.322, 72.890], [19.312, 72.925], [19.290, 72.938],
      [19.255, 72.930], [19.252, 72.890], [19.260, 72.850],
      [19.258, 72.800]
    ];
    L.polygon(cityBoundaryCoords, {
      color: '#475569',
      weight: 2,
      fill: false,
      dashArray: '5, 5'
    }).addTo(layerGroup);

    // 2. Render Flood Risk Zones (Choropleth Polygons)
    if (activeLayers.zones && gisData.zones) {
      gisData.zones.forEach(zone => {
        const poly = L.polygon(zone.coordinates, {
          color: '#ffffff',
          weight: 1,
          fillColor: zone.color,
          fillOpacity: zone.fillOpacity
        }).addTo(layerGroup);

        poly.on('click', () => {
          setSelectedFeature({
            type: 'zone',
            title: zone.name,
            riskLevel: zone.riskLevel,
            color: zone.color,
            depth: zone.floodDepth
          });
        });

        poly.bindTooltip(`<strong>${zone.name}</strong><br/>Risk: ${zone.riskLevel} (${zone.floodDepth})`, {
          sticky: true,
          className: 'gis-tooltip'
        });
      });
    }

    // 3. Render Road Network (Black Lines)
    if (activeLayers.roads && gisData.roads) {
      gisData.roads.forEach(roadCoords => {
        L.polyline(roadCoords, {
          color: '#0f172a',
          weight: 2,
          opacity: 0.9
        }).addTo(layerGroup);
      });
    }

    // 4. Render Western Railway Line (Blue Line dividing East & West)
    if (activeLayers.railway && gisData.railway) {
      L.polyline(gisData.railway, {
        color: '#1d4ed8',
        weight: 3.5,
        opacity: 0.95
      }).addTo(layerGroup);

      // Station points along railway line
      const stationMarkers = [
        { name: "Bhayandar Station", coords: [19.314, 72.853] },
        { name: "Mira Road Station", coords: [19.282, 72.858] }
      ];
      stationMarkers.forEach(st => {
        const stIcon = L.divIcon({
          className: 'rail-station-marker',
          html: `<div style="width: 10px; height: 10px; border-radius: 2px; background: #1d4ed8; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });
        L.marker(st.coords, { icon: stIcon })
          .bindTooltip(`Railway: <strong>${st.name}</strong>`)
          .addTo(layerGroup);
      });
    }

    // 5. Render Flood Location Hotspots (Black Dots)
    if (activeLayers.hotspots && gisData.hotspots) {
      gisData.hotspots.forEach(pt => {
        const markerIcon = L.divIcon({
          className: 'flood-dot-marker',
          html: `<div style="width: 8px; height: 8px; border-radius: 50%; background: #000000; border: 1.5px solid #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.5); cursor: pointer;"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4]
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: markerIcon }).addTo(layerGroup);

        marker.on('click', () => {
          setSelectedFeature({
            type: 'hotspot',
            title: pt.name,
            riskLevel: pt.status,
            depth: pt.depth,
            lat: pt.lat,
            lng: pt.lng
          });
        });

        marker.bindPopup(`
          <div style="font-family: Inter, sans-serif; font-size: 0.8rem; padding: 2px;">
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${pt.name}</div>
            <div style="color: #b91c1c; font-weight: 600;">Status: ${pt.status}</div>
            <div style="color: #64748b; font-size: 0.75rem;">Inundation Depth: ${pt.depth}</div>
          </div>
        `);
      });
    }

    return () => {
      layerGroup.remove();
    };
  }, [gisData, activeLayers]);

  // Load Mira Bhayandar into Prediction Form
  const handleLoadMiraBhayandar = () => {
    if (onSelectLocationForPredict) {
      onSelectLocationForPredict({
        name: "Mira Bhayandar",
        lat: 19.2952,
        lng: 72.8544,
        r24: 125,
        r72: 240,
        elev: 12, // low coastal elevation
        temp: 28,
        hum: 88
      });
    }
  };

  return (
    <div className="mira-map-page-wrapper">
      {/* Top Banner Control Bar */}
      <div className="mira-map-top-bar">
        <div className="mira-title-section">
          <button className="back-btn" onClick={onBackToDashboard}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <div className="mira-header-text">
            <h2>Mira Bhayandar Flood Vulnerability GIS Atlas</h2>
            <span className="mira-subtitle">Satellite Topographic Inundation Analysis & Geospatial Risk Zoning</span>
          </div>
        </div>

        {/* Interactive Layer Toggles */}
        <div className="mira-controls">
          <div className="layer-toggles">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={activeLayers.zones}
                onChange={e => setActiveLayers(p => ({ ...p, zones: e.target.checked }))}
              />
              <span>Risk Zones</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={activeLayers.railway}
                onChange={e => setActiveLayers(p => ({ ...p, railway: e.target.checked }))}
              />
              <span>Railway</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={activeLayers.roads}
                onChange={e => setActiveLayers(p => ({ ...p, roads: e.target.checked }))}
              />
              <span>Roads</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={activeLayers.hotspots}
                onChange={e => setActiveLayers(p => ({ ...p, hotspots: e.target.checked }))}
              />
              <span>Flood Points</span>
            </label>
          </div>

          <button className="predict-mira-btn" onClick={handleLoadMiraBhayandar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
            <span>Analyze in Predictor</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area with Cartographic GIS Frame */}
      <div className="gis-canvas-container">
        <div ref={mapRef} className="gis-leaflet-container" />

        {/* 1. Compass Rose (Top Left) */}
        <div className="gis-compass-rose">
          <svg width="60" height="60" viewBox="0 0 100 100">
            <polygon points="50,10 56,44 50,42" fill="#0f172a" />
            <polygon points="50,10 44,44 50,42" fill="#cbd5e1" />
            <polygon points="50,90 56,56 50,58" fill="#0f172a" />
            <polygon points="50,90 44,56 50,58" fill="#cbd5e1" />
            <polygon points="10,50 44,56 42,50" fill="#cbd5e1" />
            <polygon points="10,50 44,44 42,50" fill="#0f172a" />
            <polygon points="90,50 56,56 58,50" fill="#0f172a" />
            <polygon points="90,50 56,44 58,50" fill="#cbd5e1" />
            <circle cx="50" cy="50" r="4" fill="#0f172a" />
            <text x="50" y="8" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">N</text>
            <text x="50" y="99" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">S</text>
            <text x="3" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">W</text>
            <text x="97" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">E</text>
          </svg>
        </div>

        {/* 2. Scale Bar (Bottom Left) */}
        <div className="gis-scale-bar-box">
          <div className="scale-numbers">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>4 KM</span>
          </div>
          <div className="scale-segments">
            <div className="seg black" />
            <div className="seg white" />
            <div className="seg black" />
            <div className="seg white" />
          </div>
        </div>

        {/* 3. Bottom GIS Cartographic Panel matching Image Exactly */}
        <div className="gis-bottom-legend-panel">
          {/* Section A: Title & Date */}
          <div className="legend-title-col">
            <h3 className="legend-main-title">FLOOD RISK</h3>
            <div className="legend-place-name">Mira Bhayandar</div>
            <div className="legend-date">Date: 15 December, 2024</div>
          </div>

          {/* Section B: Layer Symbols */}
          <div className="legend-symbols-col">
            <div className="sym-row">
              <span className="sym-boundary-box" />
              <span className="sym-label">City Boundary</span>
            </div>
            <div className="sym-row">
              <span className="sym-road-line" />
              <span className="sym-label">Road</span>
            </div>
            <div className="sym-row">
              <span className="sym-rail-line" />
              <span className="sym-label">Railway line</span>
            </div>
            <div className="sym-row">
              <span className="sym-flood-dot" />
              <span className="sym-label">Flood Location</span>
            </div>
          </div>

          {/* Section C: Flood Risk Legend Colors */}
          <div className="legend-risk-colors-col">
            <div className="risk-legend-heading">Flood Risk</div>
            <div className="risk-color-rows">
              <div className="risk-color-row">
                <span className="color-swatch very-low" />
                <span className="color-label">Very Low</span>
              </div>
              <div className="risk-color-row">
                <span className="color-swatch low" />
                <span className="color-label">Low</span>
              </div>
              <div className="risk-color-row">
                <span className="color-swatch moderate" />
                <span className="color-label">Moderate</span>
              </div>
              <div className="risk-color-row">
                <span className="color-swatch high" />
                <span className="color-label">High</span>
              </div>
              <div className="risk-color-row">
                <span className="color-swatch very-high" />
                <span className="color-label">Very High</span>
              </div>
            </div>
          </div>

          {/* Section D: Coordinate System & Source Info */}
          <div className="legend-meta-col">
            <div className="meta-text">Coordinate System: GCS WGS 1984</div>
            <div className="meta-text">Datum: WGS 1984</div>
            <div className="meta-text" style={{ marginTop: '4px', fontWeight: '600' }}>
              Data Source: Multiple Spatial Data
            </div>
            <div className="meta-disclaimer">
              The boundaries and names and the designations used on this map do not imply official endorsement or acceptance by the AG/AIS. All information is the best available at the time this map was produced.
            </div>
          </div>
        </div>

        {/* Feature Inspector Flyout on Click */}
        {selectedFeature && (
          <div className="gis-feature-inspector">
            <div className="inspector-header">
              <span className="inspector-title">{selectedFeature.title}</span>
              <button className="inspector-close" onClick={() => setSelectedFeature(null)}>&times;</button>
            </div>
            <div className="inspector-body">
              <div className="inspector-stat">
                <span className="stat-label">Classification:</span>
                <span className="stat-value" style={{ color: selectedFeature.color || '#e53935', fontWeight: 700 }}>
                  {selectedFeature.riskLevel}
                </span>
              </div>
              <div className="inspector-stat">
                <span className="stat-label">Inundation Depth:</span>
                <span className="stat-value">{selectedFeature.depth}</span>
              </div>
              {selectedFeature.lat && (
                <div className="inspector-stat">
                  <span className="stat-label">Coordinates:</span>
                  <span className="stat-value">{selectedFeature.lat}, {selectedFeature.lng}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
