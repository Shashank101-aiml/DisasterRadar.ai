import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, Download } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { fetchAlertScoring, fetchRainfallImpact, fetchWeeklyReports, predictFloodRisk } from '../services/api';
import { geocodeLocation, fetchGlobalLiveTelemetry, type GeocodeMatch } from '../services/geocoding';
import { exportCsv, toCsvRow } from '../services/csvExport';
import type { AlertScoringResponse, RainfallImpactResponse, WeeklyReportResponse, PrecautionItem } from '../types/api';

const PRESET_LOCATIONS = [
  { name: 'Mira Bhayandar', country: 'Maharashtra, India', lat: 19.2952, lng: 72.8544 },
  { name: 'Mumbai', country: 'Maharashtra, India', lat: 19.0760, lng: 72.8777 },
  { name: 'Bengaluru', country: 'Karnataka, India', lat: 12.9716, lng: 77.5946 },
  { name: 'Chennai', country: 'Tamil Nadu, India', lat: 13.0827, lng: 80.2707 },
  { name: 'Mangaluru', country: 'Karnataka, India', lat: 12.9141, lng: 74.8560 },
  { name: 'Kolkata', country: 'West Bengal, India', lat: 22.5726, lng: 88.3639 },
  { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 }
];

const SUB_TABS = [
  { id: 'threshold', label: '🚨 Threshold & Status' },
  { id: 'weekly', label: '📅 7-Day Ledger' },
  { id: 'sensitivity', label: '📈 Sensitivity Curves' },
  { id: 'precautions', label: '🛡️ Precautions' }
] as const;
type SubTab = (typeof SUB_TABS)[number]['id'];

