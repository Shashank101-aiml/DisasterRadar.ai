import React, { useState, useEffect } from 'react';
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

import {
  predictFloodRisk,
  fetchStations,
  fetchModelPerformance,
  fetchRecentPredictions
} from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modalState, setModalState] = useState({ isOpen: false, type: null });

  // Active Geographic Zone for Risk Map and Location-Specific History
  const [activeLocation, setActiveLocation] = useState({
    name: 'Mira Bhayandar',
    country: 'India',
    lat: 19.2952,
    lng: 72.8544
  });

  // Input Parameters State
  const [params, setParams] = useState({
    rainfall24h: 85,
    rainfall72h: 190,
    temperature: 25,
    humidity: 82,
    windSpeed: 12,
    pressure: 1005,
    elevation: 900,
    latitude: 12.97,
    longitude: 77.59,
    location: 'Bengaluru, Karnataka'
  });


  // Current Prediction State
  const [prediction, setPrediction] = useState({
    probability: 78.4,
    riskLevel: 'HIGH',
    riskClass: 'high',
    recommendation: 'Monitor rainfall and drainage conditions closely. Issue early warning for low-lying areas and prepare emergency response resources.',
    location: 'Bengaluru, Karnataka',
    latitude: 12.97,
    longitude: 77.59,
    riskFactors: [
      { name: 'Rainfall (72h)', value: 31, color: '#ef4444' },
      { name: 'Rainfall (24h)', value: 22, color: '#f97316' },
      { name: 'Humidity', value: 12, color: '#eab308' },
      { name: 'Elevation', value: 8, color: '#a3e635' },
      { name: 'Temperature', value: 8, color: '#84cc16' }
    ]
  });

  // Dashboard Telemetry and Model Data
  const [stations, setStations] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      const [stationList, perfData, recentData] = await Promise.all([
        fetchStations(),
        fetchModelPerformance(),
        fetchRecentPredictions()
      ]);
      setStations(stationList);
      setModelMetrics(perfData);
      setRecentPredictions(recentData);
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

      // Prepend to recent list
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const newRecent = {
        time: timeStr,
        location: (params.location || 'Point').split(',')[0],
        probability: result.probability,
        riskLevel: result.riskLevel
      };
      setRecentPredictions(prev => [newRecent, ...prev.slice(0, 5)]);
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
      rainfall24h: locData.r24 ?? locData.rainfall24h ?? 85,
      rainfall72h: locData.r72 ?? locData.rainfall72h ?? 190,
      temperature: locData.temp ?? locData.temperature ?? 25,
      humidity: locData.hum ?? locData.humidity ?? 82,
      windSpeed: locData.wind ?? locData.windSpeed ?? 15,
      pressure: locData.pressure ?? 1008,
      elevation: locData.elev ?? locData.elevation ?? 20,
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
      />

      {/* MAIN WRAPPER */}
      <main className="main-wrapper">
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onOpenAlerts={() => setActiveTab('alerts')}
          onOpenProfile={() => setActiveTab('about')}
        />

        {activeTab === 'map' ? (
          /* 3D WORLD GLOBE & CARTOGRAPHIC GIS ATLAS VIEW */
          <GlobeRiskMap
            onBackToDashboard={() => setActiveTab('dashboard')}
            onSelectLocationForPredict={handleGlobePredict}
            activeLocation={activeLocation}
            onLocationChange={setActiveLocation}
            onOpenHistoryModal={() => setActiveTab('historical')}
          />
        ) : activeTab === 'predict' ? (
          /* FULL-PAGE PRODUCTION PREDICT RISK STUDIO */
          <PredictRiskView
            currentLocation={activeLocation}
            params={params}
            prediction={prediction}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onLocationChange={(newLoc, newParams, newPred) => {
              if (newLoc) setActiveLocation(newLoc);
              if (newParams) setParams(newParams);
              if (newPred) setPrediction(newPred);
            }}
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
            onLocationChange={(newLoc, newParams, newPred) => {
              if (newLoc) setActiveLocation(newLoc);
              if (newParams) setParams(newParams);
              if (newPred) setPrediction(newPred);
            }}
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
        onLocationChange={(newLoc, newParams, newPred) => {
          if (newLoc) setActiveLocation(newLoc);
          if (newParams) setParams(newParams);
          if (newPred) setPrediction(newPred);
        }}
      />

    </div>
  );
}
