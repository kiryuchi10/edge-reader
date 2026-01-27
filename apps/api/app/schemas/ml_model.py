"""
ML Model Schemas - Request/Response models for ML operations
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class ModelType(str, Enum):
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    TIMESERIES = "timeseries"

class Algorithm(str, Enum):
    # Classification
    RANDOM_FOREST = "random_forest"
    XGBOOST = "xgboost"
    LOGISTIC = "logistic"
    # Regression
    LINEAR = "linear"
    # Clustering
    KMEANS = "kmeans"
    DBSCAN = "dbscan"
    # Time Series
    LSTM = "lstm"
    ARIMA = "arima"
    PROPHET = "prophet"

class ModelTrainRequest(BaseModel):
    """Request to train a new ML model"""
    dataset_id: int = Field(..., description="Dataset ID to train on")
    model_type: ModelType = Field(..., description="Type of model to train")
    algorithm: Algorithm = Field(..., description="Algorithm to use")
    target_column: str = Field(..., description="Target column name")
    feature_columns: Optional[List[str]] = Field(None, description="Feature columns (None = all except target)")
    
    # Hyperparameters
    hyperparameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Algorithm-specific hyperparameters")
    
    # Time series specific
    sequence_length: Optional[int] = Field(None, description="Sequence length for LSTM (time series only)")
    
    # Training options
    test_size: float = Field(0.2, ge=0.1, le=0.5, description="Test set size")
    random_state: int = Field(42, description="Random seed")
    
    # Deep learning options
    epochs: Optional[int] = Field(None, description="Epochs for deep learning models")
    batch_size: Optional[int] = Field(None, description="Batch size for deep learning models")

class ModelResponse(BaseModel):
    """Basic model information"""
    id: str
    model_type: ModelType
    algorithm: Algorithm
    dataset_id: int
    created_at: datetime
    status: str = Field(default="trained", description="Model status: training, trained, failed")
    
    class Config:
        from_attributes = True

class ModelDetailResponse(ModelResponse):
    """Detailed model information with metrics"""
    metrics: Dict[str, float] = Field(..., description="Model performance metrics")
    file_paths: Dict[str, str] = Field(..., description="Paths to model files (pkl, h5, onnx, etc.)")
    n_features: int = Field(..., description="Number of input features")
    hyperparameters: Dict[str, Any] = Field(default_factory=dict)
    
    # Model info
    input_shape: Optional[List[int]] = None
    output_shape: Optional[List[int]] = None
    
    # Training history (for deep learning)
    training_history: Optional[Dict[str, List[float]]] = None

class PredictionRequest(BaseModel):
    """Request for model prediction"""
    features: List[Dict[str, float]] = Field(..., description="Feature values for prediction")
    format: Optional[str] = Field("pkl", description="Model format to use (pkl, h5, onnx)")

class PredictionResponse(BaseModel):
    """Model prediction response"""
    predictions: List[Any] = Field(..., description="Prediction results")
    model_id: str
    model_type: ModelType
    confidence_scores: Optional[List[float]] = None  # For classification
    probabilities: Optional[List[Dict[str, float]]] = None  # For classification
