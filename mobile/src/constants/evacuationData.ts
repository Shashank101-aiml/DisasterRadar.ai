export interface Shelter {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  elevation: number;
  capacity: number;
  occupied: number;
  medicalStation: boolean;
  foodSuppliesDays: number;
  powerBackup: string;
  phone: string;
  safetyRating: string;
}

export const OFFLINE_SHELTERS: Shelter[] = [
  {
    id: 'shelter-1', name: 'Mira Bhayandar Municipal Relief Stadium', type: 'Primary District Shelter',
    lat: 19.2995, lng: 72.8590, elevation: 34, capacity: 1200, occupied: 410, medicalStation: true,
    foodSuppliesDays: 14, powerBackup: 'Solar + Dual Diesel Genset', phone: '+91-22-2819-2828',
    safetyRating: 'A+ (High Ground Fortress)'
  },
  {
    id: 'shelter-2', name: 'Kanakia Hilltop Community Auditorium', type: 'Secondary High-Ground Shelter',
    lat: 19.2880, lng: 72.8685, elevation: 42, capacity: 850, occupied: 230, medicalStation: true,
    foodSuppliesDays: 10, powerBackup: 'Grid + Solar Microgrid', phone: '+91-22-2818-4490',
    safetyRating: 'A+ (Elevated Ridge)'
  },
  {
    id: 'shelter-3', name: 'Beverly Park Elevated Sports Complex', type: 'Medical & Triage Evacuation Point',
    lat: 19.2825, lng: 72.8620, elevation: 28, capacity: 650, occupied: 180, medicalStation: true,
    foodSuppliesDays: 7, powerBackup: 'Diesel Genset', phone: '+91-22-2811-1077',
    safetyRating: 'A (Reinforced Concrete)'
  },
  {
    id: 'shelter-4', name: 'Bhayandar West High School Camp', type: 'Neighborhood Relief Post',
    lat: 19.3080, lng: 72.8460, elevation: 21, capacity: 450, occupied: 310, medicalStation: false,
    foodSuppliesDays: 5, powerBackup: 'Battery Inverter', phone: '+91-22-2812-3344',
    safetyRating: 'B+ (Safe 2nd Floor & Above)'
  },
  {
    id: 'shelter-5', name: 'Ghodbunder Mountain Base Regional Camp', type: 'Regional Safe Fortress',
    lat: 19.2710, lng: 72.9050, elevation: 58, capacity: 3500, occupied: 620, medicalStation: true,
    foodSuppliesDays: 21, powerBackup: 'Dedicated Generator Substation', phone: '+91-22-2849-5500',
    safetyRating: 'A+ (Bedrock Mountain Elevation)'
  }
];

export interface RoadBlockage {
  id: string;
  name: string;
  roadType: string;
  lat: number;
  lng: number;
  status: string;
  severity: 'CRITICAL' | 'HIGH WATCH' | 'MODERATE WATCH' | 'CLEAR PASSWAY';
  waterDepth: string;
  source: string;
  cause: string;
  detourRecommended: string;
  clearanceETA: string;
  polygon?: [number, number][];
}

