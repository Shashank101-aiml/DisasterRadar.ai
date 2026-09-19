// Ported verbatim from frontend/src/components/AiExplainerView.jsx so the mobile
// Explainable AI & SOPs screen carries the exact same flood-safety content as the web app.

export interface FloodScenario {
  name: string;
  type: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  prob: number;
  rainfall24h: number;
  rainfall72h: number;
  elevation: number;
  leadTime: string;
  actionTitle: string;
  waterDepthEst: string;
  summary: string;
}

export const FLOOD_SCENARIOS: Record<string, FloodScenario> = {
  current: {
    name: 'Live Flood Telemetry: Monitored Flood Basin',
    type: 'Real-time Station Analysis',
    risk: 'HIGH',
    prob: 78.4,
    rainfall24h: 85,
    rainfall72h: 190,
    elevation: 900,
    leadTime: '4 to 8 Hours Lead Time',
    actionTitle: 'Elevate Assets, Secure Siphons & Prepare Phased Evacuation',
    waterDepthEst: '0.45m - 0.85m potential street ponding',
    summary: 'Based on live 24h/72h rainfall and terrain elevation, our AI hydro-engine estimates the current flood inundation probability. Immediate protective actions required.'
  },
  flash_flood: {
    name: '⚡ Rapid Flash Flood & Cloudburst Inundation',
    type: 'Torrential High-Velocity Inundation',
    risk: 'CRITICAL',
    prob: 94.8,
    rainfall24h: 180,
    rainfall72h: 320,
    elevation: 18,
    leadTime: '30 to 60 Minutes (Urgent Alert)',
    actionTitle: 'Immediate Vertical Evacuation to Higher Concrete Floors',
    waterDepthEst: '1.2m - 2.1m rapid surge (> 2.5 m/s velocity)',
    summary: 'Extreme rainfall intensity exceeding municipal storm drains. Water rises within minutes. DO NOT attempt to drive or walk through street torrents. Move vertically above the 2nd floor immediately.'
  },
  riverine_flood: {
    name: '🌊 Riverine Basin Overflow (Riverbank Spillage)',
    type: 'Overland Floodplain Inundation',
    risk: 'HIGH',
    prob: 84.5,
    rainfall24h: 110,
    rainfall72h: 260,
    elevation: 32,
    leadTime: '6 to 12 Hours Lead Time',
    actionTitle: 'Lateral Evacuation of People, Cattle & Vehicles to +15m Contour Line',
    waterDepthEst: '0.8m - 1.6m sustained backwater',
    summary: 'Major river stage approaching danger mark. Gradual overland expansion will submerge riparian settlements in 3 distinct flood waves. Relocate vulnerable residents and unchain cattle now.'
  },
  urban_drainage: {
    name: '🏙️ Urban Stormwater Drainage Failure & Waterlogging',
    type: 'Civic Infrastructure Surcharge',
    risk: 'MODERATE',
    prob: 62.3,
    rainfall24h: 65,
    rainfall72h: 140,
    elevation: 45,
    leadTime: '12 to 24 Hours Lead Time',
    actionTitle: 'Deploy Sandbag Barriers & Elevate Ground-Floor Electronics',
    waterDepthEst: '0.3m - 0.6m localized waterlogging',
    summary: 'Stormwater culverts choked with silt and debris. Underpasses and low-lying basements are at immediate risk of localized flooding. Seal toilet drains to prevent sewer backflow.'
  },
  dam_overflow: {
    name: '🛑 Dam Spillway Discharge & Sluice Gate Release',
    type: 'Regulated Reservoir Downstream Release',
    risk: 'CRITICAL',
    prob: 91.2,
    rainfall24h: 135,
    rainfall72h: 295,
    elevation: 24,
    leadTime: '2 to 4 Hours Lead Time',
    actionTitle: 'Mandatory Complete Evacuation of Downstream Floodplains',
    waterDepthEst: '1.5m - 2.8m catastrophic discharge channel wave',
    summary: 'Upstream dam at 98% full capacity; emergency spillway gates opening. Downstream riverbed flow will increase by 45,000 cusecs. Clear all low-lying bridges, farms, and riverbanks immediately.'
  },
  coastal_surge: {
    name: '🌊 Coastal Estuarine Surge & High-Tide Flood Ingress',
    type: 'Tidal Monsoon Confluence',
    risk: 'HIGH',
    prob: 79.6,
    rainfall24h: 90,
    rainfall72h: 210,
    elevation: 4,
    leadTime: '4 to 6 Hours (Aligned with High Tide)',
    actionTitle: 'Inland Evacuation Away from Mangrove Creeks & Estuaries',
    waterDepthEst: '0.9m - 1.4m saline storm ingress',
    summary: 'Astronomical spring high tide prevents monsoon runoff from draining into the sea, causing severe backwater accumulation across low-elevation coastal wards (e.g. Mira Bhayandar / coastal creeks).'
  }
};

