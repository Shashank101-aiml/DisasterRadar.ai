// Ported verbatim from frontend/src/components/AiExplainerView.jsx so the mobile
// Explainable AI & SOPs screen carries the exact same flood-safety content as the web app.

export interface BlueprintCard {
  category: string;
  icon: string;
  badgeColor: string;
  title: string;
  points: Array<{ label: string; text: string }>;
}

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
  blueprintTitle?: string;
  blueprint?: BlueprintCard[];
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
    summary: 'Based on live 24h/72h rainfall and terrain elevation, our AI hydro-engine estimates the current flood inundation probability. Immediate protective actions required.',
    blueprintTitle: 'Live Basin Evacuation Blueprint',
    blueprint: [
      {
        category: 'Assets & Critical Appliances',
        icon: '🔌',
        badgeColor: '#0284c7',
        title: '1. How to Evacuate Electronics & Home Power',
        points: [
          { label: 'Main Breaker Cutoff (MCB)', text: 'Shut down the main electrical breaker before rising street runoff touches 15 cm socket height.' },
          { label: 'Elevate Heavy Inverters & Appliances', text: 'Move refrigerators, washing machines, and solar inverter battery banks onto 1.2m elevated plinths.' },
          { label: 'LPG Cylinder Anchoring', text: 'Secure gas cylinders upright with heavy nylon ratchet straps to high window bars.' },
          { label: 'Triple-Bag Vital Records', text: 'Seal property deeds, passports, Aadhaar cards, and insurance files in waterproof floating dry-pouches.' }
        ]
      },
      {
        category: 'Vehicle & Transit Safety',
        icon: '🚗',
        badgeColor: '#f59e0b',
        title: '2. How to Evacuate Vehicles & Prevent Drowning',
        points: [
          { label: 'Relocate to Flyovers & High Podiums', text: 'Move vehicles 4 to 8 hours ahead to multi-level ramps, elevated parking plazas, or highway flyovers.' },
          { label: '"Turn Around, Don\'t Drown"', text: 'Just 12 inches (30 cm) of moving floodwater exerts enough buoyancy to float sedans and compact SUVs.' },
          { label: 'Strict Underpass Avoidance', text: 'Railway and metro underpasses collect 2 to 3 meters of lethal water within 15 minutes.' },
          { label: 'Emergency Car Stall Egress', text: 'If your car stalls in rising water, unbuckle instantly, lower window glass, climb to car roof, and call for rescue.' }
        ]
      },
      {
        category: 'Vulnerable Populations',
        icon: '👨‍👩‍👧‍👦',
        badgeColor: '#ef4444',
        title: '3. Evacuating Elderly, Bedridden & Infants',
        points: [
          { label: 'Daylight Pre-Evacuation', text: 'Transfer senior citizens, expectant mothers, and infants during daylight hours before access roadways submerge.' },
          { label: '14-Day Airtight Medical Kit', text: 'Pack insulin, blood pressure pills, and prescriptions in airtight floatable dry-boxes.' },
          { label: 'Portable Medical Power Units', text: 'Ensure battery-powered oxygen concentrators and nebulizers are fully charged and prioritized.' },
          { label: 'NDRF / Civil Defense Dispatch (112)', text: 'Register bedridden citizens with emergency helplines for prioritized boat or high-clearance rescue.' }
        ]
      },
      {
        category: 'Livestock & Domestic Animals',
        icon: '🐄',
        badgeColor: '#10b981',
        title: '4. How to Evacuate Cattle, Farm Animals & Pets',
        points: [
          { label: 'UNCHAIN CATTLE IMMEDIATELY', text: 'Never leave cows or buffaloes tied in sheds. Tethered animals drown in 3 feet of water. Unbound livestock swim to safety.' },
          { label: 'Move to Elevated Earthen Mounds', text: 'Lead herds to community earthen flood platforms (Kanti) constructed above flood contours.' },
          { label: 'Elevate Dry Fodder & Feed', text: 'Stack hay bales and cattle concentrate on elevated bamboo scaffolding wrapped in tarpaulins.' },
          { label: 'Domestic Pets Go-Kit', text: 'Transport dogs and cats in rigid carriers with waterproof ID tags, leashes, and 3 days of dry pet food.' }
        ]
      },
      {
        category: 'Drainage & Siphon Sealing',
        icon: '🛡️',
        badgeColor: '#8b5cf6',
        title: '5. Preventing Sewer Blackwater Ingress',
        points: [
          { label: 'Plug Floor Drains', text: 'Insert mechanical expanding rubber plugs into ground-floor shower and floor drains.' },
          { label: 'Sandbag the Toilet Bowl', text: 'Line the toilet bowl with heavy polyethylene, close the lid, and place a 25 kg sandbag on top.' },
          { label: 'Pyramid Sandbag Perimeter', text: 'Stack sandbags against entryway doors in a 1:3 pyramid ratio with plastic lining.' },
          { label: 'Exterior Non-Return Check Valves', text: 'Verify that sewer connection inspection chambers have functioning non-return backwater check flaps.' }
        ]
      },
      {
        category: 'Post-Flood Protocol',
        icon: '🔄',
        badgeColor: '#06b6d4',
        title: '6. Safe Re-Entry & Decontamination',
        points: [
          { label: 'Wait for Civil Defense "All-Clear"', text: 'Do not re-enter flood-damaged buildings until structural engineers certify foundations.' },
          { label: 'Zero Flames / Spark Verification', text: 'Inspect for ruptured gas lines and ventilate rooms thoroughly before flipping any electrical switches.' },
          { label: 'Boil Water Advisory (3 Minutes)', text: 'Tap water is contaminated with pathogens. Boil water vigorously for 3 full minutes before drinking.' },
          { label: 'Silt Sanitization with Bleach', text: 'Wear heavy rubber gumboots and disinfect all mud-soaked walls and floors with a 1:10 bleach solution.' }
        ]
      }
    ]
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
    summary: 'Extreme rainfall intensity exceeding municipal storm drains. Water rises within minutes. DO NOT attempt to drive or walk through street torrents. Move vertically above the 2nd floor immediately.',
    blueprintTitle: '⚡ Flash Flood & Cloudburst Rapid Response Blueprint (<30-60m)',
    blueprint: [
      {
        category: 'Immediate Vertical Ascent',
        icon: '🏢',
        badgeColor: '#ef4444',
        title: '1. Instant Vertical Ascent Protocol',
        points: [
          { label: '60-Second Vertical Evacuation', text: 'Rush immediately to the 2nd floor, 3rd floor, or concrete rooftop. Do NOT waste time packing heavy items.' },
          { label: 'Never Enter Closed Attics', text: 'Avoid sealed roof cavities without an external exit hatch; rising flash surges trap occupants.' },
          { label: 'Grab 30-Second Micro-Go-Bag', text: 'Take only essential pouch: ID cards, cell phone, powerbank, prescription pills, and whistle.' },
          { label: 'Debris Torrent Shielding', text: 'Stay clear of ground-floor glass windows facing upstream; rushing mud exerts lethal impact.' }
        ]
      },
      {
        category: 'Torrential Vehicle Survival',
        icon: '⚠️',
        badgeColor: '#dc2626',
        title: '2. Immediate Vehicle Abandonment & Egress',
        points: [
          { label: 'Abandon Trapped Vehicles in 10s', text: 'If your vehicle stalls in torrential runoff, unbuckle and evacuate the vehicle within 10 seconds.' },
          { label: 'Climb to Roof or High Structure', text: 'Torrential current (>2 m/s) sweeps adults away; climb onto car roof or cling to concrete pillars.' },
          { label: 'Never Cross Washed Bridges', text: 'Flash torrents cause rapid bridge pier scour; never cross submerged concrete culverts.' },
          { label: 'Steer Clear of Ravines & Nullahs', text: 'Dry storm ravines transform into 3-meter deep lethal torrents in seconds.' }
        ]
      },
      {
        category: 'Rapid Power & Utility Cut',
        icon: '⚡',
        badgeColor: '#f59e0b',
        title: '3. Rapid Electrical & Gas Shutdown',
        points: [
          { label: 'Instant Main Breaker Trip', text: 'Flip main electrical MCB breaker immediately if accessible without stepping into floodwater.' },
          { label: 'Avoid Downed Transformer Poles', text: 'Flash flows undermine utility poles; treat all street water as live electrical conductors.' },
          { label: 'Fast Gas Cylinder Isolation', text: 'Twist LPG cylinder safety valves fully clockwise to closed position.' },
          { label: 'Solar Rooftop Inverter Isolation', text: 'De-energize solar DC isolator switches if water reaches floor level near inverter.' }
        ]
      },
      {
        category: 'Flotation & Distress Signaling',
        icon: '🛟',
        badgeColor: '#0284c7',
        title: '4. Personal Flotation & Rescue Strobes',
        points: [
          { label: 'Don Life Jackets Immediately', text: 'Fasten life jackets or buoyant swimming vests on children, non-swimmers, and seniors.' },
          { label: 'Improvised Buoyancy Rigs', text: 'Lash empty sealed 20L water cans or closed plastic jerrycans together under arms.' },
          { label: '3-Blast Whistle Distress Signal', text: 'Blow 3 sharp blasts on rescue whistles and activate mobile screen flashlights.' },
          { label: 'Bright Rooftop Markers', text: 'Spread bright orange, yellow, or red blankets across rooftop terraces for aerial spotting.' }
        ]
      },
      {
        category: 'Livestock & Pet Release',
        icon: '🐄',
        badgeColor: '#10b981',
        title: '5. Instant Halter Cut & Animal Freedom',
        points: [
          { label: 'Slash Ropes & Open Sheds', text: 'Cut all cattle halters and unlock shed gates instantly; animals instinctively scale hillsides.' },
          { label: 'Release Small Domestic Pets', text: 'Bring cats and dogs in your vertical ascent; never leave dogs chained in yards.' },
          { label: 'Steer Clear of Hillside Berms', text: 'Torrential cloudbursts trigger mudslides; move animals away from unreinforced earth cuts.' },
          { label: 'Prioritize Human Life Safety', text: 'Never jump into torrential swirling flash currents to retrieve livestock.' }
        ]
      },
      {
        category: 'Post-Torrent Hazards',
        icon: '☣️',
        badgeColor: '#8b5cf6',
        title: '6. Mudflow & Water Contamination Defense',
        points: [
          { label: 'Inspect for Soil Liquefaction', text: 'Check foundation soil and hillside retaining walls for landslide fissures before descending.' },
          { label: 'Beware of Displaced Vipers', text: 'Flash floods drive venomous snakes onto high roof ledges; inspect perches carefully.' },
          { label: 'Leptospirosis Prophylaxis', text: 'If waded through flood mud, consult emergency relief doctors for prophylactic Doxycycline.' },
          { label: 'Zero Raw Well Water Consumption', text: 'Do not drink from open wells inundated by cloudburst mud until shock-chlorinated.' }
        ]
      }
    ]
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
    summary: 'Major river stage approaching danger mark. Gradual overland expansion will submerge riparian settlements in 3 distinct flood waves. Relocate vulnerable residents and unchain cattle now.',
    blueprintTitle: '🌊 Riverine Basin Overflow & Overland Inundation Blueprint (6-12h Lead Time)',
    blueprint: [
      {
        category: 'Heavy Equipment & Farm Assets',
        icon: '🚜',
        badgeColor: '#0284c7',
        title: '1. Hoisting Pumps, Grain & Heavy Machinery',
        points: [
          { label: 'Hoist Riverbank Irrigation Pumps', text: 'Dismantle and haul riverbank diesel and electric pump sets to high-elevation farm trailers.' },
          { label: 'Floor-by-Floor Asset Migration', text: 'Move grain sacks, fertilizers, TV sets, and deep freezers to first-floor mezzanines or lofts.' },
          { label: 'Elevate Inverters & Battery Banks', text: 'Disconnect and elevate solar battery banks at least 2 meters above base ground elevation.' },
          { label: 'Shrink-Wrap Heavy Wooden Furniture', text: 'Wrap solid wood furniture legs in thick heavy-gauge polyethylene film.' }
        ]
      },
      {
        category: 'Staged Lateral Evacuation',
        icon: '🚚',
        badgeColor: '#f59e0b',
        title: '2. Staged Lateral Evacuation & Route Timing',
        points: [
          { label: 'Evacuate via High-Ridge Arteries', text: 'Use certified high-contour evacuation highways before low-lying causeways submerge.' },
          { label: 'Tractor & Harvester Convoy Staging', text: 'Move tractors, threshers, and farm trailers in daylight convoys to national highway embankments.' },
          { label: 'GPS Waypoint Sticking', text: 'Stick to center-lane certified roads; submerged river floodplains conceal canal ditches.' },
          { label: '100% Full Fuel Tank Fill', text: 'Fill vehicle fuel tanks completely; local floodplain petrol pumps will be de-energized.' }
        ]
      },
      {
        category: 'Riparian Livestock & Feed',
        icon: '🐄',
        badgeColor: '#10b981',
        title: '3. Cattle Relocation to Flood Mounds (Kanti)',
        points: [
          { label: 'Herd Movement to Community Mounds', text: 'Guide cattle herds to multi-hectare earthen flood shelters (Kanti) 12 hours ahead.' },
          { label: '7-Day Elevated Fodder Scaffolding', text: 'Transport dry hay bales and cattle feed to high flood berms; seal with tarpaulins.' },
          { label: 'Emergency Veterinary Inoculation', text: 'Administer Black Quarter (BQ) and Haemorrhagic Septicaemia (HS) booster shots.' },
          { label: 'High-Ground Freshwater Troughs', text: 'Set up high-ground water filtration troughs to prevent livestock drinking silted floodwater.' }
        ]
      },
      {
        category: 'Vulnerable Family Citizens',
        icon: '👨‍👩‍👧‍👦',
        badgeColor: '#ef4444',
        title: '4. Systematic Relocation of Seniors & Infants',
        points: [
          { label: 'Gram Panchayat Bus Evacuation', text: 'Coordinate with local authorities to transport nursing mothers, toddlers, and elders.' },
          { label: '21-Day Medical Prescription Kit', text: 'Stock 3 weeks of chronic medications (dialysis supplies, insulin, cardiac drugs).' },
          { label: 'Folding Cot Elevation in Camps', text: 'Avoid sleeping on floor level in temporary relief shelters; elevate bedding on folding cots.' },
          { label: 'Off-Grid Family Rally Points', text: 'Establish a pre-agreed rendezvous point outside the river basin zone.' }
        ]
      },
      {
        category: 'Borewell & Water Security',
        icon: '🛡️',
        badgeColor: '#8b5cf6',
        title: '5. Borewell Sealing & Siphon Isolation',
        points: [
          { label: 'Cap Drinking Water Borewells', text: 'Screw threaded sanitary caps or seal casing heads with neoprene gaskets.' },
          { label: 'Fill & Seal Overhead Storage Tanks', text: 'Fill overhead water storage tanks 100% full and lock inspection lids tightly.' },
          { label: 'Tighten Backflow Flap Valves', text: 'Ensure domestic wastewater drain outlets have operational flap valves.' },
          { label: 'Erect Riverfront Sandbag Dykes', text: 'Construct interlocking sandbag bunds along property river boundaries.' }
        ]
      },
      {
        category: 'Silt Reclamation & Drainage',
        icon: '🌾',
        badgeColor: '#06b6d4',
        title: '6. Agricultural Silt Reclamation & Re-Entry',
        points: [
          { label: 'Cut Field Drainage Furrows', text: 'Excavate perimeter drainage trenches in submerged fields once river stage drops.' },
          { label: 'Well Shock Chlorination Protocol', text: 'Pump silted well water out, then shock-treat with 50g bleaching powder per 1,000L.' },
          { label: 'Gradual Basement Dewatering', text: 'Pump flooded basements gradually (1/3 volume per day) to prevent wall collapse.' },
          { label: 'Anti-Mosquito Larvicide Treatment', text: 'Spray Temephos or BTI larvicide over standing floodplain backwater pools.' }
        ]
      }
    ]
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
    summary: 'Stormwater culverts choked with silt and debris. Underpasses and low-lying basements are at immediate risk of localized flooding. Seal toilet drains to prevent sewer backflow.',
    blueprintTitle: '🏙️ Urban Waterlogging & Basement Defense Blueprint (12-24h Lead Time)',
    blueprint: [
      {
        category: 'Basement & Sump Defense',
        icon: '🏢',
        badgeColor: '#8b5cf6',
        title: '1. Modular Barriers & Basement Sump Defense',
        points: [
          { label: 'Deploy Aluminum Floodgates', text: 'Mount interlocking modular aluminum barrier gates across basement parking ramps.' },
          { label: 'Dual Submersible Dewatering Test', text: 'Test primary and backup diesel-powered 5HP sump pumps; clear leaf screens.' },
          { label: 'Mandatory Basement Car Evacuation', text: 'Enforce complete evacuation of all vehicles from B1/B2 subterranean basement levels.' },
          { label: 'Stage Elevator Cabs on Top Floor', text: 'Park elevator cabs on the top floor and shut down power to elevator motor room.' }
        ]
      },
      {
        category: 'Sewer Backflow Isolation',
        icon: '🛡️',
        badgeColor: '#0284c7',
        title: '2. Sewer Backsurge & Floor Drain Sealing',
        points: [
          { label: 'Mechanical Expansion Rubber Plugs', text: 'Screw mechanical rubber pipe test plugs into all ground-floor shower and floor drains.' },
          { label: '25kg Sandbag on Toilet Lid', text: 'Place heavy plastic sheeting over toilet bowl, shut lid, and weight with a 25 kg sandbag.' },
          { label: 'Grease Trap & Sump Cover Sealing', text: 'Seal inspection chamber covers with heavy silicone bead gaskets.' },
          { label: 'De-energize Ground-Floor Sockets', text: 'Turn off sub-circuit breakers feeding ground-floor wall sockets.' }
        ]
      },
      {
        category: 'Civic Transit & Underpasses',
        icon: '🚗',
        badgeColor: '#f59e0b',
        title: '3. Urban Underpass Avoidance & Parking SOP',
        points: [
          { label: 'Zero Underpass Ingress', text: 'Never enter railway underpasses or depressed expressway dips.' },
          { label: 'Relocate to Multi-Level Ramps', text: 'Park four-wheelers and scooters on 2nd-floor multi-level parking plazas or flyovers.' },
          { label: 'Beware of Dislodged Manholes', text: 'Stormwater backsurges pop cast-iron manhole covers open; never wade into murky water.' },
          { label: 'Avoid Driving Along Metro Medians', text: 'Stormwater pools deeply along center dividers; stick to crowned center lanes.' }
        ]
      },
      {
        category: 'Remote Work & Food Reserves',
        icon: '💻',
        badgeColor: '#10b981',
        title: '4. Work-From-Home (WFH) & Emergency Pantry',
        points: [
          { label: 'Enforce Work-From-Home SOP', text: 'Switch enterprise workforce to remote operations 12 hours prior to storm bands.' },
          { label: 'Server Room UPS Protection', text: 'Verify data center UPS batteries and gracefully shut down low-level server racks.' },
          { label: 'Inverter Power Conservation', text: 'Restrict residential inverters to emergency LED lights and phone chargers.' },
          { label: '4-Day Non-Perishable Pantry', text: 'Stock 4 days of dry pantry staples, sealed 20L water cans, and ready meal packs.' }
        ]
      },
      {
        category: 'High-Density Residential SOP',
        icon: '👨‍👩‍👧‍👦',
        badgeColor: '#ef4444',
        title: '5. High-Density Apartment & Ground Floor Safety',
        points: [
          { label: 'Ground-Floor Resident Relocation', text: 'Move elderly and infant residents from ground-floor flats to 1st/2nd floor clubhouses.' },
          { label: 'Cordon Transformer DP Boxes', text: 'Cordon off outdoor electricity transformer distribution boxes with hazard tape.' },
          { label: 'Pre-Stage Potable Water Tankers', text: 'Request municipal potable water tankers on elevated podium streets.' },
          { label: 'Building Floor-Warden Network', text: 'Establish floor-warden communication channels to relay hourly drainage updates.' }
        ]
      },
      {
        category: 'Civic Restoration & Testing',
        icon: '🔄',
        badgeColor: '#06b6d4',
        title: '6. Electrical Megger Testing & Mold Remediation',
        points: [
          { label: 'Insulation Megger Testing', text: 'Have certified electricians conduct Megger insulation tests before restoring power.' },
          { label: 'Underground Sump Bleach Scrub', text: 'Drain and scrub underground potable water tanks with chlorine solution.' },
          { label: '24-Hour Mold Remediation', text: 'Strip soaked baseboards and wet drywall within 24 hours to prevent mold growth.' },
          { label: 'Thermal Insecticidal Fogging', text: 'Coordinate with municipal teams for thermal pyrethrum fogging.' }
        ]
      }
    ]
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
    summary: 'Upstream dam at 98% full capacity; emergency spillway gates opening. Downstream riverbed flow will increase by 45,000 cusecs. Clear all low-lying bridges, farms, and riverbanks immediately.',
    blueprintTitle: '🛑 Dam Spillway Discharge & Downstream Floodway Blueprint (2-4h Lead Time)',
    blueprint: [
      {
        category: 'Riverbed Total Clearance',
        icon: '🚨',
        badgeColor: '#ef4444',
        title: '1. Mandatory 100% Floodway Clearance',
        points: [
          { label: 'Evacuate 500m River Corridor', text: 'Evacuate all human presence within 500 meters of the river channel immediately.' },
          { label: 'Activate Siren & Public Address', text: 'Broadcast emergency loudspeaker alerts and sound siren towers across villages.' },
          { label: 'Halt River Mining & Ferry Boats', text: 'Pull sand dredging boats, tourist ferries, and pontoon bridges onto high river bluffs.' },
          { label: 'Barricade Low-Level Causeways', text: 'Close and barricade all submersible bridges; release wavefront overflows in 45m.' }
        ]
      },
      {
        category: 'Farm Fleet & Heavy Machinery',
        icon: '🚜',
        badgeColor: '#f59e0b',
        title: '2. Heavy Plant & Farm Tractor Fast Convoy',
        points: [
          { label: 'Perpendicular Fleet Mobilization', text: 'Drive tractors, harvesters, and diesel tankers perpendicular to river flow.' },
          { label: 'Hoist Riverbed Lift Pumps', text: 'Pull up electrical riverbed lift pump assemblies with chain hoists.' },
          { label: 'Move Solar Pump Inverters', text: 'Dismantle riverside solar pump panels outside the active discharge zone.' },
          { label: 'Secure Chemical & Fuel Drums', text: 'Transport diesel barrels, pesticides, and fertilizers away from floodplains.' }
        ]
      },
      {
        category: 'Livestock Downstream Exodus',
        icon: '🐄',
        badgeColor: '#10b981',
        title: '3. Downstream Cattle Exodus to Hill Corrals',
        points: [
          { label: 'Cut Shed Halters Immediately', text: 'Free every animal immediately; release livestock toward high-ridge pastures.' },
          { label: 'Hilltop Community Holding Corrals', text: 'Herd village livestock into high-elevation school grounds at +20m elevation.' },
          { label: 'Tractor Trailer Hay Distribution', text: 'Transport dry fodder in tractor trailers directly to holding corrals.' },
          { label: 'Waterway Exclusion Fencing', text: 'Erect temporary barricades to prevent cattle wandering back to riverbanks.' }
        ]
      },
      {
        category: 'Cusec Discharge Tracking',
        icon: '📢',
        badgeColor: '#0284c7',
        title: '4. Cusec Flow Monitoring & Emergency Bags',
        points: [
          { label: 'Track Official Cusec Release Rates', text: 'Monitor Irrigation Department Cusec discharge notifications (25k → 50k → 100k cusecs).' },
          { label: 'Deploy Amateur Radio (HAM)', text: 'Station amateur radio operators at local offices in case cell towers flood.' },
          { label: '2-Hour Rapid Evacuation Rucksack', text: 'Pack waterproof survival rucksacks with dry food, water purifying tablets, ID records.' },
          { label: 'Priority School Bus Evacuation', text: 'Coordinate emergency buses to clear riverside schools first before bridges submerge.' }
        ]
      },
      {
        category: 'Sluice & Canal Safety',
        icon: '🛡️',
        badgeColor: '#8b5cf6',
        title: '5. Branch Canal Intake Closure & Dyke Defense',
        points: [
          { label: 'Close Branch Canal Regulators', text: 'Shut branch canal intake sluices to prevent surge backflow from bursting canals.' },
          { label: 'River Bend Embankment Armor', text: 'Reinforce acute river bend embankments with geo-textile sandbags and riprap.' },
          { label: 'Isolate Riverside Effluent Ponds', text: 'Isolate chemical holding lagoons to prevent downstream toxic contamination.' },
          { label: 'De-energize River Power Spans', text: 'De-energize river-crossing high-tension lines if water crests near sag thresholds.' }
        ]
      },
      {
        category: 'Post-Spillway Recovery',
        icon: '🔄',
        badgeColor: '#06b6d4',
        title: '6. Bridge Pier Sonic Scour Tests & Silt Clearing',
        points: [
          { label: 'Sonic Scour Bridge Inspections', text: 'Keep bridges closed until structural engineers complete ultrasonic scour tests.' },
          { label: 'Flush Silted Jack-Well Intakes', text: 'Flush drinking water intake jack-wells choked with dense reservoir bottom silt.' },
          { label: 'Clear Silt from Farmlands', text: 'Clear heavy silt deposition from agricultural bottomlands using earthmovers.' },
          { label: 'NTU Turbidity & Coliform Testing', text: 'Verify NTU turbidity and coliform bacteria levels before resuming pumping.' }
        ]
      }
    ]
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
    summary: 'Astronomical spring high tide prevents monsoon runoff from draining into the sea, causing severe backwater accumulation across low-elevation coastal wards (e.g. Mira Bhayandar / coastal creeks).',
    blueprintTitle: '🌊 Coastal Estuarine Surge & High-Tide Flood Ingress Blueprint (4-6h Window)',
    blueprint: [
      {
        category: 'Tidal Evacuation Window',
        icon: '🌙',
        badgeColor: '#0284c7',
        title: '1. Low-Tide Evacuation Window & Inland Movement',
        points: [
          { label: 'Exploit Low-Tide Transit Window', text: 'Execute vehicular and asset evacuation strictly during low-tide windows.' },
          { label: 'Relocate 1.5 km Inland', text: 'Move families and vehicles at least 1.5 km inland from tidal creeks and esplanades.' },
          { label: 'Track Astronomical Tide Charts', text: 'Cross-reference tide tables; storm surge adds 1.0m to 1.8m atop spring tide crests.' },
          { label: 'Barricade Coastal Causeway Roads', text: 'Avoid coastal highway causeways subject to tidal overwash.' }
        ]
      },
      {
        category: 'Marine Barrier & Flap Valves',
        icon: '🛡️',
        badgeColor: '#8b5cf6',
        title: '2. Marine Non-Return Flap Valves & Sandbag Berms',
        points: [
          { label: 'Verify Coastal Flap Gate Closures', text: 'Ensure storm drain outfalls have clear flap gates that seal shut against seawater.' },
          { label: 'Dual-Row Marine Sandbag Berms', text: 'Build interlocking sandbag berms with plastic membranes around sea-facing buildings.' },
          { label: 'Corrosion-Resistant Sump Pumps', text: 'Deploy stainless-steel submersible pumps for corrosive saltwater dewatering.' },
          { label: 'Seal Underground Cable Ducts', text: 'Plug electrical conduits with expanding marine foam to block saltwater entry.' }
        ]
      },
      {
        category: 'Boats & Marine Craft',
        icon: '⛵',
        badgeColor: '#f59e0b',
        title: '3. Double-Mooring Boats & Port Vessel Safety',
        points: [
          { label: 'Double-Moor Fishing Trawlers', text: 'Secure fishing trawlers in sheltered inner creek docks with double nylon mooring warps.' },
          { label: 'Haul Small Dinghies Beyond High Dunes', text: 'Drag small catamarans above the storm tide line; lash to sturdy palm trunks.' },
          { label: 'Disconnect Marina Shore Power', text: 'Unplug and isolate dockside electrical pedestals to eliminate deadly saltwater arcing.' },
          { label: 'Hoist Outboard Motors & Fuel', text: 'Remove outboard boat engines and fuel containers; store in high warehouse lofts.' }
        ]
      },
      {
        category: 'Saline Corrosion Protection',
        icon: '🔌',
        badgeColor: '#ef4444',
        title: '4. Saltwater Corrosion & Electronics Defense',
        points: [
          { label: 'Elevate Electrical Motors & Inverters', text: 'Saltwater causes instant corrosion; hoist motors and inverters above 2m height.' },
          { label: 'Coat Terminals with Marine Grease', text: 'Spray marine corrosion-inhibitor grease over vehicle battery terminals.' },
          { label: 'Triple-Seal Documents & Credentials', text: 'Vacuum-seal property deeds and insurance records in waterproof dry-bags.' },
          { label: 'Elevate Consumer Electronics', text: 'Relocate computers, televisions, and kitchen appliances to upper floor living spaces.' }
        ]
      },
      {
        category: 'Coastal Community & Fisheries',
        icon: '🐟',
        badgeColor: '#10b981',
        title: '5. Aquaculture Netting & Cyclone Shelter Evacuation',
        points: [
          { label: 'Install Aquaculture Overflow Nets', text: 'Erect nylon perimeter nets around shrimp ponds to prevent stock escape.' },
          { label: 'Evacuate Thatched Coastal Hamlets', text: 'Move families living in unreinforced coastal dwellings to concrete cyclone shelters.' },
          { label: 'Store 50L Potable Fresh Water/Person', text: 'Coastal well salinization is instant; store at least 50L fresh water per person.' },
          { label: 'Wear Maritime Lifejackets', text: 'Ensure family members wear maritime-grade life vests with distress whistles.' }
        ]
      },
      {
        category: 'Post-Surge Salinity Flushing',
        icon: '🔄',
        badgeColor: '#06b6d4',
        title: '6. Fresh Water Washdown & Soil Desalination',
        points: [
          { label: 'Freshwater Equipment Washdown', text: 'Rinse seawater-exposed machinery and vehicles with clean fresh water immediately.' },
          { label: 'Agricultural Soil Leaching Furrows', text: 'Dig drainage furrows and flush inundated soils with monsoon rainwater.' },
          { label: 'Pump Out Saline Coastal Wells', text: 'Pump out brackish groundwater from coastal wells and verify TDS before drinking.' },
          { label: 'Clear Marine Debris & Fish Offal', text: 'Collect and bury decaying marine flotsam promptly to prevent epidemics.' }
        ]
      }
    ]
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
