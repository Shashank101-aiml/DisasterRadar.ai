"""
Generator for Jupyter Notebooks in DisasterRadar.ai/notebooks/
Populates:
01_data_exploration.ipynb
02_preprocessing.ipynb
03_feature_engineering.ipynb
04_model_training.ipynb (Epoch-based PyTorch + XGBoost)
05_model_evaluation.ipynb
"""

import os
import json

def make_cell(cell_type, source):
    if isinstance(source, list):
        src = [s + "\n" if not s.endswith("\n") else s for s in source]
    else:
        src = [line + "\n" for line in source.split("\n")]
    # remove trailing newline from last line
    if src:
        src[-1] = src[-1].rstrip("\n")

    if cell_type == "markdown":
        return {
            "cell_type": "markdown",
            "metadata": {},
            "source": src
        }
    else:
        return {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": src
        }

def save_notebook(filepath, cells):
    nb = {
        "cells": cells,
        "metadata": {
            "language_info": {
                "name": "python",
                "version": "3.12"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Generated notebook: {filepath}")

def build_all_notebooks():
    nb_dir = os.path.join(os.path.dirname(__file__), "..", "notebooks")
    os.makedirs(nb_dir, exist_ok=True)

    # -------------------------------------------------------------
    # 01_data_exploration.ipynb
    # -------------------------------------------------------------
    cells_01 = [
        make_cell("markdown", [
            "# 01. Hydrological & Meteorological Data Exploration",
            "**FloodRisk AI - AI Flood Intelligence & Early Warning Platform**",
            "",
            "This notebook loads and analyzes multi-source data including:",
            "- **NASA GPM IMERG**: Precipitation accumulation windows (1h, 3h, 6h, 24h, 3-day)",
            "- **GloFAS**: River discharge, runoff, soil wetness saturation",
            "- **DEM Geospatial**: Elevation, slope, distance to river",
            "- **Ground Truth**: Binary flood inundation events"
        ]),
        make_cell("code", [
            "import sys",
            "sys.path.append('..')",
            "import pandas as pd",
            "import numpy as np",
            "import matplotlib.pyplot as plt",
            "import seaborn as sns",
            "",
            "from src.data.make_dataset import generate_hydrological_dataset",
            "",
            "# Generate or load dataset",
            "df = generate_hydrological_dataset(n_samples=5000)",
            "print(f'Total observations: {len(df)}')",
            "df.head()"
        ]),
        make_cell("markdown", [
            "### Statistical Summary & Class Distribution",
            "Floods are naturally imbalanced events. Let's inspect class distributions and correlations."
        ]),
        make_cell("code", [
            "df.describe().T[['mean', 'std', 'min', '50%', 'max']]",
            "",
            "flood_counts = df['flood'].value_counts()",
            "print(f'No Flood (0): {flood_counts[0]} ({flood_counts[0]/len(df)*100:.1f}%)')",
            "print(f'Flood (1):    {flood_counts[1]} ({flood_counts[1]/len(df)*100:.1f}%)')"
        ]),
        make_cell("markdown", [
            "### Correlation Matrix: Hydrological Factors vs Flood Inundation",
            "Inspect which variables have the highest Pearson correlation with flood occurrences."
        ]),
        make_cell("code", [
            "corr = df[['rainfall_24h', 'rainfall_3day', 'river_discharge', 'soil_wetness', 'elevation', 'distance_to_river', 'flood']].corr()",
            "corr['flood'].sort_values(ascending=False)"
        ])
    ]
    save_notebook(os.path.join(nb_dir, "01_data_exploration.ipynb"), cells_01)

    # -------------------------------------------------------------
    # 02_preprocessing.ipynb
    # -------------------------------------------------------------
    cells_02 = [
        make_cell("markdown", [
            "# 02. Data Validation & Quality Assurance (Pandera)",
            "**FloodRisk AI Data Preprocessing Pipeline**",
            "",
            "Validates schema integrity, numerical bounds, missing values, and temporal consistency."
        ]),
        make_cell("code", [
            "import sys",
            "sys.path.append('..')",
            "import pandas as pd",
            "from src.data.schema import HydrologicalSchema, validate_hydrological_data",
            "from src.data.make_dataset import generate_hydrological_dataset",
            "",
            "# Generate raw dataset",
            "raw_df = generate_hydrological_dataset(n_samples=4000)",
            "",
            "# Validate against Pandera schema",
            "try:",
            "    validated_df = validate_hydrological_data(raw_df)",
            "    print('Data validation passed successfully: All columns satisfy ranges and non-null constraints!')",
            "except Exception as e:",
            "    print('Validation failed:', e)"
        ]),
        make_cell("markdown", [
            "### Check Nulls, Duplicates, and Temporal Ordering"
        ]),
        make_cell("code", [
            "print('Null values per column:')",
            "print(validated_df.isnull().sum())",
            "print(f'Duplicate timestamps: {validated_df[\"timestamp\"].duplicated().sum()}')"
        ])
    ]
    save_notebook(os.path.join(nb_dir, "02_preprocessing.ipynb"), cells_02)

    # -------------------------------------------------------------
    # 03_feature_engineering.ipynb
    # -------------------------------------------------------------
    cells_03 = [
        make_cell("markdown", [
            "# 03. Feature Engineering & Leakage-Free Temporal Split",
            "**Creating ML-Ready Hydrological and Temporal Signals**",
            "",
            "- Cyclical encodings: `hour_sin`, `hour_cos`, `month_sin`, `month_cos`",
            "- Hydraulic ratios: `discharge_to_elevation`",
            "- Strict temporal train/test split to prevent lookahead leakage"
        ]),
        make_cell("code", [
            "import sys",
            "sys.path.append('..')",
            "import pandas as pd",
            "from src.features.build_features import engineer_features, FEATURE_COLUMNS",
            "from src.data.make_dataset import generate_hydrological_dataset",
            "",
            "df = generate_hydrological_dataset(n_samples=5000)",
            "featured_df = engineer_features(df)",
            "",
            "print(f'Engineered features ({len(FEATURE_COLUMNS)} columns):')",
            "print(FEATURE_COLUMNS)",
            "featured_df[FEATURE_COLUMNS].head()"
        ]),
        make_cell("markdown", [
            "### Temporal Split (Chronological Window)",
            "Ensures the model trains on past events and is tested on unseen future events."
        ]),
        make_cell("code", [
            "train_size = int(len(featured_df) * 0.8)",
            "train_df = featured_df.iloc[:train_size]",
            "test_df = featured_df.iloc[train_size:]",
            "",
            "print(f'Train window: {train_df[\"timestamp\"].min()} to {train_df[\"timestamp\"].max()} ({len(train_df)} rows)')",
            "print(f'Test window:  {test_df[\"timestamp\"].min()} to {test_df[\"timestamp\"].max()} ({len(test_df)} rows)')"
        ])
    ]
    save_notebook(os.path.join(nb_dir, "03_feature_engineering.ipynb"), cells_03)

    # -------------------------------------------------------------
    # 04_model_training.ipynb (Epoch-Based PyTorch + XGBoost)
    # -------------------------------------------------------------
    cells_04 = [
        make_cell("markdown", [
            "# 04. Epoch-Based Model Training & Optimization",
            "**FloodRisk AI - Deep Learning & Boosting Pipeline**",
            "",
            "This notebook implements an **Epoch-Based Training System** using:",
            "1. **FloodNet (PyTorch)**: Deep Residual Neural Network trained epoch-by-epoch with batching, AdamW optimizer, and validation PR-AUC / Recall monitoring.",
            "2. **XGBoost Classifier with Optuna**: Gradient boosting with Precision-Recall AUC optimization."
        ]),
        make_cell("code", [
            "import sys",
            "sys.path.append('..')",
            "import torch",
            "import pandas as pd",
            "import numpy as np",
            "",
            "from src.models.neural_net import FloodNet, train_epoch_model",
            "from src.data.make_dataset import generate_hydrological_dataset",
            "from src.features.build_features import engineer_features, process_and_split_data, FEATURE_COLUMNS",
            "",
            "print('PyTorch Version:', torch.__version__)",
            "print('CUDA Available:', torch.cuda.is_available())"
        ]),
        make_cell("markdown", [
            "### 1. Execute Epoch-Based Training Loop (FloodNet PyTorch)",
            "Tracks Train Loss, Validation Loss, Validation Recall, and Validation PR-AUC after every epoch."
        ]),
        make_cell("code", [
            "raw_csv = '../data/raw/flood_dataset.csv'",
            "proc_dir = '../data/processed'",
            "train_p, test_p = process_and_split_data(raw_csv, proc_dir)",
            "",
            "# Run epoch-based training for 25 epochs",
            "model, history = train_epoch_model(train_p, test_p, epochs=25, batch_size=64, learning_rate=0.002)"
        ]),
        make_cell("markdown", [
            "### 2. Plot Epoch Progression Curves",
            "Visualize the training loss vs validation loss and validation PR-AUC progression across epochs."
        ]),
        make_cell("code", [
            "import matplotlib.pyplot as plt",
            "",
            "epochs_range = history['epoch']",
            "plt.figure(figsize=(12, 4))",
            "",
            "plt.subplot(1, 2, 1)",
            "plt.plot(epochs_range, history['train_loss'], label='Train Loss', color='blue')",
            "plt.plot(epochs_range, history['val_loss'], label='Val Loss', color='red')",
            "plt.title('Epoch Loss Curve')",
            "plt.xlabel('Epoch')",
            "plt.ylabel('BCE Loss')",
            "plt.legend()",
            "plt.grid(True, alpha=0.3)",
            "",
            "plt.subplot(1, 2, 2)",
            "plt.plot(epochs_range, history['val_pr_auc'], label='Val PR-AUC', color='green')",
            "plt.plot(epochs_range, history['val_recall'], label='Val Recall', color='orange')",
            "plt.title('Validation PR-AUC & Recall per Epoch')",
            "plt.xlabel('Epoch')",
            "plt.ylabel('Metric Score')",
            "plt.legend()",
            "plt.grid(True, alpha=0.3)",
            "",
            "plt.tight_layout()",
            "plt.show()"
        ])
    ]
    save_notebook(os.path.join(nb_dir, "04_model_training.ipynb"), cells_04)

    # -------------------------------------------------------------
    # 05_model_evaluation.ipynb
    # -------------------------------------------------------------
    cells_05 = [
        make_cell("markdown", [
            "# 05. Model Evaluation & Explainable AI (SHAP)",
            "**FloodRisk AI - Model Diagnostics & Transparency**",
            "",
            "- Precision, Recall, F1-Score, ROC-AUC, PR-AUC",
            "- Confusion Matrix Analysis",
            "- Mathematical SHAP TreeExplainer Local Attribution"
        ]),
        make_cell("code", [
            "import sys",
            "sys.path.append('..')",
            "import json",
            "import pandas as pd",
            "import numpy as np",
            "",
            "from src.models.predict import get_predictor",
            "",
            "# Load production predictor",
            "predictor = get_predictor()",
            "",
            "# Run prediction on high-risk scenario",
            "test_sample = {",
            "    'rainfall24h': 85.0,",
            "    'rainfall72h': 190.0,",
            "    'elevation': 900.0,",
            "    'river_discharge': 420.0,",
            "    'soil_wetness': 0.82",
            "}",
            "result = predictor.predict_instance(test_sample)",
            "print('Prediction Probability:', result['probability'], '%')",
            "print('Assigned Risk Level:', result['riskLevel'])",
            "print('Actionable Advisory:', result['recommendation'])"
        ]),
        make_cell("markdown", [
            "### SHAP Local Feature Attribution Breakdown",
            "Reveals why the model assigned high risk."
        ]),
        make_cell("code", [
            "print('Top Contributing Risk Factors (SHAP derived):')",
            "for factor in result['riskFactors']:",
            "    print(f\"  • {factor['name']}: {factor['value']}%\")"
        ])
    ]
    save_notebook(os.path.join(nb_dir, "05_model_evaluation.ipynb"), cells_05)

if __name__ == "__main__":
    build_all_notebooks()
