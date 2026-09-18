import React, { useState, useEffect } from 'react';

export default function Header({ onToggleSidebar, onOpenAlerts, onOpenProfile, onDownloadApp }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="top-header" style={{ background: 'rgba(8, 12, 22, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(56, 189, 248, 0.15)' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        <div className="header-titles">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#f8fafc' }}>
              DisasterRadar<span style={{ color: '#38bdf8' }}>.ai</span>
            </h1>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', letterSpacing: '0.04em' }}>
              EOC-v2.5
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
            AI Flood Risk Prediction & Disaster Intelligence
          </p>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Live Satellite Ingestion / Offline Telemetry Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isOnline ? 'rgba(15, 23, 42, 0.75)' : 'rgba(124, 45, 18, 0.75)',
            border: `1px solid ${isOnline ? 'rgba(56, 189, 248, 0.2)' : '#f97316'}`,
            borderRadius: '20px',
            padding: '4px 10px',
            fontSize: '0.68rem',
            color: isOnline ? '#cbd5e1' : '#fed7aa',
            fontWeight: 700
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#10b981' : '#f97316',
              boxShadow: `0 0 8px ${isOnline ? '#10b981' : '#f97316'}`,
              display: 'inline-block'
            }}
          />
          <span>{isOnline ? 'OPEN-METEO LIVE' : 'OFFLINE RESCUE MODE'}</span>
        </div>

        {/* EOC Mission Clock */}
        <div className="header-clock" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '14px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div className="clock-details">
            <span className="clock-time" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
              {time || '10:24:00 AM'}
            </span>
            <span className="clock-date" style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {date}
            </span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Prominent Download App Button for PC & Mobile */}
          <button
            className="download-app-header-btn"
            onClick={onDownloadApp}
            aria-label="Download App"
            style={{
              background: '#0284c7',
              border: '1px solid #38bdf8',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download App</span>
          </button>

          <button
            className="icon-button"
            onClick={onOpenAlerts}
            aria-label="Notifications"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#e2e8f0',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <span className="badge-dot" style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 6px #ef4444' }} />
          </button>

          <button
            className="user-avatar-btn"
            onClick={onOpenProfile}
            aria-label="User Profile"
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
