import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as Clipboard from 'expo-clipboard';
import { Navigation, ShieldAlert, Radio, Copy, Check } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useOfflineStore } from '../store/useOfflineStore';
import { downloadEvacuationRegion, type DownloadProgress } from '../services/offlineMaps';
import { OFFLINE_SHELTERS, OFFLINE_ROAD_BLOCKAGES, calcDistanceKm, type Shelter } from '../constants/evacuationData';
import EvacuationMap from '../components/evacuation/EvacuationMap';

interface GpsFix {
  lat: number;
  lng: number;
  elevation: number;
  accuracy: number;
  status: string;
  timestamp: string;
  isRealHardwareGps: boolean;
}

const DEFAULT_GPS: GpsFix = {
  lat: 19.2952, lng: 72.8544, elevation: 14, accuracy: 4.2,
  status: 'AWAITING LOCK', timestamp: new Date().toLocaleTimeString(), isRealHardwareGps: false
};

export default function EvacuationScreen() {
  const { cachedRadiusKm, cacheMetadata, setCache, hydrate } = useOfflineStore();
  const [isOnline, setIsOnline] = useState(true);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [gpsFix, setGpsFix] = useState<GpsFix>(DEFAULT_GPS);
  const [isLockingGps, setIsLockingGps] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter>(OFFLINE_SHELTERS[0]);
  const [ledgerTab, setLedgerTab] = useState<'hazards' | 'shelters'>('hazards');
  const [sosCopied, setSosCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const effectiveOffline = simulateOffline || !isOnline;

  useEffect(() => {
    hydrate();
    const unsubscribe = NetInfo.addEventListener((state) => setIsOnline(Boolean(state.isConnected)));
    return unsubscribe;
  }, [hydrate]);

  const handleLockGps = async () => {
    setIsLockingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsFix((prev) => ({ ...prev, status: 'PERMISSION DENIED — using default zone', timestamp: new Date().toLocaleTimeString() }));
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsFix({
        lat: parseFloat(position.coords.latitude.toFixed(5)),
        lng: parseFloat(position.coords.longitude.toFixed(5)),
        elevation: position.coords.altitude ? Math.round(position.coords.altitude) : 14,
        accuracy: position.coords.accuracy ? parseFloat(position.coords.accuracy.toFixed(1)) : 5,
        status: 'LOCKED (GNSS)',
        timestamp: new Date().toLocaleTimeString(),
        isRealHardwareGps: true
      });
    } catch (e) {
      setGpsFix((prev) => ({ ...prev, status: 'GPS ERROR — using default zone', timestamp: new Date().toLocaleTimeString() }));
    } finally {
      setIsLockingGps(false);
    }
  };

  const handleDownloadRegion = async (radiusKm: number) => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadProgress({ percentage: 0, completedResourceCount: 0, completedResourceSize: 0 });
    try {
      const { pack, status } = await downloadEvacuationRegion(gpsFix.lat, gpsFix.lng, radiusKm, (p) => setDownloadProgress(p));
      await setCache(radiusKm, pack.id, {
        tilesCount: status.completedTileCount,
        sizeBytes: `${(status.completedResourceSize / (1024 * 1024)).toFixed(1)} MB`,
        lastSyncTime: `${new Date().toLocaleTimeString()} (Offline Cache Verified)`,
        status: `PHASE ${radiusKm}KM CACHE READY (OFFLINE)`
      });
    } catch (e: any) {
      setDownloadError(e?.message ?? 'Download failed — check network connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopySos = async () => {
    const dist = calcDistanceKm(gpsFix.lat, gpsFix.lng, selectedShelter.lat, selectedShelter.lng);
    const sosText =
      `[DISASTER SOS - OFFLINE BEACON]\n` +
      `LOCATION: ${gpsFix.lat}, ${gpsFix.lng} (Accuracy: ±${gpsFix.accuracy}m)\n` +
      `CURRENT ELEVATION: ${gpsFix.elevation}m MSL\n` +
      `CACHED SECTOR: ${cachedRadiusKm ?? 0}km Map Ready\n` +
      `EVACUATING TO: ${selectedShelter.name} (${dist}km away, Elev: ${selectedShelter.elevation}m)\n` +
      `ROUTE: Kanakia Ridge & Beverly Park Flyover (Avoiding Creek Bridge)\n` +
      `TIME: ${new Date().toLocaleString()}\n` +
      `BATTERY/OFFLINE TRANSMISSION VIA DISASTERRADAR.AI`;
    try {
      await Clipboard.setStringAsync(sosText);
      setSosCopied(true);
      setTimeout(() => setSosCopied(false), 3000);
    } catch (e) {
      console.error('SOS clipboard copy failed:', e);
    }
  };

  const distanceToTarget = calcDistanceKm(gpsFix.lat, gpsFix.lng, selectedShelter.lat, selectedShelter.lng);
  const activeBlockages = OFFLINE_ROAD_BLOCKAGES.filter((b) => b.severity !== 'CLEAR PASSWAY');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14 }}>
      <View style={styles.commandBar}>
        <View style={[styles.statusBadge, effectiveOffline && styles.statusBadgeOffline]}>
          <View style={[styles.statusDot, { backgroundColor: effectiveOffline ? colors.warningAlt : colors.success }]} />
          <Text style={styles.statusText}>{effectiveOffline ? 'OFFLINE RESCUE MODE' : 'ONLINE — TELEMETRY SYNCED'}</Text>
        </View>
        <TouchableOpacity style={styles.simBtn} onPress={() => setSimulateOffline((v) => !v)}>
          <Text style={styles.simBtnText}>{simulateOffline ? 'Exit Offline Simulation' : 'Simulate Offline Mode'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.lockBtn} onPress={handleLockGps} disabled={isLockingGps}>
          {isLockingGps ? <ActivityIndicator size="small" color="#fff" /> : <Navigation size={13} color="#fff" />}
          <Text style={styles.lockBtnText}>Lock Offline GPS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="GPS Fix" value={gpsFix.status.split(' ')[0]} sub={`±${gpsFix.accuracy}m accuracy`} />
        <MetricCard label="Target Shelter" value={`${distanceToTarget}km`} sub={selectedShelter.name.split(' ').slice(0, 3).join(' ')} />
        <MetricCard label="Blockages Avoided" value={String(activeBlockages.length)} sub="Active hazard zones" color={colors.danger} />
        <MetricCard label="Cached Sector" value={cachedRadiusKm ? `${cachedRadiusKm}km` : 'None'} sub={cacheMetadata?.status ?? 'Download a region below'} color={colors.accent} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>OFFLINE MAP & DISASTER CACHE DOWNLOADER</Text>
        <Text style={styles.sectionSubtitle}>
          Downloads real vector map tiles for the selected radius around your GPS fix, so the map keeps working with
          no network connection.
        </Text>
        <View style={styles.phaseRow}>
          {[5, 10, 15].map((km) => (
            <TouchableOpacity
              key={km}
              style={[styles.phaseBtn, cachedRadiusKm === km && styles.phaseBtnActive]}
              onPress={() => handleDownloadRegion(km)}
              disabled={isDownloading}
            >
              <Text style={[styles.phaseBtnText, cachedRadiusKm === km && styles.phaseBtnTextActive]}>{km} km</Text>
            </TouchableOpacity>
          ))}
        </View>
        {isDownloading && downloadProgress && (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(downloadProgress.percentage)}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(downloadProgress.percentage)}% · {downloadProgress.completedResourceCount} tiles ·{' '}
              {(downloadProgress.completedResourceSize / (1024 * 1024)).toFixed(1)} MB
            </Text>
          </View>
        )}
        {downloadError && <Text style={styles.errorText}>{downloadError}</Text>}
        {!isDownloading && cacheMetadata && (
          <Text style={styles.cacheInfo}>
            {cacheMetadata.tilesCount} tiles · {cacheMetadata.sizeBytes} · Synced {cacheMetadata.lastSyncTime}
          </Text>
        )}
      </View>

      <EvacuationMap
        gpsFix={gpsFix}
        shelters={OFFLINE_SHELTERS}
        blockages={OFFLINE_ROAD_BLOCKAGES}
        selectedShelter={selectedShelter}
        onSelectShelter={setSelectedShelter}
      />

      <View style={styles.card}>
        <View style={styles.ledgerTabs}>
          <TouchableOpacity onPress={() => setLedgerTab('hazards')} style={[styles.ledgerTab, ledgerTab === 'hazards' && styles.ledgerTabActive]}>
            <ShieldAlert size={13} color={ledgerTab === 'hazards' ? colors.accent : colors.textMuted} />
            <Text style={[styles.ledgerTabText, ledgerTab === 'hazards' && styles.ledgerTabTextActive]}>Hazard Ledger</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLedgerTab('shelters')} style={[styles.ledgerTab, ledgerTab === 'shelters' && styles.ledgerTabActive]}>
            <Radio size={13} color={ledgerTab === 'shelters' ? colors.accent : colors.textMuted} />
            <Text style={[styles.ledgerTabText, ledgerTab === 'shelters' && styles.ledgerTabTextActive]}>Shelters</Text>
          </TouchableOpacity>
        </View>

        {ledgerTab === 'hazards' &&
          OFFLINE_ROAD_BLOCKAGES.map((b) => {
            const isClear = b.severity === 'CLEAR PASSWAY';
            const color = isClear ? colors.success : b.severity === 'CRITICAL' ? colors.danger : b.severity === 'HIGH WATCH' ? colors.warningAlt : colors.warning;
            return (
              <View key={b.id} style={styles.hazardRow}>
                <View style={styles.hazardHeader}>
                  <Text style={styles.hazardName}>{b.name}</Text>
                  <View style={[styles.hazardBadge, { backgroundColor: `${color}22`, borderColor: color }]}>
                    <Text style={[styles.hazardBadgeText, { color }]}>{b.severity}</Text>
                  </View>
                </View>
                <Text style={styles.hazardMeta}>{b.roadType} · {b.waterDepth}</Text>
                <Text style={styles.hazardDetour}>{isClear ? b.detourRecommended : `Detour: ${b.detourRecommended}`}</Text>
              </View>
            );
          })}

        {ledgerTab === 'shelters' &&
          OFFLINE_SHELTERS.map((s) => {
            const isSelected = s.id === selectedShelter.id;
            const occupancyPct = Math.round((s.occupied / s.capacity) * 100);
            return (
              <TouchableOpacity key={s.id} style={[styles.shelterRow, isSelected && styles.shelterRowActive]} onPress={() => setSelectedShelter(s)}>
                <View style={styles.hazardHeader}>
                  <Text style={styles.hazardName}>{s.name}</Text>
                  <Text style={styles.shelterElev}>{s.elevation}m</Text>
                </View>
                <Text style={styles.hazardMeta}>{s.type} · {occupancyPct}% occupied · {s.safetyRating}</Text>
                {s.medicalStation && <Text style={styles.shelterMedical}>⚕ Medical station on-site</Text>}
              </TouchableOpacity>
            );
          })}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TURN-BY-TURN SAFE NAVIGATION (OFFLINE SOP)</Text>
        <DirectionStep num="1" title={`Depart Current Location (${gpsFix.lat}, ${gpsFix.lng})`} body={`Head toward the ridge corridor. Elevation is currently ${gpsFix.elevation}m.`} color={colors.accentDark} />
        <DirectionStep num="!" title="HAZARD AVOIDANCE: Avoid Creek Bridge & Subway" body="Do NOT take the Western Railway subway or Creek bridge. Submerged with 1.25m water." color={colors.danger} />
        <DirectionStep num="2" title="Ascend Beverly Park Flyover (Elevated Passway)" body="Take the grade-separated overpass ramp. Safe elevation 28m above ground runoff." color={colors.success} />
        <DirectionStep num="3" title="Continue along Kanakia High Ridge Road" body="Ridge elevation 36m-42m provides zero flood accumulation." color={colors.success} />
        <DirectionStep num="🏁" title={`Arrive at ${selectedShelter.name}`} body="Register with Civil Defense Officers. Medical post on ground floor." color={colors.accent} />

        <TouchableOpacity style={styles.sosBtn} onPress={handleCopySos}>
          {sosCopied ? <Check size={16} color="#fff" /> : <Copy size={16} color="#fff" />}
          <Text style={styles.sosBtnText}>{sosCopied ? 'SOS BEACON COPIED FOR SMS/RADIO' : 'COPY OFFLINE SOS BEACON FOR SMS / RADIO'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MetricCard({ label, value, sub, color = colors.text }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSub} numberOfLines={1}>{sub}</Text>
    </View>
  );
}

