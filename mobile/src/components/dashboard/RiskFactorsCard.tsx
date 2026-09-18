import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import type { RiskFactor } from '../../types/api';

function getExplanation(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('72h')) return 'Soil reaches saturation capacity > 120mm; excess becomes direct surface runoff.';
  if (lower.includes('24h')) return 'Acute cloudburst surge volume exceeding storm sewer flow capacity.';
  if (lower.includes('humid')) return 'High atmospheric moisture prevents evaporation and increases storm intensity.';
  if (lower.includes('elev')) return 'Low-lying basin terrain (< 25m) naturally collects pooling floodwaters.';
  if (lower.includes('temp')) return 'Warm surface air drives convective storm clouds and rapid precipitation.';
  return 'Key environmental parameter contributing to hydrodynamic flood risk.';
}

const DEFAULT_FACTORS: RiskFactor[] = [
  { name: 'Rainfall (72h)', value: 31, color: colors.danger },
  { name: 'Rainfall (24h)', value: 22, color: colors.warningAlt },
  { name: 'Humidity', value: 12, color: colors.warning },
  { name: 'Elevation', value: 8, color: '#06b6d4' },
  { name: 'Temperature', value: 8, color: '#3b82f6' }
];

export default function RiskFactorsCard({ factors }: { factors?: RiskFactor[] }) {
  const items = factors && factors.length > 0 ? factors : DEFAULT_FACTORS;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Why is this Location at Risk?</Text>
        <View style={styles.shapTag}><Text style={styles.shapTagText}>SHAP DRIVERS</Text></View>
      </View>
      <Text style={styles.subtitle}>Top hydrological and physical factors identified by the AI model.</Text>

      <View style={{ gap: 12 }}>
        {items.map((factor, idx) => (
          <View key={idx}>
            <View style={styles.rowHeader}>
              <Text style={styles.factorName}>{factor.name}</Text>
              <Text style={[styles.factorValue, { color: factor.color || colors.accent }]}>+{factor.value}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.min(100, factor.value * 2.5)}%`, backgroundColor: factor.color || colors.accent }]} />
            </View>
            <Text style={styles.explanation}>{getExplanation(factor.name)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginTop: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.4 },
  shapTag: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  shapTagText: { fontSize: 10, color: colors.accent },
  subtitle: { fontSize: 11, color: colors.textMuted, marginTop: 4, marginBottom: 14 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  factorName: { fontSize: 12, fontWeight: '700', color: '#e2e8f0' },
  factorValue: { fontSize: 12, fontWeight: '800' },
  barTrack: { height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  explanation: { fontSize: 10, color: colors.textFaint, marginTop: 4, lineHeight: 14 }
});
