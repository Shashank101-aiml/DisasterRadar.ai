"""
DisasterRadar.ai - Unified Model Training & Evaluation Pipeline
Trains:
1. PyTorch Epoch-Based FloodNet (Deep Hydrological Neural Network)
2. Calibrated Ensemble Flood Classifier (Gradient Boosting / Random Forest)
Generates:
- models/flood_model.pkl
- models/scaler.pkl
- models/flood_net_best.pt
- models/metrics.json
- outputs/confusion_matrix.png
- outputs/roc_curve.png
- outputs/feature_importance.png
- outputs/epoch_training_curve.png
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import TensorDataset, DataLoader

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve, brier_score_loss
)

# PyTorch Architecture
class FloodNet(nn.Module):
    def __init__(self, input_dim: int = 13, hidden_dim: int = 64, dropout_rate: float = 0.25):
        super(FloodNet, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.SiLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.SiLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden_dim // 2, 16),
            nn.SiLU(),
            nn.Linear(16, 1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze(-1)


def train_and_evaluate_all():
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
    
    X = df[feature_cols].values
    y = df['flood_target'].values
    
    # 80/20 Stratified Split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train split: {len(X_train)} samples, Validation split: {len(X_val)} samples")
    
    # Feature Standardization
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    # Save Scaler
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"Saved StandardScaler to {scaler_path}")
    
    # ==========================================
    # 1. EPOCH-BASED PYTORCH FLOODNET TRAINING
    # ==========================================
    print("\n" + "="*60)
    print("STARTING PYTORCH EPOCH-BASED FLOODNET TRAINING")
    print("="*60)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using compute device: {device}")
    
    train_dataset = TensorDataset(torch.FloatTensor(X_train_scaled), torch.FloatTensor(y_train))
    val_dataset = TensorDataset(torch.FloatTensor(X_val_scaled), torch.FloatTensor(y_val))
    
    batch_size = 256
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    model = FloodNet(input_dim=len(feature_cols)).to(device)
    
    # Weighted loss for ~20% flood imbalance
    pos_weight = torch.tensor([(len(y_train) - sum(y_train)) / sum(y_train)]).to(device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    optimizer = optim.AdamW(model.parameters(), lr=0.003, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=15, eta_min=1e-5)
    
    epochs = 15
    history = {'epoch': [], 'train_loss': [], 'val_loss': [], 'val_acc': [], 'val_recall': [], 'val_pr_auc': []}
    best_val_loss = float('inf')
    best_weights_path = os.path.join(models_dir, 'flood_net_best.pt')
    
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            logits = model(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()
            train_loss += loss.item() * len(batch_y)
        train_loss /= len(train_dataset)
        
        # Validation pass
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_targets = []
        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                batch_x, batch_y = batch_x.to(device), batch_y.to(device)
                logits = model(batch_x)
                loss = criterion(logits, batch_y)
                val_loss += loss.item() * len(batch_y)
                probs = torch.sigmoid(logits).cpu().numpy()
                all_preds.extend(probs)
                all_targets.extend(batch_y.cpu().numpy())
                
        val_loss /= len(val_dataset)
        scheduler.step()
        
        all_preds = np.array(all_preds)
        all_targets = np.array(all_targets)
        pred_labels = (all_preds >= 0.5).astype(int)
        
        epoch_acc = accuracy_score(all_targets, pred_labels)
        epoch_rec = recall_score(all_targets, pred_labels)
        epoch_prauc = average_precision_score(all_targets, all_preds)
        
        history['epoch'].append(epoch)
        history['train_loss'].append(train_loss)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(epoch_acc)
        history['val_recall'].append(epoch_rec)
        history['val_pr_auc'].append(epoch_prauc)
        
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), best_weights_path)
            star = " * [BEST SAVED]"
        else:
            star = ""
            
        print(f"Epoch [{epoch:02d}/{epochs}] | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Acc: {epoch_acc:.4f} | Recall: {epoch_rec:.4f} | PR-AUC: {epoch_prauc:.4f}{star}")
        
    print(f"\nSaved best PyTorch FloodNet weights to {best_weights_path}")
    
    # Save Epoch Training Curve
    plt.figure(figsize=(10, 4))
    plt.subplot(1, 2, 1)
    plt.plot(history['epoch'], history['train_loss'], label='Train Loss', marker='o')
    plt.plot(history['epoch'], history['val_loss'], label='Val Loss', marker='s')
    plt.title('FloodNet: Epoch Loss Convergence')
    plt.xlabel('Epoch')
    plt.ylabel('BCE Loss')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend()
    
    plt.subplot(1, 2, 2)
    plt.plot(history['epoch'], history['val_acc'], label='Val Accuracy', color='green', marker='o')
    plt.plot(history['epoch'], history['val_pr_auc'], label='Val PR-AUC', color='purple', marker='^')
    plt.title('FloodNet: Epoch Metrics Tracking')
    plt.xlabel('Epoch')
    plt.ylabel('Score')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'epoch_training_curve.png'), dpi=200)
    plt.close()
    
    # ==========================================
    # 2. ENSEMBLE PRODUCTION MODEL TRAINING
    # ==========================================
    print("\n" + "="*60)
    print("TRAINING ENSEMBLE GRADIENT BOOSTING CLASSIFIER")
    print("="*60)
    
    gbm = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        random_state=42
    )
    gbm.fit(X_train_scaled, y_train)
    
    # Validate
    y_pred = gbm.predict(X_val_scaled)
    y_prob = gbm.predict_proba(X_val_scaled)[:, 1]
    
    # Compute Comprehensive Metrics
    acc = float(accuracy_score(y_val, y_pred))
    prec = float(precision_score(y_val, y_pred))
    rec = float(recall_score(y_val, y_pred))
    f1 = float(f1_score(y_val, y_pred))
    roc_auc = float(roc_auc_score(y_val, y_prob))
    pr_auc = float(average_precision_score(y_val, y_prob))
    brier = float(brier_score_loss(y_val, y_prob))
    cm = confusion_matrix(y_val, y_pred).tolist()
    
    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy:        {acc:.4f} ({acc*100:.2f}%)")
    print(f"Precision:       {prec:.4f}")
    print(f"Recall:          {rec:.4f}")
    print(f"F1-Score:        {f1:.4f}")
    print(f"ROC-AUC:         {roc_auc:.4f}")
    print(f"PR-AUC:          {pr_auc:.4f}")
    print(f"Brier Score:     {brier:.4f}")
    print(f"Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    
    # Save Model to models/flood_model.pkl
    model_pkl_path = os.path.join(models_dir, 'flood_model.pkl')
    with open(model_pkl_path, 'wb') as f:
        pickle.dump(gbm, f)
    print(f"\nSaved trained model to {model_pkl_path} ({os.path.getsize(model_pkl_path) / (1024*1024):.2f} MB)")
    
    # Save Metrics JSON
    metrics_data = {
        'model_name': 'FloodRisk-XGB/GBM Ensemble v1.0',
        'accuracy': round(acc, 4),
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1_score': round(f1, 4),
        'roc_auc': round(roc_auc, 4),
        'pr_auc': round(pr_auc, 4),
        'brier_score': round(brier, 4),
        'confusion_matrix': cm,
        'feature_names': feature_cols,
        'feature_importances': [round(float(v), 4) for v in gbm.feature_importances_],
        'epoch_history': history
    }
    
    metrics_path = os.path.join(models_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Saved metrics payload to {metrics_path}")
    
    # ==========================================
    # 3. GENERATE EVALUATION CHARTS IN OUTPUTS/
    # ==========================================
    # Confusion Matrix
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False,
                xticklabels=['Predicted Safe', 'Predicted Flood'],
                yticklabels=['Actual Safe', 'Actual Flood'])
    plt.title(f'Confusion Matrix (Acc: {acc*100:.1f}%)', fontsize=12, fontweight='bold')
    plt.ylabel('True Class')
    plt.xlabel('Predicted Class')
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'confusion_matrix.png'), dpi=200)
    plt.close()
    
    # ROC Curve
    fpr, tpr, _ = roc_curve(y_val, y_prob)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color='#0284c7', lw=2.5, label=f'ROC Curve (AUC = {roc_auc:.4f})')
    plt.plot([0, 1], [0, 1], color='#94a3b8', linestyle='--', lw=1.5, label='Random Chance')
    plt.title('Receiver Operating Characteristic (ROC)', fontsize=12, fontweight='bold')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.6)
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'roc_curve.png'), dpi=200)
    plt.close()
    
    # Feature Importance
    plt.figure(figsize=(9, 6))
    fi_df = pd.DataFrame({'feature': feature_cols, 'importance': gbm.feature_importances_})
    fi_df = fi_df.sort_values(by='importance', ascending=True)
    plt.barh(fi_df['feature'], fi_df['importance'], color='#38bdf8', edgecolor='#0284c7')
    plt.title('Hydrological & Governance Feature Importance (Gini)', fontsize=12, fontweight='bold')
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(outputs_dir, 'feature_importance.png'), dpi=200)
    plt.close()
    
    print("All evaluation plots generated in outputs/ successfully!")
    return metrics_data

if __name__ == '__main__':
    train_and_evaluate_all()
