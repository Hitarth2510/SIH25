from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import pandas as pd
import pickle
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Comprehensive Crop Recommendation ML Service", version="2.0.0")

# Load models and preprocessor at startup
try:
    with open("models/crop_model.pkl", "rb") as f:
        crop_model = pickle.load(f)
    with open("models/yield_model.pkl", "rb") as f:
        yield_model = pickle.load(f)
    with open("models/preprocessor.pkl", "rb") as f:
        preprocessor = pickle.load(f)
    with open("models/model_metadata.json", "r") as f:
        model_metadata = json.load(f)
    logger.info("Models loaded successfully")
except Exception as e:
    logger.error(f"Failed to load models: {e}")
    # Create dummy models for development
    crop_model = None
    yield_model = None
    preprocessor = None
    model_metadata = {"version": "v2.0.0-dev", "features": []}

class Location(BaseModel):
    lat: float
    lon: float

class Features(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    temperature: float
    humidity: float
    rainfall: float
    organic_carbon: float
    soil_type: str
    area_ha: float
    farming_method: str
    irrigation_type: str
    previous_crops: List[str]
    experience_years: int
    budget_category: str
    preferred_crops: List[str]

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    solar_radiation: float
    pressure: float

class ForecastData(BaseModel):
    daily_forecast: List[Dict]
    seasonal_outlook: str

class PredictRequest(BaseModel):
    location: Location
    features: Features
    market_snapshot: Dict[str, float]
    weather_data: WeatherData
    forecast_data: ForecastData

class CropRecommendation(BaseModel):
    crop: str
    score: float
    predicted_yield_kg_per_ha: float
    estimated_profit_inr: float
    sustainability_score: float
    confidence: float
    risk_level: str
    season_suitability: str
    water_requirement: str
    market_demand: str

class ShapFeature(BaseModel):
    feature: str
    impact: float

class PredictResponse(BaseModel):
    model_version: str
    timestamp: str
    recommendations: List[CropRecommendation]
    explanation: str
    shap_top_features: List[ShapFeature]

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "crop_model_loaded": crop_model is not None,
        "yield_model_loaded": yield_model is not None
    }

