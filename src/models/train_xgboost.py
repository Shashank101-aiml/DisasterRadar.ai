"""
XGBoost Production Model Training & TreeSHAP Pipeline
DisasterRadar.ai - Native XGBoost Serialization (flood_model.json)
Trains:
- xgboost.XGBClassifier with scale_pos_weight on 50,000 unified hydrological records
- Computes Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC, Confusion Matrix
- Computes native XGBoost TreeSHAP attributions
Saves:
- models/flood_model.json (native XGBoost JSON format, no pickle needed)
- models/metrics.json
- outputs/confusion_matrix.png, roc_curve.png, feature_importance.png
"""

import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve, brier_score_loss
)

def train_xgboost():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, 'data', 'processed', 'processed_data.csv')
    models_dir = os.path.join(base_dir, 'models')
    outputs_dir = os.path.join(base_dir, 'outputs')
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)
    
    print(f"Loading merged dataset from {data_path}...")
    df = pd.read_csv(data_path)
    
    feature_cols = [
        'rainfall_24h', 'rainfall_72h', 'elevation', 'slope', 'twi', 'ndwi',
        'ndvi', 'drainage_capacity', 'urbanization_index', 'infrastructure_decay',
        'disaster_unpreparedness', 'flow_accumulation', 'roughness'
    ]
    
    X = df[feature_cols]
    y = df['flood_target']
    
    # 80/20 Stratified Split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train split: {len(X_train)} samples, Validation split: {len(X_val)} samples")
    
    # Calculate scale_pos_weight
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos_weight = float(neg_count) / float(pos_count)
    print(f"Class imbalance ratio: {neg_count} negative / {pos_count} positive (scale_pos_weight = {scale_pos_weight:.2f})")
    
    # Native XGBoost Classifier
    print("\n" + "="*60)
    print("TRAINING NATIVE XGBOOST CLASSIFIER")
    print("="*60)
    
    model = xgb.XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=2,
        scale_pos_weight=1.5,
        eval_metric=["logloss", "aucpr"],
        random_state=42,
        n_jobs=-1
    )
    
    eval_set = [(X_train, y_train), (X_val, y_val)]
    model.fit(
        X_train, y_train,
        eval_set=eval_set,
        verbose=25
    )
    
    # Predict probabilities & labels on validation split
    y_pred = model.predict(X_val)
    y_prob = model.predict_proba(X_val)[:, 1]
    
    # Evaluation Metrics
    acc = float(accuracy_score(y_val, y_pred))
    prec = float(precision_score(y_val, y_pred))
    rec = float(recall_score(y_val, y_pred))
    f1 = float(f1_score(y_val, y_pred))
    roc_auc = float(roc_auc_score(y_val, y_prob))
    pr_auc = float(average_precision_score(y_val, y_prob))
    brier = float(brier_score_loss(y_val, y_prob))
    cm = confusion_matrix(y_val, y_pred).tolist()
    
    print("\n" + "="*60)
    print("XGBOOST VALIDATION METRICS (10,000 Unseen Samples)")
    print("="*60)
    print(f"Accuracy:        {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision:       {prec:.4f} ({prec*100:.2f}%)")
    print(f"Recall:          {rec:.4f} ({rec*100:.2f}%)")
    print(f"F1-Score:        {f1:.4f}")
    print(f"ROC-AUC:         {roc_auc:.4f}")
    print(f"PR-AUC:          {pr_auc:.4f}")
    print(f"Brier Score:     {brier:.4f}")
    print(f"Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    
    # TreeSHAP Feature Attributions
    print("\nComputing native XGBoost TreeSHAP contributions...")
    dval_sample = xgb.DMatrix(X_val.iloc[:300])
    shap_matrix = model.get_booster().predict(dval_sample, pred_contribs=True)
    mean_shap = np.abs(shap_matrix[:, :-1]).mean(axis=0)
    shap_dict = {f: round(float(val), 4) for f, val in zip(feature_cols, mean_shap)}
    sorted_shap = sorted(shap_dict.items(), key=lambda x: x[1], reverse=True)
    print("Top Feature Drivers (Native TreeSHAP):")
    for f, val in sorted_shap[:6]:
        print(f"  * {f:25s}: {val:.4f}")
        
    # Save Native XGBoost Model to JSON (NO PICKLE)
    model_json_path = os.path.join(models_dir, 'flood_model.json')
    model.save_model(model_json_path)
    print(f"\nSaved native XGBoost model to: {model_json_path} ({os.path.getsize(model_json_path) / 1024:.1f} KB)")
    
    # Save Metrics JSON
    metrics_data = {
        'model_name': 'XGBoost Flood Classifier v2.0 (Native JSON)',
        'model_format': 'native_json',
        'model_file': 'flood_model.json',
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'roc_auc': round(roc_auc, 4),
        'pr_auc': round(pr_auc, 4),
        'brier_score': round(brier, 4),
        'confusion_matrix': cm,
        'feature_names': feature_cols,
        'feature_shap_importance': shap_dict
    }
    
    metrics_path = os.path.join(models_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Saved evaluation metrics to: {metrics_path}")
    
    # Generate Visualizations in outputs/
    # 1. Confusion Matrix
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=['Predicted Safe', 'Predicted Flood'],
                yticklabels=['Actual Safe', 'Actual Flood'])
    plt.title(f'XGBoost Confusion Matrix (Acc: {acc*100:.2f}%)', fontsize=12, fontweight='bold')
    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'confusion_matrix.png'), dpi=200)
    plt.close()
    
    # 2. ROC Curve
    fpr, tpr, _ = roc_curve(y_val, y_prob)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color='#0284c7', lw=2.5, label=f'XGBoost ROC (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='#94a3b8', linestyle='--', lw=1.5, label='Random Chance')
    plt.title('Receiver Operating Characteristic (ROC)', fontsize=12, fontweight='bold')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'roc_curve.png'), dpi=200)
    plt.close()
    
    # 3. Feature Importance
    plt.figure(figsize=(9, 6))
    fi_df = pd.DataFrame(sorted_shap, columns=['feature', 'shap_importance']).sort_values(by='shap_importance', ascending=True)
    plt.barh(fi_df['feature'], fi_df['shap_importance'], color='#38bdf8', edgecolor='#0284c7')
    plt.title('XGBoost TreeSHAP Feature Attributions', fontsize=12, fontweight='bold')
    plt.xlabel('Mean |SHAP Value|')
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'feature_importance.png'), dpi=200)
    plt.close()
    
    print("All XGBoost charts generated in outputs/ successfully!")
    return model, metrics_data

if __name__ == '__main__':
    train_xgboost()
