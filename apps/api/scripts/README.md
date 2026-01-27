# ML Training Scripts

## Quick Start

### 1. Generate Sample Data

```bash
# Generate all sample datasets
python scripts/generate_sample_data.py --type all

# Or generate specific types
python scripts/generate_sample_data.py --type classification
python scripts/generate_sample_data.py --type regression
python scripts/generate_sample_data.py --type equipment
```

### 2. Train Models

```bash
# Classification
python scripts/train_models.py \
    --type classification \
    --data data/classification_sample.csv \
    --target target \
    --algorithm random_forest

# Regression
python scripts/train_models.py \
    --type regression \
    --data data/regression_sample.csv \
    --target target \
    --algorithm xgboost

# Equipment Anomaly Detection
python scripts/train_models.py \
    --type classification \
    --data data/equipment_sample.csv \
    --target target \
    --algorithm random_forest

# Time Series (LSTM)
python scripts/train_models.py \
    --type timeseries \
    --data data/timeseries_sample.csv \
    --target target \
    --algorithm lstm \
    --sequence-length 10 \
    --epochs 50
```

## Output

Trained models are saved in `models/` directory with:
- **PKL files**: For scikit-learn models
- **H5 files**: For TensorFlow/Keras models (LSTM)
- **ONNX files**: For cross-platform deployment (if available)
- **Metadata JSON**: Model information and metrics

## Using Your Own Data

1. Prepare CSV file with features and target column
2. Run training script:
   ```bash
   python scripts/train_models.py \
       --type classification \
       --data /path/to/your/data.csv \
       --target your_target_column \
       --features feature1 feature2 feature3
   ```

See `README_ML.md` for detailed documentation.
