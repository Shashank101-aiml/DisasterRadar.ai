export interface BenchmarkModel {
  id: string;
  name: string;
  badge: string;
  isActive: boolean;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  latencyMs: number;
  modelSizeMb: number;
  confusionMatrix: { tp: number; fp: number; fn: number; tn: number };
}

export const DEFAULT_MODELS: BenchmarkModel[] = [
  {
    id: 'xgboost', name: 'XGBoost Classifier', badge: 'Active Production Model', isActive: true,
    accuracy: 0.9147, precision: 0.9044, recall: 0.9275, f1Score: 0.9158, rocAuc: 0.9676, prAuc: 0.9602, brierScore: 0.0625,
    latencyMs: 1.8, modelSizeMb: 4.7, confusionMatrix: { tn: 5600, fp: 609, fn: 450, tp: 5758 }
  },
  {
    id: 'random_forest', name: 'Random Forest Ensemble', badge: 'Bagging Champion', isActive: false,
    accuracy: 0.9017, precision: 0.8759, recall: 0.9359, f1Score: 0.9049, rocAuc: 0.9610, prAuc: 0.9514, brierScore: 0.0742,
    latencyMs: 4.2, modelSizeMb: 9.46, confusionMatrix: { tn: 5386, fp: 823, fn: 398, tp: 5810 }
  },
  {
    id: 'neural_net', name: 'PyTorch FloodNet Deep NN', badge: 'Deep Learning Candidate', isActive: false,
    accuracy: 0.8720, precision: 0.8640, recall: 0.8830, f1Score: 0.8734, rocAuc: 0.9250, prAuc: 0.9170, brierScore: 0.0930,
    latencyMs: 3.4, modelSizeMb: 0.02, confusionMatrix: { tn: 5320, fp: 889, fn: 726, tp: 5482 }
  }
];

export interface ShapFeature {
  name: string;
  label: string;
  category: string;
  unit: string;
  shapImpact: number;
  description: string;
}

export const DEFAULT_FEATURES: ShapFeature[] = [
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

export const PARTIAL_DEPENDENCE_NOTES: Record<string, string> = {
  elevation: 'Elevations below 15m trigger a steep 4.2x hazard multiplier in coastal river deltas. Above 80m, runoff velocity is high, practically precluding stagnant standing water.',
  ndwi: 'Values < -0.1 represent dry urban land. Values between 0.15 and 0.40 correlate with wet mud and pre-flooded soils. Values > 0.45 signify open surface water.',
  rainfall_72h: 'Under 80mm: soil retains healthy infiltration capacity. 80mm to 160mm: field capacity reached, ponding begins. > 160mm: saturated overland runoff causing critical flooding.'
};
export const DEFAULT_PARTIAL_DEPENDENCE_NOTE = 'Feature exhibits non-linear monotonic or interaction effects in XGBoost boosted trees, strongly modulating acute precipitation runoff.';
