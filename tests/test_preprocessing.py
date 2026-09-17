"""
Tests for Data Processing & Feature Range Validation
DisasterRadar.ai - Phase 1 Automated Testing
"""

import os
import numpy as np
import pandas as pd
import pytest

@pytest.fixture
def dataset_path():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "data", "processed", "processed_data.csv")

def test_dataset_exists_and_valid(dataset_path):
    assert os.path.exists(dataset_path), f"Processed dataset missing at {dataset_path}"
    df = pd.read_csv(dataset_path)
    assert len(df) >= 10000, f"Expected at least 10k samples, found {len(df)}"
    assert df.isnull().sum().sum() == 0, "Dataset contains unexpected null values"
    assert "flood_target" in df.columns, "flood_target column missing"
    assert "rainfall_24h" in df.columns, "rainfall_24h column missing"
    assert "rainfall_72h" in df.columns, "rainfall_72h column missing"

def test_feature_distributions_and_bounds(dataset_path):
    df = pd.read_csv(dataset_path)
    assert (df['rainfall_24h'] >= 0.0).all(), "Negative 24h rainfall values found"
    assert (df['rainfall_72h'] >= 0.0).all(), "Negative 72h rainfall values found"
    assert (df['elevation'] >= 0.0).all(), "Negative elevation values found"
    assert (df['flood_target'].isin([0, 1])).all(), "Target variable must be binary [0, 1]"
    assert df['flood_target'].mean() > 0.05, "Imbalance is too extreme (<5% positive class)"
