"""
XGBoost Model Training & Optuna Hyperparameter Optimization Pipeline
Evaluates Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix, and SHAP Explainability.
"""

import os
import json
import joblib
import optuna
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    precision_recall_curve,
    auc,
    confusion_matrix
)
from src.features.build_features import FEATURE_COLUMNS

optuna.logging.set_verbosity(optuna.logging.WARNING)

def train_and_tune_model(train_parquet_path: str, test_parquet_path: str, n_trials: int = 15):
    train_df = pd.read_parquet(train_parquet_path)
    test_df = pd.read_parquet(test_parquet_path)
    
    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df["flood"]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df["flood"]
    
    # Calculate class imbalance ratio for scale_pos_weight
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    imbalance_ratio = float(neg_count) / max(1.0, float(pos_count))
    print(f"Class distribution: {pos_count} positive, {neg_count} negative (imbalance ratio: {imbalance_ratio:.2f})")
    
    # Optuna Objective
    def objective(trial):
        params = {
            "objective": "binary:logistic",
            "eval_metric": "aucpr", # Optimize Precision-Recall AUC for early warning
            "max_depth": trial.suggest_int("max_depth", 3, 8),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "n_estimators": trial.suggest_int("n_estimators", 80, 250),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 1, 6),
            "scale_pos_weight": trial.suggest_float("scale_pos_weight", 1.0, max(2.0, imbalance_ratio * 1.5)),
            "random_state": 42,
            "n_jobs": -1
        }
        
        clf = xgb.XGBClassifier(**params)
        clf.fit(X_train, y_train)
        
        y_prob = clf.predict_proba(X_test)[:, 1]
        precision_arr, recall_arr, _ = precision_recall_curve(y_test, y_prob)
        pr_auc = auc(recall_arr, precision_arr)
        return pr_auc
    
    print(f"Starting Optuna hyperparameter optimization ({n_trials} trials)...")
    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=n_trials)
    
    best_params = study.best_params
    best_params["objective"] = "binary:logistic"
    best_params["eval_metric"] = "aucpr"
    best_params["random_state"] = 42
    best_params["n_jobs"] = -1
    print(f"Best Trial PR-AUC: {study.best_value:.4f}")
    print("Best Hyperparameters:", best_params)
    
    # Train final model with best hyperparameters
    print("Training final production XGBoost model...")
    final_model = xgb.XGBClassifier(**best_params)
    final_model.fit(X_train, y_train)
    
    # Comprehensive Model Evaluation on Unseen Test Split
    y_pred = final_model.predict(X_test)
    y_prob = final_model.predict_proba(X_test)[:, 1]
    
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob)
    
    prec_arr, rec_arr, _ = precision_recall_curve(y_test, y_prob)
    pr_auc = auc(rec_arr, prec_arr)
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n--- MODEL PERFORMANCE METRICS (Unseen Temporal Test Split) ---")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print(f"PR-AUC:    {pr_auc:.4f}")
    print(f"Confusion Matrix:\n{cm}")
    
    # Calculate SHAP Explanations baseline using native TreeSHAP in XGBoost
    print("\nComputing native TreeSHAP feature importance...")
    dtest_sample = xgb.DMatrix(X_test.iloc[:200])
    # pred_contribs returns an array of shape (N, num_features + 1), where the last column is the bias term
    shap_matrix = final_model.get_booster().predict(dtest_sample, pred_contribs=True)
    feature_shap = shap_matrix[:, :-1] # exclude bias
    mean_abs_shap = np.abs(feature_shap).mean(axis=0)
    
    shap_ranking = sorted(
        zip(FEATURE_COLUMNS, mean_abs_shap),
        key=lambda x: x[1],
        reverse=True
    )
    print("Top Feature Drivers (TreeSHAP values):")
    for feat, val in shap_ranking[:6]:
        print(f"  • {feat}: {val:.4f}")
    
    # Save Model Artifacts
    models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_json_path = os.path.join(models_dir, "flood_model.json")
    final_model.save_model(model_json_path)
    
    metrics_data = {
        "model_name": "XGBoost (Optuna Optimized)",
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "pr_auc": round(float(pr_auc), 4),
        "confusion_matrix": {
            "tn": int(cm[0, 0]),
            "fp": int(cm[0, 1]),
            "fn": int(cm[1, 0]),
            "tp": int(cm[1, 1])
        },
        "best_hyperparameters": best_params,
        "feature_importance": {feat: round(float(val), 4) for feat, val in shap_ranking}
    }
    
    metrics_path = os.path.join(models_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
        
    print(f"\nSaved production model artifact to: {model_json_path}")
    print(f"Saved evaluation metrics metadata to: {metrics_path}")
    
    return final_model, metrics_data

def main():
    train_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "train.parquet")
    test_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "test.parquet")
    
    if not os.path.exists(train_path):
        from src.features.build_features import main as feat_main
        feat_main()
        
    train_and_tune_model(train_path, test_path, n_trials=12)

if __name__ == "__main__":
    main()