export const SCENARIO_LABELS: Record<string, string> = {
  current: '📡 Live Data',
  flash_flood: '⚡ Flash Flood',
  riverine_flood: '🌊 River Overflow',
  urban_drainage: '🏙️ Waterlogging',
  dam_overflow: '🛑 Dam Release',
  coastal_surge: '🌊 Coastal Surge'
};

export interface KnowledgeEntry {
  q: string;
  a: string;
}

export const FLOOD_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    q: 'How should I evacuate and protect heavy home appliances and electronics in a flood?',
    a: '1. Disconnect and elevate: Unplug all appliances. Elevate refrigerators, washing machines, inverter battery banks, and television sets on sturdy concrete blocks or move them to the first floor (above the 100-year flood line).\n2. Isolate main electricity (MCB): Turn off the main electrical circuit breaker BEFORE water touches socket level (usually 30 cm from floor). This prevents short-circuit fires and fatal water electrification.\n3. Secure compressor motors: Seal refrigerator compressor drain holes with waterproof duct tape if movement is impossible to minimize silt damage.\n4. Protect gas cylinders: Secure LPG cylinders in an upright position with nylon straps to high window bars so they don\'t float away and rupture valves.'
  },
  {
    q: 'How do I evacuate vehicles (cars, motorcycles) and why is driving through floodwater fatal?',
    a: '1. Pre-evacuation parking: Move vehicles at least 12 hours before peak rain to elevated multi-level parking ramps, flyovers, or high-ground community berms.\n2. "Turn Around, Don\'t Drown": Just 6 inches (15 cm) of moving floodwater knocks an adult down. 12 inches (30 cm) of water floats passenger cars, breaking tire contact. 24 inches (60 cm) sweeps away heavy SUVs and trucks.\n3. Engine Hydraulic Lock: If water enters the engine air intake (located near front headlights), water is sucked into cylinders. Because water cannot compress, pistons bend instantly, destroying the engine and stalling the vehicle in the middle of the flood.\n4. Emergency egress if trapped in a car: If your vehicle stalls in rising water, UNBUCKLE IMMEDIATELY, roll down the window (or break it with headrest prongs if electrical power fails), climb onto the car roof, and signal for rescue. NEVER stay inside a sinking car.'
  },
  {
    q: 'How do I prevent municipal sewer backflow from flooding my home through toilets and drains?',
    a: '1. Why it happens: When city storm drains overflow, floodwater surcharges municipal sewer mains, forcing contaminated blackwater backward up through ground-floor toilets, shower drains, and kitchen sinks.\n2. Mechanical drain plugs: Install expanding rubber test plugs (pneumatic or mechanical pipe plugs) in ground-floor floor drains.\n3. Sandbag toilet seal: Place a sealed plastic garbage bag over the toilet bowl rim, close the lid, and place a 25kg sandbag directly on top of the lid to hold back pressurized sewer water.\n4. Check valve: Ensure exterior sewer inspection chambers have a functional non-return backwater check valve installed.'
  },
  {
    q: 'How do I evacuate elderly, bedridden, and mobility-impaired family members during floods?',
    a: '1. Early Phase 1 Evacuation: Evacuate elderly persons during the 24-hour Yellow Flood Alert before road currents develop. Once water reaches 1 foot, wheelchair or stretcher evacuation becomes hazardous.\n2. 14-Day Medical Supply Pouch: Pack a 14-day supply of cardiac, blood pressure, insulin, and prescription medicines in a floatable waterproof dry-bag along with doctor prescriptions.\n3. Backup Power for Medical Devices: If oxygen concentrators or CPAP machines are needed, bring a charged 12V portable power station or manual bag-valve-mask resuscitator.\n4. Register with NDRF / Civil Defense: Notify local disaster helplines (112 / 1070) of the exact GPS location of bedridden patients so high-clearance rescue boats are prioritized.'
  },
  {
    q: 'How do I safely evacuate farm livestock, cattle, and domestic pets during floods?',
    a: '1. NEVER leave animals tied or locked in sheds: A tied cow, buffalo, or dog cannot escape rising floodwaters and will drown when water reaches 3-4 feet. If you cannot transport them, UNCHAIN THEM IMMEDIATELY so they can instinctively swim to natural high ground.\n2. Elevated Earth Mounds (Kanti): Move cattle herds to designated community earthen flood berms elevated at least 2 meters above maximum historical flood levels.\n3. Dry Fodder Preservation: Protect hay and cattle feed by wrapping in plastic tarpaulins on elevated bamboo scaffolds. Wet silage rots quickly and causes bovine rumen acidosis.\n4. Small Pets: Keep cats and dogs in hard-shelled pet carriers with harnesses, collapsible water bowls, and dry pet rations.'
  },
  {
    q: 'What should I do if trapped on an upper floor or rooftop surrounded by rising floodwater?',
    a: '1. Ascend vertically: Move to the highest accessible concrete floor or roof. DO NOT climb into a closed attic without an exterior roof access hatch, as rising floodwater can trap you against the ceiling.\n2. Do NOT drink floodwater: Floodwater is laden with raw sewage, industrial toxins, Leptospirosis, and cholera. Rely strictly on sealed bottled water or rainwater collected in clean buckets.\n3. Signal Emergency Rescue: Signal helicopters and rescue boats with bright orange/red cloths, reflective mirrors during day, flashlights/phone strobes at night, and 3 sharp whistle blasts.\n4. Beware of wildlife: Displaced snakes, rodents, and scorpions will also seek high ground on trees and roofs. Keep a sturdy stick handy and do not reach into dark crevices.'
  }
];

