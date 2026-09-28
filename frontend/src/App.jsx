import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TopMetrics from './components/TopMetrics';
import InputParameters from './components/InputParameters';
import RiskFactors from './components/RiskFactors';
import RiskMap from './components/RiskMap';
import ModelPerformance from './components/ModelPerformance';
import RecentPredictions from './components/RecentPredictions';
import InfoBanner from './components/InfoBanner';
import Modal from './components/Modal';
import GlobeRiskMap from './components/GlobeRiskMap';
import HistoricalDataView from './components/HistoricalDataView';
import AlertsReportsView from './components/AlertsReportsView';
import AboutProjectView from './components/AboutProjectView';
import ModelPerformanceView from './components/ModelPerformanceView';
import PredictRiskView from './components/PredictRiskView';
import AiExplainerView from './components/AiExplainerView';
import SplineAiGuardian from './components/SplineAiGuardian';
import EvacuationRouteView from './components/EvacuationRouteView';
import InstallAppModal from './components/InstallAppModal';

import {
  predictFloodRisk,
  fetchStations,
  fetchModelPerformance,
  fetchRecentPredictions,
  fetchLiveWeatherByLocationOrCoords,
  reverseGeocodeCoords
} from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Active Geographic Zone for Risk Map and Location-Specific History
  const [activeLocation, setActiveLocation] = useState({
    name: 'Bengaluru, Karnataka',
    country: 'India',
    lat: 12.9603,
    lng: 77.7151
  });

  // Input Parameters State (Initialized to real live baseline for Bengaluru)
  const [params, setParams] = useState({
    rainfall24h: 0.0,
    rainfall72h: 0.0,
    temperature: 21.2,
    humidity: 78,
    windSpeed: 12,
    pressure: 910,
    elevation: 897,
    latitude: 12.9603,
    longitude: 77.7151,
    location: 'Bengaluru, Karnataka'
  });

  // Current Prediction State (computed dynamically from ML model)
  const [prediction, setPrediction] = useState({
    probability: 0.0,
    riskLevel: 'LOW',
    riskClass: 'low',
    recommendation: 'SAFE: Environmental conditions well within absorption thresholds. Continue routine hydrological monitoring.',
    location: 'Bengaluru, Karnataka',
    latitude: 12.9603,
    longitude: 77.7151,
    riskFactors: [
      { name: 'Humidity', value: 12, color: '#eab308' },
      { name: 'Rainfall (72h)', value: 5, color: '#ef4444' },
      { name: 'Rainfall (24h)', value: 4, color: '#f97316' },
      { name: 'Elevation', value: 3, color: '#a3e635' },
      { name: 'Temperature', value: 2, color: '#84cc16' }
    ]
  });

  // Dashboard Telemetry and Model Data
  const [stations, setStations] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRealTelemetry, setIsFetchingRealTelemetry] = useState(false);
  const [telemetrySyncStatus, setTelemetrySyncStatus] = useState('');

  // Unified Location & Live Telemetry Synchronizer for ALL tabs
  const handleLocationTelemetrySync = useCallback(async (newLoc, newParams = null, newPred = null) => {
    if (!newLoc) return;
    setActiveLocation(newLoc);

    if (newParams && newPred) {
      setParams(newParams);
      setPrediction(newPred);
      setIsFetchingRealTelemetry(false);
      return;
    }

    // Keep actively fetching real data for the requested location until loaded
    setIsFetchingRealTelemetry(true);
    setTelemetrySyncStatus(`Fetching real-time Open-Meteo & Copernicus telemetry for ${newLoc.name}...`);
    try {
      const live = await fetchLiveWeatherByLocationOrCoords({
        latitude: newLoc.lat,
        longitude: newLoc.lng,
        location: newLoc.name
      });
      if (live) {
        const updated = {
          rainfall24h: live.rainfall24h,
          rainfall72h: live.rainfall72h,
          currentRainfall: live.currentRainfall,
          isRaining: live.isRaining,
          temperature: live.temperature,
          humidity: live.humidity,
          windSpeed: live.windSpeed || 12,
          pressure: live.pressure || 1012,
          elevation: live.elevation,
          latitude: newLoc.lat,
          longitude: newLoc.lng,
          location: newLoc.name
        };
        setParams(updated);
        const pred = await predictFloodRisk(updated);
        if (pred) setPrediction(pred);
        setTelemetrySyncStatus(`✓ Live telemetry loaded for ${newLoc.name}`);
        setTimeout(() => setTelemetrySyncStatus(''), 4000);
      }
    } catch (err) {
      console.warn('Real-time sync error for location:', err);
      setTelemetrySyncStatus('⚠️ Sync error, retrying...');
    } finally {
      setIsFetchingRealTelemetry(false);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      const [stationList, perfData, recentData] = await Promise.all([
        fetchStations(),
        fetchModelPerformance(),
        fetchRecentPredictions()
      ]);
      setStations(Array.isArray(stationList) ? stationList : []);
      setModelMetrics(perfData);
      setRecentPredictions(recentData);

      // Ingest live real-time weather on startup for user's device or location
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        setIsFetchingRealTelemetry(true);
        setTelemetrySyncStatus('Detecting device GPS coordinates...');
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const userLat = parseFloat(pos.coords.latitude.toFixed(4));
            const userLng = parseFloat(pos.coords.longitude.toFixed(4));
            let liveLocName = `Device Location (${userLat}, ${userLng})`;
            try {
              const geo = await reverseGeocodeCoords(userLat, userLng);
              if (geo && geo.name) liveLocName = geo.name;
            } catch (e) {}
            await handleLocationTelemetrySync({ name: liveLocName, country: '', lat: userLat, lng: userLng });
          },
          async (err) => {
            console.log('GPS geolocation fallback to current location:', err.message);
            await handleLocationTelemetrySync({ name: 'Bengaluru, Karnataka', country: 'India', lat: 12.9603, lng: 77.7151 });
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      } else {
        handleLocationTelemetrySync({ name: 'Bengaluru, Karnataka', country: 'India', lat: 12.9603, lng: 77.7151 });
      }
    }
    loadData();
  }, []);

  // Handle Input Changes
  const handleParamChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'location') {
      setActiveLocation(prev => ({ ...prev, name: value }));
    } else if (field === 'latitude') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) setActiveLocation(prev => ({ ...prev, lat: parsed }));
    } else if (field === 'longitude') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) setActiveLocation(prev => ({ ...prev, lng: parsed }));
    }
  };

  // Handle Prediction Action (calls FastAPI POST /api/predict)
  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const result = await predictFloodRisk(params);
      setPrediction(result);

      // Prepend to recent list with clean location name
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      let locLabel = params.location || 'Active Station';
      if (locLabel.startsWith('Device Location (')) {
        locLabel = `Device (${params.latitude ? Number(params.latitude).toFixed(2) : '12.96'}°N, ${params.longitude ? Number(params.longitude).toFixed(2) : '77.71'}°E)`;
      } else {
        locLabel = locLabel.split(',')[0];
      }

      const newRecent = {
        time: timeStr,
        location: locLabel,
        probability: result.probability,
        riskLevel: result.riskLevel
      };
      setRecentPredictions(prev => {
        const filtered = prev.filter(p => !(p.location === newRecent.location && Math.abs(p.probability - newRecent.probability) < 0.05 && p.time === newRecent.time));
        return [newRecent, ...filtered.slice(0, 5)];
      });
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Station selection from Map
  const handleSelectStation = (station) => {
    setActiveLocation({
      name: station.name,
      country: 'Karnataka, India',
      lat: station.lat,
      lng: station.lng
    });

    const updatedParams = {
      rainfall24h: station.r24,
      rainfall72h: station.r72,
      temperature: station.temp,
      humidity: station.hum,
      windSpeed: 12,
      pressure: 1005,
      elevation: station.elev,
      latitude: station.lat,
      longitude: station.lng,
      location: `${station.name}, Karnataka`
    };
    setParams(updatedParams);

    // Run prediction for that station
    predictFloodRisk(updatedParams).then(res => {
      setPrediction(res);
    });
  };

  // Tab Navigation Handling
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleGlobePredict = (locData) => {
    setActiveLocation({
      name: locData.name,
      country: locData.country || '',
      lat: locData.lat,
      lng: locData.lng
    });

    const updatedParams = {
      rainfall24h: locData.r24 ?? locData.rainfall24h ?? 0.0,
      rainfall72h: locData.r72 ?? locData.rainfall72h ?? 0.0,
      currentRainfall: locData.currentRainfall ?? locData.current_rainfall ?? 0.0,
      isRaining: Boolean(locData.isRaining ?? locData.is_raining),
      temperature: locData.temp ?? locData.temperature ?? 25,
      humidity: locData.hum ?? locData.humidity ?? 60,
      windSpeed: locData.wind ?? locData.windSpeed ?? 10,
      pressure: locData.pressure ?? 1013,
      elevation: locData.elev ?? locData.elevation ?? 15,
      latitude: locData.lat,
      longitude: locData.lng,
      location: locData.country ? `${locData.name}, ${locData.country}` : locData.name
    };
    setParams(updatedParams);
    setActiveTab('dashboard');
    setIsLoading(true);
    predictFloodRisk(updatedParams).then(res => {
      setPrediction(res);
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('inputParamsCard')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  };


  return (
    <div className="app-container">
      {/* LEFT SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenModal={(type) => setModalState({ isOpen: true, type })}
        onDownloadApp={() => setIsDownloadModalOpen(true)}
      />

      {/* MAIN WRAPPER */}
      <main className="main-wrapper">
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onOpenAlerts={() => setActiveTab('alerts')}
          onOpenProfile={() => setActiveTab('about')}
          onDownloadApp={() => setIsDownloadModalOpen(true)}
          activeLocation={activeLocation}
          isFetchingRealTelemetry={isFetchingRealTelemetry}
        />

        {/* Real-time Telemetry Ingestion Banner */}
        {isFetchingRealTelemetry && (
          <div style={{
            background: 'rgba(2, 132, 199, 0.16)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#38bdf8',
            fontWeight: 600,
            zIndex: 40
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-pulsing-dot" style={{ background: '#38bdf8', width: '8px', height: '8px' }} />
              <span>{telemetrySyncStatus || `Ingesting real-time Open-Meteo & Copernicus telemetry for ${activeLocation.name}...`}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Live Planetary Stream</span>
          </div>
        )}

        {activeTab === 'map' ? (
          /* 3D WORLD GLOBE & CARTOGRAPHIC GIS ATLAS VIEW */
          <GlobeRiskMap
            onBackToDashboard={() => setActiveTab('dashboard')}
            onSelectLocationForPredict={handleGlobePredict}
            activeLocation={activeLocation}
            currentParams={params}
            currentPrediction={prediction}
            onLocationChange={handleLocationTelemetrySync}
            onOpenHistoryModal={() => setActiveTab('historical')}
          />
        ) : activeTab === 'evacuation' ? (
          /* SATELLITE ROAD BLOCKAGE & OFFLINE EVACUATION NAVIGATOR */
          <EvacuationRouteView
            onBackToDashboard={() => setActiveTab('dashboard')}
            activeLocation={activeLocation}
            onDownloadApp={() => setIsDownloadModalOpen(true)}
          />
        ) : activeTab === 'predict' ? (
          /* FULL-PAGE PRODUCTION PREDICT RISK STUDIO */
          <PredictRiskView
            currentLocation={activeLocation}
            params={params}
            prediction={prediction}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onLocationChange={handleLocationTelemetrySync}
            onOpenPerformance={() => setActiveTab('performance')}
          />
        ) : activeTab === 'performance' ? (
          /* FULL-PAGE INTERACTIVE MODEL PERFORMANCE & EVALUATION STUDIO */
          <ModelPerformanceView
            metrics={modelMetrics}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onOpenPredict={() => setActiveTab('predict')}
          />
        ) : activeTab === 'historical' ? (
          /* FULL-PAGE HISTORICAL DATA & DISASTER REGISTRY VIEW */
          <HistoricalDataView
            currentLocation={activeLocation}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'alerts' || activeTab === 'reports' ? (
          /* FULL-PAGE ALERTS SCORING & 7-DAY RAINFALL REPORTS VIEW */
          <AlertsReportsView
            currentLocation={activeLocation}
            params={params}
            prediction={prediction}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onLocationChange={handleLocationTelemetrySync}
          />
        ) : activeTab === 'explainer' ? (
          /* FULL-PAGE AI EXPLAINER & EVACUATION PROTOCOLS + SYLLABUS AUDIT (CO4 | L6) */
          <AiExplainerView
            currentLocation={activeLocation}
            params={params}
            prediction={prediction}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onOpenPredict={() => setActiveTab('predict')}
            onOpenMap={() => setActiveTab('map')}
            onOpenPerformance={() => setActiveTab('performance')}
          />
        ) : activeTab === 'about' ? (
          /* FULL-PAGE ABOUT PROJECT & ARCHITECTURE GUIDE VIEW */
          <AboutProjectView
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        ) : (
          /* STANDARD DASHBOARD VIEW */

          <div className="dashboard-content">
            {/* HERO DISASTER RADAR & ANTHROPOMORPHIC 3D AI RESCUE GUARDIAN */}
            <section className="command-hero-section">
              <div className="command-hero-left">
                <div className="hero-eyebrow">
                  <span className="live-pulsing-dot" />
                  <span>SATELLITE METEOROLOGICAL INTELLIGENCE</span>
                </div>
                <h2 className="hero-main-title">
                  Predict Flood Risk <span style={{ color: '#38bdf8' }}>Before It Becomes a Disaster.</span>
                </h2>
                <p className="hero-description">
                  Real-time meteorological, topographical and environmental intelligence powered by calibrated machine learning. Ingesting live Open-Meteo & Copernicus global satellite telemetry.
                </p>
                <div className="hero-cta-group">
                  <button className="primary-cta-btn" onClick={() => handleSelectTab('predict')}>
                    <span>⚡ Predict Risk Studio</span>
                  </button>
                  <button className="secondary-cta-btn" onClick={() => handleSelectTab('map')}>
                    <span>🌐 3D World Globe & GIS</span>
                  </button>
                  <button className="secondary-cta-btn" onClick={() => handleSelectTab('evacuation')} style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#10b981' }}>
                    <span>🛡️ Offline Evacuation & Roads</span>
                  </button>
                </div>
                <div className="hero-features-strip">
                  <span>✓ 15 Hydrological Features</span>
                  <span>✓ Native XGBoost (T*=0.55)</span>
                  <span>✓ 100% Dynamic Open-Meteo</span>
                </div>
              </div>
              <div className="command-hero-right">
                <SplineAiGuardian
                  probability={prediction.probability}
                  riskLevel={prediction.riskLevel}
                  rainfall24h={params.rainfall24h}
                  elevation={params.elevation}
                  location={params.location}
                />
              </div>
            </section>

            {/* TOP 4 METRICS CARDS */}
            <TopMetrics
              probability={prediction.probability}
              riskLevel={prediction.riskLevel}
              location={prediction.location}
              latitude={prediction.latitude}
              longitude={prediction.longitude}
              recommendation={prediction.recommendation}
              onOpenExplainer={() => setActiveTab('explainer')}
            />

            {/* TWO-COLUMN GRID */}
            <div className="main-grid">
              {/* LEFT COLUMN: Input Parameters & Top Risk Factors */}
              <div className="left-column">
                <InputParameters
                  params={params}
                  onChange={handleParamChange}
                  onPredict={handlePredict}
                  isLoading={isLoading}
                  onOpenPredictStudio={() => setActiveTab('predict')}
                />

                <RiskFactors factors={prediction.riskFactors} />
              </div>

              {/* RIGHT COLUMN: Risk Map, Model Performance & Recent Predictions */}
              <div className="right-column">
                <RiskMap
                  stations={stations}
                  onSelectStation={handleSelectStation}
                  onOpenMiraMap={() => setActiveTab('map')}
                  activeLocation={activeLocation}
                />

                <div className="bottom-split-grid">
                  <ModelPerformance
                    metrics={modelMetrics}
                    onOpenFullPerformance={() => setActiveTab('performance')}
                  />
                  <RecentPredictions predictions={recentPredictions} />
                </div>

              </div>
            </div>

            {/* FOOTER BANNER */}
            <InfoBanner />
          </div>
        )}
      </main>

      {/* REUSABLE MODAL (FOR FLOATING AUDIT/INSPECTIONS) */}
      <Modal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={() => setModalState({ isOpen: false, type: null })}
        currentLocation={activeLocation}
        params={params}
        prediction={prediction}
        onLocationChange={handleLocationTelemetrySync}
      />

      {/* DEDICATED PWA & MOBILE/PC APP INSTALLATION MODAL */}
      <InstallAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

    </div>
  );
}
