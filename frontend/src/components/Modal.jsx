import React from 'react';
import HistoricalDataView from './HistoricalDataView';
import AlertsReportsView from './AlertsReportsView';
import AboutProjectView from './AboutProjectView';

export default function Modal({ isOpen, type, onClose, currentLocation, params, prediction }) {
  if (!isOpen) return null;

  const rawLoc = currentLocation?.name || (typeof currentLocation === 'string' ? currentLocation : 'Mira Bhayandar');
  const locName = rawLoc.split(',')[0].trim();

  let title = 'Project Information';
  let isLarge = true;
  let content = null;

  if (type === 'about') {
    title = '🌊 DisasterRadar.ai — Project Architecture & Community Guide';
    content = <AboutProjectView onBackToDashboard={onClose} isEmbeddedInModal={true} />;
  } else if (type === 'historical') {
    title = `🏛️ DisasterRadar.ai — Historical Flood Registry for ${locName}`;
    content = <HistoricalDataView currentLocation={currentLocation} onBackToDashboard={onClose} isEmbeddedInModal={true} />;
  } else if (type === 'alerts' || type === 'reports') {
    title = `🚨 DisasterRadar.ai — Alerts & 7-Day Rainfall Reports (${locName})`;
    content = <AlertsReportsView currentLocation={currentLocation} params={params} prediction={prediction} onBackToDashboard={onClose} isEmbeddedInModal={true} />;
  }

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className={`modal-card ${isLarge ? 'modal-lg' : ''}`} style={{ maxWidth: '980px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">{content}</div>
      </div>
    </div>
  );
}