export const FALLBACK_ANSWER = (query: string) =>
  `Emergency Flood Action Plan for "${query}":\n1. Check water depth: Never step into moving water > 6 inches.\n2. Ascend to highest concrete structural floor immediately.\n3. Turn off main circuit breaker (MCB) to prevent water electrification.\n4. Call emergency dispatch 112 / State Disaster Management 1070 with your exact GPS coordinates.`;

export interface SyllabusRequirement {
  id: number;
  code: string;
  title: string;
  status: string;
  description: string;
  evidence: string[];
  artifact: string;
  icon: string;
}

export const SYLLABUS_REQUIREMENTS: SyllabusRequirement[] = [
  {
    id: 1, code: 'REQ-01', title: 'Collect historical disaster and weather datasets (Flood Focus)', status: '100% FULFILLED',
    description: 'Massive multi-sensor historical flood hydrology datasets combined with live meteorological precipitation telemetry.',
    evidence: [
      '1,025,802 records from MODIS Satellite Flood Remote Sensing containing precip_1d, precip_3d, elevation, slope, TWI, NDWI, and target flood flags',
      '50,000 historical flood governance & municipal vulnerability records tracking DrainageSystems, TopographyDrainage, and Urbanization',
      'Live flood weather pipeline via Open-Meteo REST API delivering past 24h & 72h precipitation, humidity, pressure, and rainfall forecasts',
      'Copernicus Global 30m Digital Elevation Model (DEM) and Topographic Wetness Index (TWI) integration'
    ],
    artifact: 'data/processed/processed_data.csv & backend/services/geospatial_api.py', icon: '🌊'
  },
  {
    id: 2, code: 'REQ-02', title: 'Perform preprocessing and feature selection (Flood Hydrodynamics)', status: '100% FULFILLED',
    description: 'Leakage-free normalization, physics-based bounds clamping, and engineering 4 domain hydrodynamic flood indices.',
    evidence: [
      'StandardScaler transformation fitted strictly on training partition with zero data leakage',
      'Engineered Cumulative Rainfall Ratio: R_ratio = R_72h / (R_24h + 1.0) to capture soil saturation dynamics',
      'Engineered Ponding Hazard Index: PHI = (100.0 - min(elev, 100.0)) / (slope + 0.1) measuring depression water storage',
      'Engineered Topographic Wetness Index: TWI = ln(a / tan(β)) quantifying topographic runoff convergence',
      'Engineered Water Contrast Index: WCI = NDWI - NDVI to distinguish inundated terrain from dense canopy',
      'TreeSHAP feature selection isolating Elevation (+1.54), NDVI (+1.00), NDWI (+0.72), and 24h/72h rainfall as top predictive flood drivers'
    ],
    artifact: 'notebooks/02_preprocessing.ipynb, notebooks/03_feature_engineering.ipynb & models/feature_names.json', icon: '⚙️'
  },
  {
    id: 3, code: 'REQ-03', title: 'Develop a probabilistic prediction model (Flood Inundation Probability)', status: '100% FULFILLED',
    description: 'Engineered calibrated Native XGBoost classifier and PyTorch FloodNet deep learning architecture outputting calibrated flood probabilities [0.0, 1.0].',
    evidence: [
      'Native XGBoost Model (models/flood_model.json): Deployed in secure JSON format (strictly no pickle vulnerability) providing calibrated continuous flood probabilities',
      'PyTorch FloodNet Deep Neural Network (models/flood_net_best.pt): 15-epoch training loop with AdamW (lr=0.003), CosineAnnealingLR, and positive-weighted BCEWithLogitsLoss for class imbalance',
      'Brier Loss Calibration Score: 0.0616, proving that predicted flood probabilities strictly match observed flood frequencies',
      'Ultra-fast real-time inference latency of < 12ms per hydrological prediction query'
    ],
    artifact: 'src/models/train_xgboost_pipeline.py, models/flood_model.json & models/flood_net_best.pt', icon: '🧠'
  },
  {
    id: 4, code: 'REQ-04', title: 'Predict disaster risk levels for different regions (Multi-Basin Flood Zones)', status: '100% FULFILLED',
    description: 'Granular flood risk level classification (LOW, MODERATE, HIGH, CRITICAL) mapped across urban wards, river basins, and global coordinates.',
    evidence: [
      '4-Tier Flood Risk Standardization: LOW (<35%), MODERATE (35%–65%), HIGH (65%–85%), CRITICAL (>85%)',
      'Karnataka Hydrological Sensor Grid: 10 live stations (Bengaluru Central, Yelahanka, Nelamangala, Hoskote, Kolar, Hosur, Anekal, Kanakapura, Ramanagara, Magadi)',
      'Mira Bhayandar Cartographic Flood Atlas: High-resolution 5-tier ward-level flood vulnerability choropleths showing railway embankment choke points and creek inundation',
      'Global 3D Earth Globe: Interactive coordinate raycasting for real-time flood forecasting at any longitude/latitude on Earth'
    ],
    artifact: 'frontend/src/components/RiskMap.jsx, MiraBhayandarRiskMap.jsx & GlobeRiskMap.jsx', icon: '🗺️'
  },
  {
    id: 5, code: 'REQ-05', title: 'Evaluate the model using suitable performance metrics (Flood Benchmarks)', status: '100% FULFILLED',
    description: 'Rigorous empirical evaluation against 10,000 unseen held-out validation flood and non-flood events.',
    evidence: [
      'High Accuracy: 91.24% on native XGBoost pipeline (91.65% ensemble)',
      'Exceptional ROC-AUC: 0.9623 across all decision thresholds',
      'Life-Critical Recall (Sensitivity): 84.77% (successfully detects 1,676 out of 1,977 true flood events, minimizing life-threatening false negatives)',
      'Precision: 74.46% | F1-Score: 0.7928 | PR-AUC: 0.8569 | Brier Loss: 0.0616',
      'Full 10,000-sample Confusion Matrix: True Negatives: 7,448 | False Positives: 575 | False Negatives: 301 | True Positives: 1,676'
    ],
    artifact: 'models/metrics.json, notebooks/05_model_evaluation.ipynb & tests/test_prediction.py', icon: '📈'
  },
  {
    id: 6, code: 'REQ-06', title: 'Recommend early warning and risk mitigation strategies (Flood Protection)', status: '100% FULFILLED',
    description: 'Contextual AI flood advisory engine generating actionable civil defense notifications, drainage clearing orders, and evacuation triggers.',
    evidence: [
      'Automated 3-Tier Early Warning: Yellow Watch (Monitor & Clear Silt), Orange Advisory (Stage Sandbags & Move Cars), Red Emergency (Evacuate Immediately)',
      'Dynamic Decision Threshold: Calibrated at 55% to trigger life-safety evacuations 6-12 hours ahead of peak flood inundation',
      'Contextual Mitigation Engine: Recommends storm drain desilting when Drainage Stress is dominant; triggers temporary flood barrier erection when ponding hazard surges',
      'Emergency Municipal Protocols: Sluice gate coordination guidelines and electrical sub-station isolation procedures'
    ],
    artifact: 'backend/services/alerts_service.py & frontend/src/components/AlertsReportsView.jsx', icon: '🚨'
  },
  {
    id: 7, code: 'REQ-07', title: 'Discuss social impact and practical applications of the system (Flood Resilience)', status: '100% FULFILLED',
    description: 'Thorough evaluation of socio-economic benefits, humanitarian relief optimization, and climate-resilient urban flood defense.',
    evidence: [
      'Saving Human Lives: 48h–72h early flood warning lead time gives municipal authorities the window required to evacuate thousands of residents safely',
      'Infrastructure Safeguarding: Prevents catastrophic electrical transformer explosions and drinking water contamination by enabling timely pre-flood shutdowns',
      'Optimizing Disaster Response (NDRF/SDRF): High-resolution flood risk heatmaps direct rescue boats and amphibious vehicles to the most vulnerable wards first',
      'Informal Settlement Protection: Focuses early warning alerts on low-income riparian communities situated along natural drainage channels',
      'Climate-Resilient City Planning: Identifies high-risk retention zones where construction should be restricted to preserve natural flood absorption sponge capacity'
    ],
    artifact: 'frontend/src/components/AboutProjectView.jsx & README.md', icon: '🌍'
  }
];

