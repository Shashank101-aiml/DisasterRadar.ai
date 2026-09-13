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
import MiraBhayandarRiskMap from './components/MiraBhayandarRiskMap';

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
    if (tabId === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'predict') {
      setActiveTab('dashboard');
      setTimeout(() => {
        document.getElementById('inputParamsCard')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else if (tabId === 'performance') {
      setActiveTab('dashboard');
      setTimeout(() => {
        document.getElementById('modelPerfCard')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleMiraPredict = (miraData) => {
    const updatedParams = {
      rainfall24h: miraData.r24,
      rainfall72h: miraData.r72,
      temperature: miraData.temp,
      humidity: miraData.hum,
      windSpeed: 18,
      pressure: 1002,
      elevation: miraData.elev,
      latitude: miraData.lat,
      longitude: miraData.lng,
      location: `${miraData.name}, Maharashtra`
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
          onOpenAlerts={() => setModalState({ isOpen: true, type: 'alerts' })}
          onOpenProfile={() => setModalState({ isOpen: true, type: 'about' })}
        />

        {activeTab === 'map' ? (
          /* DEDICATED MIRA BHAYANDAR RISK MAP VIEW */
          <MiraBhayandarRiskMap
            onBackToDashboard={() => setActiveTab('dashboard')}
            onSelectLocationForPredict={handleMiraPredict}
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
                  <ModelPerformance metrics={modelMetrics} />
                  <RecentPredictions predictions={recentPredictions} />
                </div>
              </div>
            </div>

            {/* FOOTER BANNER */}
            <InfoBanner />
          </div>
        )}
      </main>

      {/* REUSABLE MODAL */}
      <Modal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={() => setModalState({ isOpen: false, type: null })}
      />
    </div>
  );
}
