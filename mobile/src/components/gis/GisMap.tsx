import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import type { MiraBhayandarGisData } from '../../types/api';
import PulseBeacon from './PulseBeacon';

interface TargetLocation {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  gisData: MiraBhayandarGisData | null;
  targetLocation: TargetLocation;
  isMiraBhayandar: boolean;
  predictionProbability?: number;
}

function GisFallbackList({ gisData, targetLocation, isMiraBhayandar }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {isMiraBhayandar && gisData ? (
        gisData.zones.map((z) => (
          <View key={z.id} style={styles.fallbackRow}>
            <View style={[styles.fallbackDot, { backgroundColor: z.color }]} />
            <Text style={styles.fallbackName}>{z.name}</Text>
            <Text style={styles.fallbackMeta}>{z.riskLevel}</Text>
          </View>
        ))
      ) : (
        <View style={styles.fallbackRow}>
          <View style={[styles.fallbackDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.fallbackName}>{targetLocation.name}</Text>
        </View>
      )}
    </View>
  );
}

let NativeGisMap: React.ComponentType<Props> | null = null;
if (Platform.OS !== 'web') {
  const MapView = require('react-native-maps').default;
  const { Polygon, Polyline, Marker, Callout } = require('react-native-maps');

  NativeGisMap = function NativeGisMapImpl({ gisData, targetLocation, isMiraBhayandar, predictionProbability }: Props) {
    return (
      <MapView
        style={StyleSheet.absoluteFill}
        mapType="terrain"
        initialRegion={{
          latitude: targetLocation.lat,
          longitude: targetLocation.lng,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12
        }}
      >
        {isMiraBhayandar && gisData ? (
          <>
            {gisData.zones.map((z) => (
              <Polygon
                key={z.id}
                coordinates={z.coordinates.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))}
                strokeColor="#ffffff"
                strokeWidth={1.5}
                fillColor={`${z.color}${Math.round(z.fillOpacity * 255).toString(16).padStart(2, '0')}`}
                tappable
              />
            ))}
            <Polyline
              coordinates={gisData.railway.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))}
              strokeColor="#1d4ed8"
              strokeWidth={4}
            />
            {gisData.roads.map((road, i) => (
              <Polyline
                key={i}
                coordinates={road.map(([lat, lng]) => ({ latitude: lat, longitude: lng }))}
                strokeColor="#0f172a"
                strokeWidth={2}
              />
            ))}
            {gisData.hotspots.map((h) => (
              <Marker key={h.name} coordinate={{ latitude: h.lat, longitude: h.lng }} pinColor={colors.danger}>
                <Callout>
                  <View style={{ padding: 4, minWidth: 140 }}>
                    <Text style={{ fontWeight: '700', fontSize: 12 }}>{h.name}</Text>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>{h.status} — {h.depth}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
            <Marker
              coordinate={{ latitude: gisData.metadata.center[0], longitude: gisData.metadata.center[1] }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges
            >
              <PulseBeacon color={colors.accent} />
            </Marker>
          </>
        ) : (
          <Marker
            coordinate={{ latitude: targetLocation.lat, longitude: targetLocation.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
          >
            <PulseBeacon
              color={predictionProbability && predictionProbability > 70 ? colors.danger : predictionProbability && predictionProbability > 40 ? colors.warning : colors.success}
            />
            <Callout>
              <View style={{ padding: 4, minWidth: 140 }}>
                <Text style={{ fontWeight: '700', fontSize: 12 }}>{targetLocation.name}</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>
    );
  };
}

export default function GisMap(props: Props) {
  return (
    <View style={styles.mapWrap}>
      {NativeGisMap ? <NativeGisMap {...props} /> : <GisFallbackList {...props} />}
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { height: 340, borderRadius: 10, overflow: 'hidden', backgroundColor: '#0f172a' },
  fallbackRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.panelAlt, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, margin: 6 },
  fallbackDot: { width: 10, height: 10, borderRadius: 5 },
  fallbackName: { flex: 1, fontSize: 12, color: colors.text, fontWeight: '600' },
  fallbackMeta: { fontSize: 11, color: colors.textMuted }
});