export interface ChecklistItem {
  key: string;
  label: string;
  detail: string;
  defaultChecked: boolean;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'docs', label: 'Waterproof Dry Pouch for Documents', detail: 'Passports, IDs, property deeds, insurance policies, university certificates in a sealed floatable dry bag.', defaultChecked: true },
  { key: 'water', label: '3-Day Clean Drinking Water & Aquatabs', detail: '4 liters per person per day + chlorine purification tablets to disinfect raw rainwater.', defaultChecked: true },
  { key: 'firstaid', label: 'Trauma & Flood First Aid Kit', detail: 'Antiseptics, waterproof bandages, wound wash, tourniquet, burn ointment, and sterile gauze.', defaultChecked: true },
  { key: 'plugs', label: 'Sewer Backflow Mechanical Plugs', detail: 'Rubber mechanical expanding test plugs to seal ground-floor toilet siphon traps and bathroom drains.', defaultChecked: false },
  { key: 'car_relocate', label: 'Vehicle Relocated to High-Ground Berm', detail: 'Car or motorbike moved to elevated multi-level parking ramps or flyovers at least 12 hours ahead.', defaultChecked: true },
  { key: 'food', label: 'High-Calorie Non-Perishable Food', detail: 'Nutrient bars, peanut butter, canned foods with pull-tabs, dried fruits (zero cooking or heating required).', defaultChecked: false },
  { key: 'flashlight', label: 'IP68 Waterproof LED Flashlight', detail: 'Waterproof headlamp and torches with spare lithium batteries for wading at night.', defaultChecked: true },
  { key: 'powerbank', label: 'Charged 20,000mAh Power Bank', detail: 'Kept in airtight ziplock bag to charge emergency phones during 72-hour grid blackouts.', defaultChecked: false },
  { key: 'radio', label: 'AM/FM Battery/Crank Emergency Radio', detail: 'For receiving state civil defense and SDRF flood broadcast instructions when cell towers drown.', defaultChecked: false },
  { key: 'whistle', label: 'Pealess Emergency Rescue Whistle', detail: 'Loud pea-less marine whistle (audible up to 1.5 km to guide rescue boats in heavy downpours).', defaultChecked: false },
  { key: 'meds', label: '14-Day Prescription Meds (Floatable)', detail: 'Insulin, cardiac, hypertension, asthma inhalers stored in a floatable waterproof container.', defaultChecked: true },
  { key: 'cash', label: 'Emergency Cash in Small Denominations', detail: 'Cash in small bills (ATMs, card POS, and UPI fail immediately when municipal power is severed).', defaultChecked: true },
  { key: 'mcb_off', label: 'Main Electrical MCB Breaker Cut Off', detail: 'Main circuit breaker cut off before leaving to prevent catastrophic short-circuit water electrification.', defaultChecked: false },
  { key: 'lifejacket', label: 'Buoyancy Vests / Inflatable Lifejackets', detail: 'Coast-guard approved 100N lifejackets for all family members, especially children and non-swimmers.', defaultChecked: false },
  { key: 'pets', label: 'Domestic Pet Carrier & Food', detail: 'Rigid pet carrier, leash, collapsible bowl, and 3-day dry food pack for domestic cats/dogs.', defaultChecked: false },
  { key: 'livestock', label: 'Livestock Unchained & Berms Activated', detail: 'All cows and goats unchained to prevent stable drowning; herds moved to elevated flood mounds.', defaultChecked: false }
];

