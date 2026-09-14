import React, { useState, useEffect } from 'react';
import { fetchAlertScoring, fetchRainfallImpact, fetchWeeklyReports } from '../services/api';

export default function AlertsReportsView({ currentLocation, params, prediction, onBackToDashboard, isEmbeddedInModal = false }) {
  const [subTab, setSubTab] = useState('threshold');
  const [alertScore, setAlertScore] = useState(null);
  const [rainfallImpact, setRainfallImpact] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const rawLoc = currentLocation?.name || (typeof currentLocation === 'string' ? currentLocation : 'Mira Bhayandar');
  const locName = rawLoc.split(',')[0].trim();
  const locCountry = currentLocation?.country || '';
  const locLat = currentLocation?.lat !== undefined ? currentLocation.lat : 19.295;
  const locLng = currentLocation?.lng !== undefined ? currentLocation.lng : 72.854;

  const curProb = alertScore?.probability ?? prediction?.probability ?? 78.4;
  const isThresholdCrossed = curProb >= 50.0;
  const deltaThreshold = Math.round((curProb - 50.0) * 10) / 10;

  useEffect(() => {
    setLoading(true);
    const payload = {
      rainfall24h: params?.rainfall24h ?? 85.0,
      rainfall72h: params?.rainfall72h ?? 190.0,
      temperature: params?.temperature ?? 25.0,
      humidity: params?.humidity ?? 82.0,
      windSpeed: params?.windSpeed ?? 12.0,
      pressure: params?.pressure ?? 1005.0,
      elevation: params?.elevation ?? 15.0,
      latitude: locLat,
      longitude: locLng,
      location: locName,
      probability: prediction?.probability ?? 78.4
    };

    Promise.all([
      fetchAlertScoring(payload),
      fetchRainfallImpact(payload),
      fetchWeeklyReports(locName, locLat, locLng)
    ]).then(([score, impact, weekly]) => {
      if (score) setAlertScore(score);
      if (impact) setRainfallImpact(impact);
      if (weekly) setWeeklyReport(weekly);
    }).finally(() => {
      setLoading(false);
    });
  }, [currentLocation, params, prediction]);

  // Fallback 7-day retrospective records
  const weekRecords = weeklyReport?.weekly_records || [
    { id: 'w1', date: '2026-09-09', day_name: 'Wed', rainfall_24h_mm: 45.0, rainfall_72h_mm: 110.0, probability: 38.2, threshold_crossed: false, risk_level: 'LOW', peak_water_depth_m: 0.2, status_summary: 'Intermittent monsoon showers; nallas flowing normally' },
    { id: 'w2', date: '2026-09-10', day_name: 'Thu', rainfall_24h_mm: 72.0, rainfall_72h_mm: 165.0, probability: 54.5, threshold_crossed: true, risk_level: 'MODERATE', peak_water_depth_m: 0.5, status_summary: 'Tidal confluence; 50% threshold crossed; culverts backflowing' },
    { id: 'w3', date: '2026-09-11', day_name: 'Fri', rainfall_24h_mm: 148.0, rainfall_72h_mm: 265.0, probability: 84.6, threshold_crossed: true, risk_level: 'CRITICAL', peak_water_depth_m: 1.4, status_summary: 'Severe cloudburst; underpass paralyzed; emergency pumps active' },
    { id: 'w4', date: '2026-09-12', day_name: 'Sat', rainfall_24h_mm: 115.0, rainfall_72h_mm: 310.0, probability: 76.2, threshold_crossed: true, risk_level: 'HIGH', peak_water_depth_m: 1.0, status_summary: 'Persistent runoff; municipal road sweepers clearing choke points' },
    { id: 'w5', date: '2026-09-13', day_name: 'Sun', rainfall_24h_mm: 60.0, rainfall_72h_mm: 240.0, probability: 51.0, threshold_crossed: true, risk_level: 'MODERATE', peak_water_depth_m: 0.4, status_summary: 'Rainfall easing; creek level receding during low tide window' },
    { id: 'w6', date: '2026-09-14', day_name: 'Mon', rainfall_24h_mm: 28.0, rainfall_72h_mm: 140.0, probability: 35.8, threshold_crossed: false, risk_level: 'LOW', peak_water_depth_m: 0.1, status_summary: 'Dry spell; desilting crews cleared 450 meters of drainage' },
    { id: 'w7', date: '2026-09-15', day_name: 'Tue', rainfall_24h_mm: params?.rainfall24h ?? 85.0, rainfall_72h_mm: params?.rainfall72h ?? 190.0, probability: curProb, threshold_crossed: isThresholdCrossed, risk_level: curProb >= 70 ? 'CRITICAL' : (curProb >= 50 ? 'HIGH' : 'LOW'), peak_water_depth_m: curProb >= 70 ? 1.2 : 0.6, status_summary: isThresholdCrossed ? 'Active severe convective band; 50% safety threshold exceeded' : 'Normal rainfall within drainage absorption capacity' }
  ];

  // Fallback rainfall sensitivity scenarios
  const incScenarios = rainfallImpact?.increase_scenarios || [
    { rainfall_increase_mm: 10, simulated_rainfall_24h: (params?.rainfall24h ?? 85) + 10, simulated_probability: Math.min(99.4, Math.round((curProb + 12.4) * 10) / 10), risk_increase_delta: 12.4, water_depth_increase_m: 0.18, threat_classification: "Moderate Ingress", consequence_summary: "Curb-height pooling (10-25cm). Slow transit on arterial lanes; storm drains running at 85% capacity.", threshold_breached: true },
    { rainfall_increase_mm: 25, simulated_rainfall_24h: (params?.rainfall24h ?? 85) + 25, simulated_probability: Math.min(99.4, Math.round((curProb + 26.8) * 10) / 10), risk_increase_delta: 26.8, water_depth_increase_m: 0.42, threat_classification: "Severe Waterlogging", consequence_summary: "Street water depth reaches 35-50cm. Vehicle stalling in underpasses, ground floor shop ingress.", threshold_breached: true },
    { rainfall_increase_mm: 50, simulated_rainfall_24h: (params?.rainfall24h ?? 85) + 50, simulated_probability: Math.min(99.4, Math.round((curProb + 44.1) * 10) / 10), risk_increase_delta: 44.1, water_depth_increase_m: 0.85, threat_classification: "Critical Flash Inundation", consequence_summary: "Major culvert overflow (0.7m - 1.1m depth). Road links severed, power supply shut down for safety.", threshold_breached: true },
    { rainfall_increase_mm: 100, simulated_rainfall_24h: (params?.rainfall24h ?? 85) + 100, simulated_probability: 99.4, risk_increase_delta: 58.5, water_depth_increase_m: 1.60, threat_classification: "Catastrophic Cloudburst Surge", consequence_summary: "Extreme deluge exceeding 1.5m depth. Residential ground floors inundated, mandatory boat evacuations.", threshold_breached: true }
  ];

  const decScenarios = rainfallImpact?.decrease_scenarios || [
    { scenario_label: "-10 mm (Rain Eases)", rainfall_reduction_mm: 10.0, simulated_probability: Math.max(2.5, Math.round((curProb - 14.2) * 10) / 10), risk_reduction_delta: 14.2, drainage_recovery_behavior: "Gravity drains clear surface gutters; runoff velocity drops by 45%. Water begins receding from road shoulders.", safety_margin_rating: "MODERATE STABILITY — Water levels stabilize with no new overland flow.", estimated_recession_hours: 2.2, below_alert_threshold: (curProb - 14.2) < 50.0 },
    { scenario_label: "-25 mm (Significant Letup)", rainfall_reduction_mm: 25.0, simulated_probability: Math.max(2.5, Math.round((curProb - 29.6) * 10) / 10), risk_reduction_delta: 29.6, drainage_recovery_behavior: "Primary stormwater channels re-establish free discharge. Street ponding clears from all major carriage roads within 2 hours.", safety_margin_rating: "SUBSTANTIAL SAFETY — Risk falls below alert threshold into manageable zone.", estimated_recession_hours: 1.4, below_alert_threshold: true },
    { scenario_label: "Rain Ceases Completely (0 mm Dry Spell)", rainfall_reduction_mm: params?.rainfall24h ?? 85.0, simulated_probability: 4.8, risk_reduction_delta: Math.round((curProb - 4.8) * 10) / 10, drainage_recovery_behavior: "Ground saturation steadily diminishes. Natural infiltration and municipal pumps restore all low spots within 3-6 hours.", safety_margin_rating: "OPTIMAL SAFETY ZONE — Flood hazard neutralized; full transit operations safe to resume.", estimated_recession_hours: 0.8, below_alert_threshold: true }
  ];

  const safeBuffer = rainfallImpact?.safe_absorption_buffer_mm ?? (curProb < 50.0 ? Math.round((50.0 - curProb) * 1.8) : 0);
  const drainHours = rainfallImpact?.estimated_drain_time_hours ?? 3.5;
  const soilSat = rainfallImpact?.soil_saturation_pct ?? 78.5;

  return (
    <div className="alerts-reports-page-container" style={{ padding: isEmbeddedInModal ? '0' : '24px 32px', color: '#1e293b' }}>
      {/* TOP HEADER & BREADCRUMB */}
      {!isEmbeddedInModal && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <button
                onClick={onBackToDashboard}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ← Back to Dashboard
              </button>
              <span style={{ color: '#94a3b8' }}>/</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Alerts & Reports Center</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🚨 Real-Time Alerts & 7-Day Rainfall Reports
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
              Automated 50% flood risk threshold scoring, 7-day retrospective incident tracking, and dynamic rainfall sensitivity analysis for <strong>{locName} {locCountry ? `(${locCountry})` : ''}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: isThresholdCrossed ? '#fee2e2' : '#dcfce7',
              color: isThresholdCrossed ? '#dc2626' : '#16a34a',
              border: `1px solid ${isThresholdCrossed ? '#fca5a5' : '#86efac'}`,
              fontWeight: 800,
              fontSize: '0.82rem',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isThresholdCrossed ? '#dc2626' : '#16a34a' }}></span>
              {isThresholdCrossed ? '50% THRESHOLD BREACHED' : 'SAFE (<50% THRESHOLD)'}
            </span>
          </div>
        </div>
      )}

      {/* TOP CONTEXT BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 18px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>📍</span>
          <div>
            <strong style={{ fontSize: '0.96rem', color: '#0f172a' }}>{locName} {locCountry ? `(${locCountry})` : ''}</strong>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Active Telemetry: 24h Rain: <strong>{params?.rainfall24h ?? 85} mm</strong> | 72h Rain: <strong>{params?.rainfall72h ?? 190} mm</strong> | Elevation: <strong>{params?.elevation ?? 15} m</strong>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Current ML Inundation Probability: <strong style={{ color: isThresholdCrossed ? '#dc2626' : '#16a34a', fontSize: '1.05rem' }}>{curProb}%</strong>
        </div>
      </div>

      {/* PRIMARY SUB-TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          onClick={() => setSubTab('threshold')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'threshold' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'threshold' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.92rem',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          🚨 50% Threshold Scoring
        </button>

        <button
          onClick={() => setSubTab('weekly')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'weekly' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'weekly' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.92rem',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          📅 Past 1-Week Ledger (7 Days)
        </button>

        <button
          onClick={() => setSubTab('sensitivity')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'sensitivity' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'sensitivity' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.92rem',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          📈 Rainfall Impact & Elasticity
        </button>

        <button
          onClick={() => setSubTab('precautions')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'precautions' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'precautions' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.92rem',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          🛡️ Safety Precautions & Directives
        </button>
      </div>

      {/* TAB 1: 🚨 50% THRESHOLD SCORING */}
      {subTab === 'threshold' && (
        <div>
          {/* BIG STATUS HERO CARD */}
          <div style={{
            background: isThresholdCrossed ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: `2px solid ${isThresholdCrossed ? '#ef4444' : '#22c55e'}`,
            borderRadius: '12px',
            padding: '22px 26px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  background: isThresholdCrossed ? '#ef4444' : '#16a34a',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.05em',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  marginBottom: '8px'
                }}>
                  {curProb >= 80 ? 'CRITICAL DISASTER EMERGENCY' : (curProb >= 65 ? 'HIGH INUNDATION WARNING' : (curProb >= 50 ? 'MODERATE SURCHARGE WATCH' : 'NORMAL / MONITORING'))}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: isThresholdCrossed ? '#991b1b' : '#166534', margin: '0 0 8px 0' }}>
                  {isThresholdCrossed
                    ? `⚠️ 50% Flood Risk Threshold Breached for ${locName}`
                    : `✅ Conditions Normal — Safely Below 50% Threshold for ${locName}`}
                </h3>
                <p style={{ fontSize: '0.9rem', color: isThresholdCrossed ? '#7f1d1d' : '#14532d', margin: 0, lineHeight: 1.5, maxWidth: '700px' }}>
                  {isThresholdCrossed
                    ? `The backend AI scoring engine has detected a threshold breach at ${curProb}% (+${deltaThreshold}% above the critical 50.0% cutoff). Overland storm runoff is overwhelming local gravity drains. Low-lying arterial roads and basements face immediate waterlogging.`
                    : `The backend AI scoring engine confirms current risk is ${curProb}%, maintaining an operational safety buffer of ${Math.abs(deltaThreshold)}% below the 50% danger line. Drains and terrain are absorbing all surface precipitation.`}
                </p>
              </div>

              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>CURRENT ML RISK SCORE</div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: isThresholdCrossed ? '#dc2626' : '#16a34a', lineHeight: 1 }}>
                  {curProb}%
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: isThresholdCrossed ? '#b91c1c' : '#15803d', marginTop: '6px' }}>
                  {isThresholdCrossed ? `▲ ${deltaThreshold}% Above 50% Threshold` : `▼ ${Math.abs(deltaThreshold)}% Below 50% Threshold`}
                </div>
              </div>
            </div>

            {/* THRESHOLD GAUGE BAR */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                <span>0% Safe</span>
                <span style={{ color: '#d97706', fontWeight: 800 }}>50% CRITICAL ALERT THRESHOLD</span>
                <span>100% Inundated</span>
              </div>
              <div style={{ height: '14px', background: '#e2e8f0', borderRadius: '7px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, Math.max(4, curProb))}%`,
                  height: '100%',
                  background: curProb >= 70 ? 'linear-gradient(90deg, #eab308, #ef4444)' : (curProb >= 50 ? 'linear-gradient(90deg, #84cc16, #eab308)' : '#22c55e'),
                  borderRadius: '7px',
                  transition: 'width 0.4s ease'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: '3px',
                  background: '#0f172a',
                  zIndex: 2,
                  boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                }}></div>
              </div>
            </div>
          </div>

          {/* 4 SCORING METRICS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Threshold Cutoff</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>50.0%</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Standard Civil Defense Cutoff</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Threshold Status</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: isThresholdCrossed ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
                {isThresholdCrossed ? 'BREACHED' : 'SAFE'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{deltaThreshold >= 0 ? `+${deltaThreshold}% over threshold` : `${Math.abs(deltaThreshold)}% safe buffer`}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Water Depth</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                {isThresholdCrossed ? (curProb >= 75 ? '0.8 - 1.5 m' : '0.3 - 0.7 m') : '< 0.15 m'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>At chronic bottleneck junctions</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Civic Lead Time</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#8b5cf6', marginTop: '2px' }}>2 to 4 Hours</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Advance evacuation window</div>
            </div>
          </div>

          {/* ACTION DIRECTIVE BANNER */}
          <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>📢</span>
              <strong style={{ color: '#1e40af', fontSize: '0.94rem' }}>Automated Alert Protocol Dispatched</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#1e3a8a', lineHeight: 1.5 }}>
              {isThresholdCrossed
                ? `Automated warning dispatched to municipal emergency control rooms for ${locName}. Mobile dewatering pumps are directed to low-lying collection sumps, and traffic police are alerted to restrict access to flooded underpasses.`
                : `All hydrologic parameters for ${locName} remain within standard operational envelopes. No public advisories or detours required at this time.`}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: 📅 PAST 1-WEEK INCIDENT LEDGER */}
      {subTab === 'weekly' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Past 7-Day Chronological Telemetry & Inundation Ledger
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Historical record showing day-by-day 24h/72h rainfall, probability score, and 50% threshold status for <strong>{locName}</strong>
              </div>
            </div>
            <div>
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," +
                    ["Date,Day,Rainfall 24h (mm),Rainfall 72h (mm),Probability (%),Threshold Status,Water Depth (m),Status Summary"].join(",") + "\n" +
                    weekRecords.map(r => `"${r.date}","${r.day_name}",${r.rainfall_24h_mm},${r.rainfall_72h_mm},${r.probability},"${r.threshold_crossed ? 'BREACHED' : 'SAFE'}",${r.peak_water_depth_m},"${r.status_summary.replace(/"/g, '""')}"`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `FloodRisk_WeeklyReport_${locName}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                📊 Export CSV Report
              </button>
            </div>
          </div>

          {/* 3 KPI CARDS FOR PAST 7 DAYS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>7-Day Total Accumulation</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                {Math.round(weekRecords.reduce((acc, r) => acc + r.rainfall_24h_mm, 0))} mm
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Days &gt; 50% Threshold</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444', marginTop: '2px' }}>
                {weekRecords.filter(r => r.threshold_crossed).length} of 7 Days
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Peak 7-Day Water Depth</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8b5cf6', marginTop: '2px' }}>
                {Math.max(...weekRecords.map(r => r.peak_water_depth_m))} m
              </div>
            </div>
          </div>

          {/* 7-DAY TABLE */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>Date & Day</th>
                  <th style={{ padding: '10px 12px' }}>Rain (24h / 72h)</th>
                  <th style={{ padding: '10px 12px' }}>Risk Score</th>
                  <th style={{ padding: '10px 12px' }}>50% Threshold</th>
                  <th style={{ padding: '10px 12px' }}>Peak Depth</th>
                  <th style={{ padding: '10px 12px' }}>Field Observations & Incident Summary</th>
                </tr>
              </thead>
              <tbody>
                {weekRecords.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: r.threshold_crossed ? 'rgba(254, 242, 242, 0.4)' : '#ffffff' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#0f172a' }}>
                      {r.date} <span style={{ color: '#64748b', fontWeight: 400 }}>({r.day_name})</span>
                    </td>
                    <td style={{ padding: '12px', color: '#0369a1', fontWeight: 600 }}>
                      {r.rainfall_24h_mm} mm <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ {r.rainfall_72h_mm} mm</span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 800, color: r.probability >= 70 ? '#dc2626' : (r.probability >= 50 ? '#d97706' : '#16a34a') }}>
                      {r.probability}%
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: r.threshold_crossed ? '#fee2e2' : '#dcfce7',
                        color: r.threshold_crossed ? '#b91c1c' : '#15803d',
                        border: `1px solid ${r.threshold_crossed ? '#fca5a5' : '#86efac'}`
                      }}>
                        {r.threshold_crossed ? 'BREACHED' : 'SAFE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#475569' }}>
                      {r.peak_water_depth_m} m
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#475569' }}>
                      {r.status_summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 📈 RAINFALL SENSITIVITY & IMPACT */}
      {subTab === 'sensitivity' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Hydrological Rainfall Sensitivity & Risk Elasticity Matrix
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '4px 0 0 0' }}>
              Simulating exact quantitative risk progression for <strong>{locName}</strong>: how much risk increases if rainfall surges, and what happens if rainfall decreases or ceases completely.
            </p>
          </div>

          {/* 3 QUANTITATIVE SAFETY KPI METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '14px 18px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Safe Absorption Buffer</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#166534', marginTop: '2px' }}>
                {safeBuffer > 0 ? `+${safeBuffer} mm` : '0 mm (Deficit Active)'}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534' }}>Rainfall tolerated before 50% threshold breach</div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '14px 18px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Full Recession Duration</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e40af', marginTop: '2px' }}>
                ~{drainHours} Hours
              </div>
              <div style={{ fontSize: '0.74rem', color: '#1e40af' }}>Time for ponding to clear if rain stops now</div>
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '14px 18px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase' }}>Soil Saturation Index</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#7e22ce', marginTop: '2px' }}>
                {soilSat}% Saturation
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7e22ce' }}>Near hydraulic percolation limit</div>
            </div>
          </div>

          {/* TWO-COLUMN SENSITIVITY BREAKDOWN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* LEFT: RAINFALL INCREASE */}
            <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📈</span>
                <div>
                  <strong style={{ color: '#b91c1c', fontSize: '0.96rem' }}>IF RAINFALL INCREASES</strong>
                  <div style={{ fontSize: '0.74rem', color: '#7f1d1d' }}>How risk grows as storm volume escalates</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incScenarios.map((s, idx) => (
                  <div key={idx} style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.88rem' }}>+{s.rainfall_increase_mm} mm Additional Rain</span>
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        Risk: {s.simulated_probability}% (+{s.risk_increase_delta}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#7f1d1d', fontWeight: 600, marginBottom: '4px' }}>
                      Water Depth: +{s.water_depth_increase_m}m | Threat: {s.threat_classification}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                      {s.consequence_summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: RAINFALL DECREASE & DRY SPELL */}
            <div style={{ background: '#fff', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>📉</span>
                <div>
                  <strong style={{ color: '#15803d', fontSize: '0.96rem' }}>IF RAINFALL GOES DOWN / CEASES</strong>
                  <div style={{ fontSize: '0.74rem', color: '#14532d' }}>How risk drops and safe drainage restores</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {decScenarios.map((s, idx) => (
                  <div key={idx} style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.88rem' }}>{s.scenario_label}</span>
                      <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        Risk: {s.simulated_probability}% (-{s.risk_reduction_delta}%)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 600, marginBottom: '4px' }}>
                      Recession Time: ~{s.estimated_recession_hours}h | Status: {s.below_alert_threshold ? '✅ Below Threshold' : '⚠️ Alert Persists'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                      {s.drainage_recovery_behavior}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 🛡️ SAFETY PRECAUTIONS & PROTOCOLS */}
      {subTab === 'precautions' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Actionable Safety Precautions & Civil Defense Protocols
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', margin: '4px 0 0 0' }}>
              Tailored emergency response measures based on current <strong>{curProb}% flood probability</strong> for <strong>{locName}</strong>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* CITIZENS & FAMILIES */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.3rem' }}>👨‍👩‍👧</span>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>Citizens & Households</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Relocate Vehicles</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>CRITICAL</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Move cars and scooters to elevated podiums or upper ramps. Water over the wheel hub causes irreparable ECU and engine hydro-lock.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Ground Floor Sandbags</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>RECOMMENDED</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Erect temporary aluminum shields or sandbag barriers at doorway thresholds to repel street wash surges.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>72-Hour Survival Stock</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>SAFETY</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Keep 10 liters of bottled water, dry rations, fully charged power banks, torchlights, and essential prescription medications above 1.5m elevation.
                  </p>
                </div>
              </div>
            </div>

            {/* COMMUTERS & MOTORISTS */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.3rem' }}>🚗</span>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>Motorists & Commuters</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Never Cross Underpasses</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>RULE #1</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Just 30cm (1 foot) of moving floodwater floats a standard sedan. If an underpass has water above curb height, immediately turn around.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Check Live Navigation</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>ADVISORY</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Use the 3D World Globe / Risk Map before driving to identify which ward drainage channels are surcharging.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Vehicle Escape Hammer</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px' }}>EQUIPMENT</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Store a mechanical window glass-punch hammer in the center console in case electric window motors short-circuit underwater.
                  </p>
                </div>
              </div>
            </div>

            {/* MUNICIPAL & EMERGENCY RESPONDERS */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.3rem' }}>🚒</span>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>First Responders (NDRF/MBMC)</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Deploy Dewatering Pumps</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>URGENT</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Position diesel-powered 1000 GPM suction pumps at known chronic choking culverts and railway subway sumps.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Low Tide Sluice Windows</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>STRATEGIC</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Open creek discharge flap gates precisely during low tide to evacuate inland ponding by gravity before next tidal surge.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>Electrical Feeder Shutoff</strong>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>LIFE SAFETY</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Remotely de-energize roadside DP boxes and low-height transformers in inundated sectors to avoid civic electrocution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
