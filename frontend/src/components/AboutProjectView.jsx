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
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1080px' }}>
          
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '26px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <span style={{ display: 'inline-block', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                💡 Project Overview & Core Mission
              </span>
              <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>
                ✓ Operational Across Global & Regional Basins
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px' }}>
              DisasterRadar.ai: Real-Time AI Early Warning & Flood Intelligence System
            </h3>
            <p style={{ fontSize: '0.92rem', marginBottom: '16px', color: '#cbd5e1', lineHeight: 1.6 }}>
              Standard weather forecasts simply state <em>"80mm precipitation expected today"</em>, failing to answer the critical questions: <strong style={{ color: '#f8fafc' }}>"Will my street flood? Will ground-floor homes submerge? Is it safe to commute through low-lying underpasses?"</strong> DisasterRadar.ai bridges this gap by fusing Earth-observation telemetry, 3D terrain topography, municipal drainage factors, and a multi-model machine learning ensemble into an actionable, real-time flood early warning system.
            </p>

            <div style={{ background: '#0f172a', borderLeft: '4px solid #0284c7', border: '1px solid #1e293b', borderLeftColor: '#0284c7', padding: '16px 20px', borderRadius: '8px', marginBottom: '20px' }}>
              <strong style={{ color: '#f8fafc' }}>Core Mission:</strong> Transform 1,000,000+ satellite hydrology records, live weather radar feeds, and digital elevation models into a <strong style={{ color: '#38bdf8' }}>precise flood probability score [0% - 100%]</strong> with automated 50% threshold life-safety directives, evacuation blueprints, and sensitivity simulations.
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>
              🌟 5 Core Operational Capabilities:
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>📡</span>
                  <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>Live Telemetry & 3D Globe</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                  Queries Open-Meteo precipitation and Copernicus 30m Global DEM on the fly for any latitude/longitude coordinate or global city on an interactive 3D globe.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🧠</span>
                  <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>Super-Stack ML Ensemble</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                  Soft-voting ensemble of Native XGBoost (349 trees), Native Random Forest (100 trees), and PyTorch FloodNet achieving 91.24% accuracy and 93.12% sensitivity.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🚨</span>
                  <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>50% Threshold Early Warning</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                  Automated trigger system delivering tailored emergency directives for residents, motorists, and municipal emergency response cells.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>📈</span>
                  <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>7-Day Ledger & Sensitivity Matrix</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                  Retrospective 7-day weather reanalysis combined with stepwise precipitation simulation (+10mm to +100mm) showing safe absorption buffers and recession hours.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>📋</span>
                  <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>Dynamic Evacuation Blueprints</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                  Scenario-specific evacuation procedures tailored for Flash Floods, River Overflows, Urban Waterlogging, Dam Releases, and Coastal Surges.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🔍</span>
                  <strong style={{ fontSize: '0.94rem', color: '#f8fafc' }}>TreeSHAP Explainability</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0 }}>
                  Every prediction outputs exact per-feature attributions, proving exactly why a risk score was generated without black-box ambiguity.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: HOW TO USE THE APP */}
      {subTab === 'how_to_use' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1080px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              📱 Interactive Workflow: How to Use DisasterRadar.ai
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '20px' }}>
              A complete guide to navigating the web dashboard, querying live station telemetry, simulating extreme storms, and following emergency protocols:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 1: Explore with the 3D Interactive Risk Globe</strong>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                    Click <strong style={{ color: '#38bdf8' }}>Risk Map</strong> in the navigation sidebar. Enter any city name (e.g., <em>Mumbai, Miami, Tokyo, London, Mira Bhayandar</em>) or direct latitude/longitude coordinates. The 3D globe rotates and pinpoints the location with live elevation contours and flood hazard overlays.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 2: Inspect Live Station Telemetry & Instant Super-Stack Prediction</strong>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                    The backend queries live Open-Meteo numerical weather feeds (24h/72h rainfall, humidity, wind) and Copernicus DEM elevation to evaluate the Super-Stack Ensemble model, outputting the calibrated risk probability on the Donut Gauge.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 3: Run Interactive Multi-Model Comparisons & TreeSHAP Attributions</strong>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                    Navigate to <strong style={{ color: '#38bdf8' }}>Predict Risk</strong> to adjust hydrological sliders (rainfall, slope, soil saturation, NDWI) and compare the Super-Stack Ensemble against Native XGBoost and Random Forest simultaneously, complete with real-time TreeSHAP force plots.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>4</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 4: Check 50% Threshold Alerts & 7-Day Inundation Ledger</strong>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                    Open <strong style={{ color: '#38bdf8' }}>Alerts & Reports</strong> to view the past 7-day chronological incident history for your active location, check whether the 50% threshold was breached, and simulate rainfall fluctuations (+10mm to +100mm cloudburst vs -10mm drainage recovery).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', background: '#0f172a', border: '1px solid #1e293b', padding: '18px', borderRadius: '10px' }}>
                <div style={{ background: '#0284c7', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>5</div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>Step 5: Access Flood Evacuation Blueprints & Hydrodynamic Matrix</strong>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0' }}>
                    Click <strong style={{ color: '#38bdf8' }}>AI Explainer & SOPs</strong> to select specific flood conditions (Flash Flood, River Overflow, Waterlogging, Dam Release, Coastal Surge) and access dedicated 6-category evacuation blueprints, water depth hazard matrices, and interactive Go-Bag checklists.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 50% ALERTS & SENSITIVITY ENGINE */}
      {subTab === 'alerts_engine' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1080px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '26px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', marginBottom: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              ⚡ Core Alert & Simulation Architecture
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              Automated 50% Threshold Safety Engine & Dynamic Rainfall Elasticity
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px' }}>
              How DisasterRadar.ai evaluates the critical 50% inundation boundary, maintains the 7-day retrospective ledger, and computes hydrological elasticity:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              
              <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🚨</span>
                  <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>50% Operational Alert Threshold</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  50.0% probability represents the physical tipping point where precipitation volume outpaces gravity drainage throughput. Warnings activate automatically, escalating into Moderate Watch (35–50%), High Warning (50–80%), and Critical Emergency (&gt;80%).
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📅</span>
                  <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>7-Day Inundation Ledger</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Queries live Open-Meteo historical reanalysis (<code style={{ color: '#38bdf8' }}>past_days=7</code>) to render a day-by-day table of precipitation, cumulative 72h saturation, peak estimated water depth, and threshold status with TTL caching.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📈</span>
                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>Rainfall Increase Simulation (+10mm to +100mm)</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Simulates incremental cloudburst surges (+10mm, +25mm, +50mm, +100mm) in real time, calculating exact delta risk score increases, expected water depth increments, and civic infrastructure vulnerability.
                </p>
              </div>

              <div style={{ background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📉</span>
                  <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>Rainfall Decrease & Recession Hours</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Calculates natural drainage capacity when storms subside (-10mm, -25mm, 0mm dry spells). Details the exact <strong style={{ color: '#f8fafc' }}>Safe Absorption Buffer (mm)</strong> and <strong style={{ color: '#f8fafc' }}>Hours to Complete Drainage</strong>.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLOOD SAFETY & ALERTS */}
      {subTab === 'safety_guide' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1080px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              🚨 Flood Risk Tiers & Life-Safety Directives
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px' }}>
              Every risk level is coupled with specific operational instructions for citizens, motorists, and municipal emergency cells:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#10b981', fontSize: '0.98rem' }}>🟢 LOW RISK (0% – 35%) — ALL CLEAR / ROUTINE MONITORING</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Drains are operating normally. Clear dry leaves and plastic debris off compound drain grates. Maintain standard vigilance during heavy monsoon seasons.
                </p>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#f59e0b', fontSize: '0.98rem' }}>🟡 MODERATE RISK (35% – 50%) — WATCH & PRECAUTIONARY ALERT</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Continuous rain saturating soil. Street-level accumulation beginning in depressed locations. Avoid subterranean basement parking; charge phones, torches, and power banks; assemble floatable Go-Bags.
                </p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#ef4444', fontSize: '0.98rem' }}>🟠 HIGH RISK (50% – 80%) — WARNING: 50% THRESHOLD BREACHED</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  Severe storm load exceeding gravity drain capacity. Relocate vehicles to high flyovers and multi-level parking ramps immediately. Elevate inverters, electronics, and food reserves above 1.5m. Avoid all non-essential road travel.
                </p>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: '#f87171', fontSize: '0.98rem' }}>🔴 CRITICAL DANGER (80% – 100%) — MANDATORY EMERGENCY EVACUATION</strong>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#f8fafc', margin: 0, lineHeight: 1.5 }}>
                  Catastrophic inundation imminent or actively underway. Shut down main electrical circuit breaker (MCB). Unchain cattle and domestic animals immediately. <strong style={{ color: '#fca5a5' }}>"Turn Around, Don't Drown" — never walk or drive into moving water</strong>. Follow civil defense directives (Emergency 112).
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WHY TRUST THE AI */}
      {subTab === 'accuracy_plain' && (
        <div style={{ lineHeight: 1.6, color: '#94a3b8', maxWidth: '1080px' }}>
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '26px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              🎯 Empirical Model Validation & Statistical Reliability
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '20px' }}>
              DisasterRadar.ai is validated on over 1,000,000 Earth-observation records and an independent holdout dataset of 12,417 balanced validation samples:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7' }}>91.47%</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>XGBoost Accuracy</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>93.12%</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Ensemble Recall (Life Safety)</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#8b5cf6' }}>1,000K+</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Satellite Training Records</div>
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8' }}>0.9676</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>ROC-AUC Discriminator</div>
              </div>
            </div>

            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px' }}>
              <strong style={{ color: '#f8fafc', fontSize: '0.94rem' }}>Why Recall Matters Most in Flood Intelligence:</strong>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0', lineHeight: 1.6 }}>
                In disaster management, a <strong style={{ color: '#ef4444' }}>False Negative</strong> (missing an actual flood event) causes loss of human life and catastrophic property damage, whereas a False Positive only causes temporary precaution. Our models prioritize high Sensitivity/Recall (93.12% ensemble recall) ensuring dangerous flood conditions are detected early with minimal misses.
              </p>
            </div>
          </div>
        </div>
      )}



      {/* TAB 7: TECHNICAL & ML ARCHITECTURE */}
      {subTab === 'tech_specs' && (
        <div style={{ lineHeight: 1.6, maxWidth: '1080px', color: '#94a3b8' }}>
          
          {/* HEADER & HERO */}
          <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '14px', padding: '26px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <span style={{ display: 'inline-block', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', marginBottom: '8px', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
                  🏛️ Production System Blueprint
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  DisasterRadar.ai System Architecture & Multi-Model ML Pipeline
                </h3>
              </div>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                ⚡ Zero-Pickle Security Standard
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
              DisasterRadar.ai is built on an enterprise 4-tier architecture: live earth-observation and meteorological telemetry ingestion, 15-dimensional hydrodynamic feature engineering, a calibrated Super-Stack ensemble (Native XGBoost + Native Random Forest + PyTorch FloodNet), TreeSHAP feature attributions, and an asynchronous FastAPI backend serving dual React/React Native presentation layers.
            </p>
          </div>

          {/* ASCII SYSTEM ARCHITECTURE FLOW DIAGRAM */}
          <div style={{ background: '#030712', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Architecture Flow Diagram
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>End-to-End Pipeline</span>
            </div>
            <pre style={{ margin: 0, color: '#93c5fd', fontSize: '0.76rem', fontFamily: 'Consolas, Monaco, "Courier New", monospace', lineHeight: 1.35 }}>
{`  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                           1. DATA SOURCES & TELEMETRY INGESTION                        │
  │  • MODIS Satellite Hydrology (1M+ rows)    • Open-Meteo High-Resolution Weather API     │
  │  • Copernicus DEM 30m Elevation Topography • Municipal Drainage & Vulnerability Atlas   │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                         2. HYDRODYNAMIC FEATURE ENGINEERING (15D)                      │
  │  • Multi-spectral: NDWI, NDVI, Contrast    • Terrain: Elevation, Slope, TWI (Wetness)   │
  │  • Precipitation: 24h/72h Rain, Ratio      • Infrastructure: Drainage Density, Ponding  │
  │  • Data Integrity: Zero-Null Audit, IQR Outlier Clamping, Leakage-Free 80/20 Stratified │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                   ┌──────────────────────────┴──────────────────────────┐
                   ▼                                                     ▼
  ┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
  │    NATIVE XGBOOST CLASSIFIER    │                 │   NATIVE RANDOM FOREST (JSON)   │
  │  • 349 Boosting Trees (hist)    │                 │  • 100 Decision Trees (max_d=14)│
  │  • Accuracy: 91.47% | Rec: 92.7%│                 │  • Accuracy: 90.17% | Rec: 93.6%│
  │  • ROC-AUC: 0.9676              │                 │  • ROC-AUC: 0.9610 | OOB: 0.9029│
  │  • Format: flood_model.json     │                 │  • Format: random_forest.json   │
  └────────────────┬────────────────┘                 └────────────────┬────────────────┘
                   │                                                     │
                   └──────────────────────────┬──────────────────────────┘
                                              │ + PyTorch FloodNet Deep Residual NN (10%)
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                 3. SUPER-STACK ENSEMBLE ENGINE & TREESHAP EXPLAINABILITY               │
  │  • Soft-Voting Meta-Ensemble: 0.50 RF + 0.40 XGB + 0.10 NN (91.24% Ensemble Accuracy)  │
  │  • Real-Time TreeSHAP Feature Attribution: Per-feature directional hazard forces       │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                            4. FASTAPI REST MICROSERVICES BACKEND                       │
  │  • POST /api/predict (Real-time inference) • POST /api/alerts/scoring (50% Threshold)  │
  │  • GET  /api/reports/weekly (7-Day Ledger) • POST /api/reports/rainfall-impact (Sens)  │
  │  • GET  /api/stations (Live Telemetry)     • GET  /api/gis/mira-bhayandar (GIS Wards)  │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                   ┌──────────────────────────┴──────────────────────────┐
                   ▼                                                     ▼
  ┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
  │      REACT 18 + VITE FRONTEND   │                 │     REACT NATIVE MOBILE APP     │
  │  • Donut Gauge & Live Telemetry │                 │  • Push Alerts & Offline SOPs   │
  │  • 3D Risk Globe & Evacuation   │                 │  • GPS Live Station Sync        │
  │  • Model Diagnostics Dashboard  │                 │  • Go-Bag & Survival Checklists │
  └─────────────────────────────────┘                 └─────────────────────────────────┘`}
            </pre>
          </div>

          {/* 4 DETAILED ARCHITECTURAL TIERS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            {/* TIER 1 */}
            <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #38bdf8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📡</span>
                <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>Tier 1: Data Ingestion & Live Hydrological Telemetry</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li><strong style={{ color: '#f8fafc' }}>MODIS Satellite Earth Observation:</strong> Over 1,000,000 historical flood events capturing multi-spectral surface water signatures and inundation dynamics.</li>
                <li><strong style={{ color: '#f8fafc' }}>Open-Meteo High-Resolution APIs:</strong> Live hourly precipitation, 24h & 72h rolling precipitation, temperature, wind, and relative humidity.</li>
                <li><strong style={{ color: '#f8fafc' }}>Copernicus 30m Global DEM:</strong> Digital elevation model providing sub-meter terrain contours, catchment slopes, and valley depressions.</li>
                <li><strong style={{ color: '#f8fafc' }}>Municipal Infrastructure GIS:</strong> Stormwater drainage capacity, arterial culvert bottleneck locations, and ward vulnerability indices.</li>
              </ul>
            </div>

            {/* TIER 2 */}
            <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧪</span>
                <strong style={{ color: '#f59e0b', fontSize: '1rem' }}>Tier 2: 15-Feature Hydrodynamic Pipeline</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li><strong style={{ color: '#f8fafc' }}>Multi-Spectral Indices:</strong> Normalized Difference Water Index (<code style={{ color: '#38bdf8' }}>NDWI</code>), Vegetation Index (<code style={{ color: '#38bdf8' }}>NDVI</code>), and Surface Water Contrast.</li>
                <li><strong style={{ color: '#f8fafc' }}>Terrain Topography:</strong> Catchment Elevation, Slope Angle, and Topographic Wetness Index (<code style={{ color: '#38bdf8' }}>TWI = ln(a / tan β)</code>).</li>
                <li><strong style={{ color: '#f8fafc' }}>Precipitation Dynamics:</strong> 24h Rain, 72h Accumulation, Precipitation Ratio (<code style={{ color: '#38bdf8' }}>24h / 72h</code>), and Ponding Hazard Index.</li>
                <li><strong style={{ color: '#f8fafc' }}>Civic Surcharge Factors:</strong> Drainage Network Density, Soil Saturation Index, and Estuarine / River Proximity.</li>
              </ul>
            </div>

            {/* TIER 3 */}
            <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧠</span>
                <strong style={{ color: '#10b981', fontSize: '1rem' }}>Tier 3: Super-Stack Multi-Model ML Ensemble</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li><strong style={{ color: '#f8fafc' }}>Native XGBoost Classifier:</strong> 349 Gradient Boosted Decision Trees (<code style={{ color: '#38bdf8' }}>tree_method='hist'</code>, max_depth=8, lr=0.047) scoring <strong>91.47% Accuracy</strong> and <strong>92.75% Recall</strong>.</li>
                <li><strong style={{ color: '#f8fafc' }}>Native Random Forest Classifier:</strong> 100 Decision Trees (<code style={{ color: '#38bdf8' }}>max_depth=14</code>) scoring <strong>90.17% Accuracy</strong> and <strong>93.59% Recall</strong> in native JSON.</li>
                <li><strong style={{ color: '#f8fafc' }}>PyTorch FloodNet Deep NN:</strong> Residual MLP with BatchNorm1d, Dropout(0.25), and CosineAnnealing learning rate scheduling.</li>
                <li><strong style={{ color: '#f8fafc' }}>TreeSHAP Explainability:</strong> Calculates exact per-feature contribution and directional push (+/-) for every prediction.</li>
              </ul>
            </div>

            {/* TIER 4 */}
            <div style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <strong style={{ color: '#8b5cf6', fontSize: '1rem' }}>Tier 4: FastAPI Microservices & Presentation Layer</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                <li><strong style={{ color: '#f8fafc' }}>FastAPI REST Services:</strong> Sub-5ms async inference throughput, TTL in-memory cache, and robust CORS protection.</li>
                <li><strong style={{ color: '#f8fafc' }}>50% Threshold Safety Engine:</strong> Automated trigger system delivering tailored citizen, driver, and municipal action directives.</li>
                <li><strong style={{ color: '#f8fafc' }}>Dynamic Sensitivity Engine:</strong> Stepwise rainfall elasticity simulations (0–500mm) displaying water depth & recession hours.</li>
                <li><strong style={{ color: '#f8fafc' }}>Dual Presentation:</strong> React 18 + Vite Web Dashboard and React Native Mobile App with voice-enabled emergency briefings.</li>
              </ul>
            </div>

          </div>



          {/* PRODUCTION REST API SPECIFICATIONS */}
          <div style={{ background: '#030712', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                🚀 Production REST API Microservice Endpoints
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>FastAPI Async Engine</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
              <div style={{ background: '#0b1120', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ background: '#10b981', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, marginRight: '10px', fontSize: '0.72rem' }}>POST</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>/api/predict</span>
                </div>
                <span style={{ color: '#94a3b8' }}>Real-time super-stack ensemble inference with TreeSHAP attributions</span>
              </div>

              <div style={{ background: '#0b1120', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ background: '#10b981', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, marginRight: '10px', fontSize: '0.72rem' }}>POST</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>/api/alerts/scoring</span>
                </div>
                <span style={{ color: '#94a3b8' }}>Automated 50% flood probability threshold scoring & safety directives</span>
              </div>

              <div style={{ background: '#0b1120', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, marginRight: '10px', fontSize: '0.72rem' }}>GET</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>/api/reports/weekly</span>
                </div>
                <span style={{ color: '#94a3b8' }}>7-day retrospective inundation ledger via live Open-Meteo reanalysis</span>
              </div>

              <div style={{ background: '#0b1120', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ background: '#10b981', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, marginRight: '10px', fontSize: '0.72rem' }}>POST</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>/api/reports/rainfall-impact</span>
                </div>
                <span style={{ color: '#94a3b8' }}>Stepwise precipitation elasticity & safe absorption buffer simulation</span>
              </div>

              <div style={{ background: '#0b1120', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, marginRight: '10px', fontSize: '0.72rem' }}>GET</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>/api/stations</span>
                </div>
                <span style={{ color: '#94a3b8' }}>Live regional telemetry stations, sensor feeds, and active rainfall gauges</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
