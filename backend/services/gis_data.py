"""
Mira Bhayandar GIS and Flood Risk Layer Data
Provides GeoJSON polygons, railway lines, road corridors, and flood hotspots.
"""

from typing import List, Dict, Any

MIRA_BHAYANDAR_METADATA = {
    "title": "FLOOD RISK",
    "location": "Mira Bhayandar",
    "date": "15 December, 2024",
    "coordinateSystem": "GCS WGS 1984",
    "datum": "WGS 1984",
    "dataSource": "Multiple Spatial Data",
    "center": [19.2952, 72.8544],
    "zoom": 13
}

# Flood Risk Zones (Choropleth polygons covering Mira Bhayandar)
# Coordinates approx: North: 19.33, South: 19.26, West: 72.77, East: 72.91
FLOOD_RISK_ZONES = [
    # 1. Very High Risk (Red) - Bhayandar East/West low-lying creek basin & railway subway
    {
        "id": "zone-vh-1",
        "name": "Bhayandar Creek Basin & Station Lowlands",
        "riskLevel": "Very High",
        "color": "#f44336",
        "fillOpacity": 0.65,
        "floodDepth": "1.5 - 2.2 m",
        "coordinates": [
            [19.310, 72.845], [19.318, 72.850], [19.322, 72.858],
            [19.315, 72.868], [19.302, 72.862], [19.298, 72.852],
            [19.303, 72.846]
        ]
    },
    {
        "id": "zone-vh-2",
        "name": "Navghar & Penkarpada Inundation Pocket",
        "riskLevel": "Very High",
        "color": "#f44336",
        "fillOpacity": 0.65,
        "floodDepth": "1.2 - 1.8 m",
        "coordinates": [
            [19.295, 72.860], [19.301, 72.868], [19.298, 72.876],
            [19.288, 72.872], [19.289, 72.862]
        ]
    },
    # 2. High Risk (Orange) - Dense urban Mira Road & Kashimira junction
    {
        "id": "zone-h-1",
        "name": "Mira Road Central Urban Grid",
        "riskLevel": "High",
        "color": "#ff9800",
        "fillOpacity": 0.6,
        "floodDepth": "0.8 - 1.4 m",
        "coordinates": [
            [19.285, 72.850], [19.295, 72.852], [19.302, 72.862],
            [19.295, 72.875], [19.282, 72.882], [19.275, 72.868],
            [19.278, 72.855]
        ]
    },
    {
        "id": "zone-h-2",
        "name": "Uttan Coastal Inundation Belt",
        "riskLevel": "High",
        "color": "#ff9800",
        "fillOpacity": 0.6,
        "floodDepth": "0.7 - 1.2 m",
        "coordinates": [
            [19.280, 72.780], [19.300, 72.795], [19.295, 72.815],
            [19.270, 72.805], [19.265, 72.785]
        ]
    },
    # 3. Moderate Risk (Yellow) - Rai-Morva, Murdha, Khari belt
    {
        "id": "zone-m-1",
        "name": "Rai-Morva & Murdha Agricultural Plain",
        "riskLevel": "Moderate",
        "color": "#ffeb3b",
        "fillOpacity": 0.55,
        "floodDepth": "0.3 - 0.7 m",
        "coordinates": [
            [19.300, 72.795], [19.315, 72.815], [19.320, 72.840],
            [19.305, 72.845], [19.295, 72.825], [19.285, 72.810]
        ]
    },
    {
        "id": "zone-m-2",
        "name": "Western Express Highway Corridor",
        "riskLevel": "Moderate",
        "color": "#ffeb3b",
        "fillOpacity": 0.55,
        "floodDepth": "0.4 - 0.6 m",
        "coordinates": [
            [19.275, 72.868], [19.282, 72.882], [19.288, 72.890],
            [19.272, 72.895], [19.268, 72.875]
        ]
    },
    # 4. Low Risk (Light Green) - Transitional foothills & elevated plateau
    {
        "id": "zone-l-1",
        "name": "Ghodbunder Foothills Transition",
        "riskLevel": "Low",
        "color": "#4caf50",
        "fillOpacity": 0.6,
        "floodDepth": "0.1 - 0.3 m",
        "coordinates": [
            [19.288, 72.890], [19.300, 72.905], [19.290, 72.915],
            [19.275, 72.912], [19.272, 72.895]
        ]
    },
    # 5. Very Low Risk (Dark Green) - Sanjay Gandhi National Park ridge & Chena hill forest
    {
        "id": "zone-vl-1",
        "name": "Sanjay Gandhi National Park & Chena Forest Ridge",
        "riskLevel": "Very Low",
        "color": "#1b5e20",
        "fillOpacity": 0.75,
        "floodDepth": "< 0.05 m (Safe)",
        "coordinates": [
            [19.275, 72.912], [19.290, 72.915], [19.285, 72.930],
            [19.255, 72.925], [19.252, 72.905], [19.268, 72.900]
        ]
    }
]

