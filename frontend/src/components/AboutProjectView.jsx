import React, { useState } from 'react';

export default function AboutProjectView({ onBackToDashboard, isEmbeddedInModal = false }) {
  const [subTab, setSubTab] = useState('user_overview');

  return (
    <div className="about-project-page-container" style={{ padding: isEmbeddedInModal ? '0' : '24px 32px', color: '#f8fafc' }}>
      {/* TOP HEADER & BREADCRUMB */}
      {!isEmbeddedInModal && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <button
                onClick={onBackToDashboard}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ← Back to Dashboard
              </button>
              <span style={{ color: '#475569' }}>/</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>System Documentation</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              🌊 DisasterRadar.ai — Project Architecture & Community Guide
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
              Comprehensive operational manual, machine learning methodology, 50% threshold alerting, and municipal safety protocols
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
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

      {/* PRIMARY SUB-TABS NAVIGATION (Solid single color indicator) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1e293b', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'user_overview', label: '💡 What is This?' },
          { id: 'how_to_use', label: '📱 How to Use the App' },
          { id: 'alerts_engine', label: '⚡ 50% Alerts & Sensitivity Engine' },
          { id: 'safety_guide', label: '🚨 Flood Safety & Alert Tiers' },
          { id: 'accuracy_plain', label: '🎯 Why Trust the AI?' },
          { id: 'mira_bhayandar', label: '🗺️ Regional Atlas' },
          { id: 'tech_specs', label: '⚙️ Technical & ML Architecture' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              background: subTab === tab.id ? '#0f172a' : 'transparent',
              border: 'none',
              borderBottom: subTab === tab.id ? '2px solid #0284c7' : '2px solid transparent',
              color: subTab === tab.id ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '10px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WHAT IS THIS? */}
      {subTab === 'user_overview' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1000px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', fontWeight: 700, fontSize: '0.74rem', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
              Life-Saving Early Warning
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
              Real-Time AI That Warns You Before Floodwater Enters Your Street
            </h3>
            <p style={{ fontSize: '0.92rem', marginBottom: '16px', color: '#cbd5e1' }}>
              Standard weather apps tell you <em>"it will rain 80mm today"</em>, but that doesn't answer the question that truly matters: <strong style={{ color: '#f8fafc' }}>"Will my street flood? Will my ground floor submerge? Is it safe to drive or travel?"</strong>
            </p>

            <div style={{ background: '#0f172a', borderLeft: '4px solid #0284c7', border: '1px solid #1e293b', borderLeftColor: '#0284c7', padding: '16px 20px', borderRadius: '8px', marginBottom: '20px' }}>
              <strong style={{ color: '#f8fafc' }}>Our Mission:</strong> Turn complex satellite observations, radar data, and 3D terrain physics into a <strong style={{ color: '#38bdf8' }}>simple, actionable flood warning score</strong> that saves lives, protects property, and gives cities time to deploy emergency resources.
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
              How It Protects You in 3 Simple Steps:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '10px' }}>1</div>
                <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>Reads Real Weather & Ground</strong>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '8px 0 0 0' }}>
                  Combines live Open-Meteo precipitation with Copernicus DEM elevation, soil saturation, and municipal drainage capacity.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '10px' }}>2</div>
                <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>AI Calculates Flood Odds</strong>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '8px 0 0 0' }}>
                  A 15-feature XGBoost machine learning brain analyzes slopes and bottleneck hydrodynamics to compute the exact probability.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '10px' }}>3</div>
                <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>50% Threshold Alerts</strong>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '8px 0 0 0' }}>
                  Automated early alerts trigger the moment probability exceeds 50%, with tailored advice for residents, drivers, and municipal teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOW TO USE THE APP */}
      {subTab === 'how_to_use' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1000px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              Interactive Walkthrough: How to Explore Flood Risks
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              Test your neighborhood, navigate anywhere across the globe, and simulate extreme monsoon conditions in seconds:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 1: Explore with the 3D World Globe</strong>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Click <strong style={{ color: '#38bdf8' }}>Risk Map</strong> in the sidebar. Type any city or country (e.g. <em>Tokyo, Miami, London, Mira Bhayandar</em>) or enter direct latitude/longitude coordinates. The 3D globe rotates and zooms directly to the target location with a glowing beacon pin.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 2: Observe Automated Live Telemetry & AI Prediction</strong>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    The application instantly contacts Open-Meteo and Copernicus DEM APIs, ingests real-time 24h/72h rainfall, elevation, humidity, and atmospheric pressure, and runs the XGBoost prediction model on the spot.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 3: Check 50% Threshold Alerts & 7-Day Rainfall Reports</strong>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Click <strong style={{ color: '#38bdf8' }}>Alerts & Reports</strong> in the sidebar. See the past 1-week chronological ledger for your active location, evaluate the 50% threshold status, and review the rainfall sensitivity matrix to see how much risk changes if rainfall increases (+10mm to +100mm) or decreases.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>4</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 4: Review Area-Specific Historical Disaster Records</strong>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
                    Click <strong style={{ color: '#38bdf8' }}>Historical Data</strong> to review verified past flood catastrophes, peak inundation depths, and causal dynamics strictly filtered to your active location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 50% ALERTS & SENSITIVITY ENGINE */}
      {subTab === 'alerts_engine' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1000px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700, fontSize: '0.74rem', padding: '4px 10px', borderRadius: '4px', marginBottom: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              Core Alert Architecture
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              Automated 50% Threshold Alert Scoring & Dynamic Rainfall Elasticity
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              Detailed breakdown of how the backend scores alerts, logs 7-day incident history, and simulates rainfall fluctuations:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🚨</span>
                  <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>50% Operational Alert Cutoff</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  50.0% probability represents the tipping point where overland precipitation exceeds gravity sewer absorption. Warnings trigger automatically, escalating into Moderate Watch (50-65%), High Warning (65-80%), and Critical Emergency (&gt;80%).
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📅</span>
                  <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>7-Day Retrospective Ledger</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Maintains a chronological day-by-day record of daily precipitation, cumulative saturation, peak inundation depth, and threshold breaches for every active area.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📈</span>
                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>Rainfall Increase Simulation</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Simulates incremental rainfall surges (+10mm, +25mm, +50mm, +100mm cloudburst) showing exact risk probability increases, expected standing water depth, and civic impact.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📉</span>
                  <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>Rainfall Decrease & Safety Buffers</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Calculates drainage recovery when rain subsides (-10mm, -25mm, 0mm dry spell). Details exact <strong style={{ color: '#f8fafc' }}>Safe Absorption Buffers (mm)</strong> and <strong style={{ color: '#f8fafc' }}>Floodwater Recession Hours</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLOOD SAFETY & ALERTS */}
      {subTab === 'safety_guide' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1000px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              What Each Flood Risk Level Means for You
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              Our system assigns a clear color-coded warning tier. Here is what to do when each alert triggers:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>🟢 LOW RISK (0% – 35%) — ALL CLEAR</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0 }}>
                  Drains coping normally. Normal routine. Clear dry leaves or plastic trash off driveway stormwater grates.
                </p>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>🟡 MODERATE RISK (35% – 50%) — WATCH & CAUTION</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0 }}>
                  Continuous rain saturating soil. Street-level accumulation beginning in low spots. Avoid basement parking; charge phones and battery banks.
                </p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>🟠 HIGH RISK (50% – 80%) — WARNING: 50% THRESHOLD BREACHED</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0 }}>
                  Severe storm load exceeding drain capacity. Move vehicles to upper podiums immediately. Keep emergency supplies and medicines above 1.5 meters. Avoid traveling.
                </p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#f87171', fontSize: '0.95rem' }}>🔴 CRITICAL DANGER (80% – 100%) — EMERGENCY EVACUATION</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#f8fafc', margin: 0 }}>
                  Severe inundation imminent or actively underway. Switch off main household power breaker. <strong style={{ color: '#fca5a5' }}>NEVER walk or drive into moving floodwater</strong>. Follow civic evacuation orders (Emergency 112).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WHY TRUST THE AI */}
      {subTab === 'accuracy_plain' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1000px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              Why Can You Trust This AI? (In Simple Numbers)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              Rigorous validation on real satellite datasets and empirical monsoon benchmarks:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0284c7' }}>92%</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Overall Accuracy</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#10b981' }}>87%</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Floods Caught Early (Recall)</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#8b5cf6' }}>1,025K+</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Satellite Observations</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#38bdf8' }}>0.965</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>ROC-AUC Discriminator</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REGIONAL ATLAS */}
      {subTab === 'mira_bhayandar' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1000px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              Mira Bhayandar Regional Geographical Atlas
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              The Mira Bhayandar Municipal Corporation (MBMC) terrain dynamics:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '18px', borderRadius: '10px' }}>
                <strong style={{ color: '#ef4444', fontSize: '0.92rem' }}>⚠️ High Vulnerability Lowlands</strong>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                  <strong style={{ color: '#f8fafc' }}>Rai Creek, Uttan Belt & Bhayandar West:</strong> Ground elevation under 5 meters. Arabian Sea spring high tides coincide with rainfall to create backflow into culverts.
                </p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '18px', borderRadius: '10px' }}>
                <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>⛰️ Natural High Ground Safety</strong>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                  <strong style={{ color: '#f8fafc' }}>National Park Foothills & Bhayandar East:</strong> Elevations above 40–80 meters naturally channel runoff downward, serving as safe emergency assembly points.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TECHNICAL & ML ARCHITECTURE */}
      {subTab === 'tech_specs' && (
        <div style={{ lineHeight: 1.6, maxWidth: '1000px', color: '#94a3b8' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              Technical Architecture & XGBoost Pipeline Specifications
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginBottom: '16px' }}>
              15-feature hydrological feature engineering, native JSON booster model, TreeSHAP attributions, and REST API specifications:
            </p>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', marginBottom: '18px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>⚡ Model Hyperparameters & Serialization:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.82rem', marginTop: '12px' }}>
                <div style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '14px', borderRadius: '8px' }}>
                  <strong style={{ color: '#f8fafc' }}>Booster Size:</strong> 236 Trees
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>Early stopped at iteration 235 / 400</p>
                </div>
                <div style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '14px', borderRadius: '8px' }}>
                  <strong style={{ color: '#f8fafc' }}>Optuna Tuning:</strong> 10 Trials
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>LR: 0.109, Max Depth: 8, Hist trees</p>
                </div>
                <div style={{ background: '#0b1120', border: '1px solid #1e293b', padding: '14px', borderRadius: '8px' }}>
                  <strong style={{ color: '#f8fafc' }}>Model Format:</strong> Native JSON
                  <p style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>models/flood_model.json (zero pickle)</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#030712', border: '1px solid #1e293b', color: '#f8fafc', padding: '16px 20px', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'monospace', lineHeight: 1.7 }}>
              <div style={{ color: '#38bdf8', marginBottom: '4px' }}># Production REST API Endpoints:</div>
              <div style={{ color: '#cbd5e1' }}><span style={{ color: '#10b981' }}>POST</span> /api/predict                 - Real-time XGBoost inference</div>
              <div style={{ color: '#cbd5e1' }}><span style={{ color: '#10b981' }}>POST</span> /api/alerts/scoring          - Automated 50% threshold evaluation</div>
              <div style={{ color: '#cbd5e1' }}><span style={{ color: '#10b981' }}>POST</span> /api/reports/rainfall-impact - Stepwise sensitivity simulation</div>
              <div style={{ color: '#cbd5e1' }}><span style={{ color: '#0284c7' }}>GET </span> /api/reports/weekly          - 7-day retrospective incident ledger</div>
              <div style={{ color: '#cbd5e1' }}><span style={{ color: '#0284c7' }}>GET </span> /api/history/events          - Scoped historical disaster archives</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
