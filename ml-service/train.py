import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, mean_squared_error, r2_score
import pickle
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_custom_dataset():
    """
    Load a custom dataset if provided by the user.
    This function should be modified to load your specific dataset.
    Return None if no custom dataset is available.
    """
    try:
        # Try to load user's custom dataset
        # Replace this with your actual dataset loading logic
        # Examples:
        # df = pd.read_csv('your_dataset.csv')
        # df = pd.read_excel('your_dataset.xlsx')
        # df = pd.read_json('your_dataset.json')
        
        # For now, return None to use synthetic data
        # When you have a dataset, uncomment and modify the following:
        # df = pd.read_csv('crop_recommendation.csv')
        # logger.info(f"Loaded custom dataset with {len(df)} samples")
        # return df
        
        return None
    except Exception as e:
        logger.warning(f"Could not load custom dataset: {e}")
        return None

def create_comprehensive_dataset(n_samples=15000):
    """Create a comprehensive synthetic crop dataset for training"""
    np.random.seed(42)
    
    # Enhanced crop types with their optimal conditions
    crops = {
        'Rice': {
            'N': (30, 50), 'P': (15, 25), 'K': (30, 50), 'ph': (6.0, 7.5), 
            'temp': (25, 35), 'humidity': (70, 90), 'rainfall': (150, 300),
            'organic_carbon': (0.8, 1.2), 'soil_preference': ['Clayey', 'Alluvial'],
            'season': 'kharif', 'water_req': 'high', 'base_yield': 4500
        },
        'Wheat': {
            'N': (20, 40), 'P': (10, 20), 'K': (20, 40), 'ph': (6.0, 7.5),
            'temp': (15, 25), 'humidity': (50, 70), 'rainfall': (50, 150),
            'organic_carbon': (0.6, 1.0), 'soil_preference': ['Loamy', 'Alluvial'],
            'season': 'rabi', 'water_req': 'medium', 'base_yield': 3200
        },
        'Maize': {
            'N': (40, 60), 'P': (20, 30), 'K': (30, 50), 'ph': (6.0, 7.0),
            'temp': (20, 30), 'humidity': (60, 80), 'rainfall': (60, 120),
            'organic_carbon': (0.7, 1.1), 'soil_preference': ['Loamy', 'Sandy', 'Red'],
            'season': 'kharif', 'water_req': 'medium', 'base_yield': 4000
        },
        'Cotton': {
            'N': (30, 50), 'P': (15, 25), 'K': (20, 40), 'ph': (5.5, 8.0),
            'temp': (25, 35), 'humidity': (50, 70), 'rainfall': (50, 100),
            'organic_carbon': (0.5, 0.9), 'soil_preference': ['Black', 'Red'],
            'season': 'kharif', 'water_req': 'medium', 'base_yield': 2800
        },
        'Sugarcane': {
            'N': (50, 80), 'P': (20, 35), 'K': (40, 70), 'ph': (6.0, 8.0),
            'temp': (25, 35), 'humidity': (70, 90), 'rainfall': (100, 200),
            'organic_carbon': (1.0, 1.5), 'soil_preference': ['Alluvial', 'Black'],
            'season': 'annual', 'water_req': 'very_high', 'base_yield': 65000
        },
        'Soybean': {
            'N': (20, 40), 'P': (25, 40), 'K': (30, 50), 'ph': (6.0, 7.0),
            'temp': (20, 30), 'humidity': (60, 80), 'rainfall': (80, 150),
            'organic_carbon': (0.8, 1.2), 'soil_preference': ['Black', 'Red'],
            'season': 'kharif', 'water_req': 'medium', 'base_yield': 2200
        },
        'Groundnut': {
            'N': (15, 30), 'P': (20, 35), 'K': (25, 45), 'ph': (6.0, 7.5),
            'temp': (25, 35), 'humidity': (50, 70), 'rainfall': (50, 100),
            'organic_carbon': (0.6, 1.0), 'soil_preference': ['Sandy', 'Red'],
            'season': 'kharif', 'water_req': 'low', 'base_yield': 2800
        },
        'Sunflower': {
            'N': (25, 45), 'P': (15, 25), 'K': (20, 40), 'ph': (6.0, 7.5),
            'temp': (20, 30), 'humidity': (40, 60), 'rainfall': (40, 80),
            'organic_carbon': (0.5, 0.9), 'soil_preference': ['Red', 'Black'],
            'season': 'rabi', 'water_req': 'low', 'base_yield': 1800
        },
        'Chickpea': {
            'N': (15, 25), 'P': (20, 30), 'K': (25, 40), 'ph': (6.0, 7.5),
            'temp': (15, 25), 'humidity': (50, 70), 'rainfall': (30, 70),
            'organic_carbon': (0.7, 1.1), 'soil_preference': ['Black', 'Clayey'],
            'season': 'rabi', 'water_req': 'low', 'base_yield': 1500
        },
        'Pigeon Pea': {
            'N': (20, 35), 'P': (15, 25), 'K': (20, 35), 'ph': (6.5, 7.5),
            'temp': (20, 30), 'humidity': (60, 80), 'rainfall': (60, 120),
            'organic_carbon': (0.8, 1.2), 'soil_preference': ['Red', 'Black'],
            'season': 'kharif', 'water_req': 'medium', 'base_yield': 1200
        },
        'Mustard': {
            'N': (30, 50), 'P': (15, 25), 'K': (20, 40), 'ph': (6.0, 7.5),
            'temp': (15, 25), 'humidity': (50, 70), 'rainfall': (40, 80),
            'organic_carbon': (0.6, 1.0), 'soil_preference': ['Loamy', 'Sandy'],
            'season': 'rabi', 'water_req': 'low', 'base_yield': 1600
        },
        'Barley': {
            'N': (25, 40), 'P': (12, 20), 'K': (18, 35), 'ph': (6.0, 7.5),
            'temp': (12, 22), 'humidity': (50, 70), 'rainfall': (35, 75),
            'organic_carbon': (0.5, 0.9), 'soil_preference': ['Loamy', 'Sandy'],
            'season': 'rabi', 'water_req': 'low', 'base_yield': 2800
        }
    }
    
    soil_types = ['Sandy', 'Loamy', 'Clayey', 'Silty', 'Peaty', 'Black', 'Red', 'Alluvial']
    farming_methods = ['organic', 'conventional', 'mixed']
    irrigation_types = ['rainfed', 'irrigated', 'drip', 'sprinkler']
    
    data = []
    crop_list = list(crops.keys())
    
    for _ in range(n_samples):
        # Randomly select a crop
        crop = np.random.choice(crop_list)
        crop_params = crops[crop]
        
        # Choose soil type (with preference for suitable soils)
        if np.random.random() < 0.7:  # 70% chance of suitable soil
            soil_type = np.random.choice(crop_params['soil_preference'])
        else:
            soil_type = np.random.choice(soil_types)
        
        # Generate farming practices
        farming_method = np.random.choice(farming_methods)
        irrigation_type = np.random.choice(irrigation_types)
        
        # Generate features with realistic correlations
        row = {
            'N': np.random.normal(np.mean(crop_params['N']), 8),
            'P': np.random.normal(np.mean(crop_params['P']), 5),
            'K': np.random.normal(np.mean(crop_params['K']), 8),
            'ph': np.random.normal(np.mean(crop_params['ph']), 0.4),
            'temperature': np.random.normal(np.mean(crop_params['temp']), 4),
            'humidity': np.random.normal(np.mean(crop_params['humidity']), 8),
            'rainfall': np.random.normal(np.mean(crop_params['rainfall']), 30),
            'organic_carbon': np.random.normal(np.mean(crop_params['organic_carbon']), 0.2),
            'soil_type': soil_type,
            'farming_method': farming_method,
            'irrigation_type': irrigation_type,
            'area_ha': np.random.uniform(0.5, 10.0),
            'experience_years': np.random.randint(1, 25),
            'crop': crop
        }
        
        # Calculate yield based on conditions
        yield_factors = calculate_yield_factors(row, crop_params)
        row['yield_kg_per_ha'] = crop_params['base_yield'] * yield_factors
        
        # Ensure values are within reasonable bounds
        row['N'] = max(5, min(120, row['N']))
        row['P'] = max(3, min(60, row['P']))
        row['K'] = max(5, min(150, row['K']))
        row['ph'] = max(4.0, min(9.0, row['ph']))
        row['temperature'] = max(5, min(50, row['temperature']))
        row['humidity'] = max(20, min(100, row['humidity']))
        row['rainfall'] = max(0, min(500, row['rainfall']))
        row['organic_carbon'] = max(0.1, min(3.0, row['organic_carbon']))
        row['yield_kg_per_ha'] = max(100, min(80000, row['yield_kg_per_ha']))
        
        data.append(row)
    
    return pd.DataFrame(data)

