import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/colors';

const PRESET_MODELS = {
  xgboost: {
    id: 'xgboost', name: 'XGBoost', badge: 'Active Production', color: colors.accent,
    accuracy: '91.47%', precision: '90.44%', recall: '92.75%', f1Score: '91.58%', rocAuc: '0.9676', prAuc: '0.9602',
    cm: { tn: 5600, fp: 609, fn: 450, tp: 5758 },
    curvePoints: [[0, 0], [0.01, 0.55], [0.03, 0.78], [0.06, 0.89], [0.10, 0.94], [0.20, 0.97], [0.40, 0.985], [0.70, 0.995], [1.0, 1.0]]
  },
  random_forest: {
    id: 'random_forest', name: 'Random Forest', badge: 'Native JSON (No PKL)', color: colors.success,
    accuracy: '90.17%', precision: '87.59%', recall: '93.59%', f1Score: '90.49%', rocAuc: '0.9610', prAuc: '0.9514',
    cm: { tn: 5386, fp: 823, fn: 398, tp: 5810 },
    curvePoints: [[0, 0], [0.02, 0.50], [0.05, 0.76], [0.08, 0.88], [0.12, 0.93], [0.25, 0.96], [0.45, 0.98], [0.75, 0.99], [1.0, 1.0]]
  },
  neural_net: {
    id: 'neural_net', name: 'PyTorch FloodNet', badge: 'Deep Learning', color: '#8b5cf6',
    accuracy: '87.20%', precision: '86.40%', recall: '88.30%', f1Score: '87.34%', rocAuc: '0.9250', prAuc: '0.9170',
    cm: { tn: 5320, fp: 889, fn: 726, tp: 5482 },
    curvePoints: [[0, 0], [0.03, 0.40], [0.08, 0.68], [0.15, 0.82], [0.25, 0.89], [0.40, 0.93], [0.60, 0.96], [0.80, 0.98], [1.0, 1.0]]
  }
} as const;

type ModelId = keyof typeof PRESET_MODELS;

export default function ModelPerformanceStrip({ onOpenFullPerformance }: { onOpenFullPerformance?: () => void }) {
  const [selected, setSelected] = useState<ModelId>('xgboost');
  const current = PRESET_MODELS[selected];
  const cm = current.cm;

  const w = 260, h = 130, padL = 32, padB = 22, padT = 10, padR = 12;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const pathData = current.curvePoints
    .map((pt, i) => {
      const x = padL + pt[0] * plotW;
      const y = padT + plotH - pt[1] * plotH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Model Performance Evaluation</Text>
        <View style={[styles.badge, { borderColor: current.color }]}>
          <Text style={[styles.badgeText, { color: current.color }]}>{current.badge}</Text>
        </View>
      </View>
      {onOpenFullPerformance && (
        <TouchableOpacity onPress={onOpenFullPerformance} style={{ alignSelf: 'flex-start', marginTop: 4 }}>
          <Text style={styles.studioLink}>Interactive Studio →</Text>
        </TouchableOpacity>
      )}

      <View style={styles.switcher}>
        {Object.values(PRESET_MODELS).map((m) => {
          const isActive = m.id === selected;
          return (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelected(m.id as ModelId)}
              style={[styles.switchBtn, isActive && { backgroundColor: colors.accentDark }]}
            >
              <View style={[styles.switchDot, { backgroundColor: isActive ? '#fff' : m.color }]} />
              <Text style={[styles.switchLabel, isActive && { color: '#fff', fontWeight: '800' }]}>{m.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.metricsStrip}>
        {[
          ['Accuracy', current.accuracy, colors.text],
          ['Precision', current.precision, colors.accent],
          ['Recall', current.recall, colors.success],
          ['F1', current.f1Score, '#8b5cf6'],
          ['ROC-AUC', current.rocAuc, '#f59e0b'],
          ['PR-AUC', current.prAuc, '#ec4899']
        ].map(([label, value, color]) => (
          <View key={label} style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={[styles.metricValue, { color: color as string }]}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartsRow}>
        <View style={styles.matrixBox}>
          <Text style={styles.subTitle}>Confusion Matrix</Text>
          <View style={styles.matrixGrid}>
            <View style={[styles.matrixCell, { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' }]}>
              <Text style={[styles.matrixValue, { color: colors.success }]}>{cm.tn}</Text>
              <Text style={styles.matrixCellLabel}>TN</Text>
            </View>
            <View style={[styles.matrixCell, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }]}>
              <Text style={[styles.matrixValue, { color: colors.danger }]}>{cm.fp}</Text>
              <Text style={styles.matrixCellLabel}>FP</Text>
            </View>
            <View style={[styles.matrixCell, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }]}>
              <Text style={[styles.matrixValue, { color: colors.danger }]}>{cm.fn}</Text>
              <Text style={styles.matrixCellLabel}>FN</Text>
            </View>
            <View style={[styles.matrixCell, { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: 'rgba(56,189,248,0.3)' }]}>
              <Text style={[styles.matrixValue, { color: colors.accent }]}>{cm.tp}</Text>
              <Text style={styles.matrixCellLabel}>TP</Text>
            </View>
          </View>
        </View>

        <View style={styles.rocBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.subTitle}>ROC Curve</Text>
            <Text style={[styles.rocAuc, { color: current.color }]}>AUC={current.rocAuc}</Text>
          </View>
          <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
            <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#334155" strokeWidth={1} />
            <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#334155" strokeWidth={1} />
            <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT} stroke="#1e293b" strokeWidth={1} strokeDasharray="2,2" />
            <Path d={pathData} fill="none" stroke={current.color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            <SvgText x={padL - 4} y={padT + plotH + 2} fontSize={7} fill="#94a3b8" textAnchor="end">0</SvgText>
            <SvgText x={padL - 4} y={padT + 4} fontSize={7} fill="#94a3b8" textAnchor="end">1</SvgText>
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginTop: 12, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 14, fontWeight: '800', color: colors.text },
  badge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#0f172a' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  studioLink: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  switcher: { flexDirection: 'row', gap: 6, backgroundColor: '#060911', padding: 4, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b' },
  switchBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 6 },
  switchDot: { width: 7, height: 7, borderRadius: 4 },
  switchLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  metricsStrip: {
    flexDirection: 'row', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b',
    borderRadius: 8, paddingVertical: 8, flexWrap: 'wrap'
  },
  metricLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  metricValue: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  chartsRow: { gap: 10 },
  matrixBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10 },
  subTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 6 },
  matrixGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  matrixCell: { flexBasis: '47%', borderWidth: 1, borderRadius: 6, padding: 8, alignItems: 'center' },
  matrixValue: { fontSize: 14, fontWeight: '800' },
  matrixCellLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  rocBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10 },
  rocAuc: { fontSize: 11, fontWeight: '700' }
});