# North-South Western Railway Line (Blue line in screenshot)
RAILWAY_LINE = [
    [19.325, 72.852], # North near Vasai Creek Bridge
    [19.314, 72.853], # Bhayandar Railway Station
    [19.298, 72.856], # Mid corridor
    [19.282, 72.858], # Mira Road Railway Station
    [19.265, 72.860]  # South towards Dahisar / Mumbai
]

# Major Arterial Roads
ROAD_NETWORK = [
    # Ghodbunder Road / WEH
    [[19.262, 72.870], [19.275, 72.873], [19.290, 72.880], [19.305, 72.892], [19.315, 72.905]],
    # Uttan - Bhayandar Road
    [[19.278, 72.785], [19.295, 72.815], [19.305, 72.835], [19.312, 72.850]],
    # Mira-Bhayandar Link Road
    [[19.290, 72.850], [19.292, 72.865], [19.294, 72.880]],
    # Maxus Mall / 150 Feet Road
    [[19.308, 72.842], [19.312, 72.855], [19.305, 72.870]]
]

# Historical Flood Points (Black dots in screenshot)
FLOOD_HOTSPOTS = [
    {"name": "Bhayandar West Station Subway", "lat": 19.3135, "lng": 72.8525, "depth": "1.8 m", "status": "Critical"},
    {"name": "Golden Nest Circle", "lat": 19.2950, "lng": 72.8580, "depth": "1.4 m", "status": "High Inundation"},
    {"name": "Silver Park Junction", "lat": 19.2880, "lng": 72.8640, "depth": "1.2 m", "status": "Waterlogged"},
    {"name": "Beverly Park Low-Lying Zone", "lat": 19.2840, "lng": 72.8680, "depth": "1.1 m", "status": "Submerged Drain"},
    {"name": "Shital Garden Nullah", "lat": 19.2990, "lng": 72.8620, "depth": "1.6 m", "status": "Overflowing"},
    {"name": "Kashimira Police Station Basin", "lat": 19.2780, "lng": 72.8740, "depth": "1.3 m", "status": "Traffic Diverted"},
    {"name": "Penkarpada Culvert", "lat": 19.2910, "lng": 72.8710, "depth": "1.5 m", "status": "Severe"},
    {"name": "Rai Village Estuary", "lat": 19.3080, "lng": 72.8120, "depth": "0.9 m", "status": "Tidal Inflow"},
    {"name": "Navghar Khadi Bridge", "lat": 19.3170, "lng": 72.8610, "depth": "1.7 m", "status": "High Tide Warning"}
]

def get_mira_bhayandar_gis_data() -> Dict[str, Any]:
    return {
        "metadata": MIRA_BHAYANDAR_METADATA,
        "zones": FLOOD_RISK_ZONES,
        "railway": RAILWAY_LINE,
        "roads": ROAD_NETWORK,
        "hotspots": FLOOD_HOTSPOTS
    }
