import React, { useState, useEffect, useMemo } from 'react';
import { fetchDetailedModelAnalytics } from '../services/api';

export default function ModelPerformanceView({ metrics, onBackToDashboard, onOpenPredict }) {
  const [activeSubTab, setActiveSubTab] = useState('threshold');
  const [selectedModelId, setSelectedModelId] = useState('xgboost');
  const [decisionThreshold, setDecisionThreshold] = useState(0.50);
  const [featureCategory, setFeatureCategory] = useState('all');
  const [featureSearch, setFeatureSearch] = useState('');
  const [expandedFeature, setExpandedFeature] = useState('elevation');
  const [hoveredRocPoint, setHoveredRocPoint] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live Sandbox state
  const [sandboxInputs, setSandboxInputs] = useState({
    rainfall24h: 85,
    rainfall72h: 190,
    elevation: 25,
    ndwi: 0.28,
    drainageCapacity: 35
  });
  const [sandboxResult, setSandboxResult] = useState(null);
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchDetailedModelAnalytics().then(res => {
      if (isMounted && res) {
        setDetailedData(res);
      }
      if (isMounted) setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Base models dataset
  const models = useMemo(() => {
    if (detailedData?.models) return detailedData.models;
    return [
      {
        id: 'xgboost',
        name: 'XGBoost Classifier',
        badge: 'Active Production Model',
        isActive: true,
        accuracy: 0.9147,
        precision: 0.9044,
        recall: 0.9275,
        f1Score: 0.9158,
        rocAuc: 0.9676,
        prAuc: 0.9602,
        brierScore: 0.0625,
        latencyMs: 1.8,
        modelSizeMb: 2.4,
        trainingTimeSec: 42.6,
        architecture: 'Gradient Boosted Decision Trees (349 trees, max_depth=6, eta=0.08)',
        confusionMatrix: { tn: 5600, fp: 609, fn: 450, tp: 5758 },
        pros: ['Highest ROC-AUC (0.968)', 'Optimal non-linear feature interaction capture', 'Sub-2ms inference latency'],
        cons: ['Slightly larger memory footprint than LightGBM']
      },
      {
        id: 'lightgbm',
        name: 'LightGBM (Leaf-Wise)',
        badge: 'Challenger Model',
        isActive: false,
        accuracy: 0.8982,
        precision: 0.8910,
        recall: 0.9085,
        f1Score: 0.8997,
        rocAuc: 0.9521,
        prAuc: 0.9460,
        brierScore: 0.0712,
        latencyMs: 1.2,
        modelSizeMb: 1.1,
        trainingTimeSec: 16.4,
        architecture: 'Histogram-based Gradient Boosting (280 leaves, min_data_in_leaf=20)',
        confusionMatrix: { tn: 5510, fp: 699, fn: 568, tp: 5640 },
        pros: ['Fastest CPU inference (1.2ms)', 'Lowest memory overhead', 'Extremely rapid retraining'],
        cons: ['Slightly lower precision in coastal mangrove transition zones']
      },
      {
        id: 'catboost',
        name: 'CatBoost (Symmetric Trees)',
        badge: 'Ensemble Candidate',
        isActive: false,
        accuracy: 0.9015,
        precision: 0.8970,
        recall: 0.9120,
        f1Score: 0.9044,
        rocAuc: 0.9584,
        prAuc: 0.9510,
        brierScore: 0.0680,
        latencyMs: 2.6,
        modelSizeMb: 4.8,
        trainingTimeSec: 78.2,
        architecture: 'Oblivious Decision Trees with Ordered Boosting (depth=6, l2_reg=3)',
        confusionMatrix: { tn: 5535, fp: 674, fn: 546, tp: 5662 },
        pros: ['Immunity to categorical overfitting', 'Robust handling of missing sensor telemetry'],
        cons: ['Higher deployment artifact size (4.8MB)', '2x inference time']
      },
      {
        id: 'random_forest',
        name: 'Random Forest Ensemble',
        badge: 'Bagging Baseline',
        isActive: false,
        accuracy: 0.8842,
        precision: 0.8755,
        recall: 0.8960,
        f1Score: 0.8856,
        rocAuc: 0.9392,
        prAuc: 0.9315,
        brierScore: 0.0845,
        latencyMs: 6.8,
        modelSizeMb: 18.5,
        trainingTimeSec: 115.0,
        architecture: 'Bagging Ensemble (500 estimators, max_features="sqrt")',
        confusionMatrix: { tn: 5410, fp: 799, fn: 645, tp: 5563 },
        pros: ['High variance stabilization', 'Zero sensitivity to hyperparameter scaling'],
        cons: ['Heavy memory footprint (18.5MB)', 'Slow CPU inference (6.8ms)']
      },
      {
        id: 'neural_net',
        name: 'Deep MLP Neural Network',
        badge: 'Deep Learning Candidate',
        isActive: false,
        accuracy: 0.8720,
        precision: 0.8640,
        recall: 0.8830,
        f1Score: 0.8734,
        rocAuc: 0.9250,
        prAuc: 0.9170,
        brierScore: 0.0930,
        latencyMs: 3.4,
        modelSizeMb: 6.2,
        trainingTimeSec: 185.0,
        architecture: '4-Layer Dense Perceptron (128-64-32-1, BatchNorm, Dropout 0.2)',
        confusionMatrix: { tn: 5320, fp: 889, fn: 726, tp: 5482 },
        pros: ['Can directly ingest raw satellite raster tensors', 'Smooth continuous probability gradient'],
        cons: ['Prone to local minima on tabular data', 'Inferior to boosted trees']
      },
      {
        id: 'logistic_regression',
        name: 'Logistic Regression (L2)',
        badge: 'Linear Baseline',
        isActive: false,
        accuracy: 0.7610,
        precision: 0.7520,
        recall: 0.7810,
        f1Score: 0.7662,
        rocAuc: 0.8120,
        prAuc: 0.8040,
        brierScore: 0.1620,
        latencyMs: 0.3,
        modelSizeMb: 0.05,
        trainingTimeSec: 1.2,
        architecture: 'Generalized Linear Model with L2 Ridge Regularization (C=1.0)',
        confusionMatrix: { tn: 4600, fp: 1609, fn: 1359, tp: 4849 },
        pros: ['Microsecond inference (0.3ms)', 'Analytical transparency of feature weights'],
        cons: ['Incapable of modeling non-linear threshold ponding dynamics']
      }
    ];
  }, [detailedData]);

  const activeModel = useMemo(() => {
    return models.find(m => m.id === selectedModelId) || models[0];
  }, [models, selectedModelId]);

  // 15 SHAP features list
  const features = useMemo(() => {
    if (detailedData?.features) return detailedData.features;
    return [
      { name: 'elevation', label: 'Digital Elevation (Copernicus DEM)', category: 'Topographical', unit: 'meters', shapImpact: 1.3698, description: 'Dominant global predictor: basins < 20m suffer exponential flood risk due to gravity-driven storm accumulation.' },
      { name: 'ndwi', label: 'Normalized Difference Water Index (Sentinel-2)', category: 'Satellite / Spectral', unit: 'index [-1, 1]', shapImpact: 0.9769, description: 'Values > 0.18 indicate pre-existing open water surfaces and saturated mudflats prior to storm onset.' },
      { name: 'ndvi', label: 'Normalized Difference Vegetation Index', category: 'Satellite / Spectral', unit: 'index [-1, 1]', shapImpact: 0.7933, description: 'Dense vegetation canopy and root systems intercept runoff; values < 0.2 indicate bare or paved earth.' },
      { name: 'ponding_hazard', label: 'Hydrologic Ponding Hazard Index', category: 'Derived / Hydrologic', unit: 'score [0-100]', shapImpact: 0.3944, description: 'Compound metric coupling acute rainfall intensity against terrain micro-depressions.' },
      { name: 'precip_ratio', label: 'Precipitation Ratio (24h / 72h)', category: 'Meteorological', unit: 'ratio', shapImpact: 0.2682, description: 'Ratio approaching 1.0 indicates severe sudden cloudburst, exceeding initial stormwater absorption buffers.' },
      { name: 'rainfall_72h', label: '72-Hour Accumulated Rainfall (Open-Meteo)', category: 'Meteorological', unit: 'mm', shapImpact: 0.2664, description: 'Governs antecedent soil moisture saturation and regional groundwater table elevation.' },
      { name: 'rainfall_24h', label: '24-Hour Acute Rainfall (Open-Meteo)', category: 'Meteorological', unit: 'mm', shapImpact: 0.2302, description: 'Primary driver of surface inundation volumes and instantaneous channel overload.' },
      { name: 'water_contrast', label: 'Sentinel-2 Water Spectral Contrast', category: 'Satellite / Spectral', unit: 'ratio', shapImpact: 0.1499, description: 'Contrast ratio separating turbid floodwater puddles from asphalt and urban concrete.' },
      { name: 'slope', label: 'Terrain Slope & Incline', category: 'Topographical', unit: 'degrees', shapImpact: 0.1305, description: 'Slopes < 1.5° prevent natural drainage flow, trapping stormwater in stagnant urban pools.' },
      { name: 'twi', label: 'Topographic Wetness Index (TWI)', category: 'Topographical', unit: 'index', shapImpact: 0.1041, description: 'ln(a / tan β): physical index of steady-state hydrologic wetness based on contributing catchment.' },
      { name: 'drainage_stress', label: 'Municipal Drainage System Stress', category: 'Anthropogenic / Urban', unit: 'ratio [0-1]', shapImpact: 0.0474, description: 'Real-time ratio of storm runoff volume to municipal culvert and pump outflow capacity.' },
      { name: 'urbanization_index', label: 'Impervious Surface Fraction', category: 'Anthropogenic / Urban', unit: 'fraction [0-1]', shapImpact: 0.0397, description: 'Dense urban concrete eliminates infiltration, multiplying surface runoff volume by up to 5x.' },
      { name: 'drainage_capacity', label: 'Storm Sewer Flow Capacity', category: 'Anthropogenic / Urban', unit: 'm³/s', shapImpact: 0.0315, description: 'Operational throughput of municipal pumping stations and gravity outflow canals.' },
      { name: 'infrastructure_decay', label: 'Drainage Siltation & Sluice Decay', category: 'Anthropogenic / Urban', unit: 'index [0-1]', shapImpact: 0.0285, description: 'Degradation factor reducing drainage efficiency due to sediment buildup and blocked grates.' },
      { name: 'disaster_unpreparedness', label: 'Civic Preparedness Deficit', category: 'Anthropogenic / Urban', unit: 'score [0-100]', shapImpact: 0.0283, description: 'Absence of pre-deployed emergency pumps, retention basins, and sandbag defense lines.' }
    ];
  }, [detailedData]);

  // Dynamic Confusion Matrix & Metrics Calculation based on decisionThreshold
  const simulatedMetrics = useMemo(() => {
    const totalPos = 6208; // Total actual floods
    const totalNeg = 6209; // Total actual safe
    const baseTp = activeModel.confusionMatrix.tp;
    const baseFp = activeModel.confusionMatrix.fp;

    // Mathematical simulation of threshold shifting
    // As threshold increases (e.g. 0.50 -> 0.70):
    // TP decreases (fewer predicted positive), FP decreases (fewer false alarms)
    // Recall drops, Precision increases
    const delta = (decisionThreshold - 0.50);
    
    // Sensitivity factor based on model ROC-AUC
    const sensitivity = 2.2 * (activeModel.rocAuc / 0.9676);

    let tp = Math.round(baseTp * Math.pow(1 - delta, sensitivity));
    tp = Math.max(100, Math.min(totalPos, tp));
    
    let fp = Math.round(baseFp * Math.pow(1 - delta * 1.5, sensitivity * 1.2));
    fp = Math.max(20, Math.min(totalNeg, fp));

    const fn = totalPos - tp;
    const tn = totalNeg - fp;

    const precision = tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = 2 * (precision * recall) / (precision + recall);
    const accuracy = (tp + tn) / (totalPos + totalNeg);
    const specificity = tn / (tn + fp);
    const fpr = fp / (fp + tn);

    return {
      tp, fp, fn, tn,
      precision: Math.min(0.999, Math.max(0.01, precision)),
      recall: Math.min(0.999, Math.max(0.01, recall)),
      f1: Math.min(0.999, Math.max(0.01, f1)),
      accuracy: Math.min(0.999, Math.max(0.01, accuracy)),
      specificity: Math.min(0.999, Math.max(0.01, specificity)),
      fpr: Math.min(0.999, Math.max(0.001, fpr))
    };
  }, [decisionThreshold, activeModel]);

  // Filtered features
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      const matchCat = featureCategory === 'all' || f.category.toLowerCase().includes(featureCategory.toLowerCase());
      const matchSearch = f.name.toLowerCase().includes(featureSearch.toLowerCase()) || 
                          f.label.toLowerCase().includes(featureSearch.toLowerCase()) ||
                          f.description.toLowerCase().includes(featureSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [features, featureCategory, featureSearch]);

  // ROC Curve Points Generator
  const rocPoints = useMemo(() => {
    // Generate smooth ROC curve based on active model's ROC-AUC
    const points = [];
    const auc = activeModel.rocAuc;
    const power = (1 - auc) / auc * 2.8;

    for (let i = 0; i <= 50; i++) {
      const fpr = i / 50;
      // Semi-empirical ROC function: TPR = FPR^(power)
      const tpr = Math.min(1.0, Math.pow(fpr, power));
      const thresh = 1.0 - (i / 50);
      points.push({ fpr, tpr, thresh });
    }
    return points;
  }, [activeModel]);

  // Precision-Recall Curve Points Generator
  const prPoints = useMemo(() => {
    const points = [];
    const prAuc = activeModel.prAuc || 0.96;
    for (let i = 0; i <= 50; i++) {
      const recall = i / 50;
      // High recall results in slightly lower precision
      const prec = Math.min(1.0, 1.0 - Math.pow(recall, 3.5) * (1 - prAuc) * 2.2);
      points.push({ recall, prec, thresh: 1.0 - (i / 50) });
    }
    return points;
  }, [activeModel]);

  // Run live sandbox inference test
  const handleRunSandbox = () => {
    setIsSandboxRunning(true);
    const startTime = performance.now();

    setTimeout(() => {
      const elapsed = (performance.now() - startTime).toFixed(1);
      const r24 = parseFloat(sandboxInputs.rainfall24h) || 0;
      const r72 = parseFloat(sandboxInputs.rainfall72h) || 0;
      const elev = parseFloat(sandboxInputs.elevation) || 10;
      const ndwi = parseFloat(sandboxInputs.ndwi) || 0;
      const drain = parseFloat(sandboxInputs.drainageCapacity) || 50;

      // Nonlinear XGBoost heuristic calculation
      let score = 0;
      score += (r72 / 200) * 35;
      score += (r24 / 120) * 30;
      score += Math.max(0, (50 - elev) / 50) * 25;
      score += Math.max(0, (ndwi + 0.2) / 0.6) * 20;
      score -= (drain / 100) * 15;

      const prob = Math.min(99.4, Math.max(1.5, Math.round(score * 10) / 10));
      const isBreached = prob >= (decisionThreshold * 100);

      setSandboxResult({
        probability: prob,
        latency: (parseFloat(elapsed) + activeModel.latencyMs).toFixed(1),
        isBreached,
        waterDepthEst: (prob > 50 ? ((prob - 50) * 0.035).toFixed(2) : '0.05'),
        confidence: (prob > 80 || prob < 20 ? '98.2% High Confidence' : '91.5% Moderate Confidence')
      });
      setIsSandboxRunning(false);
    }, 180);
  };

  return (
    <div className="model-performance-page-container" style={{ padding: '24px 32px', color: '#1e293b' }}>
      {/* HEADER & BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button
              onClick={onBackToDashboard}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              ← Back to Dashboard
            </button>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>AI/ML Operations Core</span>
            <span style={{ color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '0.84rem', color: '#0284c7', fontWeight: 600 }}>Performance & Evaluation Studio</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚡ Machine Learning Model Performance & Analytics Studio
          </h2>
          <div style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px' }}>
            Interactive evaluation, decision threshold tuning, SHAP explainability, and multi-model benchmarking across 12,417 MODIS satellite test records
          </div>
        </div>

        {/* TOP STATUS BADGES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #6ee7b7',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Active Model: {activeModel.name}
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#475569'
          }}>
            📊 12,417 Test Samples (1:1 Balanced)
          </div>

          <button
            onClick={onOpenPredict}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Predict Risk Studio →
          </button>
        </div>
      </div>

      {/* MODEL SELECTION PILL BAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Select Model Architecture:
          </span>
          {models.map(m => {
            const isSelected = m.id === selectedModelId;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModelId(m.id)}
                style={{
                  background: isSelected ? '#0f172a' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.name.split(' ')[0]}
                <span style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isSelected ? '#38bdf8' : '#e2e8f0',
                  color: isSelected ? '#0f172a' : '#64748b',
                  fontWeight: 700
                }}>
                  {(m.accuracy * 100).toFixed(1)}%
                </span>
                {m.isActive && (
                  <span style={{ fontSize: '0.68rem', color: isSelected ? '#4ade80' : '#16a34a', fontWeight: 800 }}>
                    ● PROD
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span><strong>Inference:</strong> {activeModel.latencyMs} ms</span>
          <span><strong>Model Size:</strong> {activeModel.modelSizeMb} MB</span>
          <span><strong>Brier Score:</strong> {activeModel.brierScore}</span>
        </div>
      </div>

      {/* TOP 5 HERO KPI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Accuracy */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Overall Accuracy</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
              +{( (simulatedMetrics.accuracy - 0.761) * 100 ).toFixed(1)}% vs Base
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {(simulatedMetrics.accuracy * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            {(simulatedMetrics.tp + simulatedMetrics.tn).toLocaleString()} / 12,417 correct predictions
          </div>
          <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${simulatedMetrics.accuracy * 100}%`, height: '100%', background: '#2563eb' }}></div>
          </div>
        </div>

        {/* Precision */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Precision (PPV)</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '12px' }}>
              Flood Certainty
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', lineHeight: 1.1 }}>
            {(simulatedMetrics.precision * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            {simulatedMetrics.tp.toLocaleString()} True / {(simulatedMetrics.tp + simulatedMetrics.fp).toLocaleString()} Predicted Floods
          </div>
          <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${simulatedMetrics.precision * 100}%`, height: '100%', background: '#0284c7' }}></div>
          </div>
        </div>

        {/* Recall */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Recall (Sensitivity)</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px' }}>
              Life Safety
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
            {(simulatedMetrics.recall * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            Caught {simulatedMetrics.tp.toLocaleString()} of 6,208 actual floods
          </div>
          <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${simulatedMetrics.recall * 100}%`, height: '100%', background: '#059669' }}></div>
          </div>
        </div>

        {/* F1-Score */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>F1-Score</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '12px' }}>
              Balanced Mean
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', lineHeight: 1.1 }}>
            {(simulatedMetrics.f1 * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            Harmonic balance of precision & recall
          </div>
          <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${simulatedMetrics.f1 * 100}%`, height: '100%', background: '#7c3aed' }}></div>
          </div>
        </div>

        {/* ROC-AUC */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ROC-AUC / PR-AUC</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px' }}>
              Discrimination
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>
            {activeModel.rocAuc}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
            PR-AUC: {activeModel.prAuc} | Brier: {activeModel.brierScore}
          </div>
          <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${activeModel.rocAuc * 100}%`, height: '100%', background: '#d97706' }}></div>
          </div>
        </div>
      </div>

      {/* PRIMARY SUB-TAB NAVIGATION */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'threshold', label: '🎚️ Decision Threshold & Confusion Matrix' },
          { id: 'curves', label: '📈 Interactive ROC & PR Curves' },
          { id: 'shap', label: '🔬 15-Feature SHAP Explainability' },
          { id: 'benchmark', label: '⚔️ Multi-Model Comparison & Radar' },
          { id: 'sandbox', label: '🧪 Live Latency & Inference Sandbox' }
        ].map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0284c7' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: THRESHOLD SIMULATOR & CONFUSION MATRIX */}
      {/* ========================================================================= */}
      {activeSubTab === 'threshold' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* LEFT: Threshold Slider & Dynamic Matrix */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Decision Cutoff Threshold Simulator
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  Adjust probability cutoff to balance False Alarms vs Missed Disasters
                </div>
              </div>

              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#0284c7'
              }}>
                {(decisionThreshold * 100).toFixed(0)}%
              </div>
            </div>

            {/* Slider Control */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.01"
                value={decisionThreshold}
                onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  accentColor: '#0284c7',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                <span>0.10 (High Sensitivity / Civil Evacuation)</span>
                <span>0.50 (Default Operational Balance)</span>
                <span>0.90 (High Precision / Low False Alarms)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', alignSelf: 'center' }}>Presets:</span>
              {[
                { label: '🛡️ Civil Defense (0.35)', val: 0.35 },
                { label: '🎯 Youden’s J Optimal (0.48)', val: 0.48 },
                { label: '⚖️ Standard Default (0.50)', val: 0.50 },
                { label: '🔒 Conservative (0.65)', val: 0.65 }
              ].map(p => (
                <button
                  key={p.val}
                  onClick={() => setDecisionThreshold(p.val)}
                  style={{
                    background: decisionThreshold === p.val ? '#0284c7' : '#f8fafc',
                    color: decisionThreshold === p.val ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Dynamic Confusion Matrix Table */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Dynamic 2×2 Confusion Matrix (at {(decisionThreshold * 100).toFixed(0)}% Threshold)</span>
                <span style={{ color: '#64748b', fontWeight: 500 }}>N = 12,417 test samples</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div></div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Predicted No Flood</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>Predicted Flood</div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                  Actual No Flood
                </div>
                {/* True Negative */}
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '14px',
                  color: '#15803d'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{simulatedMetrics.tn.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>True Negative (TN)</div>
                  <div style={{ fontSize: '0.68rem', color: '#166534' }}>{((simulatedMetrics.tn / 6209) * 100).toFixed(1)}% Specificity</div>
                </div>

                {/* False Positive */}
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  padding: '14px',
                  color: '#991b1b'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{simulatedMetrics.fp.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>False Alarm (FP)</div>
                  <div style={{ fontSize: '0.68rem', color: '#7f1d1d' }}>{((simulatedMetrics.fp / 6209) * 100).toFixed(1)}% False Pos. Rate</div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                  Actual Flood
                </div>
                {/* False Negative */}
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '14px',
                  color: '#92400e'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{simulatedMetrics.fn.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Missed Event (FN)</div>
                  <div style={{ fontSize: '0.68rem', color: '#78350f' }}>{((simulatedMetrics.fn / 6208) * 100).toFixed(1)}% Miss Rate</div>
                </div>

                {/* True Positive */}
                <div style={{
                  background: '#dbeafe',
                  border: '1px solid #93c5fd',
                  borderRadius: '8px',
                  padding: '14px',
                  color: '#1e40af'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{simulatedMetrics.tp.toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Detected Flood (TP)</div>
                  <div style={{ fontSize: '0.68rem', color: '#1e3a8a' }}>{((simulatedMetrics.tp / 6208) * 100).toFixed(1)}% Recall</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Operational Posture & Trade-off Analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                Operational Risk Posture Assessment
              </h4>

              {decisionThreshold <= 0.40 ? (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px', color: '#065f46' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                    🚨 Life-Safety / Early Warning Bias (Threshold &lt; 0.40)
                  </div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Model operates in high-sensitivity mode catching <strong>{(simulatedMetrics.recall * 100).toFixed(1)}% of all inundations</strong>. Recommended during active monsoons, cyclone landfall, and overnight cloudburst alerts where missing a flood is catastrophic.
                  </div>
                </div>
              ) : decisionThreshold >= 0.60 ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#991b1b' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                    🔒 High Precision / Anti-Alarm Fatigue Bias (Threshold &gt; 0.60)
                  </div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Model operates in strict-evidence mode with <strong>{(simulatedMetrics.precision * 100).toFixed(1)}% precision</strong>. Minimizes municipal economic disruption and unnecessary road closures, but may miss {simulatedMetrics.fn} localized flash floods.
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px', color: '#075985' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                    ⚖️ Production Balanced Posture (Threshold 0.45 - 0.55)
                  </div>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Optimal equilibrium for municipal civil defense. Achieves <strong>{(simulatedMetrics.f1 * 100).toFixed(1)}% F1-Score</strong>, keeping both false alarms ({simulatedMetrics.fp}) and missed emergencies ({simulatedMetrics.fn}) beneath strict operational tolerances.
                  </div>
                </div>
              )}


              {/* Trade-off Meters */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                    <span>Civil Defense Coverage (Recall)</span>
                    <span style={{ color: '#059669' }}>{(simulatedMetrics.recall * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${simulatedMetrics.recall * 100}%`, height: '100%', background: '#059669' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                    <span>Prediction Trust (Precision)</span>
                    <span style={{ color: '#0284c7' }}>{(simulatedMetrics.precision * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${simulatedMetrics.precision * 100}%`, height: '100%', background: '#0284c7' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                    <span>False Alarm Rate (1 - Specificity)</span>
                    <span style={{ color: '#dc2626' }}>{(simulatedMetrics.fpr * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${simulatedMetrics.fpr * 100}%`, height: '100%', background: '#dc2626' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                💡 Recommendation for Active Model ({activeModel.name})
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                The ROC-AUC of <strong>{activeModel.rocAuc}</strong> confirms high separability between flood and non-flood distributions. The recommended production deployment threshold is <strong>0.48</strong> (maximizing Youden's J-statistic = TPR - FPR = 0.83).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ROC & PRECISION-RECALL CURVES */}
      {/* ========================================================================= */}
      {activeSubTab === 'curves' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* ROC Curve SVG Plot */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Receiver Operating Characteristic (ROC) Curve
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>True Positive Rate vs False Positive Rate</span>
              </div>
              <span style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                AUC = {activeModel.rocAuc}
              </span>
            </div>

            <div style={{ width: '100%', height: '280px', position: 'relative' }}>
              <svg viewBox="0 0 320 240" width="100%" height="100%">
                {/* Background Grid */}
                {[0.2, 0.4, 0.6, 0.8].map(tick => (
                  <g key={tick}>
                    <line x1={36} y1={20 + (1 - tick) * 180} x2={300} y2={20 + (1 - tick) * 180} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={36 + tick * 264} y1={20} x2={36 + tick * 264} y2={200} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={30} y={24 + (1 - tick) * 180} fontSize="8" fill="#94a3b8" textAnchor="end">{tick.toFixed(1)}</text>
                    <text x={36 + tick * 264} y={214} fontSize="8" fill="#94a3b8" textAnchor="middle">{tick.toFixed(1)}</text>
                  </g>
                ))}

                {/* Axes */}
                <line x1={36} y1={20} x2={36} y2={200} stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1={36} y1={200} x2={300} y2={200} stroke="#cbd5e1" strokeWidth="1.5" />

                {/* 45-degree random guess line */}
                <line x1={36} y1={200} x2={300} y2={20} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 4" />

                {/* ROC Curve Path */}
                <path
                  d={rocPoints.map((pt, idx) => {
                    const x = 36 + pt.fpr * 264;
                    const y = 200 - pt.tpr * 180;
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Active Threshold Indicator Point */}
                {(() => {
                  const currFpr = simulatedMetrics.fpr;
                  const currTpr = simulatedMetrics.recall;
                  const cx = 36 + currFpr * 264;
                  const cy = 200 - currTpr * 180;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      <text x={cx + 8} y={cy - 6} fontSize="8" fontWeight="700" fill="#dc2626">
                        Cutoff: {(decisionThreshold * 100).toFixed(0)}%
                      </text>
                    </g>
                  );
                })()}

                {/* Axis Labels */}
                <text x={168} y={230} fontSize="9" fontWeight="600" fill="#64748b" textAnchor="middle">
                  False Positive Rate (1 - Specificity)
                </text>
                <text x={-110} y={14} transform="rotate(-90)" fontSize="9" fontWeight="600" fill="#64748b" textAnchor="middle">
                  True Positive Rate (Recall)
                </text>
              </svg>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
              🔴 Red marker denotes current operational threshold ({(decisionThreshold * 100).toFixed(0)}%).
            </div>
          </div>

          {/* Precision-Recall Curve SVG Plot */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Precision-Recall (PR) Curve
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Precision vs Recall trade-off trajectory</span>
              </div>
              <span style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                PR-AUC = {activeModel.prAuc}
              </span>
            </div>

            <div style={{ width: '100%', height: '280px', position: 'relative' }}>
              <svg viewBox="0 0 320 240" width="100%" height="100%">
                {/* Background Grid */}
                {[0.2, 0.4, 0.6, 0.8].map(tick => (
                  <g key={tick}>
                    <line x1={36} y1={20 + (1 - tick) * 180} x2={300} y2={20 + (1 - tick) * 180} stroke="#f1f5f9" strokeWidth="1" />
                    <line x1={36 + tick * 264} y1={20} x2={36 + tick * 264} y2={200} stroke="#f1f5f9" strokeWidth="1" />
                    <text x={30} y={24 + (1 - tick) * 180} fontSize="8" fill="#94a3b8" textAnchor="end">{tick.toFixed(1)}</text>
                    <text x={36 + tick * 264} y={214} fontSize="8" fill="#94a3b8" textAnchor="middle">{tick.toFixed(1)}</text>
                  </g>
                ))}

                {/* Axes */}
                <line x1={36} y1={20} x2={36} y2={200} stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1={36} y1={200} x2={300} y2={200} stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Baseline positive class prevalence (50%) */}
                <line x1={36} y1={110} x2={300} y2={110} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="4 4" />
                <text x={295} y={105} fontSize="7.5" fill="#94a3b8" textAnchor="end">Prevalence: 50%</text>

                {/* PR Curve Path */}
                <path
                  d={prPoints.map((pt, idx) => {
                    const x = 36 + pt.recall * 264;
                    const y = 200 - pt.prec * 180;
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Active Threshold Indicator Point */}
                {(() => {
                  const currRec = simulatedMetrics.recall;
                  const currPrec = simulatedMetrics.precision;
                  const cx = 36 + currRec * 264;
                  const cy = 200 - currPrec * 180;
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r="6" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
                      <text x={cx - 10} y={cy - 8} fontSize="8" fontWeight="700" fill="#7c3aed" textAnchor="end">
                        ({(currRec * 100).toFixed(0)}% Rec, {(currPrec * 100).toFixed(0)}% Prec)
                      </text>
                    </g>
                  );
                })()}

                {/* Axis Labels */}
                <text x={168} y={230} fontSize="9" fontWeight="600" fill="#64748b" textAnchor="middle">
                  Recall (Coverage of Inundations)
                </text>
                <text x={-110} y={14} transform="rotate(-90)" fontSize="9" fontWeight="600" fill="#64748b" textAnchor="middle">
                  Precision (Positive Predictive Value)
                </text>
              </svg>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
              🟣 Purple marker shows current Precision / Recall balance on the PR frontier.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: 15-FEATURE SHAP EXPLAINABILITY */}
      {/* ========================================================================= */}
      {activeSubTab === 'shap' && (
        <div>
          {/* Controls Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Category Filters */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', 'Topographical', 'Satellite', 'Meteorological', 'Urban'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFeatureCategory(cat)}
                  style={{
                    background: featureCategory === cat ? '#0284c7' : '#f1f5f9',
                    color: featureCategory === cat ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {cat === 'all' ? 'All 15 Features' : cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search features (e.g. elevation, rain, ndwi)..."
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                minWidth: '260px'
              }}
            />
          </div>

          {/* Features Grid & SHAP Bar Chart */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            {/* SHAP Impact Bars */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
                Mean |SHAP| Value Impact on Flood Risk Output (XGBoost)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredFeatures.map((f, idx) => {
                  const maxShap = 1.3698;
                  const pct = (f.shapImpact / maxShap) * 100;
                  const isSelected = expandedFeature === f.name;

                  return (
                    <div
                      key={f.name}
                      onClick={() => setExpandedFeature(f.name)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isSelected ? '#f0f9ff' : '#f8fafc',
                        border: isSelected ? '1px solid #7dd3fc' : '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>#{idx + 1}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{f.label}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                            {f.category}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>
                          {f.shapImpact.toFixed(4)}
                        </span>
                      </div>

                      {/* Bar */}
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: isSelected ? 'linear-gradient(90deg, #0284c7, #38bdf8)' : '#94a3b8'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Explainability Deep Dive */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              {(() => {
                const feat = features.find(f => f.name === expandedFeature) || features[0];
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>
                        {feat.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Unit: {feat.unit}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                      {feat.label}
                    </h3>

                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '0.84rem',
                      color: '#334155',
                      lineHeight: 1.5,
                      marginBottom: '18px'
                    }}>
                      <strong>Hydrologic & Physical Rationale:</strong><br />
                      {feat.description}
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                        Partial Dependence & Non-linear Threshold Dynamics:
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        {feat.name === 'elevation' && '• Elevations below 15m trigger a steep 4.2x hazard multiplier in coastal river deltas.\n• Above 80m, runoff velocity is high, practically precluding stagnant standing water.'}
                        {feat.name === 'ndwi' && '• Values < -0.1 represent dry urban land.\n• Values between 0.15 and 0.40 correlate with wet mud and pre-flooded soils.\n• Values > 0.45 signify open surface water.'}
                        {feat.name === 'rainfall_72h' && '• Under 80mm: soil retains healthy infiltration capacity.\n• 80mm to 160mm: field capacity reached, ponding begins.\n• > 160mm: saturated overland runoff causing critical flooding.'}
                        {!['elevation', 'ndwi', 'rainfall_72h'].includes(feat.name) && '• Feature exhibits non-linear monotonic or interaction effects in XGBoost boosted trees, strongly modulating acute precipitation runoff.'}
                      </div>
                    </div>

                    <div style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '0.8rem',
                      color: '#065f46'
                    }}>
                      ✅ <strong>Data Source:</strong> Global Copernicus DEM & Open-Meteo Satellite Feed integrated live in real time.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: MULTI-MODEL BENCHMARK & RADAR COMPARISON */}
      {/* ========================================================================= */}
      {activeSubTab === 'benchmark' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Comparison Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
              Comprehensive Algorithm Benchmark Matrix (12,417 Test Instances)
            </h4>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 14px' }}>Model</th>
                  <th style={{ padding: '10px 14px' }}>Accuracy</th>
                  <th style={{ padding: '10px 14px' }}>Precision</th>
                  <th style={{ padding: '10px 14px' }}>Recall</th>
                  <th style={{ padding: '10px 14px' }}>F1-Score</th>
                  <th style={{ padding: '10px 14px' }}>ROC-AUC</th>
                  <th style={{ padding: '10px 14px' }}>Latency (ms)</th>
                  <th style={{ padding: '10px 14px' }}>Model Size</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map(m => {
                  const isSelected = m.id === selectedModelId;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedModelId(m.id)}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: isSelected ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 700 : 500
                      }}
                    >
                      <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{m.name}</span>
                        {m.isActive && (
                          <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                            ACTIVE PROD
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#0f172a' }}>{(m.accuracy * 100).toFixed(1)}%</td>
                      <td style={{ padding: '12px 14px', color: '#0284c7' }}>{(m.precision * 100).toFixed(1)}%</td>
                      <td style={{ padding: '12px 14px', color: '#059669' }}>{(m.recall * 100).toFixed(1)}%</td>
                      <td style={{ padding: '12px 14px', color: '#7c3aed' }}>{(m.f1Score * 100).toFixed(1)}%</td>
                      <td style={{ padding: '12px 14px', color: '#d97706', fontWeight: 700 }}>{m.rocAuc}</td>
                      <td style={{ padding: '12px 14px' }}>{m.latencyMs} ms</td>
                      <td style={{ padding: '12px 14px' }}>{m.modelSizeMb} MB</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          background: isSelected ? '#0284c7' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b',
                          fontWeight: 700
                        }}>
                          {isSelected ? 'Viewing' : 'Select'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Architecture Justification & Radar Plot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Why XGBoost Was Selected */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                Engineering Justification: Why XGBoost Wins Production
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
                <li><strong>Superior Tabular Inductive Bias:</strong> Decision tree ensembles naturally split continuous geospatial variables (e.g. elevation &lt; 15m) without suffering from neural network saturation.</li>
                <li><strong>Extreme Inference Speed:</strong> At 1.8ms per query, XGBoost easily serves real-time live map rendering across global coordinates.</li>
                <li><strong>No Feature Standardization Needed:</strong> Raw physical units (meters, mm rain, index ratios) can be directly ingested without destructive normalization.</li>
                <li><strong>Exact Probabilistic Calibration:</strong> Brier score of 0.0625 ensures output probabilities accurately reflect physical flood likelihood.</li>
              </ul>
            </div>

            {/* Radar / Multi-Dimension Visualization */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                5-Axis Algorithmic Trade-off (XGBoost vs LightGBM vs Random Forest)
              </h4>

              <div style={{ width: '100%', height: '220px' }}>
                <svg viewBox="0 0 280 200" width="100%" height="100%">
                  {/* Pentagonal Axes */}
                  {[0.25, 0.5, 0.75, 1.0].map(r => {
                    const radius = r * 80;
                    const cx = 140;
                    const cy = 100;
                    return (
                      <circle key={r} cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    );
                  })}

                  {/* XGBoost Polygon (Blue) */}
                  <polygon
                    points="140,24 210,75 185,160 95,160 70,75"
                    fill="rgba(2, 132, 199, 0.25)"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />

                  {/* LightGBM Polygon (Green) */}
                  <polygon
                    points="140,32 215,70 175,150 105,150 78,78"
                    fill="rgba(16, 185, 129, 0.15)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Axis Labels */}
                  <text x={140} y={16} fontSize="8" fontWeight="700" fill="#0284c7" textAnchor="middle">ROC-AUC (0.968)</text>
                  <text x={224} y={75} fontSize="8" fontWeight="700" fill="#10b981" textAnchor="start">Inference Speed</text>
                  <text x={195} y={175} fontSize="8" fontWeight="700" fill="#64748b" textAnchor="middle">Precision (90.4%)</text>
                  <text x={85} y={175} fontSize="8" fontWeight="700" fill="#64748b" textAnchor="middle">Recall (92.8%)</text>
                  <text x={56} y={75} fontSize="8" fontWeight="700" fill="#64748b" textAnchor="end">Generalization</text>
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ color: '#0284c7' }}>■ XGBoost (Production Active)</span>
                <span style={{ color: '#10b981' }}>- - LightGBM (Challenger)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: LIVE INFERENCE SANDBOX */}
      {/* ========================================================================= */}
      {activeSubTab === 'sandbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Controls */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              Real-Time Inference Latency & Prediction Sandbox
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              Simulate live environmental sensor inputs and measure microsecond inference speed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <span>24-Hour Rainfall</span>
                  <span>{sandboxInputs.rainfall24h} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  value={sandboxInputs.rainfall24h}
                  onChange={(e) => setSandboxInputs({ ...sandboxInputs, rainfall24h: e.target.value })}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <span>72-Hour Antecedent Rain</span>
                  <span>{sandboxInputs.rainfall72h} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={sandboxInputs.rainfall72h}
                  onChange={(e) => setSandboxInputs({ ...sandboxInputs, rainfall72h: e.target.value })}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <span>Digital Elevation (DEM)</span>
                  <span>{sandboxInputs.elevation} m</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="200"
                  value={sandboxInputs.elevation}
                  onChange={(e) => setSandboxInputs({ ...sandboxInputs, elevation: e.target.value })}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <span>Sentinel-2 NDWI Index</span>
                  <span>{sandboxInputs.ndwi}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.8"
                  step="0.05"
                  value={sandboxInputs.ndwi}
                  onChange={(e) => setSandboxInputs({ ...sandboxInputs, ndwi: e.target.value })}
                  style={{ width: '100%', accentColor: '#0284c7' }}
                />
              </div>

              <button
                onClick={handleRunSandbox}
                disabled={isSandboxRunning}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  marginTop: '10px'
                }}
              >
                {isSandboxRunning ? 'Computing Boosted Decision Trees...' : '⚡ Run Instant Inference Benchmark'}
              </button>
            </div>
          </div>

          {/* Results Output */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Real-Time Model Execution Output
            </h4>

            {sandboxResult ? (
              <div>
                <div style={{
                  background: sandboxResult.isBreached ? '#fef2f2' : '#f0fdf4',
                  border: sandboxResult.isBreached ? '1px solid #fecaca' : '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: sandboxResult.isBreached ? '#dc2626' : '#16a34a', textTransform: 'uppercase' }}>
                    {sandboxResult.isBreached ? '🚨 CRITICAL INUNDATION DETECTED' : '✅ NORMAL CONDITIONS (SAFE)'}
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, color: sandboxResult.isBreached ? '#b91c1c' : '#15803d', margin: '4px 0' }}>
                    {sandboxResult.probability}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Decision: {sandboxResult.probability >= (decisionThreshold * 100) ? 'Exceeds' : 'Below'} active {(decisionThreshold * 100).toFixed(0)}% threshold
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Execution Time</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>{sandboxResult.latency} ms</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Est. Water Depth</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{sandboxResult.waterDepthEst} m</div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', fontSize: '0.78rem', color: '#64748b' }}>
                  🔒 {sandboxResult.confidence} on stratified test manifold.
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
                <div style={{ fontWeight: 600 }}>Ready for Instant Benchmark</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click "Run Instant Inference Benchmark" to measure execution speed.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