export interface WaterDepthTier {
  depth: string;
  title: string;
  desc: string;
  color: string;
}

export const WATER_DEPTH_MATRIX: WaterDepthTier[] = [
  { depth: '6 Inches (15 cm)', title: 'Human Walking Threshold', color: '#f59e0b', desc: 'Water reaches above the ankles. At velocities above 1.5 m/s, it generates enough lateral drag to knock healthy adults off their feet, sweeping them into drainage culverts.' },
  { depth: '12 Inches (30 cm)', title: 'Sedan & Hatchback Floating Threshold', color: '#f97316', desc: 'Displaces enough volume to float most cars (sedans, hatchbacks). Water enters the exhaust pipe and front air filter, killing the engine instantly and trapping passengers inside.' },
  { depth: '24 Inches (60 cm)', title: 'Heavy SUV & Rescue Truck Sweep', color: '#ef4444', desc: 'Generates enough hydrodynamic buoyant lift to sweep away heavy 4x4 SUVs, fire trucks, and police vans. Roads below water are frequently washed away, leading to fatal rollovers.' },
  { depth: '36+ Inches (1.0m+)', title: 'Severe Structural Inundation', color: '#ec4899', desc: 'Floods entire ground floors of buildings. Submerged hazards include live 11kV electrical cables, open storm manholes with suction vortexes, and Leptospirosis infection.' }
];

