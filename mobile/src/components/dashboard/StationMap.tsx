import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import type { StationData } from '../../types/api';

const RISK_COLOR: Record<string, string> = {
  low: '#84cc16',
  moderate: colors.warning,
  high: colors.warningAlt,
  severe: colors.danger
};

interface Props {
  stations: StationData[];
  onSelectStation: (station: StationData) => void;
}

// react-native-maps has no web renderer, so this app's only non-Android verification path
// (Expo web, used during development) shows a list fallback instead of a blank native view.
function StationListFallback({ stations, onSelectStation }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {stations.map((s) => (
        <TouchableOpacity key={s.name} style={styles.listRow} onPress={() => onSelectStation(s)}>
          <View style={[styles.listDot, { backgroundColor: RISK_COLOR[s.risk] ?? RISK_COLOR.low }]} />
          <Text style={styles.listName}>{s.name}</Text>
          <Text style={[styles.listProb, { color: RISK_COLOR[s.risk] ?? RISK_COLOR.low }]}>{s.prob}%</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

let NativeStationMap: React.ComponentType<Props> | null = null;
if (Platform.OS !== 'web') {
  // Lazy require so web bundles never pull in the native-only module.
  const MapView = require('react-native-maps').default;
  const { Marker, Callout } = require('react-native-maps');

  NativeStationMap = function NativeStationMapImpl({ stations, onSelectStation }: Props) {
    const first = stations[0];
    return (
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: first?.lat ?? 12.9716,
          longitude: first?.lng ?? 77.5946,
          latitudeDelta: 4,
          longitudeDelta: 4
        }}
      >
        {stations.map((s) => (
          <Marker key={s.name} coordinate={{ latitude: s.lat, longitude: s.lng }} pinColor={RISK_COLOR[s.risk] ?? RISK_COLOR.low}>
            <Callout onPress={() => onSelectStation(s)}>
              <View style={{ padding: 4, minWidth: 140 }}>
                <Text style={{ fontWeight: '700', fontSize: 13 }}>{s.name}</Text>
                <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                  Risk: {s.risk.toUpperCase()} ({s.prob}%)
                </Text>
                <Text style={{ fontSize: 11, color: '#1d64d8', fontWeight: '700' }}>Tap to load parameters</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    );
  };
}

export default function StationMap({ stations, onSelectStation }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Risk Map</Text>
      <View style={styles.mapWrap}>
        {NativeStationMap ? (
          <NativeStationMap stations={stations} onSelectStation={onSelectStation} />
        ) : (
          <StationListFallback stations={stations} onSelectStation={onSelectStation} />
        )}
      </View>

      <View style={styles.legend}>
        {(['low', 'moderate', 'high', 'severe'] as const).map((tier) => (
          <View key={tier} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: RISK_COLOR[tier] }]} />
            <Text style={styles.legendLabel}>{tier[0].toUpperCase() + tier.slice(1)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginTop: 12 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10 },
  mapWrap: { height: 280, borderRadius: 10, overflow: 'hidden', backgroundColor: '#0f172a' },
  legend: { flexDirection: 'row', gap: 14, marginTop: 10, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: colors.textMuted },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.panelAlt,
    borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, margin: 6
  },
  listDot: { width: 10, height: 10, borderRadius: 5 },
  listName: { flex: 1, fontSize: 13, color: colors.text, fontWeight: '600' },
  listProb: { fontSize: 13, fontWeight: '800' }
});