export const OFFLINE_ROAD_BLOCKAGES: RoadBlockage[] = [
  {
    id: 'block-1', name: 'Mira-Bhayandar Creek Estuary Bridge', roadType: 'Major Arterial Bridge',
    lat: 19.2970, lng: 72.8480, status: 'BLOCKED NOW', severity: 'CRITICAL', waterDepth: '1.25 meters',
    source: 'Sentinel-1 SAR Radar (-21.4 dB backscatter)', cause: 'High tide tidal bore + Creek surge overflow',
    detourRecommended: 'Route via Beverly Park Flyover', clearanceETA: 'In ~4 hours (Post high-tide recede)',
    polygon: [[19.2985, 72.8465], [19.2982, 72.8505], [19.2955, 72.8495], [19.2958, 72.8458]]
  },
  {
    id: 'block-2', name: 'Western Railway Station Subway Underpass', roadType: 'Pedestrian & Vehicle Underpass',
    lat: 19.2915, lng: 72.8535, status: 'BLOCKED NOW', severity: 'CRITICAL', waterDepth: '1.60 meters',
    source: 'Municipal IoT Ultrasonic Gauge (Sensor #MB-09)', cause: 'Depression basin drainage failure',
    detourRecommended: 'Use Station Road Foot-Over-Bridge', clearanceETA: 'Requires heavy dewatering pumps (6-8 hrs)',
    polygon: [[19.2925, 72.8525], [19.2925, 72.8545], [19.2905, 72.8545], [19.2905, 72.8525]]
  },
  {
    id: 'block-3', name: 'Shanti Nagar Sector 4 Corridor', roadType: 'Secondary Sector Arterial',
    lat: 19.2890, lng: 72.8580, status: 'IMMINENT IN ~35 MINS', severity: 'HIGH WATCH', waterDepth: '0.35 meters (Rising +1.2 cm/min)',
    source: 'Topographic DEM Inundation Model (<4m elevation)', cause: 'Storm sewer backflow approaching critical overflow',
    detourRecommended: 'Ascend to Shanti Park Main Road', clearanceETA: 'Dependent on rainfall rate dropping below 10mm/h',
    polygon: [[19.2902, 72.8570], [19.2900, 72.8592], [19.2880, 72.8590], [19.2882, 72.8568]]
  },
  {
    id: 'block-4', name: 'Western Express Highway Low Service Lane', roadType: 'Highway Feeder Link (KM 28.4)',
    lat: 19.2820, lng: 72.8660, status: 'PREDICTED IN ~1 HR 15 MINS', severity: 'MODERATE WATCH', waterDepth: '0.15 meters (Rising +0.7 cm/min)',
    source: 'Culvert IoT Telemetry & Runoff Forecast', cause: 'Upstream catchment overflow reaching highway embankment',
    detourRecommended: 'Stay on Main Elevated Expressway Viaduct', clearanceETA: 'Expected clear after 3 hrs of peak runoff',
    polygon: [[19.2835, 72.8645], [19.2835, 72.8675], [19.2805, 72.8675], [19.2805, 72.8645]]
  },
  {
    id: 'block-5', name: 'Uttan Coastal Causeway Spillway', roadType: 'Coastal District Link Road',
    lat: 19.2780, lng: 72.8250, status: 'PREDICTED IN ~2 HOURS', severity: 'HIGH WATCH', waterDepth: '0.20 meters (Wave overtopping)',
    source: 'Oceanographic High-Tide Surge Sensor', cause: 'Spring tide high water line breaching seawall',
    detourRecommended: 'Inland bypass through Rai Village', clearanceETA: 'Recedes with morning low tide',
    polygon: [[19.2800, 72.8230], [19.2800, 72.8270], [19.2760, 72.8270], [19.2760, 72.8230]]
  },
  {
    id: 'pass-1', name: 'Kanakia High Ridge Link Road', roadType: 'High-Elevation Ridge Highway',
    lat: 19.2920, lng: 72.8630, status: 'SAFE & CLEAR (72+ HOURS)', severity: 'CLEAR PASSWAY', waterDepth: 'Dry (0.00m)',
    source: 'Satellite DEM Elevation Profile (38m-42m MSL)', cause: 'Elevated topography allows rapid storm runoff',
    detourRecommended: 'Primary Designated Evacuation Corridor', clearanceETA: 'Operational 24/7'
  },
  {
    id: 'pass-2', name: 'Beverly Park Elevated Concrete Flyover', roadType: 'Grade-Separated Viaduct',
    lat: 19.2855, lng: 72.8605, status: 'SAFE & CLEAR (72+ HOURS)', severity: 'CLEAR PASSWAY', waterDepth: 'Dry (0.00m)',
    source: 'Structural Elevation Sensors', cause: 'Grade-separated 12m above ground level',
    detourRecommended: 'All vehicles cleared for transit', clearanceETA: 'Operational 24/7'
  }
];

export function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export const SAFE_ROUTE_WAYPOINTS: [number, number][] = [
  [19.2855, 72.8605], // Beverly Park Elevated Flyover (OPEN)
  [19.2920, 72.8630], // Kanakia High Ridge Road (OPEN)
  [19.2965, 72.8615] // North Ridge Approach
];