function DirectionStep({ num, title, body, color }: { num: string; title: string; body: string; color: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepBadge, { backgroundColor: color }]}>
        <Text style={styles.stepBadgeText}>{num}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.stepTitle, { color }]}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commandBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  statusBadgeOffline: { backgroundColor: 'rgba(249,115,22,0.12)', borderColor: colors.warningAlt },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#cbd5e1' },
  simBtn: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  simBtnText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  lockBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentDark, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  lockBtnText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  metricCard: { flexBasis: '47%', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 12 },
  metricLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  metricSub: { fontSize: 10, color: colors.textFaint, marginTop: 2 },
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
  sectionSubtitle: { fontSize: 11, color: colors.textMuted, marginBottom: 12, lineHeight: 15 },
  phaseRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  phaseBtn: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  phaseBtnActive: { backgroundColor: colors.accentDark, borderColor: colors.accent },
  phaseBtnText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  phaseBtnTextActive: { color: '#fff' },
  progressWrap: { marginTop: 4 },
  progressTrack: { height: 8, backgroundColor: '#0f172a', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  progressText: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  errorText: { fontSize: 11, color: '#f87171', marginTop: 6 },
  cacheInfo: { fontSize: 10, color: colors.success, marginTop: 6 },
  ledgerTabs: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  ledgerTab: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  ledgerTabActive: { borderColor: colors.accent, backgroundColor: '#111a2d' },
  ledgerTabText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  ledgerTabTextActive: { color: colors.accent },
  hazardRow: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 },
  hazardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  hazardName: { fontSize: 12, fontWeight: '700', color: colors.text, flex: 1 },
  hazardBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  hazardBadgeText: { fontSize: 9, fontWeight: '800' },
  hazardMeta: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  hazardDetour: { fontSize: 10, color: '#cbd5e1', marginTop: 2 },
  shelterRow: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 },
  shelterRowActive: { borderColor: colors.accent, backgroundColor: '#111a2d' },
  shelterElev: { fontSize: 11, color: colors.success, fontWeight: '700' },
  shelterMedical: { fontSize: 10, color: colors.accent, marginTop: 4 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stepBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  stepTitle: { fontSize: 12, fontWeight: '700' },
  stepBody: { fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 15 },
  sosBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#dc2626', borderWidth: 1, borderColor: colors.danger, borderRadius: 8, paddingVertical: 12, marginTop: 8 },
  sosBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 }
});
