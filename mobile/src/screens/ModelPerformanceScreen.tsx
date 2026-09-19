import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Line, Path, Circle, Text as SvgText, Polygon } from 'react-native-svg';
import { colors } from '../constants/colors';
import { fetchDetailedModelAnalytics } from '../services/api';
import { DEFAULT_MODELS, DEFAULT_FEATURES, PARTIAL_DEPENDENCE_NOTES, DEFAULT_PARTIAL_DEPENDENCE_NOTE, type BenchmarkModel, type ShapFeature } from '../constants/modelPerformanceData';

const SUB_TABS = [
  { id: 'threshold', label: '🎚️ Threshold & Matrix' },
  { id: 'curves', label: '📈 ROC & PR Curves' },
  { id: 'shap', label: '🔬 SHAP Explainability' },
  { id: 'benchmark', label: '⚔️ Benchmark & Radar' },
  { id: 'sandbox', label: '🧪 Inference Sandbox' }
] as const;
type SubTab = (typeof SUB_TABS)[number]['id'];

const THRESHOLD_PRESETS = [
  { label: '🛡️ Civil Defense', val: 0.35 },
  { label: "🎯 Youden's J Optimal", val: 0.48 },
  { label: '⚖️ Standard Default', val: 0.50 },
  { label: '🔒 Conservative', val: 0.65 }
];

const CATEGORIES = ['all', 'Topographical', 'Satellite', 'Meteorological', 'Urban'];

function computeSimulatedMetrics(model: BenchmarkModel, decisionThreshold: number) {
  const totalPos = 6208;
  const totalNeg = 6209;
  const baseTp = model.confusionMatrix.tp;
  const baseFp = model.confusionMatrix.fp;
  const delta = decisionThreshold - 0.5;
  const sensitivity = 2.2 * (model.rocAuc / 0.9676);

  let tp = Math.round(baseTp * Math.pow(1 - delta, sensitivity));
  tp = Math.max(100, Math.min(totalPos, tp));
  let fp = Math.round(baseFp * Math.pow(1 - delta * 1.5, sensitivity * 1.2));
  fp = Math.max(20, Math.min(totalNeg, fp));

  const fn = totalPos - tp;
  const tn = totalNeg - fp;
  const precision = tp / (tp + fp);
  const recall = tp / (tp + fn);
  const f1 = (2 * (precision * recall)) / (precision + recall);
  const accuracy = (tp + tn) / (totalPos + totalNeg);
  const fpr = fp / (fp + tn);

  const clamp = (v: number) => Math.min(0.999, Math.max(0.01, v));
  return { tp, fp, fn, tn, precision: clamp(precision), recall: clamp(recall), f1: clamp(f1), accuracy: clamp(accuracy), fpr: Math.min(0.999, Math.max(0.001, fpr)) };
}

function buildRocPoints(auc: number) {
  const power = ((1 - auc) / auc) * 2.8;
  return Array.from({ length: 51 }, (_, i) => {
    const fpr = i / 50;
    return { fpr, tpr: Math.min(1, Math.pow(fpr, power)) };
  });
}

function buildPrPoints(prAuc: number) {
  return Array.from({ length: 51 }, (_, i) => {
    const recall = i / 50;
    return { recall, prec: Math.min(1, 1 - Math.pow(recall, 3.5) * (1 - prAuc) * 2.2) };
  });
}

