import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

const SUB_TABS = [
  { id: 'user_overview', label: '💡 What is This?' },
  { id: 'how_to_use', label: '📱 How to Use the App' },
  { id: 'alerts_engine', label: '⚡ 50% Alerts & Sensitivity Engine' },
  { id: 'safety_guide', label: '🚨 Flood Safety & Alert Tiers' },
  { id: 'accuracy_plain', label: '🎯 Why Trust the AI?' },
  { id: 'mira_bhayandar', label: '🗺️ Regional Atlas' },
  { id: 'tech_specs', label: '⚙️ Technical & ML Architecture' }
] as const;

type SubTabId = (typeof SUB_TABS)[number]['id'];

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function StepCard({ num, title, body }: { num: number; title: string; body: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{num}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitleSm}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

function TileStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AlertTierCard({ title, color, bg, border, body }: { title: string; color: string; bg: string; border: string; body: string }) {
  return (
    <View style={[styles.tierCard, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.tierTitle, { color }]}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const [subTab, setSubTab] = useState<SubTabId>('user_overview');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.tabBarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {SUB_TABS.map((tab) => (
            <Text
              key={tab.id}
              onPress={() => setSubTab(tab.id)}
              style={[styles.tabItem, subTab === tab.id && styles.tabItemActive]}
            >
              {tab.label}
            </Text>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {subTab === 'user_overview' && (
          <Card>
            <View style={styles.pill}><Text style={styles.pillText}>Life-Saving Early Warning</Text></View>
            <Text style={styles.cardTitle}>Real-Time AI That Warns You Before Floodwater Enters Your Street</Text>
            <Text style={styles.body}>
              Standard weather apps tell you "it will rain 80mm today", but that doesn't answer the question that
              truly matters: "Will my street flood? Will my ground floor submerge? Is it safe to drive or travel?"
            </Text>
            <View style={styles.calloutBox}>
              <Text style={styles.body}>
                <Text style={styles.bold}>Our Mission: </Text>
                Turn complex satellite observations, radar data, and 3D terrain physics into a simple, actionable
                flood warning score that saves lives, protects property, and gives cities time to deploy emergency resources.
              </Text>
            </View>
            <Text style={styles.cardTitleSm}>How It Protects You in 3 Simple Steps:</Text>
            <StepCard num={1} title="Reads Real Weather & Ground" body="Combines live Open-Meteo precipitation with Copernicus DEM elevation, soil saturation, and municipal drainage capacity." />
            <StepCard num={2} title="AI Calculates Flood Odds" body="A 15-feature XGBoost machine learning brain analyzes slopes and bottleneck hydrodynamics to compute the exact probability." />
            <StepCard num={3} title="50% Threshold Alerts" body="Automated early alerts trigger the moment probability exceeds 50%, with tailored advice for residents, drivers, and municipal teams." />
          </Card>
        )}

        {subTab === 'how_to_use' && (
          <Card>
            <Text style={styles.cardTitle}>Interactive Walkthrough: How to Explore Flood Risks</Text>
            <Text style={styles.body}>
              Test your neighborhood, navigate anywhere across the globe, and simulate extreme monsoon conditions in seconds:
            </Text>
            <StepCard num={1} title="Step 1: Explore the World GIS Map" body='Open "3D World Globe & GIS" in the menu. Type any city or country, or enter direct latitude/longitude coordinates, to jump straight to that location.' />
            <StepCard num={2} title="Step 2: Observe Automated Live Telemetry & AI Prediction" body="The app instantly contacts Open-Meteo and Copernicus DEM APIs, ingests real-time 24h/72h rainfall, elevation, humidity, and atmospheric pressure, and runs the XGBoost prediction model on the spot." />
            <StepCard num={3} title="Step 3: Check 50% Threshold Alerts & 7-Day Rainfall Reports" body='Open "Early Warning & Alerts". See the past 1-week ledger for your active location, evaluate the 50% threshold status, and review the rainfall sensitivity matrix.' />
            <StepCard num={4} title="Step 4: Review Area-Specific Historical Disaster Records" body='Open "Historical Disaster Atlas" to review verified past flood catastrophes, peak inundation depths, and causal dynamics filtered to your active location.' />
          </Card>
        )}

        {subTab === 'alerts_engine' && (
          <Card>
            <View style={[styles.pill, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }]}>
              <Text style={[styles.pillText, { color: colors.danger }]}>Core Alert Architecture</Text>
            </View>
            <Text style={styles.cardTitle}>Automated 50% Threshold Alert Scoring & Dynamic Rainfall Elasticity</Text>
            <Text style={styles.body}>
              Detailed breakdown of how the backend scores alerts, logs 7-day incident history, and simulates rainfall fluctuations:
            </Text>
            <AlertTierCard title="🚨 50% Operational Alert Cutoff" color={colors.danger} bg="#0f172a" border="rgba(239,68,68,0.3)"
              body="50.0% probability represents the tipping point where overland precipitation exceeds gravity sewer absorption. Warnings escalate into Moderate Watch (50-65%), High Warning (65-80%), and Critical Emergency (>80%)." />
            <AlertTierCard title="📅 7-Day Retrospective Ledger" color={colors.accent} bg="#0f172a" border="rgba(56,189,248,0.3)"
              body="Maintains a chronological day-by-day record of daily precipitation, cumulative saturation, peak inundation depth, and threshold breaches for every active area." />
            <AlertTierCard title="📈 Rainfall Increase Simulation" color="#f59e0b" bg="#0f172a" border="rgba(245,158,11,0.3)"
              body="Simulates incremental rainfall surges (+10mm, +25mm, +50mm, +100mm cloudburst) showing exact risk probability increases, expected standing water depth, and civic impact." />
            <AlertTierCard title="📉 Rainfall Decrease & Safety Buffers" color={colors.success} bg="#0f172a" border="rgba(16,185,129,0.3)"
              body="Calculates drainage recovery when rain subsides (-10mm, -25mm, 0mm dry spell). Details exact Safe Absorption Buffers (mm) and Floodwater Recession Hours." />
          </Card>
        )}

        {subTab === 'safety_guide' && (
          <Card>
            <Text style={styles.cardTitle}>What Each Flood Risk Level Means for You</Text>
            <Text style={styles.body}>Our system assigns a clear color-coded warning tier. Here is what to do when each alert triggers:</Text>
            <AlertTierCard title="🟢 LOW RISK (0% – 35%) — ALL CLEAR" color={colors.success} bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.25)"
              body="Drains coping normally. Normal routine. Clear dry leaves or plastic trash off driveway stormwater grates." />
            <AlertTierCard title="🟡 MODERATE RISK (35% – 50%) — WATCH & CAUTION" color="#f59e0b" bg="rgba(245,158,11,0.08)" border="rgba(245,158,11,0.25)"
              body="Continuous rain saturating soil. Street-level accumulation beginning in low spots. Avoid basement parking; charge phones and battery banks." />
            <AlertTierCard title="🟠 HIGH RISK (50% – 80%) — WARNING: 50% THRESHOLD BREACHED" color={colors.danger} bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.3)"
              body="Severe storm load exceeding drain capacity. Move vehicles to upper podiums immediately. Keep emergency supplies and medicines above 1.5 meters. Avoid traveling." />
            <AlertTierCard title="🔴 CRITICAL DANGER (80% – 100%) — EMERGENCY EVACUATION" color="#f87171" bg="rgba(239,68,68,0.15)" border={colors.danger}
              body="Severe inundation imminent or actively underway. Switch off main household power breaker. NEVER walk or drive into moving floodwater. Follow civic evacuation orders (Emergency 112)." />
          </Card>
        )}

        {subTab === 'accuracy_plain' && (
          <Card>
            <Text style={styles.cardTitle}>Why Can You Trust This AI? (In Simple Numbers)</Text>
            <Text style={styles.body}>Rigorous validation on real satellite datasets and empirical monsoon benchmarks:</Text>
            <View style={styles.statGrid}>
              <TileStat value="92%" label="Overall Accuracy" color={colors.accentDark} />
              <TileStat value="87%" label="Floods Caught Early (Recall)" color={colors.success} />
              <TileStat value="1,025K+" label="Satellite Observations" color="#8b5cf6" />
              <TileStat value="0.965" label="ROC-AUC Discriminator" color={colors.accent} />
            </View>
          </Card>
        )}

        {subTab === 'mira_bhayandar' && (
          <Card>
            <Text style={styles.cardTitle}>Mira Bhayandar Regional Geographical Atlas</Text>
            <Text style={styles.body}>The Mira Bhayandar Municipal Corporation (MBMC) terrain dynamics:</Text>
            <AlertTierCard title="⚠️ High Vulnerability Lowlands" color={colors.danger} bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.25)"
              body="Rai Creek, Uttan Belt & Bhayandar West: ground elevation under 5 meters. Arabian Sea spring high tides coincide with rainfall to create backflow into culverts." />
            <AlertTierCard title="⛰️ Natural High Ground Safety" color={colors.success} bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.25)"
              body="National Park Foothills & Bhayandar East: elevations above 40–80 meters naturally channel runoff downward, serving as safe emergency assembly points." />
          </Card>
        )}

        {subTab === 'tech_specs' && (
          <Card>
            <Text style={styles.cardTitle}>Technical Architecture & XGBoost Pipeline Specifications</Text>
            <Text style={styles.body}>
              15-feature hydrological feature engineering, native JSON booster model, TreeSHAP attributions, and REST API specifications:
            </Text>
            <View style={styles.hyperBox}>
              <Text style={styles.cardTitleSm}>⚡ Model Hyperparameters & Serialization</Text>
              <Text style={styles.body}><Text style={styles.bold}>Booster Size: </Text>349 boosting trees (hist method, max_depth=8)</Text>
              <Text style={styles.body}><Text style={styles.bold}>Model Format: </Text>Native JSON — models/flood_model.json (zero pickle)</Text>
              <Text style={styles.body}><Text style={styles.bold}>Second model: </Text>Native Random Forest JSON — models/random_forest_model.json (zero pickle)</Text>
            </View>
            <View style={styles.codeBox}>
              <Text style={styles.codeHeader}># Production REST API Endpoints:</Text>
              <Text style={styles.codeLine}><Text style={{ color: colors.success }}>POST</Text> /api/predict                 — real-time XGBoost inference</Text>
              <Text style={styles.codeLine}><Text style={{ color: colors.success }}>POST</Text> /api/predict/compare         — XGBoost vs Random Forest comparison</Text>
              <Text style={styles.codeLine}><Text style={{ color: colors.success }}>POST</Text> /api/alerts/scoring          — automated 50% threshold evaluation</Text>
              <Text style={styles.codeLine}><Text style={{ color: colors.success }}>POST</Text> /api/reports/rainfall-impact — stepwise sensitivity simulation</Text>
              <Text style={styles.codeLine}><Text style={{ color: colors.accentDark }}>GET </Text> /api/reports/weekly          — 7-day retrospective incident ledger</Text>
              <Text style={styles.codeLine}><Text style={{ color: colors.accentDark }}>GET </Text> /api/history/events          — scoped historical disaster archives</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: { borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  tabBar: { paddingHorizontal: 12, gap: 4 },
  tabItem: {
    color: colors.textMuted, fontWeight: '700', fontSize: 13, paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent'
  },
  tabItemActive: { color: colors.accent, borderBottomColor: colors.accentDark },
  content: { padding: 16 },
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 18 },
  pill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(2,132,199,0.15)', borderWidth: 1, borderColor: 'rgba(2,132,199,0.3)',
    borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10
  },
  pillText: { color: colors.accent, fontWeight: '700', fontSize: 11 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 10 },
  cardTitleSm: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  body: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 10 },
  bold: { color: colors.text, fontWeight: '700' },
  calloutBox: { backgroundColor: '#0f172a', borderLeftWidth: 4, borderLeftColor: colors.accentDark, borderRadius: 8, padding: 14, marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 10 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentDark, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { color: '#fff', fontWeight: '800' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statTile: { flexBasis: '47%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  tierCard: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 10 },
  tierTitle: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  hyperBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 14, marginBottom: 14 },
  codeBox: { backgroundColor: '#030712', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 14 },
  codeHeader: { color: colors.accent, fontFamily: 'monospace', fontSize: 11, marginBottom: 6 },
  codeLine: { color: '#cbd5e1', fontFamily: 'monospace', fontSize: 11, lineHeight: 18 }
});
