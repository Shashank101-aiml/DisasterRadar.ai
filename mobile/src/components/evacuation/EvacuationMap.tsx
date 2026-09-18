import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import type { Shelter, RoadBlockage } from '../../constants/evacuationData';

interface GpsFix {
  lat: number;
  lng: number;
  elevation: number;
}

interface Props {
  gpsFix: GpsFix;
  shelters: Shelter[];
  blockages: RoadBlockage[];
  selectedShelter: Shelter;
  onSelectShelter: (s: Shelter) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: colors.danger,
  'HIGH WATCH': colors.warningAlt,
  'MODERATE WATCH': colors.warning,
  'CLEAR PASSWAY': colors.success
};

// MapLibre is native-only (no web renderer), so the browser-based verification loop
// used during development shows this list fallback instead of a blank view. The real
// on-device build renders the actual offline-capable MapLibre map below.
function MapFallbackList({ gpsFix, shelters, blockages, selectedShelter, onSelectShelter }: Props) {
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.fallbackGps}>
        <Text style={styles.fallbackGpsText}>📍 GPS: {gpsFix.lat}, {gpsFix.lng} · {gpsFix.elevation}m</Text>
      </View>
      {shelters.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.fallbackRow, s.id === selectedShelter.id && styles.fallbackRowActive]}
          onPress={() => onSelectShelter(s)}
        >
          <View style={[styles.fallbackDot, { backgroundColor: colors.success }]} />
          <Text style={styles.fallbackName}>{s.name}</Text>
        </TouchableOpacity>
      ))}
      {blockages.map((b) => (
        <View key={b.id} style={styles.fallbackRow}>
          <View style={[styles.fallbackDot, { backgroundColor: SEVERITY_COLOR[b.severity] }]} />
          <Text style={styles.fallbackName}>{b.name}</Text>
        </View>
      ))}
    </View>
  );
}

let NativeEvacuationMap: React.ComponentType<Props> | null = null;
if (Platform.OS !== 'web') {
  const MapLibre = require('@maplibre/maplibre-react-native');
  const { Map, Camera, Marker, GeoJSONSource, Layer } = MapLibre;
  const { EVACUATION_MAP_STYLE } = require('../../services/offlineMaps');

  const blockageGeoJson = (blockages: RoadBlockage[]) => ({
    type: 'FeatureCollection',
    features: blockages
      .filter((b) => b.polygon)
      .map((b) => ({
        type: 'Feature',
        properties: { color: SEVERITY_COLOR[b.severity] },
        geometry: { type: 'Polygon', coordinates: [b.polygon!.map(([lat, lng]) => [lng, lat])] }
      }))
  });

  NativeEvacuationMap = function NativeEvacuationMapImpl({ gpsFix, shelters, blockages, selectedShelter, onSelectShelter }: Props) {
    return (
      <Map style={{ flex: 1 }} mapStyle={EVACUATION_MAP_STYLE}>
        <Camera initialViewState={{ center: [gpsFix.lng, gpsFix.lat], zoom: 12 }} />

        <GeoJSONSource id="blockages" shape={blockageGeoJson(blockages) as any}>
          <Layer id="blockage-fill" type="fill" style={{ fillColor: ['get', 'color'], fillOpacity: 0.35 }} />
          <Layer id="blockage-outline" type="line" style={{ lineColor: ['get', 'color'], lineWidth: 2 }} />
        </GeoJSONSource>

        <Marker coordinate={[gpsFix.lng, gpsFix.lat]}>
          <View style={styles.gpsMarker}>
            <View style={styles.gpsMarkerCore} />
          </View>
        </Marker>

        {shelters.map((s) => (
          <Marker key={s.id} coordinate={[s.lng, s.lat]} onPress={() => onSelectShelter(s)}>
            <View style={[styles.shelterMarker, s.id === selectedShelter.id && styles.shelterMarkerActive]} />
          </Marker>
        ))}
      </Map>
    );
  };
}

export default function EvacuationMap(props: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Offline Evacuation Map</Text>
      <View style={styles.mapWrap}>
        {NativeEvacuationMap ? <NativeEvacuationMap {...props} /> : <MapFallbackList {...props} />}
      </View>
      <View style={styles.legend}>
        <LegendItem color={colors.success} label="Clear / Shelter" />
        <LegendItem color={colors.warning} label="Moderate" />
        <LegendItem color={colors.warningAlt} label="High Watch" />
        <LegendItem color={colors.danger} label="Critical" />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginBottom: 14 },
  title: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 10 },
  mapWrap: { height: 320, borderRadius: 10, overflow: 'hidden', backgroundColor: '#0f172a' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  legendLabel: { fontSize: 10, color: colors.textMuted },
  fallbackGps: { backgroundColor: colors.panelAlt, borderRadius: 8, padding: 10, marginBottom: 4 },
  fallbackGpsText: { fontSize: 11, color: colors.accent, fontWeight: '700' },
  fallbackRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.panelAlt, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 8, margin: 2 },
  fallbackRowActive: { borderColor: colors.accent },
  fallbackDot: { width: 9, height: 9, borderRadius: 5 },
  fallbackName: { fontSize: 11, color: colors.text, flex: 1 },
  gpsMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.3)', alignItems: 'center', justifyContent: 'center' },
  gpsMarkerCore: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, borderWidth: 2, borderColor: '#fff' },
  shelterMarker: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.success, borderWidth: 2, borderColor: '#fff' },
  shelterMarkerActive: { backgroundColor: colors.accent, width: 20, height: 20, borderRadius: 10 }
});
