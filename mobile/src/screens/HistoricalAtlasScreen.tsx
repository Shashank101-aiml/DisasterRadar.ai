import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Download } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { fetchHistoricalEvents, fetchPredictionAuditLog } from '../services/api';
import { exportCsv, toCsvRow } from '../services/csvExport';
import type { HistoricalEvent, PredictionAuditRow } from '../types/api';

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const;

const SEVERITY_STYLE: Record<string, { bg: string; color: string }> = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', color: colors.danger },
  HIGH: { bg: 'rgba(249,115,22,0.15)', color: colors.warningAlt },
  MODERATE: { bg: 'rgba(234,179,8,0.15)', color: colors.warning },
  LOW: { bg: 'rgba(16,185,129,0.15)', color: colors.success }
};

function areaHazard(locName: string): string {
  const l = locName.toLowerCase();
  if (l.includes('mira') || l.includes('bhayandar')) return 'Creek Tidal Backflow & Siltation';
  if (l.includes('miami')) return 'King Tide & Coastal Sea Rise';
  if (l.includes('tokyo')) return 'Typhoon Surge & River Crest';
  if (l.includes('venice')) return 'Lagoon Tidal Acqua Alta';
  if (l.includes('london')) return 'Thames Estuary Barrier Overtopping';
  if (l.includes('bengaluru')) return 'Encroached Valley Lake Spillways';
  return 'Urban Runoff & Topographic Surcharge';
}

/** Scopes the full event set to the active location, mirroring the web app's matching rules. */
function scopeToLocation(allEvents: HistoricalEvent[], locName: string): HistoricalEvent[] {
  const l = locName.toLowerCase();
  const isMira = l.includes('mira') || l.includes('bhayandar') || l.includes('mbmc');
  const isMiami = l.includes('miami');
  const isTokyo = l.includes('tokyo');
  const isVenice = l.includes('venice');
  const isLondon = l.includes('london');

  return allEvents.filter((ev) => {
    const target = `${ev.location ?? ''} ${ev.region ?? ''} ${ev.state ?? ''} ${ev.event_name ?? ''}`.toLowerCase();
    if (isMira) return ['mira', 'bhayandar', 'mbmc', 'rai creek', 'golden nest'].some((k) => target.includes(k));
    if (isMiami) return ['miami', 'florida', 'brickell'].some((k) => target.includes(k));
    if (isTokyo) return ['tokyo', 'japan', 'arakawa', 'kanda'].some((k) => target.includes(k));
    if (isVenice) return ['venice', 'italy', 'lagoon'].some((k) => target.includes(k));
    if (isLondon) return ['london', 'uk', 'thames'].some((k) => target.includes(k));
    return target.includes(l);
  });
}

