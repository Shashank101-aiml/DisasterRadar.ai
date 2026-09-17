# FloodRisk AI - Frontend Dashboard

An AI-Based Flood Risk Prediction System that visualizes real-time and simulated flood vulnerability across meteorological and environmental parameters.

## Features Included
1. **Top Risk Indicator Cards**:
   - **Flood Probability**: Dynamic SVG circular donut progress gauge showing 78.4% (high risk color-coded).
   - **Risk Level**: Flood-inundated structure badge with severity state.
   - **Location**: Geocoded coordinates (`Bengaluru, Karnataka: Lat 12.97, Lon 77.59`).
   - **Actionable Recommendation**: Contextual advisory for civic authorities and emergency teams.
2. **Interactive Input Parameters**:
   - 24h & 72h Rainfall, Temperature, Humidity, Wind Speed, Atmospheric Pressure, Elevation, Latitude & Longitude.
   - Live **"Predict Risk"** calculation engine simulating the XGBoost decision pipeline.
3. **Top Risk Factors**:
   - Horizontal bar distribution detailing the relative impact percentage of key features.
4. **Interactive Regional Risk Map**:
   - Powered by Leaflet.js with CartoDB Positron tiles.
   - Markers for Bengaluru, Nelamangala, Yelahanka, Hoskote, Kolar, Hosur, Anekal, Kanakapura, Ramanagara, and Magadi.
   - Clickable station markers to load location weather data directly into the prediction form.
5. **Model Performance Analytics**:
   - Evaluation metrics: Accuracy (0.91), Precision (0.91), Recall (0.90), F1-Score (0.90), ROC-AUC (0.96).
   - Dynamic Confusion Matrix table.
   - Smooth SVG ROC Curve (True Positive Rate vs False Positive Rate).
6. **Recent Predictions Log**:
   - Real-time prediction timeline with color-coded risk status pills.

## How to Run

### Option 1: Open Directly in Browser
Simply double-click or open `index.html` in any modern web browser:
```bash
start index.html
```

### Option 2: Run with Local HTTP Server
Using Python:
```bash
python -m http.server 3000
```
Then visit [http://localhost:3000](http://localhost:3000) in your browser.

Using Node.js:
```bash
npx serve .
```
