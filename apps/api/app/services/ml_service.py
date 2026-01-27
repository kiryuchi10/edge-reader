"""
ML Service - Model Training, Prediction, and Management
Supports multiple model types and export formats (H5, ONNX, pickle)
"""
import os
import json
import pickle
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import numpy as np
import pandas as pd
from pathlib import Path

# Scikit-learn models
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.cluster import KMeans, DBSCAN
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, r2_score, silhouette_score
)

# XGBoost
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logging.warning("XGBoost not available. Install with: pip install xgboost")

# TensorFlow/Keras for deep learning
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential, Model
    from tensorflow.keras.layers import Dense, LSTM, Dropout, Input
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not available. Install with: pip install tensorflow")

# ONNX export
try:
    import onnx
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    logging.warning("ONNX not available. Install with: pip install onnx skl2onnx")

logger = logging.getLogger(__name__)

# Model storage directory
MODELS_DIR = Path(os.getenv("MODELS_DIR", "./models"))
MODELS_DIR.mkdir(parents=True, exist_ok=True)

class MLService:
    """ML Model Training and Prediction Service"""
    
    def __init__(self):
        self.models_dir = MODELS_DIR
        self.models_dir.mkdir(parents=True, exist_ok=True)
    
    def train_classification(
        self,
        X: np.ndarray,
        y: np.ndarray,
        algorithm: str = "random_forest",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Train a classification model
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: Target labels (n_samples,)
            algorithm: 'random_forest', 'xgboost', 'logistic'
            **kwargs: Hyperparameters
        
        Returns:
            Dict with model info, metrics, and file paths
        """
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Select algorithm
        if algorithm == "random_forest":
            model = RandomForestClassifier(
                n_estimators=kwargs.get("n_estimators", 100),
                max_depth=kwargs.get("max_depth", None),
                random_state=42
            )
        elif algorithm == "xgboost" and XGBOOST_AVAILABLE:
            model = xgb.XGBClassifier(
                n_estimators=kwargs.get("n_estimators", 100),
                max_depth=kwargs.get("max_depth", 6),
                random_state=42
            )
        elif algorithm == "logistic":
            model = LogisticRegression(
                max_iter=kwargs.get("max_iter", 1000),
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        # Train
        logger.info(f"Training {algorithm} classifier...")
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average="weighted")),
            "recall": float(recall_score(y_test, y_pred, average="weighted")),
            "f1_score": float(f1_score(y_test, y_pred, average="weighted")),
        }
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=5)
        metrics["cv_mean"] = float(cv_scores.mean())
        metrics["cv_std"] = float(cv_scores.std())
        
        # Save model
        model_id = f"classifier_{algorithm}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_paths = self._save_model(model, model_id, algorithm, "classification")
        
        return {
            "model_id": model_id,
            "algorithm": algorithm,
            "model_type": "classification",
            "metrics": metrics,
            "file_paths": model_paths,
            "n_features": X.shape[1],
            "n_classes": len(np.unique(y)),
        }
    
    def train_regression(
        self,
        X: np.ndarray,
        y: np.ndarray,
        algorithm: str = "random_forest",
        **kwargs
    ) -> Dict[str, Any]:
        """Train a regression model"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        if algorithm == "random_forest":
            model = RandomForestRegressor(
                n_estimators=kwargs.get("n_estimators", 100),
                max_depth=kwargs.get("max_depth", None),
                random_state=42
            )
        elif algorithm == "xgboost" and XGBOOST_AVAILABLE:
            model = xgb.XGBRegressor(
                n_estimators=kwargs.get("n_estimators", 100),
                max_depth=kwargs.get("max_depth", 6),
                random_state=42
            )
        elif algorithm == "linear":
            model = LinearRegression()
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        logger.info(f"Training {algorithm} regressor...")
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        metrics = {
            "mse": float(mean_squared_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "r2": float(r2_score(y_test, y_pred)),
        }
        
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="r2")
        metrics["cv_mean"] = float(cv_scores.mean())
        metrics["cv_std"] = float(cv_scores.std())
        
        model_id = f"regressor_{algorithm}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_paths = self._save_model(model, model_id, algorithm, "regression")
        
        return {
            "model_id": model_id,
            "algorithm": algorithm,
            "model_type": "regression",
            "metrics": metrics,
            "file_paths": model_paths,
            "n_features": X.shape[1],
        }
    
    def train_clustering(
        self,
        X: np.ndarray,
        algorithm: str = "kmeans",
        n_clusters: int = 3,
        **kwargs
    ) -> Dict[str, Any]:
        """Train a clustering model"""
        if algorithm == "kmeans":
            model = KMeans(
                n_clusters=n_clusters,
                random_state=42,
                n_init=10
            )
        elif algorithm == "dbscan":
            model = DBSCAN(
                eps=kwargs.get("eps", 0.5),
                min_samples=kwargs.get("min_samples", 5)
            )
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        logger.info(f"Training {algorithm} clustering model...")
        model.fit(X)
        
        labels = model.labels_
        metrics = {
            "n_clusters": len(set(labels)) - (1 if -1 in labels else 0),
            "n_noise": int(list(labels).count(-1)),
        }
        
        if algorithm == "kmeans":
            metrics["inertia"] = float(model.inertia_)
            metrics["silhouette"] = float(silhouette_score(X, labels))
        
        model_id = f"cluster_{algorithm}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_paths = self._save_model(model, model_id, algorithm, "clustering")
        
        return {
            "model_id": model_id,
            "algorithm": algorithm,
            "model_type": "clustering",
            "metrics": metrics,
            "file_paths": model_paths,
            "n_features": X.shape[1],
        }
    
    def train_lstm_timeseries(
        self,
        X: np.ndarray,
        y: np.ndarray,
        sequence_length: int = 10,
        **kwargs
    ) -> Dict[str, Any]:
        """Train LSTM for time series forecasting"""
        if not TENSORFLOW_AVAILABLE:
            raise ImportError("TensorFlow required for LSTM models")
        
        # Reshape for LSTM: (samples, timesteps, features)
        n_samples = X.shape[0] - sequence_length + 1
        X_seq = np.zeros((n_samples, sequence_length, X.shape[1]))
        y_seq = np.zeros((n_samples,))
        
        for i in range(n_samples):
            X_seq[i] = X[i:i+sequence_length]
            y_seq[i] = y[i+sequence_length-1]
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_seq, y_seq, test_size=0.2, random_state=42
        )
        
        # Build LSTM model
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(sequence_length, X.shape[1])),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(1)
        ])
        
        model.compile(optimizer="adam", loss="mse", metrics=["mae"])
        
        # Callbacks
        callbacks = [
            EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
            ModelCheckpoint(
                str(self.models_dir / "lstm_best.h5"),
                monitor="val_loss",
                save_best_only=True
            )
        ]
        
        # Train
        history = model.fit(
            X_train, y_train,
            validation_data=(X_test, y_test),
            epochs=kwargs.get("epochs", 50),
            batch_size=kwargs.get("batch_size", 32),
            callbacks=callbacks,
            verbose=1
        )
        
        # Evaluate
        y_pred = model.predict(X_test)
        metrics = {
            "mse": float(mean_squared_error(y_test, y_pred.flatten())),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred.flatten()))),
            "mae": float(np.mean(np.abs(y_test - y_pred.flatten()))),
        }
        
        # Save model
        model_id = f"lstm_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        model_paths = self._save_keras_model(model, model_id)
        
        return {
            "model_id": model_id,
            "algorithm": "lstm",
            "model_type": "timeseries",
            "metrics": metrics,
            "file_paths": model_paths,
            "sequence_length": sequence_length,
            "history": {k: [float(v) for v in vals] for k, vals in history.history.items()},
        }
    
    def _save_model(self, model: Any, model_id: str, algorithm: str, model_type: str) -> Dict[str, str]:
        """Save model in multiple formats"""
        model_dir = self.models_dir / model_id
        model_dir.mkdir(parents=True, exist_ok=True)
        
        paths = {}
        
        # Save as pickle (always works)
        pickle_path = model_dir / f"{model_id}.pkl"
        with open(pickle_path, "wb") as f:
            pickle.dump(model, f)
        paths["pkl"] = str(pickle_path)
        
        # Save metadata
        metadata = {
            "model_id": model_id,
            "algorithm": algorithm,
            "model_type": model_type,
            "created_at": datetime.now().isoformat(),
        }
        metadata_path = model_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        paths["metadata"] = str(metadata_path)
        
        # Export to ONNX if available
        if ONNX_AVAILABLE and hasattr(model, "n_features_in_"):
            try:
                initial_type = [("float_input", FloatTensorType([None, model.n_features_in_]))]
                onnx_model = convert_sklearn(model, initial_types=initial_type)
                onnx_path = model_dir / f"{model_id}.onnx"
                with open(onnx_path, "wb") as f:
                    f.write(onnx_model.SerializeToString())
                paths["onnx"] = str(onnx_path)
            except Exception as e:
                logger.warning(f"Failed to export ONNX: {e}")
        
        return paths
    
    def _save_keras_model(self, model: keras.Model, model_id: str) -> Dict[str, str]:
        """Save Keras/TensorFlow model"""
        model_dir = self.models_dir / model_id
        model_dir.mkdir(parents=True, exist_ok=True)
        
        paths = {}
        
        # Save as H5 (Keras format)
        h5_path = model_dir / f"{model_id}.h5"
        model.save(str(h5_path))
        paths["h5"] = str(h5_path)
        
        # Save as SavedModel (TensorFlow format)
        savedmodel_path = model_dir / "saved_model"
        model.save(str(savedmodel_path))
        paths["savedmodel"] = str(savedmodel_path)
        
        # Save metadata
        metadata = {
            "model_id": model_id,
            "algorithm": "lstm",
            "model_type": "timeseries",
            "created_at": datetime.now().isoformat(),
            "input_shape": model.input_shape,
            "output_shape": model.output_shape,
        }
        metadata_path = model_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        paths["metadata"] = str(metadata_path)
        
        return paths
    
    def load_model(self, model_id: str, format: str = "pkl") -> Any:
        """Load a trained model"""
        model_dir = self.models_dir / model_id
        
        if format == "pkl":
            with open(model_dir / f"{model_id}.pkl", "rb") as f:
                return pickle.load(f)
        elif format == "h5" and TENSORFLOW_AVAILABLE:
            return keras.models.load_model(str(model_dir / f"{model_id}.h5"))
        elif format == "savedmodel" and TENSORFLOW_AVAILABLE:
            return keras.models.load_model(str(model_dir / "saved_model"))
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def predict(self, model_id: str, X: np.ndarray, format: str = "pkl") -> np.ndarray:
        """Make predictions with a trained model"""
        model = self.load_model(model_id, format)
        return model.predict(X)

# Global service instance
ml_service = MLService()
