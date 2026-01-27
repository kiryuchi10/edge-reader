"""
ML Model Training Script
Standalone script to train models with sample or real data
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
from app.services.ml_service import ml_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_sample_classification_data(n_samples=1000, n_features=10, n_classes=3):
    """Generate sample classification data"""
    from sklearn.datasets import make_classification
    
    X, y = make_classification(
        n_samples=n_samples,
        n_features=n_features,
        n_informative=n_features,
        n_redundant=0,
        n_classes=n_classes,
        random_state=42
    )
    return X, y

def generate_sample_regression_data(n_samples=1000, n_features=10):
    """Generate sample regression data"""
    from sklearn.datasets import make_regression
    
    X, y = make_regression(
        n_samples=n_samples,
        n_features=n_features,
        n_informative=n_features,
        noise=10,
        random_state=42
    )
    return X, y

def generate_sample_timeseries_data(n_samples=1000, n_features=5):
    """Generate sample time series data"""
    t = np.arange(n_samples)
    X = np.random.randn(n_samples, n_features)
    y = np.sin(2 * np.pi * t / 50) + 0.5 * np.random.randn(n_samples)
    return X, y

def load_data_from_csv(file_path: str, target_column: str, feature_columns: list = None):
    """Load data from CSV file"""
    df = pd.read_csv(file_path)
    
    if feature_columns is None:
        feature_columns = [col for col in df.columns if col != target_column]
    
    X = df[feature_columns].values
    y = df[target_column].values
    
    return X, y, feature_columns

def main():
    """Main training script"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Train ML models")
    parser.add_argument("--type", choices=["classification", "regression", "clustering", "timeseries"], 
                       required=True, help="Model type")
    parser.add_argument("--algorithm", default="random_forest", 
                       help="Algorithm (random_forest, xgboost, logistic, linear, kmeans, lstm)")
    parser.add_argument("--data", type=str, help="Path to CSV data file")
    parser.add_argument("--target", type=str, help="Target column name (for CSV)")
    parser.add_argument("--features", nargs="+", help="Feature columns (for CSV)")
    parser.add_argument("--samples", type=int, default=1000, help="Number of samples (for synthetic data)")
    parser.add_argument("--n-clusters", type=int, default=3, help="Number of clusters (for clustering)")
    parser.add_argument("--sequence-length", type=int, default=10, help="Sequence length (for LSTM)")
    parser.add_argument("--epochs", type=int, default=50, help="Epochs (for LSTM)")
    
    args = parser.parse_args()
    
    # Load or generate data
    if args.data:
        logger.info(f"Loading data from {args.data}")
        if not args.target:
            raise ValueError("--target required when using --data")
        X, y, feature_cols = load_data_from_csv(args.data, args.target, args.features)
        logger.info(f"Loaded {X.shape[0]} samples with {X.shape[1]} features")
    else:
        logger.info("Generating synthetic data...")
        if args.type == "classification":
            X, y = generate_sample_classification_data(n_samples=args.samples)
        elif args.type == "regression":
            X, y = generate_sample_regression_data(n_samples=args.samples)
        elif args.type == "timeseries":
            X, y = generate_sample_timeseries_data(n_samples=args.samples)
        else:
            X, y = generate_sample_regression_data(n_samples=args.samples)
        logger.info(f"Generated {X.shape[0]} samples with {X.shape[1]} features")
    
    # Train model
    logger.info(f"Training {args.type} model with {args.algorithm} algorithm...")
    
    try:
        if args.type == "classification":
            result = ml_service.train_classification(
                X, y,
                algorithm=args.algorithm,
                n_estimators=100,
                max_depth=10
            )
        elif args.type == "regression":
            result = ml_service.train_regression(
                X, y,
                algorithm=args.algorithm,
                n_estimators=100,
                max_depth=10
            )
        elif args.type == "clustering":
            result = ml_service.train_clustering(
                X,
                algorithm=args.algorithm,
                n_clusters=args.n_clusters
            )
        elif args.type == "timeseries":
            if args.algorithm != "lstm":
                raise ValueError("Only LSTM supported for timeseries")
            result = ml_service.train_lstm_timeseries(
                X, y,
                sequence_length=args.sequence_length,
                epochs=args.epochs,
                batch_size=32
            )
        else:
            raise ValueError(f"Unsupported type: {args.type}")
        
        # Print results
        logger.info("=" * 60)
        logger.info("Training completed successfully!")
        logger.info(f"Model ID: {result['model_id']}")
        logger.info(f"Metrics: {result['metrics']}")
        logger.info(f"Model files saved to:")
        for format_type, path in result['file_paths'].items():
            logger.info(f"  {format_type.upper()}: {path}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