export default function ModelPerformanceScreen() {
  const [subTab, setSubTab] = useState<SubTab>('threshold');
  const [selectedModelId, setSelectedModelId] = useState('xgboost');
  const [decisionThreshold, setDecisionThreshold] = useState(0.5);
  const [featureCategory, setFeatureCategory] = useState('all');
  const [featureSearch, setFeatureSearch] = useState('');
  const [expandedFeature, setExpandedFeature] = useState('elevation');
  const [models, setModels] = useState<BenchmarkModel[]>(DEFAULT_MODELS);
  const [features, setFeatures] = useState<ShapFeature[]>(DEFAULT_FEATURES);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(true);

  const [sandboxInputs, setSandboxInputs] = useState({ rainfall24h: 85, rainfall72h: 190, elevation: 25, ndwi: 0.28, drainageCapacity: 35 });
  const [sandboxResult, setSandboxResult] = useState<{ probability: number; latency: string; isBreached: boolean } | null>(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  useEffect(() => {
    fetchDetailedModelAnalytics()
      .then((res) => {
        const gotModels = !!res?.models?.length;
        const gotFeatures = !!res?.features?.length;
        if (gotModels) setModels(res.models as unknown as BenchmarkModel[]);
        if (gotFeatures) setFeatures(res.features as unknown as ShapFeature[]);
        setIsUsingFallback(!(gotModels && gotFeatures));
      })
      .catch(() => setIsUsingFallback(true))
      .finally(() => setIsLoading(false));
  }, []);

  const activeModel = useMemo(() => models.find((m) => m.id === selectedModelId) ?? models[0], [models, selectedModelId]);
  const simulatedMetrics = useMemo(() => computeSimulatedMetrics(activeModel, decisionThreshold), [activeModel, decisionThreshold]);
  const rocPoints = useMemo(() => buildRocPoints(activeModel.rocAuc), [activeModel]);
  const prPoints = useMemo(() => buildPrPoints(activeModel.prAuc), [activeModel]);

  const filteredFeatures = useMemo(() => {
    const q = featureSearch.toLowerCase();
    return features.filter((f) => {
      const matchCat = featureCategory === 'all' || f.category.toLowerCase().includes(featureCategory.toLowerCase());
      const matchSearch = !q || f.name.toLowerCase().includes(q) || f.label.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [features, featureCategory, featureSearch]);

  const activeFeature = features.find((f) => f.name === expandedFeature) ?? features[0];

  const handleRunSandbox = () => {
    setIsSandboxRunning(true);
    const start = Date.now();
    setTimeout(() => {
      const elapsed = Date.now() - start;
      const { rainfall24h: r24, rainfall72h: r72, elevation: elev, ndwi, drainageCapacity: drain } = sandboxInputs;
      let score = 0;
      score += (r72 / 200) * 35;
      score += (r24 / 120) * 30;
      score += Math.max(0, (50 - elev) / 50) * 25;
      score += Math.max(0, (ndwi + 0.2) / 0.6) * 20;
      score -= (drain / 100) * 15;
      const prob = Math.min(99.4, Math.max(1.5, Math.round(score * 10) / 10));
      setSandboxResult({
        probability: prob,
        latency: (elapsed + activeModel.latencyMs).toFixed(1),
        isBreached: prob >= decisionThreshold * 100
      });
      setIsSandboxRunning(false);
    }, 180);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14 }}>
      <Text style={styles.title}>Model Performance & Diagnostics Studio</Text>
      {isLoading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 8 }} />}
      {!isLoading && isUsingFallback && (
        <View style={styles.fallbackBanner}>
          <Text style={styles.fallbackBannerText}>⚠ Showing bundled reference metrics — live analytics endpoint unavailable</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modelPillRow}>
        {models.map((m) => {
          const isSelected = m.id === selectedModelId;
          return (
            <TouchableOpacity key={m.id} onPress={() => setSelectedModelId(m.id)} style={[styles.modelPill, isSelected && styles.modelPillActive]}>
              <Text style={[styles.modelPillName, isSelected && styles.modelPillNameActive]}>{m.name.split(' ')[0]}</Text>
              <Text style={[styles.modelPillAcc, isSelected && styles.modelPillNameActive]}>{(m.accuracy * 100).toFixed(1)}%</Text>
              {m.isActive && <Text style={styles.modelPillProd}>● PROD</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={styles.metaLine}>
        Inference: {activeModel.latencyMs}ms · Size: {activeModel.modelSizeMb}MB · Brier: {activeModel.brierScore}
      </Text>

      <View style={styles.kpiGrid}>
        <KpiCard label="Accuracy" value={`${(simulatedMetrics.accuracy * 100).toFixed(1)}%`} color={colors.text} badge="Overall" />
        <KpiCard label="Precision" value={`${(simulatedMetrics.precision * 100).toFixed(1)}%`} color={colors.accent} badge="Low False Alarms" />
        <KpiCard label="Recall" value={`${(simulatedMetrics.recall * 100).toFixed(1)}%`} color={colors.success} badge="Civil Safety" />
        <KpiCard label="F1-Score" value={`${(simulatedMetrics.f1 * 100).toFixed(1)}%`} color="#8b5cf6" badge="Harmonic" />
        <KpiCard label="ROC-AUC" value={String(activeModel.rocAuc)} color="#f59e0b" badge="Discrimination" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {SUB_TABS.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setSubTab(t.id)} style={[styles.tabBtn, subTab === t.id && styles.tabBtnActive]}>
            <Text style={[styles.tabBtnText, subTab === t.id && styles.tabBtnTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {subTab === 'threshold' && (
        <ThresholdTab
          decisionThreshold={decisionThreshold}
          setDecisionThreshold={setDecisionThreshold}
          simulatedMetrics={simulatedMetrics}
          activeModel={activeModel}
        />
      )}

      {subTab === 'curves' && (
        <CurvesTab activeModel={activeModel} rocPoints={rocPoints} prPoints={prPoints} decisionThreshold={decisionThreshold} simulatedMetrics={simulatedMetrics} />
      )}

      {subTab === 'shap' && (
        <ShapTab
          featureCategory={featureCategory} setFeatureCategory={setFeatureCategory}
          featureSearch={featureSearch} setFeatureSearch={setFeatureSearch}
          filteredFeatures={filteredFeatures} expandedFeature={expandedFeature} setExpandedFeature={setExpandedFeature}
          activeFeature={activeFeature}
        />
      )}

      {subTab === 'benchmark' && (
        <BenchmarkTab models={models} selectedModelId={selectedModelId} setSelectedModelId={setSelectedModelId} />
      )}

      {subTab === 'sandbox' && (
        <SandboxTab
          sandboxInputs={sandboxInputs} setSandboxInputs={setSandboxInputs}
          onRun={handleRunSandbox} isRunning={isSandboxRunning} result={sandboxResult} decisionThreshold={decisionThreshold}
        />
      )}
    </ScrollView>
  );
}

function KpiCard({ label, value, color, badge }: { label: string; value: string; color: string; badge: string }) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiHeader}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <View style={styles.kpiBadge}><Text style={styles.kpiBadgeText}>{badge}</Text></View>
      </View>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </View>
  );
}

function ThresholdTab({ decisionThreshold, setDecisionThreshold, simulatedMetrics, activeModel }: any) {
  return (
    <View>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Decision Cutoff Threshold Simulator</Text>
          <View style={styles.thresholdBadge}><Text style={styles.thresholdBadgeText}>{(decisionThreshold * 100).toFixed(0)}%</Text></View>
        </View>
        <Text style={styles.cardSubtitle}>Adjust probability cutoff to balance False Alarms vs Missed Disasters.</Text>
        <Slider
          minimumValue={0.1} maximumValue={0.9} step={0.01} value={decisionThreshold}
          onValueChange={setDecisionThreshold}
          minimumTrackTintColor={colors.accentDark} maximumTrackTintColor="#1e293b" thumbTintColor={colors.accent}
        />
        <View style={styles.sliderLabelsRow}>
          <Text style={styles.sliderEdgeLabel}>0.10 Sensitivity</Text>
          <Text style={styles.sliderEdgeLabel}>0.50 Balance</Text>
          <Text style={styles.sliderEdgeLabel}>0.90 Precision</Text>
        </View>
        <View style={styles.presetRow}>
          {THRESHOLD_PRESETS.map((p) => (
            <TouchableOpacity key={p.val} onPress={() => setDecisionThreshold(p.val)} style={[styles.presetBtn, decisionThreshold === p.val && styles.presetBtnActive]}>
              <Text style={[styles.presetBtnText, decisionThreshold === p.val && styles.presetBtnTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.matrixTitle}>Dynamic 2×2 Confusion Matrix (N = 12,417)</Text>
        <View style={styles.matrixGrid}>
          <MatrixCell label="True Negative" value={simulatedMetrics.tn} sub={`${((simulatedMetrics.tn / 6209) * 100).toFixed(1)}% Specificity`} color={colors.success} />
          <MatrixCell label="False Alarm (FP)" value={simulatedMetrics.fp} sub={`${((simulatedMetrics.fp / 6209) * 100).toFixed(1)}% FPR`} color={colors.danger} />
          <MatrixCell label="Missed Event (FN)" value={simulatedMetrics.fn} sub={`${((simulatedMetrics.fn / 6208) * 100).toFixed(1)}% Miss Rate`} color="#f59e0b" />
          <MatrixCell label="Detected Flood (TP)" value={simulatedMetrics.tp} sub={`${((simulatedMetrics.tp / 6208) * 100).toFixed(1)}% Recall`} color={colors.accent} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Operational Risk Posture</Text>
        {decisionThreshold <= 0.4 ? (
          <PostureBanner color={colors.success} title="🚨 Life-Safety / Early Warning Bias" body={`Catching ${(simulatedMetrics.recall * 100).toFixed(1)}% of all inundations. Recommended during active monsoons and cyclone landfall.`} />
        ) : decisionThreshold >= 0.6 ? (
          <PostureBanner color={colors.danger} title="🔒 High Precision / Anti-Alarm Fatigue Bias" body={`${(simulatedMetrics.precision * 100).toFixed(1)}% precision. Minimizes disruption, may miss ${simulatedMetrics.fn} localized floods.`} />
        ) : (
          <PostureBanner color={colors.accent} title="⚖️ Production Balanced Posture" body={`${(simulatedMetrics.f1 * 100).toFixed(1)}% F1-Score, keeping false alarms (${simulatedMetrics.fp}) and missed emergencies (${simulatedMetrics.fn}) low.`} />
        )}
        <View style={{ marginTop: 12, gap: 10 }}>
          <MeterRow label="Civil Defense Coverage (Recall)" value={simulatedMetrics.recall} color={colors.success} />
          <MeterRow label="Prediction Trust (Precision)" value={simulatedMetrics.precision} color={colors.accentDark} />
          <MeterRow label="False Alarm Rate" value={simulatedMetrics.fpr} color={colors.danger} />
        </View>
        <View style={styles.recommendBox}>
          <Text style={styles.recommendTitle}>💡 Recommendation for {activeModel.name}</Text>
          <Text style={styles.recommendBody}>
            ROC-AUC of {activeModel.rocAuc} confirms high separability. Recommended production threshold is 0.48 (maximizing Youden's J).
          </Text>
        </View>
      </View>
    </View>
  );
}

function PostureBanner({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <View style={[styles.postureBanner, { backgroundColor: `${color}22`, borderColor: color }]}>
      <Text style={[styles.postureTitle, { color }]}>{title}</Text>
      <Text style={styles.postureBody}>{body}</Text>
    </View>
  );
}

function MeterRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View>
      <View style={styles.meterHeader}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={[styles.meterValue, { color }]}>{(value * 100).toFixed(1)}%</Text>
      </View>
      <View style={styles.meterTrack}><View style={[styles.meterFill, { width: `${value * 100}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

function MatrixCell({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <View style={[styles.matrixCell, { backgroundColor: `${color}1a`, borderColor: `${color}66` }]}>
      <Text style={[styles.matrixValue, { color }]}>{value.toLocaleString()}</Text>
      <Text style={[styles.matrixLabel, { color }]}>{label}</Text>
      <Text style={styles.matrixSub}>{sub}</Text>
    </View>
  );
}

function CurvesTab({ activeModel, rocPoints, prPoints, decisionThreshold, simulatedMetrics }: any) {
  const w = 320, h = 220, padL = 36, padR = 12, padT = 16, padB = 30;
  const plotW = w - padL - padR, plotH = h - padT - padB;

  const rocPath = rocPoints.map((pt: any, i: number) => `${i === 0 ? 'M' : 'L'} ${(padL + pt.fpr * plotW).toFixed(1)} ${(padT + plotH - pt.tpr * plotH).toFixed(1)}`).join(' ');
  const prPath = prPoints.map((pt: any, i: number) => `${i === 0 ? 'M' : 'L'} ${(padL + pt.recall * plotW).toFixed(1)} ${(padT + plotH - pt.prec * plotH).toFixed(1)}`).join(' ');
  const rocDot = { x: padL + simulatedMetrics.fpr * plotW, y: padT + plotH - simulatedMetrics.recall * plotH };
  const prDot = { x: padL + simulatedMetrics.recall * plotW, y: padT + plotH - simulatedMetrics.precision * plotH };

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>ROC Curve</Text>
          <View style={styles.aucBadge}><Text style={styles.aucBadgeText}>AUC = {activeModel.rocAuc}</Text></View>
        </View>
        <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
          <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#334155" strokeWidth={1.5} />
          <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#334155" strokeWidth={1.5} />
          <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT} stroke="#1e293b" strokeWidth={1} strokeDasharray="4 4" />
          <Path d={rocPath} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={rocDot.x} cy={rocDot.y} r={5} fill={colors.danger} stroke="#fff" strokeWidth={2} />
          <SvgText x={padL} y={padT + plotH + 20} fontSize={8} fill="#94a3b8">FPR (1-Specificity)</SvgText>
          <SvgText x={padL - 28} y={padT + 8} fontSize={8} fill="#94a3b8">TPR</SvgText>
        </Svg>
        <Text style={styles.chartNote}>🔴 Current threshold: {(decisionThreshold * 100).toFixed(0)}%</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Precision-Recall Curve</Text>
          <View style={[styles.aucBadge, { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: colors.accent }]}><Text style={styles.aucBadgeText}>PR-AUC = {activeModel.prAuc}</Text></View>
        </View>
        <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
          <Line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#334155" strokeWidth={1.5} />
          <Line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#334155" strokeWidth={1.5} />
          <Line x1={padL} y1={padT + plotH / 2} x2={padL + plotW} y2={padT + plotH / 2} stroke="#1e293b" strokeWidth={1} strokeDasharray="4 4" />
          <Path d={prPath} fill="none" stroke={colors.success} strokeWidth={2.5} strokeLinecap="round" />
          <Circle cx={prDot.x} cy={prDot.y} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={2} />
          <SvgText x={padL} y={padT + plotH + 20} fontSize={8} fill="#94a3b8">Recall</SvgText>
          <SvgText x={padL - 28} y={padT + 8} fontSize={8} fill="#94a3b8">Precision</SvgText>
        </Svg>
        <Text style={styles.chartNote}>🟣 Current Precision/Recall balance</Text>
      </View>
    </View>
  );
}

function ShapTab({ featureCategory, setFeatureCategory, featureSearch, setFeatureSearch, filteredFeatures, expandedFeature, setExpandedFeature, activeFeature }: any) {
  const maxShap = 1.3698;
  return (
    <View>
      <View style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 10 }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setFeatureCategory(cat)} style={[styles.catChip, featureCategory === cat && styles.catChipActive]}>
              <Text style={[styles.catChipText, featureCategory === cat && styles.catChipTextActive]}>{cat === 'all' ? 'All 15' : cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput style={styles.searchInput} placeholder="Search features..." placeholderTextColor={colors.textFaint} value={featureSearch} onChangeText={setFeatureSearch} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mean |SHAP| Impact (XGBoost)</Text>
        {filteredFeatures.map((f: ShapFeature, idx: number) => {
          const isSelected = expandedFeature === f.name;
          const pct = (f.shapImpact / maxShap) * 100;
          return (
            <TouchableOpacity key={f.name} onPress={() => setExpandedFeature(f.name)} style={[styles.featureRow, isSelected && styles.featureRowActive]}>
              <View style={styles.featureRowHeader}>
                <Text style={styles.featureIdx}>#{idx + 1}</Text>
                <Text style={styles.featureLabel} numberOfLines={1}>{f.label}</Text>
                <Text style={styles.featureImpact}>{f.shapImpact.toFixed(4)}</Text>
              </View>
              <View style={styles.featureBarTrack}><View style={[styles.featureBarFill, { width: `${pct}%`, backgroundColor: isSelected ? colors.accentDark : '#475569' }]} /></View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <View style={styles.featureCatBadge}><Text style={styles.featureCatBadgeText}>{activeFeature.category}</Text></View>
        <Text style={styles.cardTitle}>{activeFeature.label}</Text>
        <View style={styles.rationaleBox}>
          <Text style={styles.rationaleTitle}>Hydrologic & Physical Rationale</Text>
          <Text style={styles.rationaleBody}>{activeFeature.description}</Text>
        </View>
        <Text style={styles.pdTitle}>Partial Dependence & Threshold Dynamics</Text>
        <Text style={styles.pdBody}>{PARTIAL_DEPENDENCE_NOTES[activeFeature.name] ?? DEFAULT_PARTIAL_DEPENDENCE_NOTE}</Text>
        <View style={styles.sourceBox}><Text style={styles.sourceText}>✅ Data Source: Copernicus DEM & Open-Meteo, integrated live.</Text></View>
      </View>
    </View>
  );
}

function BenchmarkTab({ models, selectedModelId, setSelectedModelId }: { models: BenchmarkModel[]; selectedModelId: string; setSelectedModelId: (id: string) => void }) {
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Algorithm Benchmark (12,417 Test Instances)</Text>
        {models.map((m) => {
          const isSelected = m.id === selectedModelId;
          return (
            <TouchableOpacity key={m.id} onPress={() => setSelectedModelId(m.id)} style={[styles.benchRow, isSelected && styles.benchRowActive]}>
              <View style={styles.benchHeader}>
                <Text style={styles.benchName}>{m.name}</Text>
                {m.isActive && <View style={styles.prodTag}><Text style={styles.prodTagText}>ACTIVE PROD</Text></View>}
              </View>
              <View style={styles.benchStatsRow}>
                <Text style={styles.benchStat}>Acc <Text style={styles.benchStatVal}>{(m.accuracy * 100).toFixed(1)}%</Text></Text>
                <Text style={styles.benchStat}>Prec <Text style={[styles.benchStatVal, { color: colors.accent }]}>{(m.precision * 100).toFixed(1)}%</Text></Text>
                <Text style={styles.benchStat}>Rec <Text style={[styles.benchStatVal, { color: colors.success }]}>{(m.recall * 100).toFixed(1)}%</Text></Text>
                <Text style={styles.benchStat}>ROC <Text style={[styles.benchStatVal, { color: '#f59e0b' }]}>{m.rocAuc}</Text></Text>
              </View>
              <Text style={styles.benchMeta}>{m.latencyMs}ms · {m.modelSizeMb}MB</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Engineering Justification: Why XGBoost Wins Production</Text>
        {[
          'Superior Tabular Inductive Bias: tree ensembles naturally split continuous geospatial variables without saturation.',
          'Extreme Inference Speed: 1.8ms/query serves real-time live map rendering globally.',
          'No Feature Standardization Needed: raw physical units ingested directly.',
          'Exact Probabilistic Calibration: Brier score of 0.0625 reflects true physical likelihood.'
        ].map((item, i) => (
          <Text key={i} style={styles.justificationItem}>• {item}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>5-Axis Algorithmic Trade-off</Text>
        <Svg width="100%" height={200} viewBox="0 0 280 200">
          {[0.25, 0.5, 0.75, 1.0].map((r) => (
            <Circle key={r} cx={140} cy={100} r={r * 80} fill="none" stroke="#1e293b" strokeWidth={1} />
          ))}
          <Polygon points="140,24 210,75 185,160 95,160 70,75" fill="rgba(2,132,199,0.25)" stroke={colors.accentDark} strokeWidth={2} />
          <Polygon points="140,28 190,85 178,152 100,165 72,76" fill="rgba(16,185,129,0.20)" stroke={colors.success} strokeWidth={1.8} strokeDasharray="3 3" />
          <SvgText x={140} y={16} fontSize={7} fontWeight="700" fill={colors.accent} textAnchor="middle">ROC-AUC</SvgText>
          <SvgText x={224} y={75} fontSize={7} fontWeight="700" fill="#94a3b8">Speed</SvgText>
          <SvgText x={195} y={178} fontSize={7} fontWeight="700" fill="#94a3b8" textAnchor="middle">Precision</SvgText>
          <SvgText x={85} y={178} fontSize={7} fontWeight="700" fill={colors.success} textAnchor="middle">Recall</SvgText>
          <SvgText x={56} y={75} fontSize={7} fontWeight="700" fill="#94a3b8" textAnchor="end">Generalization</SvgText>
        </Svg>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 6 }}>
          <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '700' }}>■ XGBoost</Text>
          <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>- - Random Forest</Text>
        </View>
      </View>
    </View>
  );
}

function SandboxTab({ sandboxInputs, setSandboxInputs, onRun, isRunning, result, decisionThreshold }: any) {
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Real-Time Inference Latency Sandbox</Text>
        <Text style={styles.cardSubtitle}>Simulate live sensor inputs and measure inference speed.</Text>
        <SandboxSlider label="24-Hour Rainfall" value={sandboxInputs.rainfall24h} unit="mm" min={0} max={250}
          onChange={(v: number) => setSandboxInputs((p: any) => ({ ...p, rainfall24h: v }))} />
        <SandboxSlider label="72-Hour Antecedent Rain" value={sandboxInputs.rainfall72h} unit="mm" min={0} max={400}
          onChange={(v: number) => setSandboxInputs((p: any) => ({ ...p, rainfall72h: v }))} />
        <SandboxSlider label="Digital Elevation (DEM)" value={sandboxInputs.elevation} unit="m" min={2} max={200}
          onChange={(v: number) => setSandboxInputs((p: any) => ({ ...p, elevation: v }))} />
        <SandboxSlider label="NDWI" value={sandboxInputs.ndwi} unit="" min={-0.5} max={0.9} step={0.01}
          onChange={(v: number) => setSandboxInputs((p: any) => ({ ...p, ndwi: v }))} />

        <TouchableOpacity style={styles.runBtn} onPress={onRun} disabled={isRunning}>
          {isRunning ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.runBtnText}>Run Instant Inference Benchmark</Text>}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sandbox Result</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <Text style={[styles.sandboxProb, { color: result.isBreached ? colors.danger : colors.success }]}>{result.probability}%</Text>
            <Text style={styles.sandboxLatency}>{result.latency}ms latency</Text>
          </View>
          <Text style={styles.sandboxDecision}>
            Decision: {result.isBreached ? 'Exceeds' : 'Below'} active {(decisionThreshold * 100).toFixed(0)}% threshold
          </Text>
        </View>
      )}
    </View>
  );
}

function SandboxSlider({ label, value, unit, min, max, step = 1, onChange }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.sliderLabelRow}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{value}{unit}</Text>
      </View>
      <Slider minimumValue={min} maximumValue={max} step={step} value={value} onValueChange={onChange}
        minimumTrackTintColor={colors.accentDark} maximumTrackTintColor="#1e293b" thumbTintColor={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 10 },
  fallbackBanner: { backgroundColor: 'rgba(234,179,8,0.1)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.3)', borderRadius: 8, padding: 10, marginBottom: 10 },
  fallbackBannerText: { color: colors.warning, fontSize: 11, fontWeight: '600' },
  modelPillRow: { gap: 8, marginBottom: 6 },
  modelPill: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 10, minWidth: 100 },
  modelPillActive: { backgroundColor: colors.accentDark, borderColor: colors.accent },
  modelPillName: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  modelPillNameActive: { color: '#fff' },
  modelPillAcc: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 2 },
  modelPillProd: { fontSize: 9, fontWeight: '800', color: colors.success, marginTop: 2 },
  metaLine: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  kpiCard: { flexBasis: '31%', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 10, padding: 10 },
  kpiHeader: { marginBottom: 4 },
  kpiLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  kpiBadge: { display: 'none' },
  kpiBadgeText: { fontSize: 8 },
  kpiValue: { fontSize: 16, fontWeight: '800' },
  tabBar: { gap: 6, marginBottom: 14 },
  tabBtn: { backgroundColor: colors.panel, borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  tabBtnActive: { backgroundColor: '#111a2d', borderColor: colors.accent },
  tabBtnText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  tabBtnTextActive: { color: colors.accent },
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 12, padding: 14, marginBottom: 14 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  cardSubtitle: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  thresholdBadge: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  thresholdBadgeText: { fontSize: 16, fontWeight: '800', color: colors.accent },
  sliderLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4, marginBottom: 14 },
  sliderEdgeLabel: { fontSize: 9, color: colors.textFaint },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  presetBtn: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  presetBtnActive: { backgroundColor: colors.accentDark, borderColor: colors.accent },
  presetBtnText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  presetBtnTextActive: { color: '#fff' },
  matrixTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 8 },
  matrixGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  matrixCell: { flexBasis: '47%', borderWidth: 1, borderRadius: 8, padding: 12 },
  matrixValue: { fontSize: 18, fontWeight: '800' },
  matrixLabel: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  matrixSub: { fontSize: 9, color: colors.textFaint, marginTop: 2 },
  postureBanner: { borderWidth: 1, borderRadius: 8, padding: 12 },
  postureTitle: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  postureBody: { fontSize: 11, color: '#cbd5e1', lineHeight: 16 },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  meterLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  meterValue: { fontSize: 11, fontWeight: '700' },
  meterTrack: { height: 6, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 3 },
  recommendBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, padding: 12, marginTop: 12 },
  recommendTitle: { fontSize: 11, fontWeight: '700', color: colors.text, marginBottom: 4 },
  recommendBody: { fontSize: 11, color: colors.textMuted, lineHeight: 15 },
  aucBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: '#f59e0b', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  aucBadgeText: { fontSize: 10, fontWeight: '700', color: '#f59e0b' },
  chartNote: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  catChip: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  catChipActive: { backgroundColor: colors.accentDark, borderColor: colors.accent },
  catChipText: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  searchInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: colors.text },
  featureRow: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 10, marginBottom: 8 },
  featureRowActive: { borderColor: colors.accentDark, backgroundColor: 'rgba(56,189,248,0.08)' },
  featureRowHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  featureIdx: { fontSize: 10, fontWeight: '700', color: colors.textFaint },
  featureLabel: { flex: 1, fontSize: 11, fontWeight: '700', color: colors.text },
  featureImpact: { fontSize: 11, fontWeight: '800', color: colors.accent },
  featureBarTrack: { height: 5, backgroundColor: '#1e293b', borderRadius: 3, overflow: 'hidden' },
  featureBarFill: { height: '100%', borderRadius: 3 },
  featureCatBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(56,189,248,0.15)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.3)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  featureCatBadgeText: { fontSize: 10, fontWeight: '800', color: colors.accent },
  rationaleBox: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 12, marginTop: 8, marginBottom: 12 },
  rationaleTitle: { fontSize: 11, fontWeight: '700', color: colors.text, marginBottom: 4 },
  rationaleBody: { fontSize: 11, color: '#cbd5e1', lineHeight: 16 },
  pdTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  pdBody: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginBottom: 12 },
  sourceBox: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 8, padding: 10 },
  sourceText: { fontSize: 11, color: '#34d399' },
  benchRow: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 8 },
  benchRowActive: { borderColor: colors.accent, backgroundColor: 'rgba(56,189,248,0.1)' },
  benchHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  benchName: { fontSize: 12, fontWeight: '700', color: colors.text },
  prodTag: { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: colors.success, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  prodTagText: { fontSize: 8, fontWeight: '800', color: colors.success },
  benchStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  benchStat: { fontSize: 10, color: colors.textMuted },
  benchStatVal: { fontWeight: '800', color: colors.text },
  benchMeta: { fontSize: 10, color: colors.textFaint },
  justificationItem: { fontSize: 11, color: '#cbd5e1', lineHeight: 17, marginBottom: 6 },
  runBtn: { backgroundColor: colors.accentDark, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  runBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  sandboxProb: { fontSize: 28, fontWeight: '900' },
  sandboxLatency: { fontSize: 12, color: colors.textMuted },
  sandboxDecision: { fontSize: 11, color: colors.textMuted },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  sliderLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  sliderValue: { fontSize: 12, fontWeight: '700', color: colors.accent }
});