export interface HiddenHazard {
  title: string;
  desc: string;
  icon: string;
}

export const HIDDEN_HAZARDS: HiddenHazard[] = [
  { title: 'Open Manholes & Storm Suction Vortexes', desc: 'Rising floodwater dislodges 80kg cast-iron manhole covers. Murky water hides 3-meter deep vertical suction whirlpools that pull adults underground instantly.', icon: '🕳️' },
  { title: 'Downed Live 11kV Power Lines', desc: 'Submerged transformer boxes and fallen electricity wires charge standing water for up to 30 meters. Electrocution kills without warning in murky floodwater.', icon: '⚡' },
  { title: 'Debris Impact & Floating Vehicles', desc: 'Flood torrents carry submerged logs, steel railings, and drifting cars at 15 km/h. Impact against wading humans causes severe crush trauma and drowning.', icon: '🪵' },
  { title: 'Sewage Contamination & Leptospirosis', desc: "Floods mix rat urine and municipal sewage. Wading with scratches or cuts introduces Leptospira bacteria, leading to Weil's disease and multi-organ failure.", icon: '🦠' },
  { title: 'Displaced Reptiles & Snakebites', desc: 'Vipers, cobras, and scorpions are displaced from burrows and swim onto submerged staircases, floating debris, and low tree branches to survive.', icon: '🐍' }
];

export interface EvacuationCategory {
  label: string;
  icon: string;
  color: string;
  heading: string;
  points: { title: string; body: string }[];
}

