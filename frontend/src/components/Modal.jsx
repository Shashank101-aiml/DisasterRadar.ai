import React from 'react';

export default function Modal({ isOpen, type, onClose }) {
  if (!isOpen) return null;

  let title = 'Project Information';
  let content = null;

  if (type === 'about') {
    title = 'About FloodRisk AI';
    content = (
      <>
        <p style={{ marginBottom: '12px', lineHeight: 1.5, color: '#475569' }}>
          <strong>FloodRisk AI</strong> is an advanced data-driven predictive platform that analyzes historical rainfall, real-time telemetry, geographic elevations, and weather data to forecast flood risks across key urban catchments.
        </p>
        <p style={{ lineHeight: 1.5, color: '#475569' }}>
          Powered by state-of-the-art Gradient Boosted Decision Trees (XGBoost) achieving 91% precision and 0.96 ROC-AUC on testing datasets.
        </p>
      </>
    );
  } else if (type === 'historical') {
    title = 'Historical Rainfall & Inundation Data';
    content = (
      <>
        <p style={{ marginBottom: '12px', color: '#475569' }}>
          Records dating back from 2018 to 2024 across 42 rainfall telemetry stations in Karnataka are used for continuous retraining.
        </p>
        <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <li>September 2022 Urban Inundation Event (Bellandur / Outer Ring Rd)</li>
          <li>August 2020 Severe Catchment Flooding</li>
          <li>October 2021 High Precipitation Runoff</li>
        </ul>
      </>
    );
  } else if (type === 'alerts') {
    title = 'Active Alerts & Emergency Protocols';
    content = (
      <>
        <div style={{ background: '#fee2e2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
          <strong style={{ color: '#b91c1c' }}>Orange Flood Advisory (Bengaluru Urban)</strong>
          <p style={{ color: '#7f1d1d', fontSize: '0.82rem', marginTop: '4px' }}>
            Low-lying drainage channels near Varthur and Hebbal valley under surveillance.
          </p>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
          To broadcast SMS alerts to field personnel, connect the notification API gateway in settings.
        </p>
      </>
    );
  }

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">{content}</div>
      </div>
    </div>
  );
}