def calculate_yield_factors(row, crop_params):
    """Calculate yield multiplier based on various factors"""
    factors = []
    
    # pH factor
    optimal_ph = np.mean(crop_params['ph'])
    ph_deviation = abs(row['ph'] - optimal_ph)
    ph_factor = max(0.5, 1 - ph_deviation * 0.2)
    factors.append(ph_factor)
    
    # Temperature factor
    optimal_temp = np.mean(crop_params['temp'])
    temp_deviation = abs(row['temperature'] - optimal_temp)
    temp_factor = max(0.4, 1 - temp_deviation * 0.03)
    factors.append(temp_factor)
    
    # Rainfall factor (irrigation can compensate)
    optimal_rainfall = np.mean(crop_params['rainfall'])
    rainfall_factor = 1.0
    if row['irrigation_type'] in ['irrigated', 'drip', 'sprinkler']:
        rainfall_factor = max(0.8, min(1.2, row['rainfall'] / optimal_rainfall))
    else:
        rainfall_factor = max(0.3, min(1.1, row['rainfall'] / optimal_rainfall))
    factors.append(rainfall_factor)
    
    # Soil suitability factor
    soil_factor = 1.1 if row['soil_type'] in crop_params['soil_preference'] else 0.8
    factors.append(soil_factor)
    
    # Farming method factor
    method_factors = {'organic': 0.9, 'conventional': 1.0, 'mixed': 0.95}
    factors.append(method_factors[row['farming_method']])
    
    # Experience factor
    exp_factor = min(1.2, 0.7 + row['experience_years'] * 0.02)
    factors.append(exp_factor)
    
    # Random factor for variability
    random_factor = np.random.normal(1.0, 0.15)
    factors.append(max(0.5, min(1.5, random_factor)))
    
    return np.prod(factors)

