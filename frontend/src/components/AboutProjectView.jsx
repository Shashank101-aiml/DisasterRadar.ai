import React, { useState } from 'react';

export default function AboutProjectView({ onBackToDashboard, isEmbeddedInModal = false }) {
  const [subTab, setSubTab] = useState('user_overview');

  return (
    <div className="about-project-page-container" style={{ padding: isEmbeddedInModal ? '0' : '24px 32px', color: '#1e293b' }}>
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
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>System Documentation</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🌊 DisasterRadar.ai — Project Architecture & Community Guide
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
              Comprehensive operational manual, machine learning methodology, 50% threshold alerting, and municipal safety protocols
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #86efac',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              Production Release v2.4 (Active)
            </span>
          </div>
        </div>
      )}

      {/* PRIMARY SUB-TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          onClick={() => setSubTab('user_overview')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'user_overview' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'user_overview' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          💡 What is This?
        </button>

        <button
          onClick={() => setSubTab('how_to_use')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'how_to_use' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'how_to_use' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          📱 How to Use the App
        </button>

        <button
          onClick={() => setSubTab('alerts_engine')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'alerts_engine' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'alerts_engine' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          ⚡ 50% Alerts & Sensitivity Engine
        </button>

        <button
          onClick={() => setSubTab('safety_guide')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'safety_guide' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'safety_guide' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🚨 Flood Safety & Alert Tiers
        </button>

        <button
          onClick={() => setSubTab('accuracy_plain')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'accuracy_plain' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'accuracy_plain' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🎯 Why Trust the AI?
        </button>

        <button
          onClick={() => setSubTab('mira_bhayandar')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'mira_bhayandar' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'mira_bhayandar' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🗺️ Regional Atlas
        </button>

        <button
          onClick={() => setSubTab('tech_specs')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: subTab === 'tech_specs' ? '3px solid #0284c7' : '3px solid transparent',
            color: subTab === 'tech_specs' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '0.88rem',
            padding: '10px 14px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          ⚙️ Technical & ML Architecture
        </button>
      </div>

      {/* TAB 1: WHAT IS THIS? */}
      {subTab === 'user_overview' && (
        <div style={{ lineHeight: 1.6, color: '#334155', maxWidth: '1000px' }}>
          <span style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, fontSize: '0.74rem', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px' }}>
            Life-Saving Early Warning
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Real-Time AI That Warns You Before Floodwater Enters Your Street
          </h3>
          <p style={{ fontSize: '0.92rem', marginBottom: '16px', color: '#475569' }}>
            Standard weather apps tell you <em>"it will rain 80mm today"</em>, but that doesn't answer the question that truly matters: <strong>"Will my street flood? Will my ground floor submerge? Is it safe to drive or travel?"</strong>
          </p>

          <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '14px 18px', borderRadius: '6px', marginBottom: '20px' }}>
            <strong style={{ color: '#0f172a' }}>Our Mission:</strong> Turn complex satellite observations, radar data, and 3D terrain physics into a <strong>simple, actionable flood warning score</strong> that saves lives, protects property, and gives cities time to deploy emergency resources.
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
            How It Protects You in 3 Simple Steps:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '8px' }}>1</div>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Reads Real Weather & Ground</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '6px 0 0 0' }}>
                Combines live Open-Meteo precipitation with Copernicus DEM elevation, soil saturation, and municipal drainage capacity.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '8px' }}>2</div>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>AI Calculates Flood Odds</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '6px 0 0 0' }}>
                A 15-feature XGBoost machine learning brain analyzes slopes and bottleneck hydrodynamics to compute the exact probability.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '8px' }}>3</div>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>50% Threshold Alerts</strong>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '6px 0 0 0' }}>
                Automated early alerts trigger the moment probability exceeds 50%, with tailored advice for residents, drivers, and municipal teams.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOW TO USE THE APP */}
      {subTab === 'how_to_use' && (
        <div style={{ lineHeight: 1.6, color: '#334155', maxWidth: '1000px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Interactive Walkthrough: How to Explore Flood Risks
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
            Test your neighborhood, navigate anywhere across the globe, and simulate extreme monsoon conditions in seconds:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>Step 1: Explore with the 3D World Globe</strong>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Click <strong>Risk Map</strong> in the sidebar. Type any city or country (e.g. <em>Tokyo, Miami, London, Mira Bhayandar</em>) or enter direct latitude/longitude coordinates. The 3D globe rotates and zooms directly to the target location with a glowing beacon pin.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>Step 2: Observe Automated Live Telemetry & AI Prediction</strong>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  The application instantly contacts Open-Meteo and Copernicus DEM APIs, ingests real-time 24h/72h rainfall, elevation, humidity, and atmospheric pressure, and runs the XGBoost prediction model on the spot.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>Step 3: Check 50% Threshold Alerts & 7-Day Rainfall Reports</strong>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Click <strong>Alerts & Reports</strong> in the sidebar. See the past 1-week chronological ledger for your active location, evaluate the 50% threshold status, and review the rainfall sensitivity matrix to see how much risk changes if rainfall increases (+10mm to +100mm) or decreases.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', background: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>4</div>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#0f172a' }}>Step 4: Review Area-Specific Historical Disaster Records</strong>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Click <strong>Historical Data</strong> to review verified past flood catastrophes, peak inundation depths, and causal dynamics strictly filtered to your active location.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 50% ALERTS & SENSITIVITY ENGINE */}
      {subTab === 'alerts_engine' && (
        <div style={{ lineHeight: 1.6, color: '#334155', maxWidth: '1000px' }}>
          <span style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.74rem', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px' }}>
            Core Alert Architecture
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Automated 50% Threshold Alert Scoring & Dynamic Rainfall Elasticity
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
            Detailed breakdown of how the backend scores alerts, logs 7-day incident history, and simulates rainfall fluctuations:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '18px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.3rem' }}>🚨</span>
                <strong style={{ color: '#991b1b', fontSize: '0.95rem' }}>50% Operational Alert Cutoff</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
                50.0% probability represents the tipping point where overland precipitation exceeds gravity sewer absorption. Warnings trigger automatically, escalating into Moderate Watch (50-65%), High Warning (65-80%), and Critical Emergency (&gt;80%).
              </p>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.3rem' }}>📅</span>
                <strong style={{ color: '#1e40af', fontSize: '0.95rem' }}>7-Day Retrospective Ledger</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#1e3a8a', margin: 0, lineHeight: 1.5 }}>
                Maintains a chronological day-by-day record of daily precipitation, cumulative saturation, peak inundation depth, and threshold breaches for every active area.
              </p>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.3rem' }}>📈</span>
                <strong style={{ color: '#c2410c', fontSize: '0.95rem' }}>Rainfall Increase Simulation</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#9a3412', margin: 0, lineHeight: 1.5 }}>
                Simulates incremental rainfall surges (+10mm, +25mm, +50mm, +100mm cloudburst) showing exact risk probability increases, expected standing water depth, and civic impact.
              </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.3rem' }}>📉</span>
                <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>Rainfall Decrease & Safety Buffers</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#14532d', margin: 0, lineHeight: 1.5 }}>
                Calculates drainage recovery when rain subsides (-10mm, -25mm, 0mm dry spell). Details exact <strong>Safe Absorption Buffers (mm)</strong> and <strong>Floodwater Recession Hours</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLOOD SAFETY & ALERTS */}
      {subTab === 'safety_guide' && (
        <div style={{ lineHeight: 1.6, color: '#334155', maxWidth: '1000px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            What Each Flood Risk Level Means for You
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
            Our system assigns a clear color-coded warning tier. Here is what to do when each alert triggers:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ color: '#15803d', fontSize: '0.95rem' }}>🟢 LOW RISK (0% – 35%) — ALL CLEAR</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0 }}>
                Drains coping normally. Normal routine. Clear dry leaves or plastic trash off driveway stormwater grates.
              </p>
            </div>

            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ color: '#a16207', fontSize: '0.95rem' }}>🟡 MODERATE RISK (35% – 50%) — WATCH & CAUTION</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#854d0e', margin: 0 }}>
                Continuous rain saturating soil. Street-level accumulation beginning in low spots. Avoid basement parking; charge phones and battery banks.
              </p>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ color: '#c2410c', fontSize: '0.95rem' }}>🟠 HIGH RISK (50% – 80%) — WARNING: 50% THRESHOLD BREACHED</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#9a3412', margin: 0 }}>
                Severe storm load exceeding drain capacity. Move vehicles to upper podiums immediately. Keep emergency supplies and medicines above 1.5 meters. Avoid traveling.
              </p>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ color: '#b91c1c', fontSize: '0.95rem' }}>🔴 CRITICAL DANGER (80% – 100%) — EMERGENCY EVACUATION</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#991b1b', margin: 0 }}>
                Severe inundation imminent or actively underway. Switch off main household power breaker. <strong>NEVER walk or drive into moving floodwater</strong>. Follow civic evacuation orders (Emergency 112).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WHY TRUST THE AI */}
      {subTab === 'accuracy_plain' && (
        <div style={{ lineHeight: 1.6, color: '#334155', maxWidth: '1000px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Why Can You Trust This AI? (In Simple Numbers)
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
            Rigorous validation on real satellite datasets and empirical monsoon benchmarks:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0284c7' }}>92%</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Overall Accuracy</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>87%</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Floods Caught Early (Recall)</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8b5cf6' }}>1,025K+</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Satellite Observations</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>0.965</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>ROC-AUC Discriminator</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REGIONAL ATLAS */}
      {subTab === 'mira_bhayandar' && (
        <div style={{ lineHeight: 1.6, color: '#334155', maxWidth: '1000px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Mira Bhayandar Regional Geographical Atlas
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
            The Mira Bhayandar Municipal Corporation (MBMC) terrain dynamics:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px', borderRadius: '8px' }}>
              <strong style={{ color: '#b91c1c', fontSize: '0.9rem' }}>⚠️ High Vulnerability Lowlands</strong>
              <p style={{ fontSize: '0.82rem', color: '#991b1b', margin: '4px 0 0 0' }}>
                <strong>Rai Creek, Uttan Belt & Bhayandar West:</strong> Ground elevation under 5 meters. Arabian Sea spring high tides coincide with rainfall to create backflow into culverts.
              </p>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '8px' }}>
              <strong style={{ color: '#15803d', fontSize: '0.9rem' }}>⛰️ Natural High Ground Safety</strong>
              <p style={{ fontSize: '0.82rem', color: '#166534', margin: '4px 0 0 0' }}>
                <strong>National Park Foothills & Bhayandar East:</strong> Elevations above 40–80 meters naturally channel runoff downward, serving as safe emergency assembly points.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TECHNICAL & ML ARCHITECTURE */}
      {subTab === 'tech_specs' && (
        <div style={{ lineHeight: 1.6, maxWidth: '1000px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Technical Architecture & XGBoost Pipeline Specifications
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '14px' }}>
            15-feature hydrological feature engineering, native JSON booster model, TreeSHAP attributions, and REST API specifications:
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>⚡ Model Hyperparameters & Serialization:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem', marginTop: '8px' }}>
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                <strong>Booster Size:</strong> 236 Trees
                <p style={{ color: '#64748b', margin: '2px 0 0 0' }}>Early stopped at iteration 235 / 400</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                <strong>Optuna Tuning:</strong> 10 Trials
                <p style={{ color: '#64748b', margin: '2px 0 0 0' }}>LR: 0.109, Max Depth: 8, Hist trees</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px' }}>
                <strong>Model Format:</strong> Native JSON
                <p style={{ color: '#64748b', margin: '2px 0 0 0' }}>models/flood_model.json (zero pickle)</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', color: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
            <div style={{ color: '#38bdf8' }}># API Endpoints:</div>
            <div>POST /api/predict                 - Real-time XGBoost inference</div>
            <div>POST /api/alerts/scoring          - Automated 50% threshold evaluation</div>
            <div>POST /api/reports/rainfall-impact - Stepwise sensitivity simulation</div>
            <div>GET  /api/reports/weekly          - 7-day retrospective incident ledger</div>
            <div>GET  /api/history/events          - Scoped historical disaster archives</div>
          </div>
        </div>
      )}
    </div>
  );
}
