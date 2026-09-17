# 🌊 DisasterRadar.ai (FloodRisk AI)

> **AI-Powered Flood Intelligence, Hydrodynamic Modeling & Early Warning Platform**  
> An end-to-end multi-tier platform integrating satellite hydrology, deep learning, geospatial GIS mapping, and real-time telemetry to predict flood inundation risks.

---

## 📌 Table of Contents
1. [Overview & Core Objectives](#-overview--core-objectives)
2. [Phased Project Roadmap](#-phased-project-roadmap)
3. [System Architecture](#-system-architecture)
4. [Datasets & Hydrological Sources](#-datasets--hydrological-sources)
5. [Machine Learning Models & Metrics](#-machine-learning-models--metrics)
6. [Interactive Jupyter Notebooks](#-interactive-jupyter-notebooks)
7. [Installation & Setup](#-installation--setup)
8. [Running the Platform](#-running-the-platform)
9. [Automated Testing](#-automated-testing)
10. [API Reference (FastAPI)](#-api-reference-fastapi)
11. [Project Structure](#-project-structure)

---

## 🎯 Overview & Core Objectives

**DisasterRadar.ai** provides city planners, disaster response authorities (NDRF/SDRF), and emergency dispatchers with real-time, explainable flood forecasting.

- **Deep Hydro-Predictor**: Evaluates multi-window rainfall, terrain slope, Topographic Wetness Index (TWI), elevation, and municipal drainage factors.
- **Epoch-Based Deep Learning**: PyTorch neural network (`FloodNet`) with epoch-by-epoch loss tracking, early checkpointing, and class-weighted loss.
- **High-Resolution GIS Atlas**: Specialized Mira Bhayandar Cartographic Flood Vulnerability map with 5-tier risk choropleth, railway lines, and road corridors.
- **Operational Dashboard**: Modern React + Vite responsive UI with donut progress gauges, SHAP risk factor breakdowns, and confusion matrix diagnostics.

---

## 🗺️ Phased Project Roadmap

| Phase | Description | Status |
| :--- | :--- | :---: |
| **Phase 1: Core ML & Hydrological Modeling** | Unified dataset pipeline, PyTorch `FloodNet` (epoch-based), Gradient Boosting ensemble, 91.65% Accuracy, 0.9604 ROC-AUC, notebooks 01–05, and automated pytest suite. | **Completed** ✅ |
| **Phase 2: NLP & Disaster Intelligence** | Disaster report / SOS tweet text classification, Named Entity Recognition (NER) for locations/casualties, and urgency scoring. | *Next* 🔄 |
| **Phase 3: GenAI & Domain RAG** | Vector database (ChromaDB), disaster manual ingestion, and AI Disaster Analyst chatbot for automated situational briefings. | *Planned* ⏳ |
| **Phase 4: Agentic AI Engineering** | Multi-agent autonomous system (Ingestion Agent, Predictor Agent, GIS Agent, Dispatcher Agent) with tool-calling. | *Planned* ⏳ |
| **Phase 5: Geospatial / GIS & Real-time Telemetry** | 1D-2D overland mesh hydrodynamic simulation and live sensor streaming. | *In Progress* 🔄 |
| **Phase 6: Full-Stack Production & MLOps** | Docker containerization, model registry, drift monitoring, CI/CD pipeline, and alerting. | *Planned* ⏳ |

---

## 🏛️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │      HISTORICAL & REALTIME    │
                                  │  - 1M-Row MODIS Satellite     │
                                  │  - Kaggle Governance Factors  │
                                  │  - 1D/2D Hydrodynamic Models  │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   DATA PROCESSING & SCHEMA    │
                                  │  - Standardized Scaler        │
                                  │  - Leakage-Free Temporal Split│
                                  └──────────────┬────────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
      ┌─────────────────────────────┐                         ┌─────────────────────────────┐
      │     PYTORCH FLOODNET        │                         │  GRADIENT BOOSTING ENSEMBLE │
      │  - 15 Epochs AdamW          │                         │  - Calibrated Probabilities │
      │  - Val Recall: 91.25%       │                         │  - Accuracy: 91.65%         │
      │  - PR-AUC: 0.7576           │                         │  - ROC-AUC: 0.9604          │
      └──────────────┬──────────────┘                         └──────────────┬──────────────┘
                     │                                                       │
                     └───────────────────────────┬───────────────────────────┘
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │     FASTAPI REST BACKEND      │
                                  │  - /api/predict               │
                                  │  - /api/model/performance     │
                                  │  - /api/gis/mira-bhayandar    │
                                  └──────────────┬────────────────┘
                                                 │
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │   REACT VITE FRONTEND (UI)    │
                                  │  - Realtime Gauge & Advisories│
                                  │  - Leaflet Map & GIS Atlas    │
                                  │  - Model Performance Heatmaps │
                                  └───────────────────────────────┘
```

---

## 📊 Datasets & Hydrological Sources

1. **MODIS Remote Sensing & Satellite Hydrology** (`modis_flood_features_paling cleaning (1).csv`):
   - Over **1,025,802 records** (179 MB).
   - Features: `precip_1d` (24h rain), `precip_3d` (72h rain), `elevation`, `slope`, `aspect`, `upstream_area`, `NDVI`, `NDWI`, `TWI`, `target`.
2. **Environmental & Governance Vulnerability Dataset** (`archive/flood.csv`):
   - **50,000 records** across 20 parameters including `DrainageSystems`, `TopographyDrainage`, `Urbanization`, `DeterioratingInfrastructure`, `IneffectiveDisasterPreparedness`.
3. **1D-2D Hydrodynamic Benchmark Network (`m` folder)**:
   - River network shapefiles, overland mesh nodes, dynamic stage, flow velocity, and water depths.
4. **Standardized Unified Dataset** (`data/processed/processed_data.csv`):
   - Clean 50,000-sample balanced dataset used for model training and evaluation.

---

## 🧠 Machine Learning Models & Metrics

The models are validated against a 10,000-sample held-out validation dataset:

| Evaluation Metric | Native XGBoost Value | Operational Meaning |
| :--- | :---: | :--- |
| **Accuracy** | **91.24%** | High overall classification accuracy |
| **ROC-AUC** | **0.9623** | Exceptional discriminatory power across thresholds |
| **Recall (Sensitivity)** | **84.77%** | High flood detection rate (catches 1,676 of true floods) |
| **Precision** | **74.46%** | Controlled false alarm triggers |
| **F1-Score** | **0.7928** | Strong harmonic balance |
| **PR-AUC** | **0.8569** | Robust area under precision-recall curve |
| **Brier Loss** | **0.0616** | Well-calibrated probabilistic output |

### Confusion Matrix (10,000 Unseen Test Events)
- **True Negatives (Safe correctly identified)**: 7,448
- **False Positives (False alarms)**: 575
- **False Negatives (Missed floods)**: 301
- **True Positives (Floods detected)**: 1,676

### TreeSHAP Local Feature Importance (Native XGBoost)
- **Elevation** (topographic barrier): `+1.5417`
- **NDVI** (vegetation density/saturation): `+0.9984`
- **NDWI** (surface water index): `+0.7171`
- **Slope** (runoff velocity): `+0.4103`
- **Rainfall (24h)**: `+0.3536`
- **Rainfall (72h)**: `+0.2618`

### PyTorch `FloodNet` Epoch Progression
- **Optimizer**: AdamW (`lr=0.003`, `weight_decay=1e-4`) with CosineAnnealingLR.
- **Loss**: Positive-weighted BCEWithLogitsLoss.
- **Checkpoint**: Best checkpoint saved at Epoch 14 with **Validation Recall: 91.25%** and **PR-AUC: 0.7576**.

---

## 📓 Interactive Jupyter Notebooks

All 5 core notebooks + `disaster.ipynb` contain complete, pre-computed outputs and charts:

- [`notebooks/01_data_exploration.ipynb`](notebooks/01_data_exploration.ipynb): Ingestion, statistical distributions, class balance, and feature correlation with flood target.
- [`notebooks/02_preprocessing.ipynb`](notebooks/02_preprocessing.ipynb): Zero-null verification, physical bounds clamping, and `StandardScaler` normalization.
- [`notebooks/03_feature_engineering.ipynb`](notebooks/03_feature_engineering.ipynb): Cumulative rainfall ratio, drainage stress index, and Topographic Wetness Index.
- [`notebooks/04_model_training.ipynb`](notebooks/04_model_training.ipynb): **Epoch-based PyTorch training loop table**, loss convergence graphs, and ensemble boosting.
- [`notebooks/05_model_evaluation.ipynb`](notebooks/05_model_evaluation.ipynb): Model metrics table, **Confusion Matrix heatmap**, **ROC Curve**, and **Feature Importance chart**.
- [`disaster.ipynb`](disaster.ipynb): Root natural disaster exploratory notebook configured to run locally.

---

## 💻 Installation & Environment Setup

### 1. Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** and `npm`
- **Git**

### 2. Clone the Repository & Setup Virtual Environment
```bash
git clone https://github.com/your-username/DisasterRadar.ai.git
cd DisasterRadar.ai

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate
```

### 3. Install All Dependencies

#### Python (Backend & ML) Dependencies:
```bash
pip install -r backend/requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install optuna scikit-learn pandas numpy matplotlib seaborn pytest
```

#### Node.js (Frontend) Dependencies:
```bash
cd frontend
npm install
cd ..
```

---

## 🚀 Running Commands: From ML to Backend to Frontend

### 1️⃣ Machine Learning (ML) Commands

#### A. Ingest & Merge Raw Datasets
Combines the 1M-row MODIS satellite dataset, environmental governance data, and hydrodynamic priors into `data/processed/processed_data.csv`:
```bash
python src/data/merge_datasets.py
```

#### B. Train the 19-Step Native XGBoost Model (From Scratch)
Executes data quality audit, domain feature engineering, stratified 3-way split, Optuna hyperparameter tuning, early stopping, and TreeSHAP explainability:
```bash
python src/models/train_xgboost_pipeline.py
```
> **Output Artifacts Generated:**
> - `models/flood_model.json` (Native XGBoost JSON format — **strictly NO pickle**)
> - `models/feature_names.json` (Ordered feature schema)
> - `models/hyperparameters.json` (Optuna best parameters)
> - `models/metrics.json` (Validation & test performance scores)
> - `outputs/confusion_matrix.png`, `outputs/roc_curve.png`, `outputs/feature_importance.png`

#### C. Run Standalone Production Inference with TreeSHAP
Test predictions directly from terminal using custom sensor telemetry:
```bash
python src/models/inference.py
```

#### D. Regenerate All Executed Jupyter Notebooks
Compiles and updates notebooks 01 to 05 and `disaster.ipynb` with fresh execution outputs and charts:
```bash
python src/build_executed_notebooks.py
```

#### E. Run Automated Test Suite
```bash
python -m pytest tests/ -v
```

---

### 2️⃣ Backend (FastAPI) Commands

#### A. Start the FastAPI Server
Open a terminal in the root directory:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### B. Verify Backend Endpoints
Once running, the API is available at `http://127.0.0.1:8000`:
- **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Alternative UI**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

#### C. Test API Health & Performance from Terminal
```bash
# Check server health:
curl -X GET http://127.0.0.1:8000/api/health

# Check live model metrics (XGBoost 91.59% accuracy):
curl -X GET http://127.0.0.1:8000/api/model/performance

# Test flood prediction on custom telemetry:
curl -X POST http://127.0.0.1:8000/api/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"rainfall24h\":85.0,\"rainfall72h\":190.0,\"temperature\":28.5,\"humidity\":82.0,\"elevation\":15.0,\"pressure\":1004.0,\"location\":\"Bengaluru, Karnataka\"}"
```

---

### 3️⃣ Frontend (React + Vite) Commands

#### A. Start the React Development Server
Open a second terminal:
```bash
cd frontend
npm run dev
```
> **Frontend URL**: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)  
> Includes: Donut risk gauge, live Leaflet map, Mira Bhayandar GIS Atlas, Model Performance tab (ROC & Confusion Matrix), and Recent Predictions table.

#### B. Build for Production
```bash
cd frontend
npm run build
```

---

## ⚡ Quickstart Summary (Run All 3 Layers)

```powershell
# Terminal 1: Train ML Model & Start Backend
python src/models/train_xgboost_pipeline.py
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Start Frontend Dashboard
cd frontend
npm run dev
```

---

## 🧪 Automated Testing Verification

Run the full automated test suite to verify pipeline integrity, preprocessing bounds, and native XGBoost inference:
```bash
python -m pytest tests/ -v
```

Expected output:
```text
tests/test_prediction.py::test_native_xgboost_json_exists PASSED         [ 20%]
tests/test_prediction.py::test_inference_pipeline_execution PASSED       [ 40%]
tests/test_prediction.py::test_metrics_json_integrity PASSED             [ 60%]
tests/test_preprocessing.py::test_dataset_exists_and_valid PASSED        [ 80%]
tests/test_preprocessing.py::test_feature_distributions_and_bounds PASSED [100%]

======================= 5 passed in ~3.8s ========================
```

---

## 📡 API Reference (FastAPI)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck and timestamp |
| `POST` | `/api/predict` | Predict flood risk percentage, level, advisory, and SHAP factors |
| `GET` | `/api/stations` | Live weather stations telemetry and sensor data |
| `GET` | `/api/model/performance` | Real validation metrics (Accuracy, ROC-AUC, Confusion Matrix) |
| `GET` | `/api/gis/mira-bhayandar` | Geospatial GeoJSON risk polygons, railway line, and points of interest |
| `GET` | `/api/predictions/recent` | History of recent predictions |

---

## 📂 Project Structure

```
DisasterRadar.ai/
├── archive/                     # Kaggle environmental vulnerability dataset (flood.csv)
├── backend/                     # FastAPI REST API
│   ├── main.py                  # API endpoints and middleware
│   ├── models/schemas.py        # Pydantic request/response schemas
│   └── services/                # Predictor, telemetry stations, and GIS data
├── data/                        # Hydrological datasets
│   ├── processed/               # Standardized processed_data.csv
│   └── raw/                     # Raw telemetry and weather inputs
├── frontend/                    # Modern React (Vite) Web Application
│   ├── src/
│   │   ├── App.jsx              # Main dashboard view & tabs
│   │   ├── components/          # TopMetrics, InputParameters, RiskMap, MiraBhayandarAtlas
│   │   └── services/api.js      # Backend API connector
│   └── package.json
├── models/                      # Serialized ML & Deep Learning checkpoints
│   ├── flood_model.json         # Native XGBoost model (JSON format, NO pickle)
│   ├── flood_net_best.pt        # Trained PyTorch FloodNet weights
│   └── metrics.json             # Performance metrics & confusion matrix
├── notebooks/                   # Pre-executed Jupyter Notebooks
│   ├── 01_data_exploration.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_feature_engineering.ipynb
│   ├── 04_model_training.ipynb
│   └── 05_model_evaluation.ipynb
├── outputs/                     # Generated evaluation plots (Confusion matrix, ROC curve, etc.)
├── src/                         # Python ML pipelines
│   ├── data/merge_datasets.py   # Multi-source dataset synthesis
│   ├── models/train_all.py      # PyTorch epoch training & ensemble training
│   └── build_executed_notebooks.py # Notebook output compiler
├── tests/                       # Automated Pytest suite
│   ├── test_prediction.py
│   └── test_preprocessing.py
├── disaster.ipynb               # Natural disaster EDA notebook
└── README.md                    # Project documentation
```

---

## 📜 License
This project is open-source under the MIT License.
