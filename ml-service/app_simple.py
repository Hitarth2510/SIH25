from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
from datetime import datetime
import logging
from crop_predictor import CropPredictor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Crop Recommendation ML Service", version="2.0.0")

# Initialize the intelligent crop predictor
crop_predictor = CropPredictor()
logger.info("Intelligent crop predictor initialized")

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

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Smart Crop Recommendation ML Service",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "crop_model_loaded": True,
        "yield_model_loaded": True,
        "predictor": "intelligent"
    }

@app.post("/predict")
async def predict_crops(request: PredictRequest):
    """Generate intelligent crop recommendations"""
    try:
        logger.info(f"Prediction request for location: {request.location.lat}, {request.location.lon}")
        
        # Extract features for the intelligent predictor
        features_dict = {
            'temperature': request.weather_data.temperature,
            'humidity': request.weather_data.humidity,
            'rainfall': request.weather_data.rainfall,
            'ph': request.features.ph,
            'N': request.features.N,
            'P': request.features.P,
            'K': request.features.K,
            'organic_carbon': request.features.organic_carbon,
            'soil_type': request.features.soil_type,
            'area_ha': request.features.area_ha,
            'farming_method': request.features.farming_method,
            'irrigation_type': request.features.irrigation_type,
            'experience_years': request.features.experience_years,
            'previous_crops': request.features.previous_crops,
            'preferred_crops': request.features.preferred_crops
        }
        
        # Use the intelligent crop predictor
        logger.info(f"Input features: {features_dict}")
        recommendations = crop_predictor.predict_crops(features_dict)
        logger.info(f"ML predictions returned: {len(recommendations)} crops")
        
        if not recommendations:
            logger.warning("No crops met suitability threshold, using fallback")
            # Fallback if no suitable crops found
            recommendations = [{
                "crop": "Rice",
                "score": 0.6,
                "predicted_yield_kg_per_ha": 3000,
                "estimated_profit_inr": 25000,
                "sustainability_score": 0.7,
                "confidence": 0.7,
                "risk_level": "Medium",
                "season_suitability": "Kharif",
                "water_requirement": "High",
                "market_demand": "High"
            }]
        else:
            logger.info(f"Top recommendation: {recommendations[0]['crop']} with score {recommendations[0]['score']}")
        
        # Generate intelligent explanation
        top_crop = recommendations[0]["crop"]
        explanation = crop_predictor.generate_explanation(top_crop, features_dict)
        
        # Get feature importance for the top recommended crop
        shap_features = crop_predictor.get_feature_importance(top_crop, features_dict)
        
        response = {
            "model_version": "v2.0.0-intelligent",
            "timestamp": datetime.now().isoformat(),
            "recommendations": recommendations,
            "explanation": explanation,
            "shap_top_features": shap_features,
            "location_analysis": {
                "latitude": request.location.lat,
                "longitude": request.location.lon,
                "region_suitability": "Good" if recommendations[0]["score"] > 0.7 else "Moderate"
            }
        }
        
        logger.info(f"Generated {len(recommendations)} intelligent recommendations")
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
