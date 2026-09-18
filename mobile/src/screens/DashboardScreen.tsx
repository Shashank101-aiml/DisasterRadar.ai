import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Zap, Globe2, ShieldCheck } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { useDataStore } from '../store/useDataStore';
import { predictFloodRisk } from '../services/api';
import type { PredictionInput, StationData } from '../types/api';

import TopMetrics from '../components/dashboard/TopMetrics';
import InputParameters from '../components/dashboard/InputParameters';
import RiskFactorsCard from '../components/dashboard/RiskFactorsCard';
import StationMap from '../components/dashboard/StationMap';
import ModelPerformanceStrip from '../components/dashboard/ModelPerformanceStrip';
import RecentPredictionsTable from '../components/dashboard/RecentPredictionsTable';
import InfoBanner from '../components/shared/InfoBanner';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { params, prediction, setParams, setPrediction } = useAppStore();
  const { stations, recentPredictions, isLoading, error, loadInitialData, prependRecentPrediction } = useDataStore();
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [paramsVersion, setParamsVersion] = useState(0);

  const handleParamChange = (field: keyof PredictionInput, value: string) => {
    if (field === 'location') {
      setParams({ location: value });
      return;
    }
    const num = Number(value);
    setParams({ [field]: Number.isFinite(num) ? num : 0 } as Partial<PredictionInput>);
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setPredictError(null);
    try {
      const result = await predictFloodRisk(params);
      setPrediction(result);
      prependRecentPrediction({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: (params.location ?? 'Custom Point').split(',')[0],
        probability: result.probability,
        riskLevel: result.riskLevel
      });
    } catch (e: any) {
      setPredictError(e?.message ?? 'Prediction failed — check the backend connection.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSelectStation = (station: StationData) => {
    setParams({
      rainfall24h: station.r24,
      rainfall72h: station.r72,
      temperature: station.temp,
      humidity: station.hum,
      elevation: station.elev,
      latitude: station.lat,
      longitude: station.lng,
      location: station.name
    });
    setParamsVersion((v) => v + 1);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14 }}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>SATELLITE METEOROLOGICAL INTELLIGENCE</Text></View>
        <Text style={styles.heroTitle}>Predict Flood Risk Before It Becomes a Disaster.</Text>
        <Text style={styles.heroSubtitle}>
          Real-time meteorological, topographical and environmental intelligence powered by calibrated machine
          learning, ingesting live Open-Meteo & Copernicus global satellite telemetry.
        </Text>
        <View style={styles.heroActions}>
          <TouchableOpacity style={[styles.heroBtn, styles.heroBtnPrimary]} onPress={() => navigation.navigate('PredictRisk')}>
            <Zap size={15} color="#fff" />
            <Text style={styles.heroBtnPrimaryText}>Predict Risk Studio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('GlobeGis')}>
            <Globe2 size={15} color={colors.accent} />
            <Text style={styles.heroBtnText}>World GIS Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Evacuation')}>
            <ShieldCheck size={15} color={colors.accent} />
            <Text style={styles.heroBtnText}>Offline Evacuation</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Loading live telemetry…</Text>
        </View>
      )}
      {error && !isLoading && (
        <TouchableOpacity style={styles.errorBanner} onPress={loadInitialData}>
          <Text style={styles.errorText}>{error} — tap to retry</Text>
        </TouchableOpacity>
      )}

      <TopMetrics
        probability={prediction?.probability ?? 0}
        riskLevel={prediction?.riskLevel ?? 'LOW'}
        location={prediction?.location ?? params.location ?? ''}
        latitude={prediction?.latitude ?? params.latitude}
        longitude={prediction?.longitude ?? params.longitude}
        recommendation={prediction?.recommendation ?? ''}
        onOpenExplainer={() => navigation.navigate('AiExplainer')}
      />

      <InputParameters
        params={params}
        onChange={handleParamChange}
        onPredict={handlePredict}
        isLoading={isPredicting}
        externalVersion={paramsVersion}
      />
      {predictError && <Text style={styles.predictError}>{predictError}</Text>}

      <RiskFactorsCard factors={prediction?.riskFactors} />

      <StationMap stations={stations} onSelectStation={handleSelectStation} />

      <ModelPerformanceStrip onOpenFullPerformance={() => navigation.navigate('ModelPerformance')} />

      <RecentPredictionsTable predictions={recentPredictions} />

      <InfoBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: 16 },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: colors.success, letterSpacing: 0.4 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: colors.text, lineHeight: 30 },
  heroSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 10, lineHeight: 19 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.panel,
    borderWidth: 1, borderColor: colors.borderAccent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9
  },
  heroBtnPrimary: { backgroundColor: colors.accentDark, borderColor: colors.accent },
  heroBtnText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  heroBtnPrimaryText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { color: colors.textMuted, fontSize: 12 },
  errorBanner: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { color: '#f87171', fontSize: 12 },
  predictError: { color: '#f87171', fontSize: 11, marginTop: 8 }
});
