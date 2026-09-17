"""
Master Pipeline Runner for Phase 1
Executes:
1. Data generation & Pandera schema validation
2. Feature engineering & temporal train/test split
3. Epoch-based PyTorch Deep Learning training (FloodNet)
4. XGBoost production model training & SHAP baseline calculation
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def run_phase1_pipeline():
    print("\n=======================================================")
    print("  STEP 1: GENERATING DATASET & VALIDATING WITH PANDERA")
    print("=======================================================")
    from src.data.make_dataset import main as gen_data
    gen_data()

    print("\n=======================================================")
    print("  STEP 2: FEATURE ENGINEERING & TEMPORAL SPLIT")
    print("=======================================================")
    from src.features.build_features import main as feat_main
    feat_main()

    print("\n=======================================================")
    print("  STEP 3: EPOCH-BASED DEEP LEARNING (FloodNet PyTorch)")
    print("=======================================================")
    from src.models.neural_net import train_epoch_model
    train_p = os.path.join("data", "processed", "train.parquet")
    test_p = os.path.join("data", "processed", "test.parquet")
    train_epoch_model(train_p, test_p, epochs=15, batch_size=64)

    print("\n=======================================================")
    print("  STEP 4: XGBOOST MODEL TRAINING & SHAP BASELINE")
    print("=======================================================")
    from src.models.train import train_and_tune_model
    train_and_tune_model(train_p, test_p, n_trials=8)

    print("\n=======================================================")
    print("  PHASE 1 CORE ML PIPELINE COMPLETED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_phase1_pipeline()
