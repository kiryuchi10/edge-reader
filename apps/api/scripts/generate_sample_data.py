"""
Generate Sample Data for ML Training
Creates CSV files with synthetic data for testing model training
"""
import pandas as pd
import numpy as np
from pathlib import Path
import argparse

def generate_classification_data(n_samples=1000, n_features=10, n_classes=3, output_path="data/classification_sample.csv"):
    """Generate sample classification dataset"""
    from sklearn.datasets import make_classification
    
    X, y = make_classification(
        n_samples=n_samples,
        n_features=n_features,
        n_informative=n_features,
        n_redundant=0,
        n_classes=n_classes,
        random_state=42
    )
    
    # Create DataFrame
    feature_cols = [f"feature_{i+1}" for i in range(n_features)]
    df = pd.DataFrame(X, columns=feature_cols)
    df["target"] = [f"class_{label}" for label in y]
    
    # Save
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✓ Generated classification data: {output_path}")
    print(f"  Samples: {n_samples}, Features: {n_features}, Classes: {n_classes}")
    return output_path

def generate_regression_data(n_samples=1000, n_features=10, output_path="data/regression_sample.csv"):
    """Generate sample regression dataset"""
    from sklearn.datasets import make_regression
    
    X, y = make_regression(
        n_samples=n_samples,
        n_features=n_features,
        n_informative=n_features,
        noise=10,
        random_state=42
    )
    
    feature_cols = [f"feature_{i+1}" for i in range(n_features)]
    df = pd.DataFrame(X, columns=feature_cols)
    df["target"] = y
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✓ Generated regression data: {output_path}")
    print(f"  Samples: {n_samples}, Features: {n_features}")
    return output_path

def generate_timeseries_data(n_samples=1000, n_features=5, output_path="data/timeseries_sample.csv"):
    """Generate sample time series dataset"""
    t = np.arange(n_samples)
    
    # Generate features with some correlation
    X = np.random.randn(n_samples, n_features)
    for i in range(1, n_samples):
        X[i] = 0.7 * X[i-1] + 0.3 * X[i]  # Add autocorrelation
    
    # Generate target with trend and seasonality
    y = 10 + 0.1 * t + 5 * np.sin(2 * np.pi * t / 50) + np.random.randn(n_samples)
    
    feature_cols = [f"feature_{i+1}" for i in range(n_features)]
    df = pd.DataFrame(X, columns=feature_cols)
    df["timestamp"] = pd.date_range("2024-01-01", periods=n_samples, freq="1H")
    df["target"] = y
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✓ Generated time series data: {output_path}")
    print(f"  Samples: {n_samples}, Features: {n_features}")
    return output_path

def generate_equipment_data(n_samples=500, output_path="data/equipment_sample.csv"):
    """Generate sample equipment telemetry data for anomaly detection"""
    np.random.seed(42)
    
    # Normal operation
    normal_temp = np.random.normal(25, 2, n_samples)
    normal_pressure = np.random.normal(1.0, 0.1, n_samples)
    normal_vibration = np.random.normal(5, 1, n_samples)
    
    # Anomalies (10% of data)
    n_anomalies = int(n_samples * 0.1)
    anomaly_indices = np.random.choice(n_samples, n_anomalies, replace=False)
    
    temp = normal_temp.copy()
    pressure = normal_pressure.copy()
    vibration = normal_vibration.copy()
    
    temp[anomaly_indices] += np.random.normal(10, 3, n_anomalies)  # High temperature
    pressure[anomaly_indices] += np.random.normal(0.5, 0.2, n_anomalies)  # High pressure
    vibration[anomaly_indices] += np.random.normal(5, 2, n_anomalies)  # High vibration
    
    # Create labels
    labels = np.array(["normal"] * n_samples)
    labels[anomaly_indices] = "anomaly"
    
    df = pd.DataFrame({
        "temperature": temp,
        "pressure": pressure,
        "vibration": vibration,
        "target": labels
    })
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✓ Generated equipment data: {output_path}")
    print(f"  Samples: {n_samples}, Anomalies: {n_anomalies}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Generate sample data for ML training")
    parser.add_argument("--type", choices=["classification", "regression", "timeseries", "equipment", "all"],
                       default="all", help="Type of data to generate")
    parser.add_argument("--samples", type=int, default=1000, help="Number of samples")
    parser.add_argument("--output-dir", type=str, default="data", help="Output directory")
    
    args = parser.parse_args()
    
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("Generating Sample Data for ML Training")
    print("=" * 60)
    
    if args.type in ["classification", "all"]:
        generate_classification_data(
            n_samples=args.samples,
            output_path=str(output_dir / "classification_sample.csv")
        )
    
    if args.type in ["regression", "all"]:
        generate_regression_data(
            n_samples=args.samples,
            output_path=str(output_dir / "regression_sample.csv")
        )
    
    if args.type in ["timeseries", "all"]:
        generate_timeseries_data(
            n_samples=args.samples,
            output_path=str(output_dir / "timeseries_sample.csv")
        )
    
    if args.type in ["equipment", "all"]:
        generate_equipment_data(
            n_samples=args.samples,
            output_path=str(output_dir / "equipment_sample.csv")
        )
    
    print("=" * 60)
    print("✓ Data generation complete!")
    print(f"  Files saved to: {output_dir}")
    print("\nNext steps:")
    print("  1. Review the generated CSV files")
    print("  2. Train models using:")
    print("     python scripts/train_models.py --type classification --data data/classification_sample.csv --target target")
    print("=" * 60)

if __name__ == "__main__":
    main()
