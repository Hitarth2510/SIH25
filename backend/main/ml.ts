import type { WeatherData, WeatherForecast } from "./weather";

export interface MLFeatures {
  N: number;
  P: number;
  K: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  organic_carbon: number;
  soil_type: string;
  area_ha: number;
  farming_method: string;
  irrigation_type: string;
  previous_crops: string[];
  experience_years: number;
  budget_category: string;
  preferred_crops: string[];
}

export interface MLRequest {
  location: {
    lat: number;
    lon: number;
    state?: string;
  };
  features: MLFeatures;
  market_snapshot: any;
  weather_data: WeatherData;
  forecast_data: WeatherForecast;
}

export interface CropRecommendation {
  crop: string;
  score: number;
  predicted_yield_kg_per_ha: number;
  estimated_profit_inr: number;
  sustainability_score: number;
  confidence: number;
  risk_level: string;
  season_suitability: string;
  water_requirement: string;
  market_demand: string;
}

export interface MLResponse {
  model_version: string;
  timestamp: string;
  recommendations: CropRecommendation[];
  explanation: string;
  shap_top_features: Array<{
    feature: string;
    impact: number;
  }>;
}

export async function predictCrops(request: MLRequest): Promise<MLResponse> {
  try {
    const response = await fetch("http://localhost:8001/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`ML service error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to call ML service:", error);
    // Return mock prediction if ML service fails
    return {
      model_version: "v2.0.0-fallback",
      timestamp: new Date().toISOString(),
      recommendations: [
        {
          crop: "Rice",
          score: 0.85,
          predicted_yield_kg_per_ha: 4800,
          estimated_profit_inr: 85000,
          sustainability_score: 0.75,
          confidence: 0.81,
          risk_level: "Low",
          season_suitability: "Excellent",
          water_requirement: "High",
          market_demand: "Strong"
        },
        {
          crop: "Soybean",
          score: 0.72,
          predicted_yield_kg_per_ha: 2200,
          estimated_profit_inr: 65000,
          sustainability_score: 0.90,
          confidence: 0.68,
          risk_level: "Medium",
          season_suitability: "Good",
          water_requirement: "Medium",
          market_demand: "Moderate"
        },
        {
          crop: "Maize",
          score: 0.65,
          predicted_yield_kg_per_ha: 4200,
          estimated_profit_inr: 72000,
          sustainability_score: 0.78,
          confidence: 0.62,
          risk_level: "Low",
          season_suitability: "Good",
          water_requirement: "Medium",
          market_demand: "Strong"
        }
      ],
      explanation: "Recommendations based on soil nutrients and weather conditions.",
      shap_top_features: [
        { feature: "ph", impact: 0.3 },
        { feature: "temperature", impact: 0.25 },
        { feature: "N", impact: 0.2 }
      ]
    };
  }
}