def validate_dataset(df):
    """Validate that the dataset has the required columns and structure"""
    required_columns = [
        'N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall', 
        'organic_carbon', 'soil_type', 'farming_method', 'irrigation_type', 
        'area_ha', 'experience_years', 'crop'
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        logger.error(f"Dataset is missing required columns: {missing_columns}")
        return False
    
    # Check for yield column (optional)
    if 'yield_kg_per_ha' not in df.columns:
        logger.warning("No yield column found. Yield predictions will use synthetic data.")
        # Generate synthetic yield data
        df['yield_kg_per_ha'] = df.apply(lambda row: generate_synthetic_yield(row), axis=1)
    
    logger.info(f"Dataset validation passed. Shape: {df.shape}")
    return True

def generate_synthetic_yield(row):
    """Generate synthetic yield based on crop and conditions"""
    base_yields = {
        'Rice': 4500, 'Wheat': 3200, 'Maize': 4000, 'Cotton': 2800,
        'Sugarcane': 65000, 'Soybean': 2200, 'Groundnut': 2800,
        'Sunflower': 1800, 'Chickpea': 1500, 'Pigeon Pea': 1200,
        'Mustard': 1600, 'Barley': 2800
    }
    
    base_yield = base_yields.get(row['crop'], 3000)
    
    # Simple yield calculation based on basic factors
    ph_factor = 1.0 if 6.0 <= row['ph'] <= 7.5 else 0.8
    temp_factor = 0.9 + np.random.normal(0, 0.1)
    random_factor = np.random.normal(1.0, 0.2)
    
    yield_estimate = base_yield * ph_factor * temp_factor * random_factor
    return max(100, min(80000, yield_estimate))

def preprocess_data(df):
    """Preprocess the comprehensive dataset"""
    # Separate features and targets
    feature_columns = [
        'N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall', 'organic_carbon',
        'soil_type', 'farming_method', 'irrigation_type', 'area_ha', 'experience_years'
    ]
    
    X = df[feature_columns].copy()
    y_crop = df['crop'].copy()
    y_yield = df['yield_kg_per_ha'].copy()
    
    # Create preprocessing pipeline
    numeric_features = [
        'N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall', 
        'organic_carbon', 'area_ha', 'experience_years'
    ]
    categorical_features = ['soil_type', 'farming_method', 'irrigation_type']
    
    # Create transformers
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(drop='first', sparse_output=False)
    
    # Combine transformers
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    return X, y_crop, y_yield, preprocessor

def train_models():
    """Train comprehensive crop recommendation models"""
    logger.info("Attempting to load custom dataset...")
    
    # Try to load custom dataset first
    df = load_custom_dataset()
    
    if df is not None:
        logger.info("Custom dataset loaded successfully!")
        if not validate_dataset(df):
            logger.error("Custom dataset validation failed. Falling back to synthetic data.")
            df = None
    
    # If no custom dataset, create synthetic data
    if df is None:
        logger.info("Creating comprehensive synthetic dataset...")
        df = create_comprehensive_dataset(n_samples=20000)
    
    logger.info(f"Training with dataset containing {len(df)} samples")
    logger.info("Preprocessing data...")
    X, y_crop, y_yield, preprocessor = preprocess_data(df)
    
    # Split the data
    X_train, X_test, y_crop_train, y_crop_test, y_yield_train, y_yield_test = train_test_split(
        X, y_crop, y_yield, test_size=0.2, random_state=42, stratify=y_crop
    )
    
    logger.info("Training crop classification model...")
    # Create and train the crop classification model
    crop_model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced'
        ))
    ])
    
    crop_model.fit(X_train, y_crop_train)
    
    # Evaluate crop model
    logger.info("Evaluating crop classification model...")
    y_crop_pred = crop_model.predict(X_test)
    crop_accuracy = accuracy_score(y_crop_test, y_crop_pred)
    
    logger.info(f"Crop model accuracy: {crop_accuracy:.3f}")
    logger.info("\nCrop Classification Report:")
    logger.info(classification_report(y_crop_test, y_crop_pred))
    
    # Cross-validation for crop model
    crop_cv_scores = cross_val_score(crop_model, X_train, y_crop_train, cv=5)
    logger.info(f"Crop model CV scores: {crop_cv_scores}")
    logger.info(f"Crop model average CV score: {crop_cv_scores.mean():.3f} (+/- {crop_cv_scores.std() * 2:.3f})")
    
    logger.info("Training yield prediction model...")
    # Create and train the yield prediction model
    yield_model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', GradientBoostingRegressor(
            n_estimators=200,
            random_state=42,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8
        ))
    ])
    
    yield_model.fit(X_train, y_yield_train)
    
    # Evaluate yield model
    logger.info("Evaluating yield prediction model...")
    y_yield_pred = yield_model.predict(X_test)
    yield_rmse = np.sqrt(mean_squared_error(y_yield_test, y_yield_pred))
    yield_r2 = r2_score(y_yield_test, y_yield_pred)
    
    logger.info(f"Yield model RMSE: {yield_rmse:.2f}")
    logger.info(f"Yield model R²: {yield_r2:.3f}")
    
    # Save models and preprocessor
    logger.info("Saving model artifacts...")
    
    # Create models directory if it doesn't exist
    import os
    os.makedirs("models", exist_ok=True)
    
    # Save the crop classification model
    with open("models/crop_model.pkl", "wb") as f:
        pickle.dump(crop_model, f)
    
    # Save the yield prediction model
    with open("models/yield_model.pkl", "wb") as f:
        pickle.dump(yield_model, f)
    
    # Save just the preprocessor for inference
    with open("models/preprocessor.pkl", "wb") as f:
        pickle.dump(preprocessor, f)
    
    # Save model metadata
    metadata = {
        "version": "v2.1.0",
        "training_date": datetime.now().isoformat(),
        "data_source": "custom" if load_custom_dataset() is not None else "synthetic",
        "crop_accuracy": float(crop_accuracy),
        "crop_cv_mean": float(crop_cv_scores.mean()),
        "crop_cv_std": float(crop_cv_scores.std()),
        "yield_rmse": float(yield_rmse),
        "yield_r2": float(yield_r2),
        "features": [
            'N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall', 'organic_carbon',
            'soil_type', 'farming_method', 'irrigation_type', 'area_ha', 'experience_years'
        ],
        "target_classes": list(crop_model.classes_),
        "crop_model_type": "RandomForestClassifier",
        "yield_model_type": "GradientBoostingRegressor",
        "n_samples": len(df),
        "unique_crops": len(df['crop'].unique()),
        "dataset_info": {
            "total_samples": len(df),
            "crops_distribution": df['crop'].value_counts().to_dict()
        }
    }
    
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    logger.info("Model training completed successfully!")
    logger.info(f"Crop model accuracy: {crop_accuracy:.3f}")
    logger.info(f"Yield model R²: {yield_r2:.3f}")
    logger.info("Model artifacts saved to models/ directory")
    
    # Print dataset summary
    logger.info("\nDataset Summary:")
    logger.info(f"Total samples: {len(df)}")
    logger.info(f"Unique crops: {df['crop'].unique()}")
    logger.info(f"Soil types: {df['soil_type'].unique()}")
    logger.info(f"Data source: {'Custom dataset' if load_custom_dataset() is not None else 'Synthetic data'}")
    
    return crop_model, yield_model, crop_accuracy, yield_r2

if __name__ == "__main__":
    print("""
    Crop Recommendation Model Training
    =================================
    
    To use your own dataset:
    1. Place your dataset file in this directory
    2. Modify the load_custom_dataset() function to load your file
    3. Ensure your dataset has the required columns:
       - N, P, K, ph, temperature, humidity, rainfall, organic_carbon
       - soil_type, farming_method, irrigation_type
       - area_ha, experience_years, crop
       - yield_kg_per_ha (optional - will be generated if missing)
    
    If no custom dataset is found, synthetic data will be used.
    """)
    
    train_models()
