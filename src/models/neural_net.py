"""
Epoch-Based Deep Learning Model for Flood Risk Intelligence
PyTorch implementation of Hydrological Neural Network (FloodNet)
Features:
- Multi-layer Residual Architecture with Batch Normalization & Dropout
- Epoch-by-Epoch training loop with Train/Val Loss, Recall, and PR-AUC tracking
- Best checkpoint saving and early stopping based on Validation PR-AUC
"""

import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, precision_recall_curve, auc

from src.features.build_features import FEATURE_COLUMNS

class FloodDataset(Dataset):
    def __init__(self, X: np.ndarray, y: np.ndarray):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.float32).unsqueeze(1)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class FloodNet(nn.Module):
    def __init__(self, input_dim: int = len(FEATURE_COLUMNS), hidden_dim: int = 64, dropout_rate: float = 0.25):
        super(FloodNet, self).__init__()
        
        self.block1 = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.LeakyReLU(0.1),
            nn.Dropout(dropout_rate)
        )
        
        self.block2 = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.LeakyReLU(0.1),
            nn.Dropout(dropout_rate)
        )
        
        self.block3 = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.BatchNorm1d(32),
            nn.LeakyReLU(0.1)
        )
        
        self.out = nn.Linear(32, 1)

    def forward(self, x):
        h1 = self.block1(x)
        h2 = self.block2(h1) + h1 # Residual skip connection
        h3 = self.block3(h2)
        logits = self.out(h3)
        return logits

def train_epoch_model(
    train_parquet_path: str,
    test_parquet_path: str,
    epochs: int = 30,
    batch_size: int = 64,
    learning_rate: float = 0.002,
    patience: int = 8
):
    train_df = pd.read_parquet(train_parquet_path)
    test_df = pd.read_parquet(test_parquet_path)

    X_train = train_df[FEATURE_COLUMNS].values
    y_train = train_df["flood"].values
    X_val = test_df[FEATURE_COLUMNS].values
    y_val = test_df["flood"].values

    train_dataset = FloodDataset(X_train, y_train)
    val_dataset = FloodDataset(X_val, y_val)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    # Class imbalance weighting
    pos_weight = torch.tensor([(len(y_train) - sum(y_train)) / max(1.0, sum(y_train))], dtype=torch.float32)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    model = FloodNet(input_dim=len(FEATURE_COLUMNS))
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=3)

    print(f"=========================================================================================")
    print(f"  STARTING EPOCH-BASED TRAINING: FloodNet Deep Learning Architecture")
    print(f"  Input Features: {len(FEATURE_COLUMNS)} | Epochs: {epochs} | Batch Size: {batch_size}")
    print(f"=========================================================================================\n")

    history = {
        "epoch": [],
        "train_loss": [],
        "val_loss": [],
        "val_recall": [],
        "val_precision": [],
        "val_f1": [],
        "val_pr_auc": [],
        "val_roc_auc": []
    }

    best_pr_auc = 0.0
    best_epoch = 0
    patience_counter = 0

    models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    best_model_path = os.path.join(models_dir, "flood_net_best.pt")

    for epoch in range(1, epochs + 1):
        # --- TRAIN STEP ---
        model.train()
        train_losses = []
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            preds = model(batch_x)
            loss = criterion(preds, batch_y)
            loss.backward()
            optimizer.step()
            train_losses.append(loss.item())

        train_loss = np.mean(train_losses)

        # --- VALIDATION STEP ---
        model.eval()
        val_losses = []
        all_probs = []
        all_targets = []

        with torch.no_grad():
            for batch_x, batch_y in val_loader:
                preds = model(batch_x)
                loss = criterion(preds, batch_y)
                val_losses.append(loss.item())
                probs = torch.sigmoid(preds).cpu().numpy()
                all_probs.extend(probs)
                all_targets.extend(batch_y.cpu().numpy())

        val_loss = np.mean(val_losses)
        all_probs = np.array(all_probs).flatten()
        all_targets = np.array(all_targets).flatten()
        all_preds = (all_probs >= 0.5).astype(int)

        val_recall = recall_score(all_targets, all_preds, zero_division=0)
        val_precision = precision_score(all_targets, all_preds, zero_division=0)
        val_f1 = f1_score(all_targets, all_preds, zero_division=0)
        val_roc_auc = roc_auc_score(all_targets, all_probs)
        
        p_arr, r_arr, _ = precision_recall_curve(all_targets, all_probs)
        val_pr_auc = auc(r_arr, p_arr)

        scheduler.step(val_pr_auc)

        # Log epoch statistics
        history["epoch"].append(epoch)
        history["train_loss"].append(round(float(train_loss), 4))
        history["val_loss"].append(round(float(val_loss), 4))
        history["val_recall"].append(round(float(val_recall), 4))
        history["val_precision"].append(round(float(val_precision), 4))
        history["val_f1"].append(round(float(val_f1), 4))
        history["val_pr_auc"].append(round(float(val_pr_auc), 4))
        history["val_roc_auc"].append(round(float(val_roc_auc), 4))

        is_best = val_pr_auc > best_pr_auc
        marker = "★ [BEST]" if is_best else ""
        print(f"Epoch [{epoch:02d}/{epochs:02d}] - Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Recall: {val_recall:.4f} | PR-AUC: {val_pr_auc:.4f} | F1: {val_f1:.4f} {marker}")

        if is_best:
            best_pr_auc = val_pr_auc
            best_epoch = epoch
            patience_counter = 0
            torch.save(model.state_dict(), best_model_path)
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"\nEarly stopping triggered at Epoch {epoch}. Best Epoch: {best_epoch} with PR-AUC: {best_pr_auc:.4f}")
                break

    # Save Epoch Training History metadata
    history_path = os.path.join(models_dir, "epoch_training_history.json")
    with open(history_path, "w") as f:
        json.dump({
            "model_type": "FloodNet (PyTorch Deep Learning)",
            "best_epoch": best_epoch,
            "best_val_pr_auc": round(float(best_pr_auc), 4),
            "epochs_run": len(history["epoch"]),
            "history": history
        }, f, indent=2)

    print(f"\n=========================================================================================")
    print(f"  EPOCH TRAINING COMPLETE: Best Checkpoint saved to {best_model_path}")
    print(f"  Saved Epoch Curves to {history_path}")
    print(f"=========================================================================================\n")

    return model, history

if __name__ == "__main__":
    train_p = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "train.parquet")
    test_p = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed", "test.parquet")
    if os.path.exists(train_p) and os.path.exists(test_p):
        train_epoch_model(train_p, test_p, epochs=25)
