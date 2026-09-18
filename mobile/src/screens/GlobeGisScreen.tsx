import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Navigation2 } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { fetchMiraBhayandarGIS, predictFloodRisk } from '../services/api';
import { geocodeLocation, fetchGlobalLiveTelemetry, type GeocodeMatch } from '../services/geocoding';
import type { MiraBhayandarGisData } from '../types/api';
import GisMap from '../components/gis/GisMap';

const PRESET_HOTSPOTS = [
  { name: 'Mira Bhayandar', country: 'India', lat: 19.2952, lng: 72.8544, desc: 'MBMC Coastal Creek Plain' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, desc: 'Mithi River Basin' },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, desc: 'Urban Valley & Lake Overflows' },
  { name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, desc: 'Atlantic Coastal Sea Rise' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, desc: 'North Jakarta Subsidence' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, desc: 'Arakawa Storm Surge Basin' },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155, desc: 'Lagoon Tidal Acqua Alta' },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, desc: 'Thames Barrier Inundation' }
];

export default function GlobeGisScreen() {
  const navigation = useNavigation<any>();
  const { activeLocation, setActiveLocation, setParams, setPrediction, prediction } = useAppStore();
  const [gisData, setGisData] = useState<MiraBhayandarGisData | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [telemetry, setTelemetry] = useState<{ rainfall24h: number; rainfall72h: number; elevation: number; temperature: number; humidity: number } | null>(null);

  const isMiraBhayandar = Math.abs(activeLocation.lat - 19.2952) < 0.1 && Math.abs(activeLocation.lng - 72.8544) < 0.1;

  useEffect(() => {
    fetchMiraBhayandarGIS().then(setGisData).catch(() => setGisData(null));
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => setResults((await geocodeLocation(query.trim())).slice(0, 6)), 320);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectLocation = async (loc: { name: string; lat: number; lng: number; country?: string }) => {
    setQuery('');
    setResults([]);
    setIsLoading(true);
    try {
      const live = await fetchGlobalLiveTelemetry(loc.lat, loc.lng);
      const newParams = {
        rainfall24h: live.rainfall24h, rainfall72h: live.rainfall72h, temperature: live.temperature,
        humidity: live.humidity, pressure: live.pressure ?? 1008, windSpeed: live.windSpeed ?? 12,
        elevation: live.elevation, latitude: loc.lat, longitude: loc.lng,
        location: `${loc.name}${loc.country ? ', ' + loc.country : ''}`
      };
      const predResult = await predictFloodRisk(newParams);
      setActiveLocation({ name: loc.name, country: loc.country ?? '', lat: loc.lat, lng: loc.lng });
      setParams(newParams);
      setPrediction(predResult);
      setTelemetry({ rainfall24h: live.rainfall24h, rainfall72h: live.rainfall72h, elevation: live.elevation, temperature: live.temperature, humidity: live.humidity });
    } catch (e) {
      console.error('GIS location update failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.title}>🗺️ High-Resolution Topographic GIS Atlas</Text>
      <Text style={styles.subtitle}>
        Real Mira Bhayandar risk-zone polygons, railway, and roads served from the backend GIS endpoint. Search any
        global city for a live risk pin.
      </Text>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search any city or district worldwide..."
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
        />
        {isLoading && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
        {results.length > 0 && (
          <View style={styles.dropdown}>
            {results.map((r, i) => (
              <TouchableOpacity key={i} style={styles.dropdownRow} onPress={() => handleSelectLocation(r)}>
                <Text style={styles.dropdownText}>{r.name}, {r.country}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hotspotRow}>
        {PRESET_HOTSPOTS.map((h) => {
          const isActive = activeLocation.name === h.name;
          return (
            <TouchableOpacity key={h.name} style={[styles.hotspotChip, isActive && styles.hotspotChipActive]} onPress={() => handleSelectLocation(h)}>
              <Text style={[styles.hotspotName, isActive && styles.hotspotNameActive]}>{h.name}</Text>
              <Text style={styles.hotspotDesc}>{h.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <GisMap gisData={gisData} targetLocation={activeLocation} isMiraBhayandar={isMiraBhayandar} predictionProbability={prediction?.probability} />

      {telemetry && (
        <View style={styles.hudCard}>
          <Text style={styles.hudTitle}>LIVE TELEMETRY</Text>
          <View style={styles.hudGrid}>
            <HudStat label="Rain 24h" value={`${telemetry.rainfall24h}mm`} />
            <HudStat label="Rain 72h" value={`${telemetry.rainfall72h}mm`} />
            <HudStat label="Elevation" value={`${telemetry.elevation}m`} />
            <HudStat label="Temp" value={`${telemetry.temperature}°C`} />
          </View>
        </View>
      )}

      {prediction && (
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.hudTitle}>AI PREDICTION — {activeLocation.name}</Text>
            <Text style={[styles.aiProb, { color: prediction.probability > 70 ? colors.danger : prediction.probability > 40 ? colors.warning : colors.success }]}>
              {prediction.probability}%
            </Text>
          </View>
          <Text style={styles.aiAdvisory}>{prediction.recommendation}</Text>
          <TouchableOpacity style={styles.transferBtn} onPress={() => navigation.navigate('PredictRisk')}>
            <Navigation2 size={13} color="#fff" />
            <Text style={styles.transferBtnText}>Transfer to Full Prediction Engine</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function HudStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.hudStatLabel}>{label}</Text>
      <Text style={styles.hudStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 6, marginBottom: 12, lineHeight: 16 },
  searchBar: { marginBottom: 10 },
  searchInput: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: colors.text },
  dropdown: { marginTop: 4, backgroundColor: colors.panel, borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', borderRadius: 8 },
  dropdownRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  dropdownText: { fontSize: 12, color: '#cbd5e1' },
  hotspotRow: { gap: 8, marginBottom: 12, paddingVertical: 2 },
  hotspotChip: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 10, width: 150 },
  hotspotChipActive: { borderColor: colors.accent, backgroundColor: '#111a2d' },
  hotspotName: { fontSize: 12, fontWeight: '700', color: colors.text },
  hotspotNameActive: { color: colors.accent },
  hotspotDesc: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  hudCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginTop: 12 },
  hudTitle: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 8 },
  hudGrid: { flexDirection: 'row' },
  hudStatLabel: { fontSize: 9, color: colors.textFaint },
  hudStatValue: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 2 },
  aiCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 20 },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  aiProb: { fontSize: 20, fontWeight: '900' },
  aiAdvisory: { fontSize: 12, color: '#cbd5e1', lineHeight: 17, marginBottom: 10 },
  transferBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.accentDark, borderRadius: 8, paddingVertical: 9 },
  transferBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' }
});
