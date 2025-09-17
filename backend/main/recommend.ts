import { api } from "encore.dev/api";
import { getTemperature, getWeatherForecast } from "./weather";
import { getMarketPrices, getMarketData } from "./market";
import { predictCrops, CropRecommendation } from "./ml";
import { saveRecommendation } from "./history";

export interface RecommendRequest {
  userId: string;
  location: {
    lat: number;
    lon: number;
    state?: string;
  };
  soil_type: string;
  area_ha: number;
  farming_method?: string;
  irrigation_type?: string;
  previous_crops?: string[];
  experience_years?: number;
  budget_category?: string;
  preferred_crops?: string[];
  soil_values: {
    N?: number;
    P?: number;
    K?: number;
    ph?: number;
    moisture?: number;
    organic_carbon?: number;
  };
}

export interface RecommendResponse {
  recommendations: CropRecommendation[];
  explanation: string;
  weather_analysis: {
    current_conditions: any;
    seasonal_forecast: any;
    suitability_score: number;
  };
  soil_analysis: {
    health_score: number;
    nutrient_status: string;
    recommendations: string[];
  };
  market_analysis: {
    price_trends: any;
    demand_forecast: string;
  };
  shap_top_features: Array<{
    feature: string;
    impact: number;
  }>;
  model_version: string;
  timestamp: string;
}

// Gets comprehensive crop recommendations based on farmer inputs
export const recommend = api<RecommendRequest, RecommendResponse>(
  { expose: true, method: "POST", path: "/api/recommend" },
  async (req) => {
    // Get current weather data and forecast
    const weather = await getTemperature(req.location.lat, req.location.lon);
    const forecast = await getWeatherForecast(req.location.lat, req.location.lon);
    
    // Get enhanced market data with regional pricing and trends
    const marketData = await getMarketData();
    const regionalPrices = await getMarketPrices(req.location.state);
    
    // Get soil auto-fill values
    const soilDefaults = getSoilDefaults(req.soil_type);
    
    // Merge user inputs with defaults
    const features = {
      N: req.soil_values.N ?? soilDefaults.N,
      P: req.soil_values.P ?? soilDefaults.P,
      K: req.soil_values.K ?? soilDefaults.K,
      ph: req.soil_values.ph ?? soilDefaults.ph,
      moisture: req.soil_values.moisture ?? soilDefaults.moisture,
      organic_carbon: req.soil_values.organic_carbon ?? soilDefaults.organic_carbon,
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfall: weather.rainfall,
      soil_type: req.soil_type,
      area_ha: req.area_ha,
      farming_method: req.farming_method || 'conventional',
      irrigation_type: req.irrigation_type || 'rainfed',
      previous_crops: req.previous_crops || [],
      experience_years: req.experience_years || 5,
      budget_category: req.budget_category || 'medium',
      preferred_crops: req.preferred_crops || []
    };
    
    // Call ML microservice with enhanced market data
    const mlRequest = {
      location: req.location,
      features,
      market_snapshot: {
        ...marketData.prices,
        ...regionalPrices, // Regional prices override national averages
        msp: marketData.msp,
        trends: marketData.trends
      },
      weather_data: weather,
      forecast_data: forecast
    };
    
    const prediction = await predictCrops(mlRequest);
    
    // Analyze soil health
    const soilAnalysis = analyzeSoilHealth(features);
    
    // Analyze weather conditions
    const weatherAnalysis = analyzeWeatherSuitability(weather, forecast);
    
    // Analyze market conditions with enhanced data
    const marketAnalysis = analyzeMarketConditions(regionalPrices, marketData);
    
    const response: RecommendResponse = {
      ...prediction,
      weather_analysis: weatherAnalysis,
      soil_analysis: soilAnalysis,
      market_analysis: marketAnalysis,
      recommendations: prediction.recommendations.map(rec => ({
        ...rec,
        market_insights: {
          current_price: regionalPrices[rec.crop] || marketData.prices[rec.crop],
          msp_price: marketData.msp[rec.crop],
          price_trend: marketData.trends[rec.crop]?.trend || 'stable',
          demand_level: marketData.trends[rec.crop]?.demand_level || 'medium',
          price_change_percent: marketData.trends[rec.crop]?.change_percent || 0
        }
      }))
    };
    
    // Save recommendation to history with enhanced market data
    await saveRecommendation({
      userId: req.userId,
      input: req,
      ml_response: response,
      market_snapshot: {
        regional_prices: regionalPrices,
        market_data: marketData
      }
    });
    
    return response;
  }
);