export default function AlertsReportsScreen() {
  const { activeLocation, params, prediction, setActiveLocation, setParams, setPrediction } = useAppStore();
  const [subTab, setSubTab] = useState<SubTab>('threshold');
  const [alertScore, setAlertScore] = useState<AlertScoringResponse | null>(null);
  const [rainfallImpact, setRainfallImpact] = useState<RainfallImpactResponse | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeMatch[]>([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const locName = activeLocation.name;
  const curProb = alertScore?.probability ?? prediction?.probability ?? 0;
  const isThresholdCrossed = curProb >= 50;
  const deltaThreshold = Math.round((curProb - 50) * 10) / 10;

  const loadScoring = async () => {
    setLoading(true);
    const payload = { ...params, location: locName };
    try {
      const [score, impact, weekly] = await Promise.all([
        fetchAlertScoring(payload),
        fetchRainfallImpact(payload),
        fetchWeeklyReports(locName, activeLocation.lat, activeLocation.lng)
      ]);
      setAlertScore(score);
      setRainfallImpact(impact);
      setWeeklyReport(weekly);
    } catch (e) {
      console.error('Alert scoring load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScoring();
  }, [locName]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => setResults((await geocodeLocation(query.trim())).slice(0, 6)), 320);
    return () => clearTimeout(timer);
  }, [query]);

  const handleApplyLocation = async (loc: { name: string; lat: number; lng: number; country?: string }) => {
    setShowSearch(false);
    setQuery('');
    setResults([]);
    setIsFetchingLocation(true);
    try {
      const live = await fetchGlobalLiveTelemetry(loc.lat, loc.lng);
      const newParams = {
        ...params,
        rainfall24h: live.rainfall24h,
        rainfall72h: live.rainfall72h,
        temperature: live.temperature,
        humidity: live.humidity,
        pressure: live.pressure,
        windSpeed: live.windSpeed,
        elevation: live.elevation,
        latitude: loc.lat,
        longitude: loc.lng,
        location: `${loc.name}${loc.country ? ', ' + loc.country : ''}`
      };
      const predResult = await predictFloodRisk(newParams);
      setActiveLocation({ name: loc.name, country: loc.country ?? '', lat: loc.lat, lng: loc.lng });
      setParams(newParams);
      setPrediction(predResult);
    } catch (e) {
      console.error('Failed to update location:', e);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const weekRecords = (weeklyReport?.weekly_records ?? []) as any[];
  const incScenarios = (rainfallImpact?.increase_scenarios ?? []) as any[];
  const decScenarios = (rainfallImpact?.decrease_scenarios ?? []) as any[];
  const precautions = weeklyReport?.precautions;

  const handleExportWeekly = async () => {
    const header = 'Date,Day,Rainfall 24h (mm),Rainfall 72h (mm),Probability (%),Threshold Status,Water Depth (m),Status Summary';
    const rows = weekRecords.map((r) =>
      toCsvRow([r.date, r.day_name, r.rainfall_24h_mm, r.rainfall_72h_mm, r.probability, r.threshold_crossed ? 'BREACHED' : 'SAFE', r.peak_water_depth_m, r.status_summary])
    );
    try {
      await exportCsv(`FloodRisk_WeeklyReport_${locName}.csv`, [header, ...rows].join('\n'));
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.title}>Real-Time Alerts & 7-Day Rainfall Reports</Text>
      <Text style={styles.subtitle}>
        Automated 50% flood risk threshold scoring, 7-day retrospective tracking, and rainfall sensitivity analysis
        for <Text style={{ color: colors.accent, fontWeight: '700' }}>{locName}</Text>
      </Text>

      <View style={styles.locationBar}>
        <View style={styles.locationRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.locName}>{locName} {activeLocation.country ? `(${activeLocation.country})` : ''}</Text>
            <Text style={styles.locMeta}>
              24h: {params.rainfall24h}mm · 72h: {params.rainfall72h}mm · Elev: {params.elevation}m
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.riskLabel}>Current ML Risk</Text>
            <Text style={[styles.riskValue, { color: isThresholdCrossed ? colors.danger : colors.success }]}>{curProb}%</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.changeLocBtn} onPress={() => setShowSearch((v) => !v)}>
          <Search size={13} color={colors.accent} />
          <Text style={styles.changeLocText}>{showSearch ? 'Close Location Bar' : 'Change Location'}</Text>
        </TouchableOpacity>

        {showSearch && (
          <View style={{ marginTop: 10 }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search any city..."
              placeholderTextColor={colors.textFaint}
              value={query}
              onChangeText={setQuery}
            />
            {results.length > 0 && (
              <View style={styles.dropdown}>
                {results.map((r, i) => (
                  <TouchableOpacity key={i} style={styles.dropdownRow} onPress={() => handleApplyLocation(r)}>
                    <Text style={styles.dropdownText}>{r.name}, {r.country}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.presetRow}>
              {PRESET_LOCATIONS.map((p) => (
                <TouchableOpacity key={p.name} style={styles.presetChip} onPress={() => handleApplyLocation(p)}>
                  <Text style={styles.presetChipText}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {isFetchingLocation && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {SUB_TABS.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setSubTab(t.id)} style={[styles.tabBtn, subTab === t.id && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, subTab === t.id && styles.tabBtnTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 12 }} />}

      {subTab === 'threshold' && !loading && (
        <View>
          <View style={[styles.heroCard, { backgroundColor: isThresholdCrossed ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', borderColor: isThresholdCrossed ? colors.danger : colors.success }]}>
            <View style={[styles.heroPill, { backgroundColor: isThresholdCrossed ? colors.danger : colors.success }]}>
              <Text style={styles.heroPillText}>
                {curProb >= 80 ? 'CRITICAL DISASTER EMERGENCY' : curProb >= 65 ? 'HIGH INUNDATION WARNING' : curProb >= 50 ? 'MODERATE SURCHARGE WATCH' : 'NORMAL / MONITORING'}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: isThresholdCrossed ? '#f87171' : '#34d399' }]}>
              {isThresholdCrossed ? `⚠️ 50% Threshold Breached for ${locName}` : `✅ Conditions Normal for ${locName}`}
            </Text>
            <Text style={styles.heroBody}>
              {alertScore?.description ?? (isThresholdCrossed
                ? `The AI scoring engine detected a breach at ${curProb}% (+${deltaThreshold}% above the 50% cutoff).`
                : `Risk for ${locName} is ${curProb}%, ${Math.abs(deltaThreshold)}% below the 50% danger line.`)}
            </Text>
            <View style={{ marginTop: 16 }}>
              <View style={styles.threshLabelsRow}>
                <Text style={styles.threshLabelText}>0% Safe</Text>
                <Text style={[styles.threshLabelText, { color: '#f59e0b', fontWeight: '800' }]}>50% CRITICAL</Text>
                <Text style={styles.threshLabelText}>100% Inundated</Text>
              </View>
              <View style={styles.threshTrack}>
                <View style={[styles.threshFill, { width: `${Math.min(100, Math.max(4, curProb))}%`, backgroundColor: curProb >= 70 ? colors.danger : curProb >= 50 ? '#f59e0b' : colors.success }]} />
                <View style={styles.threshMarker} />
              </View>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <MetricBox label="Threshold Cutoff" value="50.0%" />
            <MetricBox label="Status" value={isThresholdCrossed ? 'BREACHED' : 'SAFE'} color={isThresholdCrossed ? colors.danger : colors.success} />
            <MetricBox label="Est. Water Depth" value={isThresholdCrossed ? (curProb >= 75 ? '0.8-1.5m' : '0.3-0.7m') : '< 0.15m'} color={colors.accent} />
            <MetricBox label="Civic Lead Time" value="2-4 Hours" color="#8b5cf6" />
          </View>

          <View style={styles.actionBanner}>
            <Text style={styles.actionTitle}>📢 Automated Alert Protocol</Text>
            <Text style={styles.actionBody}>{alertScore?.action_required ?? 'Monitoring conditions.'}</Text>
          </View>
        </View>
      )}

      {subTab === 'weekly' && !loading && (
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Past 7-Day Chronological Ledger</Text>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportWeekly}>
              <Download size={12} color="#fff" />
              <Text style={styles.exportBtnText}>Export CSV</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metricGrid}>
            <MetricBox label="7-Day Total Rain" value={`${Math.round(weekRecords.reduce((a, r) => a + (r.rainfall_24h_mm ?? 0), 0))} mm`} color={colors.accent} />
            <MetricBox label="Days > 50%" value={`${weekRecords.filter((r) => r.threshold_crossed).length} of 7`} color={colors.danger} />
            <MetricBox label="Peak Depth" value={`${weekRecords.length ? Math.max(...weekRecords.map((r) => r.peak_water_depth_m ?? 0)) : 0} m`} color="#8b5cf6" />
          </View>
          {weekRecords.map((r, i) => (
            <View key={i} style={[styles.dayCard, r.threshold_crossed && { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayDate}>{r.date} <Text style={{ color: colors.textMuted, fontWeight: '400' }}>({r.day_name})</Text></Text>
                <Text style={[styles.dayProb, { color: r.probability >= 70 ? colors.danger : r.probability >= 50 ? '#f59e0b' : colors.success }]}>{r.probability}%</Text>
              </View>
              <Text style={styles.dayRain}>{r.rainfall_24h_mm}mm / {r.rainfall_72h_mm}mm · Depth {r.peak_water_depth_m}m</Text>
              <Text style={styles.daySummary}>{r.status_summary}</Text>
            </View>
          ))}
        </View>
      )}

      {subTab === 'sensitivity' && !loading && (
        <View>
          <Text style={styles.sectionTitle}>Rainfall Sensitivity & Inundation Elasticity</Text>
          <Text style={styles.sectionSubtitle}>How flood risk in {locName} responds to rainfall changes.</Text>

          <Text style={styles.scenarioGroupTitle}>🌧️ Rainfall Acceleration (+mm)</Text>
          {incScenarios.map((s, i) => (
            <View key={i} style={styles.scenarioCard}>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioLabel}>+{s.rainfall_increase_mm}mm (Total: {s.simulated_rainfall_24h}mm)</Text>
                <Text style={[styles.scenarioValue, { color: s.simulated_probability >= 70 ? colors.danger : '#f59e0b' }]}>{s.simulated_probability}% (+{s.risk_increase_delta}%)</Text>
              </View>
              <Text style={styles.scenarioBody}>{s.consequence_summary}</Text>
            </View>
          ))}

          <Text style={[styles.scenarioGroupTitle, { marginTop: 14 }]}>⛅ Rainfall Abatement (-mm)</Text>
          {decScenarios.map((s, i) => (
            <View key={i} style={styles.scenarioCard}>
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioLabel}>{s.scenario_label}</Text>
                <Text style={[styles.scenarioValue, { color: colors.success }]}>{s.simulated_probability}% (-{s.risk_reduction_delta}%)</Text>
              </View>
              <Text style={styles.scenarioBody}>{s.drainage_recovery_behavior}</Text>
            </View>
          ))}
        </View>
      )}

      {subTab === 'precautions' && !loading && (
        <View>
          <Text style={styles.sectionTitle}>Safety Directives for {locName}</Text>
          <Text style={styles.sectionSubtitle}>Civic guidelines tailored to the current {curProb}% inundation risk.</Text>

          <PrecautionGroup icon="🏠" title="Households & Residents" items={precautions?.citizens} />
          <PrecautionGroup icon="🚗" title="Commuters & Drivers" items={precautions?.commuters} />
          <PrecautionGroup icon="🏛️" title="Municipal Responders" items={precautions?.municipal_responders} />
        </View>
      )}
    </ScrollView>
  );
}

function MetricBox({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

function PrecautionGroup({ icon, title, items }: { icon: string; title: string; items?: PrecautionItem[] }) {
  return (
    <View style={styles.precautionCard}>
      <Text style={styles.precautionTitle}>{icon} {title}</Text>
      {(items ?? []).length === 0 && <Text style={styles.emptyText}>No specific directives at this time.</Text>}
      {(items ?? []).map((item, i) => (
        <View key={i} style={styles.precautionRow}>
          <View style={styles.precautionRowHeader}>
            <Text style={styles.precautionItemTitle}>{item.title}</Text>
            <View style={styles.importanceBadge}>
              <Text style={styles.importanceBadgeText}>{item.importance}</Text>
            </View>
          </View>
          <Text style={styles.precautionItem}>{item.action}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 6, marginBottom: 14, lineHeight: 17 },
  locationBar: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginBottom: 14 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  locName: { fontSize: 15, fontWeight: '800', color: colors.text },
  locMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  riskLabel: { fontSize: 10, color: colors.textMuted },
  riskValue: { fontSize: 20, fontWeight: '900' },
  changeLocBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#0f172a', borderWidth: 1, borderColor: colors.accentDark, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  changeLocText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  searchInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: colors.text },
  dropdown: { marginTop: 4, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8 },
  dropdownRow: { padding: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  dropdownText: { fontSize: 11, color: '#cbd5e1' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  presetChip: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  presetChipText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  tabBar: { gap: 6, marginBottom: 14 },
  tabBtn: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  tabBtnActive: { backgroundColor: '#111a2d', borderColor: colors.accent },
  tabBtnText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  tabBtnTextActive: { color: colors.accent },
  heroCard: { borderWidth: 1, borderRadius: 12, padding: 18, marginBottom: 14 },
  heroPill: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  heroPillText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  heroTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  heroBody: { fontSize: 12, color: '#cbd5e1', lineHeight: 17 },
  threshLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  threshLabelText: { fontSize: 10, color: colors.textMuted },
  threshTrack: { height: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 6, overflow: 'hidden', position: 'relative' },
  threshFill: { height: '100%', borderRadius: 6 },
  threshMarker: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, backgroundColor: '#f8fafc' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  metricBox: { flexBasis: '47%', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 12 },
  metricLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontWeight: '900', marginTop: 4 },
  actionBanner: { backgroundColor: colors.panel, borderLeftWidth: 4, borderLeftColor: colors.accentDark, borderRadius: 8, padding: 14 },
  actionTitle: { color: colors.accent, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  actionBody: { fontSize: 12, color: '#cbd5e1', lineHeight: 17 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  sectionSubtitle: { fontSize: 11, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentDark, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  exportBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  dayCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 12, marginBottom: 8 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  dayDate: { fontSize: 12, fontWeight: '700', color: colors.text },
  dayProb: { fontSize: 13, fontWeight: '800' },
  dayRain: { fontSize: 11, color: colors.accent, marginTop: 4 },
  daySummary: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  scenarioGroupTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 8 },
  scenarioCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 8 },
  scenarioHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  scenarioLabel: { fontSize: 12, fontWeight: '700', color: colors.text, flex: 1 },
  scenarioValue: { fontSize: 12, fontWeight: '800' },
  scenarioBody: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
  precautionCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 14, marginBottom: 10 },
  precautionTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  precautionRow: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 },
  precautionRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 8 },
  precautionItemTitle: { fontSize: 12, fontWeight: '700', color: colors.text, flex: 1 },
  importanceBadge: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: colors.danger, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  importanceBadgeText: { fontSize: 9, fontWeight: '700', color: colors.danger },
  precautionItem: { fontSize: 11, color: '#cbd5e1', lineHeight: 16 },
  emptyText: { fontSize: 11, color: colors.textFaint }
});