export const EVACUATION_CATEGORIES: EvacuationCategory[] = [
  {
    label: 'Assets & Appliances', icon: '🔌', color: '#0284c7', heading: '1. How to Evacuate Electronics & Home Appliances',
    points: [
      { title: 'Cut Main Power Breaker (MCB):', body: 'Shut down the main electrical breaker before water reaches wall outlets. Never touch wet switches or plugs.' },
      { title: 'Elevate Large Appliances:', body: 'Move refrigerators, washing machines, and inverter batteries onto sturdy tables, concrete plinths, or to the first floor.' },
      { title: 'LPG Cylinder Lockdown:', body: 'Fasten gas cylinders securely with nylon ropes to high window grilles. Floating cylinders can shear pipes and ignite explosions.' },
      { title: 'Triple-Bag Documents:', body: 'Place property deeds, passports, degrees, and Aadhaar cards in sealed waterproof dry-pouches; carry on your chest pack.' }
    ]
  },
  {
    label: 'Vehicle & Transit Safety', icon: '🚗', color: '#f59e0b', heading: '2. How to Evacuate Vehicles & Prevent Drowning',
    points: [
      { title: 'Relocate to Multi-Level Parking:', body: 'Move cars and bikes 12 hours ahead to high flyovers, elevated multi-level parking ramps, or hilltop streets.' },
      { title: '"Turn Around, Don\'t Drown":', body: '12 inches (30 cm) of water floats cars; engine sucks water through air intake causing total hydrostatic lock.' },
      { title: 'Never Drive Through Underpasses:', body: 'Railway underpasses fill like bathtubs within 10 minutes, hiding 3-meter deep lethal water traps.' },
      { title: 'Car Stall Escape:', body: 'If your car is stalled in water, unbuckle instantly, roll down the window, climb to the roof, and do not attempt to push the car.' }
    ]
  },
  {
    label: 'Vulnerable Populations', icon: '👨‍👩‍👧‍👦', color: '#ef4444', heading: '3. Evacuating Elderly, Bedridden & Infants',
    points: [
      { title: 'Phase 1 Pre-Evacuation:', body: 'Evacuate elderly family members during daylight hours while ground access roads are dry.' },
      { title: '14-Day Medication Pack:', body: 'Pack insulin, cardiac pills, and blood pressure medications in airtight floatable dry-boxes with written prescriptions.' },
      { title: 'Portable Medical Oxygen:', body: 'Ensure portable oxygen cylinders and battery-operated nebulizers are charged and loaded into transport first.' },
      { title: 'NDRF Boat Coordination:', body: 'Register bedridden citizens with municipal emergency dispatch (112) for priority inflatable boat extraction.' }
    ]
  },
  {
    label: 'Livestock & Pets', icon: '🐄', color: '#10b981', heading: '4. How to Evacuate Cattle, Farm Animals & Pets',
    points: [
      { title: 'UNCHAIN CATTLE IMMEDIATELY:', body: 'Never leave cows or goats tied in stalls. A tethered cow will drown in 3 feet of water. Unchained cattle naturally swim to high ground.' },
      { title: 'Move to Earthen Berms:', body: 'Lead herds to elevated earthen community flood mounds (Kanti) constructed above the 100-year flood contour.' },
      { title: 'Elevate Dry Fodder:', body: 'Store hay bales and feed on elevated wooden platforms wrapped in tarps to prevent lethal rumen rot.' },
      { title: 'Domestic Pets:', body: 'Transport dogs and cats in rigid carriers with waterproof ID tags, leashes, and 3 days of dry pet food.' }
    ]
  },
  {
    label: 'Drainage & Siphon Sealing', icon: '🛡️', color: '#8b5cf6', heading: '5. Preventing Sewer Blackwater Ingress',
    points: [
      { title: 'Plug Floor Drains:', body: 'Insert mechanical expanding rubber plugs or water-filled heavy bags into ground-floor shower and floor drains.' },
      { title: 'Sandbag the Toilet:', body: 'Line the toilet bowl with heavy plastic, close lid, and place a 25 kg sandbag on top to block pressurized sewer backsurge.' },
      { title: 'Pyramid Sandbagging:', body: 'Stack sandbags against entry doors in a 1:3 pyramid ratio (base 3 sandbags wide, height 1 bag).' },
      { title: 'Exterior Non-Return Valves:', body: 'Check that municipal sewer connection inspection chambers have functioning flap valves.' }
    ]
  },
  {
    label: 'Post-Flood Protocol', icon: '🔄', color: '#06b6d4', heading: '6. Safe Re-Entry & Decontamination',
    points: [
      { title: 'Wait for Civil Defense "All-Clear":', body: 'Do not re-enter flood-damaged buildings until engineers certify structural foundations.' },
      { title: 'Zero Flames / Matches:', body: 'Inspect for ruptured gas pipes. Ventilate the home thoroughly before flipping any electrical switch.' },
      { title: 'Boil Water Advisory:', body: 'Tap water is contaminated with raw sewage and pathogens. Boil water vigorously for 3 minutes before drinking.' },
      { title: 'Silt Sanitization:', body: 'Wear thick rubber boots. Disinfect all mud-soaked walls and floors with a 1:10 household bleach solution.' }
    ]
  }
];