function getSoilDefaults(soilType: string): any {
  const soilLookup: Record<string, any> = {
    "Sandy": { ph: 6.0, moisture: 20, N: 20, P: 10, K: 50, organic_carbon: 0.3 },
    "Loamy": { ph: 6.8, moisture: 40, N: 40, P: 20, K: 120, organic_carbon: 0.8 },
    "Clayey": { ph: 7.2, moisture: 60, N: 60, P: 30, K: 100, organic_carbon: 1.1 },
    "Silty": { ph: 6.6, moisture: 50, N: 45, P: 35, K: 130, organic_carbon: 1.0 },
    "Peaty": { ph: 5.2, moisture: 70, N: 80, P: 25, K: 40, organic_carbon: 2.5 },
    "Black": { ph: 7.5, moisture: 60, N: 50, P: 25, K: 150, organic_carbon: 0.7 },
    "Red": { ph: 6.2, moisture: 30, N: 30, P: 15, K: 60, organic_carbon: 0.4 },
    "Alluvial": { ph: 7.0, moisture: 45, N: 55, P: 30, K: 140, organic_carbon: 0.9 }
  };
  
  return soilLookup[soilType] || soilLookup["Loamy"];
}

function analyzeSoilHealth(features: any) {
  let healthScore = 0;
  const recommendations = [];
  
  // pH analysis
  if (features.ph >= 6.0 && features.ph <= 7.5) {
    healthScore += 25;
  } else if (features.ph < 6.0) {
    recommendations.push("Consider lime application to increase soil pH");
    healthScore += 10;
  } else {
    recommendations.push("Soil is alkaline, consider sulfur application");
    healthScore += 15;
  }
  
  // Nutrient analysis
  const nStatus = features.N > 40 ? "High" : features.N > 20 ? "Medium" : "Low";
  const pStatus = features.P > 20 ? "High" : features.P > 10 ? "Medium" : "Low";
  const kStatus = features.K > 100 ? "High" : features.K > 50 ? "Medium" : "Low";
  
  if (nStatus === "High") healthScore += 25;
  else if (nStatus === "Medium") healthScore += 15;
  else recommendations.push("Consider nitrogen fertilizer application");
  
  if (pStatus === "High") healthScore += 25;
  else if (pStatus === "Medium") healthScore += 15;
  else recommendations.push("Consider phosphorus fertilizer application");
  
  if (kStatus === "High") healthScore += 25;
  else if (kStatus === "Medium") healthScore += 15;
  else recommendations.push("Consider potassium fertilizer application");
  
  // Organic carbon analysis
  if (features.organic_carbon > 0.75) {
    healthScore += 0; // Already at max
    recommendations.push("Excellent organic matter content");
  } else {
    recommendations.push("Consider adding organic matter (compost, crop residues)");
  }
  
  const nutrientStatus = `N: ${nStatus}, P: ${pStatus}, K: ${kStatus}`;
  
  return {
    health_score: Math.min(100, healthScore),
    nutrient_status: nutrientStatus,
    recommendations
  };
}

function analyzeWeatherSuitability(weather: any, forecast: any) {
  let suitabilityScore = 0;
  
  // Temperature suitability
  if (weather.temperature >= 20 && weather.temperature <= 35) {
    suitabilityScore += 40;
  } else {
    suitabilityScore += 20;
  }
  
  // Rainfall suitability
  if (weather.rainfall >= 50 && weather.rainfall <= 200) {
    suitabilityScore += 30;
  } else if (weather.rainfall < 50) {
    suitabilityScore += 10;
  } else {
    suitabilityScore += 20;
  }
  
  // Humidity suitability
  if (weather.humidity >= 50 && weather.humidity <= 80) {
    suitabilityScore += 30;
  } else {
    suitabilityScore += 15;
  }
  
  return {
    current_conditions: weather,
    seasonal_forecast: forecast,
    suitability_score: suitabilityScore
  };
}

function analyzeMarketConditions(regionalPrices: any, marketData: any) {
  // Enhanced market analysis with trends and MSP comparison
  const prices = Object.values(regionalPrices) as number[];
  const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
  
  // Analyze price trends
  const trendAnalysis: Record<string, any> = {};
  Object.keys(regionalPrices).forEach(crop => {
    const currentPrice = regionalPrices[crop];
    const mspPrice = marketData.msp[crop];
    const trend = marketData.trends[crop];
    
    trendAnalysis[crop] = {
      current_price: currentPrice,
      msp_price: mspPrice,
      price_above_msp: currentPrice > mspPrice,
      msp_premium_percent: ((currentPrice - mspPrice) / mspPrice * 100).toFixed(1),
      trend: trend?.trend || 'stable',
      demand: trend?.demand_level || 'medium'
    };
  });
  
  // Overall market sentiment
  const risingTrends = Object.values(marketData.trends).filter((t: any) => t.trend === 'rising').length;
  const totalCrops = Object.keys(marketData.trends).length;
  const marketSentiment = risingTrends / totalCrops > 0.6 ? "Bullish" : 
                         risingTrends / totalCrops < 0.4 ? "Bearish" : "Neutral";
  
  return {
    price_trends: trendAnalysis,
    market_sentiment: marketSentiment,
    average_price: Math.round(avgPrice),
    crops_above_msp: Object.values(trendAnalysis).filter((c: any) => c.price_above_msp).length,
    demand_forecast: avgPrice > 3500 ? "Strong demand expected across commodities" : 
                    avgPrice > 2500 ? "Moderate demand with selective opportunities" : 
                    "Cautious market conditions, focus on cost efficiency"
  };
}
