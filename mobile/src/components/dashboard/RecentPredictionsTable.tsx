import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import type { RecentPrediction } from '../../types/api';

const BADGE_COLOR: Record<string, string> = {
  HIGH: colors.warningAlt,
  SEVERE: colors.danger,
  MODERATE: colors.warning,
  LOW: colors.success
};

export default function RecentPredictionsTable({ predictions }: { predictions: RecentPrediction[] }) {
  const list = predictions.slice(0, 6);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recent Predictions</Text>
      {list.length === 0 ? (
        <Text style={styles.empty}>No predictions yet.</Text>
      ) : (
        list.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.time}>{p.time}</Text>
            <Text style={styles.location} numberOfLines={1}>{p.location}</Text>
            <Text style={styles.prob}>{p.probability}%</Text>
            <View style={[styles.badge, { backgroundColor: `${BADGE_COLOR[p.riskLevel] ?? colors.warningAlt}22`, borderColor: BADGE_COLOR[p.riskLevel] ?? colors.warningAlt }]}>
              <Text style={[styles.badgeText, { color: BADGE_COLOR[p.riskLevel] ?? colors.warningAlt }]}>{p.riskLevel}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginTop: 12 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10 },
  empty: { fontSize: 12, color: colors.textFaint },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#1e293b' },
  time: { fontSize: 11, color: colors.textFaint, width: 68 },
  location: { fontSize: 12, color: colors.text, fontWeight: '700', flex: 1 },
  prob: { fontSize: 12, color: colors.textMuted, width: 44, textAlign: 'right' },
  badge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800' }
});