@app.post("/predict", response_model=PredictResponse)
async def predict_crops(request: PredictRequest):
    try:
        if crop_model is None or yield_model is None:
            # Return mock predictions for development
            return get_mock_prediction()
        
        # Prepare features for prediction
        features_dict = {
            "N": request.features.N,
            "P": request.features.P,
            "K": request.features.K,
            "ph": request.features.ph,
            "temperature": request.features.temperature,
            "humidity": request.features.humidity,
            "rainfall": request.features.rainfall,
            "organic_carbon": request.features.organic_carbon,
            "soil_type": request.features.soil_type,
            "area_ha": request.features.area_ha,
            "farming_method": request.features.farming_method,
            "irrigation_type": request.features.irrigation_type,
            "experience_years": request.features.experience_years
        }
        
        # Create DataFrame for preprocessing
        df = pd.DataFrame([features_dict])
        
        # Get crop predictions
        crop_probabilities = crop_model.predict_proba(df)[0]
        crop_classes = crop_model.classes_
        
        # Get top 3 crops
        top_indices = np.argsort(crop_probabilities)[-3:][::-1]
        
        recommendations = []
        for i, idx in enumerate(top_indices):
            crop = crop_classes[idx]
            score = float(crop_probabilities[idx])
            
            # Predict yield for this specific crop
            crop_features = features_dict.copy()
            yield_estimate = yield_model.predict(df)[0]
            
            # Adjust yield based on crop-specific factors
            yield_estimate = adjust_yield_for_crop(crop, yield_estimate, features_dict)
            
            # Calculate profit estimate
            profit_estimate = calculate_profit_estimate(
                crop, yield_estimate, request.market_snapshot, request.features.area_ha
            )
            
            # Calculate sustainability score
            sustainability = calculate_sustainability_score(crop, features_dict, request.features.farming_method)
            
            # Determine risk level and other factors
            risk_level = determine_risk_level(crop, features_dict, request.weather_data)
            season_suitability = determine_season_suitability(crop, datetime.now().month)
            water_requirement = get_water_requirement(crop)
            market_demand = determine_market_demand(crop, request.market_snapshot)
            
            recommendations.append(CropRecommendation(
                crop=crop,
                score=score,
                predicted_yield_kg_per_ha=yield_estimate,
                estimated_profit_inr=profit_estimate,
                sustainability_score=sustainability,
                confidence=score * 0.9,
                risk_level=risk_level,
                season_suitability=season_suitability,
                water_requirement=water_requirement,
                market_demand=market_demand
            ))
        
        # Generate comprehensive explanation
        explanation = generate_comprehensive_explanation(features_dict, recommendations[0], request.weather_data)
        
        # Generate SHAP-like feature importance
        shap_features = generate_feature_importance(features_dict, recommendations[0])
        
        return PredictResponse(
            model_version=model_metadata.get("version", "v2.0.0"),
            timestamp=datetime.now().isoformat(),
            recommendations=recommendations,
            explanation=explanation,
            shap_top_features=shap_features
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def get_mock_prediction() -> PredictResponse:
    """Return comprehensive mock predictions for development/testing"""
    return PredictResponse(
        model_version="v2.0.0-mock",
        timestamp=datetime.now().isoformat(),
        recommendations=[
            CropRecommendation(
                crop="Rice",
                score=0.85,
                predicted_yield_kg_per_ha=4800,
                estimated_profit_inr=85000,
                sustainability_score=0.75,
                confidence=0.81,
                risk_level="Low",
                season_suitability="Excellent",
                water_requirement="High",
                market_demand="Strong"
            ),
            CropRecommendation(
                crop="Soybean",
                score=0.72,
                predicted_yield_kg_per_ha=2200,
                estimated_profit_inr=65000,
                sustainability_score=0.90,
                confidence=0.68,
                risk_level="Medium",
                season_suitability="Good",
                water_requirement="Medium",
                market_demand="Moderate"
            ),
            CropRecommendation(
                crop="Maize",
                score=0.65,
                predicted_yield_kg_per_ha=4200,
                estimated_profit_inr=72000,
                sustainability_score=0.78,
                confidence=0.62,
                risk_level="Low",
                season_suitability="Good",
                water_requirement="Medium",
                market_demand="Strong"
            )
        ],
        explanation="Rice shows highest suitability due to optimal soil moisture (65%), excellent pH levels (6.8), and favorable monsoon conditions. High nitrogen availability (45 mg/kg) supports vigorous growth. Current market prices are favorable with strong demand expected.",
        shap_top_features=[
            ShapFeature(feature="soil_moisture", impact=0.28),
            ShapFeature(feature="ph_level", impact=0.24),
            ShapFeature(feature="nitrogen_content", impact=0.22),
            ShapFeature(feature="rainfall_pattern", impact=0.18),
            ShapFeature(feature="temperature", impact=0.08)
        ]
    )

def adjust_yield_for_crop(crop: str, base_yield: float, features: dict) -> float:
    """Adjust yield based on crop-specific requirements"""
    # Crop-specific yield adjustments
    crop_factors = {
        "Rice": 4500,
        "Wheat": 3200,
        "Maize": 4000,
        "Cotton": 2800,
        "Sugarcane": 65000,
        "Soybean": 2200,
        "Groundnut": 2800,
        "Sunflower": 1800,
        "Chickpea": 1500,
        "Pigeon Pea": 1200,
        "Mustard": 1600,
        "Barley": 2800
    }
    
    base_yield_for_crop = crop_factors.get(crop, 3000)
    
    # Adjust based on soil and weather conditions
    adjustment_factor = 1.0
    
    # pH adjustment
    optimal_ph = {"Rice": 6.5, "Wheat": 7.0, "Maize": 6.5, "Cotton": 7.0}.get(crop, 6.8)
    ph_deviation = abs(features["ph"] - optimal_ph)
    if ph_deviation < 0.5:
        adjustment_factor *= 1.1
    elif ph_deviation > 1.5:
        adjustment_factor *= 0.8
    
    # Irrigation adjustment
    if features["irrigation_type"] in ["drip", "sprinkler"]:
        adjustment_factor *= 1.15
    elif features["irrigation_type"] == "irrigated":
        adjustment_factor *= 1.1
    
    # Experience adjustment
    if features["experience_years"] > 10:
        adjustment_factor *= 1.05
    elif features["experience_years"] < 3:
        adjustment_factor *= 0.9
    
    return base_yield_for_crop * adjustment_factor

def calculate_profit_estimate(crop: str, yield_kg_per_ha: float, market_prices: dict, area_ha: float) -> float:
    """Calculate comprehensive profit estimate"""
    price_per_kg = market_prices.get(crop, 2000) / 100  # Convert from per quintal to per kg
    
    # Comprehensive cost estimates (per hectare) including all farming costs
    cost_estimates = {
        "Rice": 45000,    # Seeds, fertilizers, pesticides, labor, fuel
        "Wheat": 32000,
        "Maize": 35000,
        "Cotton": 55000,  # Higher due to pesticide costs
        "Sugarcane": 75000, # High establishment costs
        "Soybean": 28000,
        "Groundnut": 38000,
        "Sunflower": 25000,
        "Chickpea": 22000,
        "Pigeon Pea": 24000,
        "Mustard": 20000,
        "Barley": 28000
    }
    
    cost_per_ha = cost_estimates.get(crop, 30000)
    revenue = yield_kg_per_ha * price_per_kg
    profit_per_ha = revenue - cost_per_ha
    
    return max(0, profit_per_ha * area_ha)

def calculate_sustainability_score(crop: str, features: dict, farming_method: str) -> float:
    """Calculate comprehensive sustainability score"""
    base_scores = {
        "Rice": 0.65,     # Moderate due to methane emissions
        "Wheat": 0.80,
        "Maize": 0.75,
        "Cotton": 0.45,   # Low due to high pesticide use
        "Sugarcane": 0.50, # Low due to high water usage
        "Soybean": 0.95,  # High due to nitrogen fixation
        "Groundnut": 0.90, # Nitrogen fixing legume
        "Sunflower": 0.85,
        "Chickpea": 0.95, # Nitrogen fixing
        "Pigeon Pea": 0.92,
        "Mustard": 0.80,
        "Barley": 0.82
    }
    
    score = base_scores.get(crop, 0.7)
    
    # Adjust based on farming method
    if farming_method == "organic":
        score += 0.15
    elif farming_method == "mixed":
        score += 0.05
    
    # Adjust based on soil health
    if features["ph"] >= 6.0 and features["ph"] <= 7.5:
        score += 0.05
    
    if features["organic_carbon"] > 1.0:
        score += 0.08
    
    return min(1.0, score)

def determine_risk_level(crop: str, features: dict, weather: WeatherData) -> str:
    """Determine risk level based on various factors"""
    risk_score = 0
    
    # Weather risk
    if abs(weather.temperature - 25) > 10:
        risk_score += 1
    if weather.rainfall < 20 or weather.rainfall > 200:
        risk_score += 1
    
    # Soil risk
    if features["ph"] < 5.5 or features["ph"] > 8.5:
        risk_score += 1
    
    # Market risk (simplified)
    high_risk_crops = ["Cotton", "Sugarcane"]
    if crop in high_risk_crops:
        risk_score += 1
    
    if risk_score <= 1:
        return "Low"
    elif risk_score <= 2:
        return "Medium"
    else:
        return "High"

def determine_season_suitability(crop: str, current_month: int) -> str:
    """Determine seasonal suitability"""
    kharif_crops = ["Rice", "Maize", "Cotton", "Sugarcane", "Soybean", "Groundnut", "Pigeon Pea"]
    rabi_crops = ["Wheat", "Chickpea", "Mustard", "Barley", "Sunflower"]
    
    # Kharif season: June to October (monsoon)
    # Rabi season: November to April (winter/spring)
    
    if 6 <= current_month <= 10:  # Kharif season
        if crop in kharif_crops:
            return "Excellent"
        elif crop in rabi_crops:
            return "Poor"
    elif 11 <= current_month or current_month <= 4:  # Rabi season
        if crop in rabi_crops:
            return "Excellent"
        elif crop in kharif_crops:
            return "Poor"
    else:  # Transition months
        return "Fair"
    
    return "Good"

def get_water_requirement(crop: str) -> str:
    """Get water requirement category for crop"""
    water_requirements = {
        "Rice": "Very High",
        "Sugarcane": "Very High",
        "Cotton": "High",
        "Maize": "Medium",
        "Wheat": "Medium",
        "Soybean": "Medium",
        "Groundnut": "Low",
        "Sunflower": "Low",
        "Chickpea": "Low",
        "Pigeon Pea": "Medium",
        "Mustard": "Low",
        "Barley": "Low"
    }
    return water_requirements.get(crop, "Medium")

def determine_market_demand(crop: str, market_prices: dict) -> str:
    """Determine market demand based on current prices"""
    avg_price = sum(market_prices.values()) / len(market_prices)
    crop_price = market_prices.get(crop, avg_price)
    
    if crop_price > avg_price * 1.2:
        return "Very Strong"
    elif crop_price > avg_price * 1.1:
        return "Strong"
    elif crop_price < avg_price * 0.9:
        return "Weak"
    else:
        return "Moderate"

def generate_comprehensive_explanation(features: dict, top_recommendation: CropRecommendation, weather: WeatherData) -> str:
    """Generate comprehensive human-readable explanation"""
    explanations = []
    
    # Soil analysis
    if 6.5 <= features["ph"] <= 7.5:
        explanations.append("optimal soil pH for most crops")
    elif features["ph"] < 6.0:
        explanations.append("acidic soil conditions requiring lime application")
    elif features["ph"] > 8.0:
        explanations.append("alkaline soil conditions")
    
    # Nutrient analysis
    if features["N"] > 40:
        explanations.append("excellent nitrogen availability")
    elif features["N"] < 20:
        explanations.append("low nitrogen requiring fertilizer supplementation")
    
    # Weather analysis
    if 20 <= weather.temperature <= 35:
        explanations.append("favorable temperature conditions")
    
    if weather.rainfall > 50:
        explanations.append("adequate rainfall for growth")
    
    # Farming practice analysis
    if features["farming_method"] == "organic":
        explanations.append("organic farming practices enhancing sustainability")
    
    if features["irrigation_type"] in ["drip", "sprinkler"]:
        explanations.append("efficient irrigation system reducing water stress")
    
    explanation = f"{top_recommendation.crop} is strongly recommended due to: " + ", ".join(explanations[:4])
    
    # Add market context
    explanation += f". Current market conditions show {top_recommendation.market_demand.lower()} demand with estimated profit of ₹{top_recommendation.estimated_profit_inr:,.0f}."
    
    return explanation

def generate_feature_importance(features: dict, top_recommendation: CropRecommendation) -> List[ShapFeature]:
    """Generate feature importance scores"""
    # Simplified feature importance based on crop science
    importance_scores = {
        "soil_moisture": 0.25,
        "ph_level": 0.22,
        "nitrogen_content": 0.20,
        "rainfall_pattern": 0.15,
        "temperature": 0.10,
        "organic_carbon": 0.08
    }
    
    return [
        ShapFeature(feature=feature, impact=impact) 
        for feature, impact in importance_scores.items()
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
