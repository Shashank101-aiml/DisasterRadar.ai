import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AlertTriangle, MapPin, Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface Props {
  probability: number;
  riskLevel: string;
  location: string;
  latitude: number;
  longitude: number;
  recommendation: string;
  onOpenExplainer?: () => void;
}

function riskPalette(riskLevel: string, probability: number) {
  const isCritical = riskLevel === 'CRITICAL' || riskLevel === 'SEVERE' || probability >= 70;
  const isHigh = !isCritical && (riskLevel === 'HIGH' || (probability >= 50 && probability < 70));
  const isModerate = !isCritical && !isHigh && (riskLevel === 'MODERATE' || (probability >= 30 && probability < 50));

  if (isCritical) return { color: colors.danger, badge: 'CRITICAL HAZARD', bg: 'rgba(239, 68, 68, 0.16)', desc: 'Inundation imminent' };
  if (isHigh) return { color: colors.warningAlt, badge: 'HIGH RISK', bg: 'rgba(249, 115, 22, 0.16)', desc: 'High saturation threat' };
  if (isModerate) return { color: colors.warning, badge: 'MODERATE ALERT', bg: 'rgba(234, 179, 8, 0.16)', desc: 'Moderate waterlogging risk' };
  return { color: colors.success, badge: 'LOW RISK', bg: 'rgba(16, 185, 129, 0.12)', desc: 'Conditions normal' };
}

function DonutGauge({ probability, color }: { probability: number; color: string }) {
  const size = 74;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, probability || 0));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e293b" strokeWidth={6} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.donutText}>{Math.round(probability)}%</Text>
        </View>
      </View>
    </View>
  );
}

function MetricCard({ children, borderColor }: { children: React.ReactNode; borderColor?: string }) {
  return <View style={[styles.card, borderColor ? { borderColor } : null]}>{children}</View>;
}

export default function TopMetrics({ probability, riskLevel, location, latitude, longitude, recommendation, onOpenExplainer }: Props) {
  const palette = riskPalette(riskLevel, probability);

  return (
    <View style={styles.grid}>
      <MetricCard>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>FLOOD PROBABILITY</Text>
          <Text style={styles.modelTag}>XGB-0.55</Text>
        </View>
        <View style={styles.metricBody}>
          <DonutGauge probability={probability} color={palette.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bigNumber, { color: palette.color }]}>{probability}%</Text>
            <Text style={styles.subtext}>{palette.desc}</Text>
          </View>
        </View>
      </MetricCard>

      <MetricCard borderColor={`${palette.color}44`}>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>RISK CLASSIFICATION</Text>
          <View style={[styles.dot, { backgroundColor: palette.color }]} />
        </View>
        <View style={styles.metricBody}>
          <View style={[styles.iconBox, { backgroundColor: palette.bg, borderColor: `${palette.color}55` }]}>
            <AlertTriangle size={22} color={palette.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.riskLevelText, { color: palette.color }]}>{riskLevel}</Text>
            <Text style={styles.badgeSubtext}>{palette.badge}</Text>
          </View>
        </View>
      </MetricCard>

      <MetricCard>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>MONITORED SECTOR</Text>
          <Text style={styles.liveTag}>LIVE GPS</Text>
        </View>
        <View style={styles.metricBody}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.3)' }]}>
            <MapPin size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationText} numberOfLines={1}>{location || 'Mira Bhayandar, Maharashtra'}</Text>
            <Text style={styles.coordText}>{latitude}° N • {longitude}° E</Text>
          </View>
        </View>
      </MetricCard>

      <MetricCard>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} color="#f59e0b" />
            <Text style={[styles.label, { color: '#f59e0b' }]}>AI RISK ASSESSMENT</Text>
          </View>
          {onOpenExplainer && (
            <TouchableOpacity onPress={onOpenExplainer} style={styles.sopBtn}>
              <Text style={styles.sopBtnText}>Evacuation SOP →</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.recommendationText}>
          {recommendation || 'Monitor rainfall and drainage conditions closely. Issue early warning for low-lying areas and prepare emergency response resources.'}
        </Text>
      </MetricCard>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 10, marginBottom: 16 },
  card: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent,
    borderRadius: 12, padding: 14
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 10, letterSpacing: 0.6, color: colors.textMuted, fontWeight: '700' },
  modelTag: {
    fontSize: 10, backgroundColor: 'rgba(56, 189, 248, 0.12)', color: colors.accent,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.25)'
  },
  liveTag: {
    fontSize: 10, backgroundColor: 'rgba(16, 185, 129, 0.12)', color: colors.success,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.25)'
  },
  metricBody: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  donutText: { fontWeight: '800', fontSize: 15, color: '#fff' },
  bigNumber: { fontSize: 24, fontWeight: '800' },
  subtext: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  iconBox: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  riskLevelText: { fontSize: 19, fontWeight: '800', textTransform: 'uppercase' },
  badgeSubtext: { fontSize: 12, color: '#cbd5e1', fontWeight: '600' },
  locationText: { fontSize: 15, fontWeight: '700', color: colors.text },
  coordText: { fontSize: 11, color: colors.accent, marginTop: 2 },
  sopBtn: { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  sopBtnText: { color: colors.accent, fontSize: 11, fontWeight: '700' },
  recommendationText: { fontSize: 13, color: '#e2e8f0', lineHeight: 18, marginTop: 8 }
});