export default function HistoricalAtlasScreen() {
  const activeLocation = useAppStore((s) => s.activeLocation);
  const locName = activeLocation.name;

  const [subTab, setSubTab] = useState<'events' | 'audit'>('events');
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<PredictionAuditRow[]>([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchHistoricalEvents({ limit: 200 }), fetchPredictionAuditLog(15)])
      .then(([evs, logs]) => {
        if (cancelled) return;
        setAllEvents(evs);
        setAuditLogs(logs);
      })
      .catch((e) => !cancelled && setError(e?.message ?? 'Failed to load historical data'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const locationEvents = useMemo(() => scopeToLocation(allEvents, locName), [allEvents, locName]);

  const events = useMemo(() => {
    const q = search.toLowerCase();
    return locationEvents.filter((ev) => {
      const matchesSearch = !q || [ev.event_name, ev.location, ev.primary_cause].some((f) => f?.toLowerCase().includes(q));
      const matchesSeverity = severity === 'ALL' || ev.severity === severity;
      return matchesSearch && matchesSeverity;
    });
  }, [locationEvents, search, severity]);

  const maxRain = useMemo(() => (locationEvents.length ? Math.max(...locationEvents.map((e) => e.rainfall_24h_mm || 0)) : 0), [locationEvents]);
  const avgDepth = useMemo(() => {
    if (!locationEvents.length) return 0;
    return Math.round((locationEvents.reduce((a, e) => a + (e.peak_water_level_m || 0), 0) / locationEvents.length) * 100) / 100;
  }, [events]);

  const handleExport = async () => {
    const header = 'Event Name,Location,Date,Rainfall 24h (mm),Rainfall 72h (mm),Peak Depth (m),Severity,Cause,Evacuated';
    const rows = events.map((e) =>
      toCsvRow([e.event_name, e.location, e.event_date, e.rainfall_24h_mm, e.rainfall_72h_mm, e.peak_water_level_m, e.severity, e.primary_cause, e.evacuated_count])
    );
    try {
      await exportCsv(`DisasterRadar_${locName}_Events.csv`, [header, ...rows].join('\n'));
    } catch (e) {
      console.error('CSV export failed:', e);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.title}>Historical Flood Registry & Disaster Archive</Text>
      <Text style={styles.subtitle}>
        Documented extreme flood events, peak water depths, and machine learning audit trails scoped to{' '}
        <Text style={{ color: colors.accent, fontWeight: '700' }}>{locName}</Text>
      </Text>

      <View style={styles.kpiGrid}>
        <KpiCard label="Cataloged Disasters" value={String(events.length)} sub={`Verified events in ${locName}`} color={colors.accent} />
        <KpiCard label="Record 24h Rainfall" value={`${maxRain} mm`} sub="Peak Historical Downpour" color={colors.text} />
        <KpiCard label="Avg Inundation Depth" value={`${avgDepth} m`} sub="Low-Lying Chronic Bottlenecks" color={colors.danger} />
        <KpiCard label="Primary Area Hazard" value={areaHazard(locName)} sub="Dominant Vulnerability Factor" color={colors.warningAlt} small />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => setSubTab('events')} style={[styles.tabBtn, subTab === 'events' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, subTab === 'events' && styles.tabBtnTextActive]}>📜 Disasters ({events.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSubTab('audit')} style={[styles.tabBtn, subTab === 'audit' && styles.tabBtnActive]}>
          <Text style={[styles.tabBtnText, subTab === 'audit' && styles.tabBtnTextActive]}>🕒 Prediction Audit Log</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} size="small" />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {subTab === 'events' && (
        <View>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${locName} disasters by event, cause, or ward...`}
              placeholderTextColor={colors.textFaint}
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
              <Download size={13} color="#fff" />
              <Text style={styles.exportBtnText}>Export CSV</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 14 }}>
            {SEVERITIES.map((s) => (
              <TouchableOpacity key={s} onPress={() => setSeverity(s)} style={[styles.sevChip, severity === s && styles.sevChipActive]}>
                <Text style={[styles.sevChipText, severity === s && styles.sevChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {events.map((ev) => {
            const sevStyle = SEVERITY_STYLE[ev.severity] ?? SEVERITY_STYLE.MODERATE;
            return (
              <View key={ev.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventName}>{ev.event_name}</Text>
                    <Text style={styles.eventDate}>📅 {ev.event_date} ({ev.year})</Text>
                  </View>
                  <View style={[styles.sevBadge, { backgroundColor: sevStyle.bg }]}>
                    <Text style={[styles.sevBadgeText, { color: sevStyle.color }]}>{ev.severity}</Text>
                  </View>
                </View>
                <Text style={styles.eventRegion}>{ev.region} — {ev.location}</Text>
                <View style={styles.eventStatsRow}>
                  <Text style={styles.eventStat}><Text style={styles.eventStatBold}>{ev.rainfall_24h_mm} mm</Text> (24h) / {ev.rainfall_72h_mm} mm (72h)</Text>
                  <Text style={[styles.eventStat, { color: colors.danger, fontWeight: '800' }]}>{ev.peak_water_level_m} m peak</Text>
                </View>
                <Text style={styles.eventCause}><Text style={styles.eventStatBold}>Cause: </Text>{ev.primary_cause}</Text>
                <Text style={styles.eventImpact}>
                  <Text style={{ color: '#cbd5e1' }}>Impact: </Text>{ev.damage_assessment} (Evacuated: {ev.evacuated_count?.toLocaleString() ?? 'N/A'})
                </Text>
                <Text style={styles.eventSource}>Source: {ev.verified_source}</Text>
              </View>
            );
          })}
          {!loading && events.length === 0 && <Text style={styles.emptyText}>No documented events match these filters.</Text>}
        </View>
      )}

      {subTab === 'audit' && (
        <View>
          <View style={styles.auditNote}>
            <Text style={styles.auditNoteTitle}>Persistent ML Audit Trail:</Text>
            <Text style={styles.auditNoteText}>
              Every model prediction executed via POST /api/predict is recorded with environmental telemetry and
              its dominant risk driver.
            </Text>
          </View>
          {auditLogs.map((log) => {
            const sevStyle = SEVERITY_STYLE[log.risk_level] ?? SEVERITY_STYLE.MODERATE;
            const probColor = log.probability >= 70 ? colors.danger : log.probability >= 50 ? colors.warningAlt : colors.success;
            return (
              <View key={log.id} style={styles.auditRow}>
                <View style={styles.auditRowHeader}>
                  <Text style={styles.auditLocation}>{log.location}</Text>
                  <Text style={[styles.auditProb, { color: probColor }]}>{log.probability}%</Text>
                </View>
                <Text style={styles.auditMeta}>{log.timestamp} · {log.rainfall_24h}mm/{log.rainfall_72h}mm · {log.elevation}m elev</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <View style={[styles.sevBadge, { backgroundColor: sevStyle.bg }]}>
                    <Text style={[styles.sevBadgeText, { color: sevStyle.color }]}>{log.risk_level}</Text>
                  </View>
                  <Text style={styles.auditDriver}>{log.primary_driver}</Text>
                </View>
              </View>
            );
          })}
          {!loading && auditLogs.length === 0 && <Text style={styles.emptyText}>No predictions logged yet.</Text>}
        </View>
      )}
    </ScrollView>
  );
}

function KpiCard({ label, value, sub, color, small }: { label: string; value: string; sub: string; color: string; small?: boolean }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[small ? styles.kpiValueSmall : styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 6, lineHeight: 17, marginBottom: 14 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: { flexBasis: '47%', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14 },
  kpiLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  kpiValue: { fontSize: 22, fontWeight: '900', marginTop: 4 },
  kpiValueSmall: { fontSize: 13, fontWeight: '800', marginTop: 6, lineHeight: 17 },
  kpiSub: { fontSize: 10, color: colors.textFaint, marginTop: 2 },
  tabRow: { flexDirection: 'row', gap: 8, borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 14 },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: colors.accentDark },
  tabBtnText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  tabBtnTextActive: { color: colors.accent },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  errorText: { color: '#f87171', fontSize: 12, marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchInput: {
    flex: 1, backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9, fontSize: 12, color: colors.text
  },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentDark, borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
  exportBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sevChip: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  sevChipActive: { backgroundColor: colors.accentDark, borderColor: colors.accentDark },
  sevChipText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  sevChipTextActive: { color: '#fff' },
  eventCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 14, marginBottom: 10 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  eventName: { fontSize: 13, fontWeight: '800', color: colors.text },
  eventDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  sevBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  sevBadgeText: { fontSize: 10, fontWeight: '800' },
  eventRegion: { fontSize: 11, color: colors.accent, fontWeight: '700', marginTop: 8 },
  eventStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  eventStat: { fontSize: 11, color: colors.textMuted },
  eventStatBold: { color: colors.text, fontWeight: '700' },
  eventCause: { fontSize: 11, color: '#cbd5e1', marginTop: 8, lineHeight: 16 },
  eventImpact: { fontSize: 10, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  eventSource: { fontSize: 9, color: colors.textFaint, marginTop: 4 },
  emptyText: { fontSize: 12, color: colors.textFaint, textAlign: 'center', marginTop: 20 },
  auditNote: { backgroundColor: colors.panel, borderLeftWidth: 4, borderLeftColor: colors.accentDark, borderRadius: 8, padding: 12, marginBottom: 12 },
  auditNoteTitle: { fontSize: 12, fontWeight: '700', color: colors.accent },
  auditNoteText: { fontSize: 11, color: colors.textMuted, marginTop: 3, lineHeight: 15 },
  auditRow: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 12, marginBottom: 8 },
  auditRowHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  auditLocation: { fontSize: 12, fontWeight: '700', color: colors.text },
  auditProb: { fontSize: 13, fontWeight: '800' },
  auditMeta: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  auditDriver: { fontSize: 10, color: colors.accent, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }
});
