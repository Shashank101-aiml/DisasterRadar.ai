import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RefreshCw, MapPin } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import type { PredictionInput } from '../../types/api';
import { fetchLiveWeather } from '../../services/api';

interface Props {
  params: PredictionInput;
  onChange: (field: keyof PredictionInput, value: string) => void;
  onPredict: () => void;
  isLoading: boolean;
  /** Bump this from the parent whenever params change externally (e.g. a map station
   *  was selected) so the locally-cached row text resyncs. Typing does NOT bump this. */
  externalVersion?: number;
}

const PRESETS = [
  { label: 'Mira Bhayandar', name: 'Mira Bhayandar, India', lat: 19.2952, lng: 72.8544 },
  { label: 'Mumbai', name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
  { label: 'Bengaluru', name: 'Bengaluru, India', lat: 12.9716, lng: 77.5946 },
  { label: 'Chennai', name: 'Chennai, India', lat: 13.0827, lng: 80.2707 }
];

const FIELDS: Array<{ key: keyof PredictionInput; label: string; unit: string; step: string }> = [
  { key: 'rainfall24h', label: 'Rainfall (24h)', unit: 'mm', step: '0.1' },
  { key: 'rainfall72h', label: 'Rainfall (72h)', unit: 'mm', step: '0.1' },
  { key: 'temperature', label: 'Temperature', unit: '°C', step: '0.1' },
  { key: 'humidity', label: 'Humidity', unit: '%', step: '1' },
  { key: 'windSpeed', label: 'Wind Speed', unit: 'km/h', step: '0.1' },
  { key: 'pressure', label: 'Atmospheric Pressure', unit: 'hPa', step: '1' },
  { key: 'elevation', label: 'Elevation', unit: 'm', step: '1' },
  { key: 'latitude', label: 'Latitude', unit: '', step: '0.0001' },
  { key: 'longitude', label: 'Longitude', unit: '', step: '0.0001' }
];

// Manages its own draft text so mid-typing partial/negative values (e.g. "-7" for a
// southern-hemisphere latitude) never get stomped by the parent's numeric round-trip.
// Remounts (via the `key` the parent assigns) whenever a preset/sync updates params
// externally, so it still picks up those changes.
function ParamRow({ label, unit, initialValue, onChangeText }: { label: string; unit: string; initialValue: string; onChangeText: (v: string) => void }) {
  const [text, setText] = useState(initialValue);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowInputWrap}>
        <TextInput
          style={styles.rowInput}
          keyboardType="numbers-and-punctuation"
          value={text}
          onChangeText={(v) => {
            setText(v);
            onChangeText(v);
          }}
        />
        {!!unit && <Text style={styles.rowUnit}>{unit}</Text>}
      </View>
    </View>
  );
}

export default function InputParameters({ params, onChange, onPredict, isLoading, externalVersion = 0 }: Props) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleSync = async (lat?: number, lng?: number, loc?: string) => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const data = await fetchLiveWeather({
        latitude: lat ?? Number(params.latitude),
        longitude: lng ?? Number(params.longitude),
        location: loc ?? params.location
      });
      onChange('rainfall24h', String(data.rainfall_24h));
      onChange('rainfall72h', String(data.rainfall_72h));
      onChange('temperature', String(data.temperature));
      onChange('humidity', String(data.humidity));
      onChange('pressure', String(data.pressure));
      onChange('windSpeed', String(data.wind_speed));
      onChange('elevation', String(data.elevation));
      onChange('latitude', String(data.latitude));
      onChange('longitude', String(data.longitude));
      onChange('location', data.location);
      setSyncMessage(`Live data synced (${data.rainfall_24h}mm 24h rain)`);
      setResetKey((k) => k + 1);
    } catch {
      setSyncMessage('Sync error — please check network.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const handleSelectPreset = (p: (typeof PRESETS)[number]) => {
    onChange('location', p.name);
    onChange('latitude', String(p.lat));
    onChange('longitude', String(p.lng));
    handleSync(p.lat, p.lng, p.name);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Input Parameters</Text>

      <View style={styles.locationBox}>
        <View style={styles.locationHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
            <MapPin size={13} color={colors.text} />
            <Text style={styles.locationLabel}>Location (City Name or Coords)</Text>
          </View>
          <TouchableOpacity onPress={() => handleSync()} disabled={isSyncing} style={styles.syncBtn}>
            {isSyncing ? <ActivityIndicator size="small" color="#fff" /> : <RefreshCw size={12} color="#fff" />}
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Open-Meteo'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationInputRow}>
          <TextInput
            style={styles.locationInput}
            placeholder="Type city (e.g. Mira Bhayandar, Mumbai)..."
            placeholderTextColor={colors.textFaint}
            value={params.location ?? ''}
            onChangeText={(v) => onChange('location', v)}
            onSubmitEditing={() => handleSync(undefined, undefined, params.location)}
          />
          <TouchableOpacity style={styles.findBtn} onPress={() => handleSync(undefined, undefined, params.location)}>
            <Text style={styles.findBtnText}>Find</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.presetRow}>
          {PRESETS.map((p) => {
            const isSelected = params.location?.includes(p.label);
            return (
              <TouchableOpacity
                key={p.label}
                onPress={() => handleSelectPreset(p)}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
              >
                <Text style={[styles.presetChipText, isSelected && styles.presetChipTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {syncMessage && <Text style={styles.syncMessage}>✓ {syncMessage}</Text>}
      </View>

      <View style={styles.table}>
        {FIELDS.map((f) => (
          <ParamRow
            key={`${f.key}-${resetKey}-${externalVersion}`}
            label={f.label}
            unit={f.unit}
            initialValue={String(params[f.key] ?? '')}
            onChangeText={(v) => onChange(f.key, v)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.predictBtn} onPress={onPredict} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.predictBtnText}>Predict Risk</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10 },
  locationBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 14 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  locationLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.accentDark,
    borderRadius: 5, paddingHorizontal: 10, paddingVertical: 5
  },
  syncBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  locationInputRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  locationInput: {
    flex: 1, backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: colors.text
  },
  findBtn: { backgroundColor: colors.accentDark, borderRadius: 4, paddingHorizontal: 14, justifyContent: 'center' },
  findBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  presetChip: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  presetChipActive: { backgroundColor: colors.accentDark, borderColor: colors.accentDark },
  presetChipText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  presetChipTextActive: { color: '#fff' },
  syncMessage: { marginTop: 8, fontSize: 11, color: colors.success, fontWeight: '600' },
  table: { gap: 8, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 12, color: '#cbd5e1', flex: 1 },
  rowInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0f172a',
    borderWidth: 1, borderColor: '#1e293b', borderRadius: 6, paddingHorizontal: 8
  },
  rowInput: { width: 70, textAlign: 'right', color: colors.text, fontSize: 13, paddingVertical: 6 },
  rowUnit: { fontSize: 11, color: colors.textFaint },
  predictBtn: {
    backgroundColor: colors.accentDark, borderRadius: 8, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center'
  },
  predictBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});
