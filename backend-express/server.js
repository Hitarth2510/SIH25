import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import pg from 'pg';
import { config } from 'dotenv';

config();

const app = express();
const port = process.env.PORT || 4000;

// Database configuration
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crop_recommendation',
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'crop-advisor-backend' });
});

// Real weather data from OpenWeatherMap API
async function getRealWeatherData(lat, lon) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenWeatherMap API key not found, using location-based estimates');
    return getLocationBasedWeatherData(lat, lon);
  }
  
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
      wind_speed: data.wind.speed,
      solar_radiation: 15, // Estimate based on weather
      pressure: data.main.pressure,
      description: data.weather[0].description,
      feels_like: data.main.feels_like,
      uv_index: 5, // Would need UV API for real data
      visibility: data.visibility / 1000, // Convert to km
      cloudiness: data.clouds.all
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return getLocationBasedWeatherData(lat, lon);
  }
}

// Fallback weather data generation based on location
function getLocationBasedWeatherData(lat, lon) {
  // Realistic weather patterns for India based on geography
  let baseTemp, humidity, rainfall;
  
  if (lat > 28) { // Northern regions (Punjab, Haryana, UP)
    baseTemp = 25;
    humidity = 60;
    rainfall = 50;
  } else if (lat > 20) { // Central regions (MP, Maharashtra)
    baseTemp = 28;
    humidity = 65;
    rainfall = 70;
  } else { // Southern regions (Karnataka, Tamil Nadu)
    baseTemp = 30;
    humidity = 70;
    rainfall = 80;
  }

  // Add seasonal variation (simplified)
  const month = new Date().getMonth();
  if (month >= 5 && month <= 9) { // Monsoon season
    rainfall *= 2;
    humidity += 10;
    baseTemp -= 2;
  } else if (month >= 11 || month <= 2) { // Winter
    baseTemp -= 5;
    humidity -= 10;
    rainfall *= 0.3;
  }

  return {
    temperature: baseTemp + (Math.random() * 4 - 2), // ±2°C variation
    humidity: Math.max(30, Math.min(90, humidity + (Math.random() * 10 - 5))),
    rainfall: Math.max(0, rainfall + (Math.random() * 20 - 10)),
    wind_speed: 3 + Math.random() * 8,
    solar_radiation: 12 + Math.random() * 8,
    pressure: 1013 + Math.random() * 10 - 5,
    description: rainfall > 60 ? "Light rain" : "Partly cloudy",
    feels_like: baseTemp + (Math.random() * 3 - 1.5),
    uv_index: 4 + Math.random() * 4,
    visibility: 8 + Math.random() * 2,
    cloudiness: rainfall > 60 ? 70 + Math.random() * 20 : 30 + Math.random() * 40
  };
}

// Weather API endpoints
app.get('/api/weather/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    const weatherData = await getRealWeatherData(parseFloat(lat), parseFloat(lon));
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Real soil data from SoilGrids API
async function getRealSoilData(lat, lon) {
  try {
    // SoilGrids REST API for soil properties
    const properties = ['phh2o', 'nitrogen', 'phosorus', 'potassium', 'ocd'];
    const depth = '0-5cm'; // Surface layer
    
    const soilData = {
      properties: {},
      location: { lat: parseFloat(lat), lon: parseFloat(lon) }
    };
    
    // Fetch each soil property
    for (const prop of properties) {
      try {
        const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=${prop}&depth=${depth}&value=mean`;
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const value = data.properties.layers[0].depths[0].values.mean;
          
          // Convert SoilGrids units to standard units
          let convertedValue, unit;
          switch (prop) {
            case 'phh2o':
              convertedValue = value / 10; // Convert from pH*10 to pH
              unit = 'pH';
              break;
            case 'nitrogen':
              convertedValue = value / 100; // Convert from cg/kg to kg/ha (approximate)
              unit = 'kg/ha';
              break;
            case 'phosorus':
              convertedValue = value / 100;
              unit = 'kg/ha';
              break;
            case 'potassium':
              convertedValue = value / 100;
              unit = 'kg/ha';
              break;
            case 'ocd':
              convertedValue = value / 10; // Convert from g/kg to %
              unit = '%';
              break;
            default:
              convertedValue = value;
              unit = 'unknown';
          }
          
          const propName = prop === 'phosorus' ? 'phosphorus' : 
                          prop === 'ocd' ? 'organic_carbon' : 
                          prop === 'phh2o' ? 'phh2o' : prop;
          
          soilData.properties[propName] = {
            mean: convertedValue,
            uncertainty: convertedValue * 0.1, // 10% uncertainty estimate
            unit_measure: unit
          };
        }
      } catch (propError) {
        console.warn(`Failed to fetch ${prop}:`, propError.message);
      }
    }
    
    // Fill missing properties with location-based estimates
    if (!soilData.properties.phh2o) {
      soilData.properties.phh2o = { mean: getLocationBasedSoilPH(lat, lon), uncertainty: 0.3, unit_measure: 'pH' };
    }
    if (!soilData.properties.nitrogen) {
      soilData.properties.nitrogen = { mean: getLocationBasedNitrogen(lat, lon), uncertainty: 5, unit_measure: 'kg/ha' };
    }
    if (!soilData.properties.phosphorus) {
      soilData.properties.phosphorus = { mean: getLocationBasedPhosphorus(lat, lon), uncertainty: 3, unit_measure: 'kg/ha' };
    }
    if (!soilData.properties.potassium) {
      soilData.properties.potassium = { mean: getLocationBasedPotassium(lat, lon), uncertainty: 10, unit_measure: 'kg/ha' };
    }
    if (!soilData.properties.organic_carbon) {
      soilData.properties.organic_carbon = { mean: getLocationBasedOrgCarbon(lat, lon), uncertainty: 0.2, unit_measure: '%' };
    }
    
    return soilData;
  } catch (error) {
    console.error('SoilGrids API error:', error);
    return getLocationBasedSoilData(lat, lon);
  }
}

// Location-based soil estimates for Indian regions
function getLocationBasedSoilPH(lat, lon) {
  if (lat > 28) return 7.2; // Northern plains - slightly alkaline
  if (lat > 20) return 6.8; // Central India - neutral to slightly alkaline  
  return 6.5; // Southern India - slightly acidic
}

function getLocationBasedNitrogen(lat, lon) {
  if (lat > 28) return 45; // Fertile northern plains
  if (lat > 20) return 35; // Central regions
  return 30; // Southern regions
}

function getLocationBasedPhosphorus(lat, lon) {
  if (lat > 28) return 25; // Higher in northern regions
  if (lat > 20) return 20;
  return 18;
}

function getLocationBasedPotassium(lat, lon) {
  if (lat > 28) return 120; // Alluvial soils high in K
  if (lat > 20) return 100;
  return 90;
}

function getLocationBasedOrgCarbon(lat, lon) {
  if (lat > 28) return 1.2; // Higher organic matter in northern plains
  if (lat > 20) return 0.9;
  return 0.7;
}

function getLocationBasedSoilData(lat, lon) {
  return {
    properties: {
      phh2o: { mean: getLocationBasedSoilPH(lat, lon), uncertainty: 0.3, unit_measure: 'pH' },
      nitrogen: { mean: getLocationBasedNitrogen(lat, lon), uncertainty: 5, unit_measure: 'kg/ha' },
      phosphorus: { mean: getLocationBasedPhosphorus(lat, lon), uncertainty: 3, unit_measure: 'kg/ha' },
      potassium: { mean: getLocationBasedPotassium(lat, lon), uncertainty: 10, unit_measure: 'kg/ha' },
      organic_carbon: { mean: getLocationBasedOrgCarbon(lat, lon), uncertainty: 0.2, unit_measure: '%' }
    },
    location: { lat: parseFloat(lat), lon: parseFloat(lon) }
  };
}

// Soil properties API endpoint
app.get('/api/soil/properties', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const soilData = await getRealSoilData(parseFloat(lat), parseFloat(lon));
    res.json(soilData);
  } catch (error) {
    console.error('Soil API error:', error);
    res.status(500).json({ error: 'Failed to fetch soil data' });
  }
});

// Market data API endpoint  
app.get('/api/market/prices', async (req, res) => {
  try {
    const { state } = req.query;
    
    // Mock market prices
    const prices = {
      'Rice': 2000 + Math.random() * 500,
      'Wheat': 1800 + Math.random() * 400,
      'Maize': 1500 + Math.random() * 300,
      'Cotton': 5000 + Math.random() * 1000,
      'Sugarcane': 300 + Math.random() * 100,
      'Soybean': 3500 + Math.random() * 800,
      'Mustard': 4000 + Math.random() * 600,
      'Gram': 4500 + Math.random() * 700
    };
    
    res.json({
      prices,
      timestamp: new Date().toISOString(),
      source: 'mock_data',
      state: state || 'National'
    });
  } catch (error) {
    console.error('Market API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Main recommendation API endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { userId, location, soil_type, area_acres, soil_values } = req.body;
    
    // Convert acres to hectares for ML model (1 acre = 0.404686 hectares)
    const area_ha = area_acres * 0.404686;
    
    // Get weather data
    const weatherData = await getRealWeatherData(location.lat, location.lon);
    
    // Prepare ML request
    const mlRequest = {
      location,
      features: {
        N: soil_values.N || 30,
        P: soil_values.P || 15,
        K: soil_values.K || 80,
        ph: soil_values.ph || 6.5,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: weatherData.rainfall,
        organic_carbon: soil_values.organic_carbon || 0.8,
        soil_type,
        area_ha,
        farming_method: req.body.farming_method || 'conventional',
        irrigation_type: req.body.irrigation_type || 'rainfed',
        previous_crops: req.body.previous_crops || [],
        experience_years: req.body.experience_years || 5,
        budget_category: req.body.budget_category || 'medium',
        preferred_crops: req.body.preferred_crops || []
      },
      market_snapshot: {
        Rice: 2100, Wheat: 2000, Maize: 1800, Cotton: 5500,
        Sugarcane: 350, Soybean: 4200, Groundnut: 5000
      },
      weather_data: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: weatherData.rainfall,
        wind_speed: weatherData.wind_speed,
        solar_radiation: weatherData.solar_radiation,
        pressure: weatherData.pressure
      },
      forecast_data: {
        daily_forecast: [],
        seasonal_outlook: "Normal conditions expected"
      }
    };
    
    // Call ML service with proper error handling
    let mlResponse;
    try {
      console.log('Calling ML service with:', JSON.stringify(mlRequest, null, 2));
      const response = await fetch('http://localhost:8001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlRequest)
      });
      
      if (response.ok) {
        mlResponse = await response.json();
        console.log('ML service responded successfully');
      } else {
        const errorText = await response.text();
        console.error('ML service error:', response.status, errorText);
        throw new Error(`ML service error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to call ML service:', error.message);
      // Use intelligent fallback based on actual input data
      mlResponse = {
        model_version: "fallback_v1.0",
        timestamp: new Date().toISOString(),
        recommendations: generateIntelligentFallback(mlRequest.features, weatherData, area_ha),
        explanation: `Based on your ${soil_type} soil (pH: ${mlRequest.features.ph}), temperature of ${weatherData.temperature}°C, and ${weatherData.rainfall}mm rainfall, these crops are recommended for your ${area_ha} hectare farm.`,
        shap_top_features: [
          { feature: "temperature", impact: 0.3 },
          { feature: "ph", impact: 0.25 },
          { feature: "rainfall", impact: 0.2 }
        ]
      };
    }
    
    // Enhanced response
    const response = {
      ...mlResponse,
      weather_analysis: {
        current_conditions: weatherData,
        seasonal_forecast: { daily_forecast: [] },
        suitability_score: 85
      },
      soil_analysis: {
        health_score: 80,
        nutrient_status: "Good",
        recommendations: ["Maintain current nutrient levels"]
      },
      market_analysis: {
        price_trends: {},
        demand_forecast: "Stable demand expected"
      }
    };
    
    // Save to database (optional)
    try {
      await pool.query(
        'INSERT INTO recommendations (user_id, input_data, ml_response, market_snapshot, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, JSON.stringify(req.body), JSON.stringify(response), JSON.stringify({})]
      );
    } catch (dbError) {
      console.warn('Database save failed:', dbError.message);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Recommendation API error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// History API endpoint
app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    res.json({ recommendations: result.rows });
  } catch (error) {
    console.error('History API error:', error);
    res.json({ recommendations: [] }); // Return empty array if database unavailable
  }
});

// Feedback API endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { recommendationId, userId, helpful, notes } = req.body;
    await pool.query(
      'INSERT INTO feedbacks (recommendation_id, user_id, helpful, notes, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [recommendationId, userId, helpful, notes]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    res.json({ success: false, error: error.message });
  }
});

// Intelligent fallback function for when ML service is unavailable
function generateIntelligentFallback(features, weatherData, area_ha) {
  const crops = [];
  
  // Rice - good for high rainfall, clayey/loamy soil
  if (weatherData.rainfall > 80 && features.ph >= 5.5 && features.ph <= 7.0) {
    crops.push({
      crop: "Rice",
      score: 0.85,
      predicted_yield_kg_per_ha: Math.round(4000 + (features.N / 10) * 100 + (weatherData.rainfall / 10) * 20),
      estimated_profit_inr: Math.round(45000 * area_ha),
      sustainability_score: 0.7,
      confidence: 0.8,
      risk_level: "Low",
      season_suitability: "Kharif",
      water_requirement: "High",
      market_demand: "High"
    });
  }
  
  // Wheat - good for moderate rainfall, cooler temperatures
  if (weatherData.temperature < 28 && weatherData.rainfall < 100 && features.ph >= 6.0) {
    crops.push({
      crop: "Wheat",
      score: 0.78,
      predicted_yield_kg_per_ha: Math.round(3200 + (features.N / 15) * 100),
      estimated_profit_inr: Math.round(38000 * area_ha),
      sustainability_score: 0.8,
      confidence: 0.75,
      risk_level: "Low",
      season_suitability: "Rabi",
      water_requirement: "Medium",
      market_demand: "High"
    });
  }
  
  // Maize - versatile crop
  if (weatherData.temperature >= 20 && weatherData.temperature <= 30) {
    crops.push({
      crop: "Maize",
      score: 0.72,
      predicted_yield_kg_per_ha: Math.round(4000 + (features.N / 12) * 80),
      estimated_profit_inr: Math.round(35000 * area_ha),
      sustainability_score: 0.75,
      confidence: 0.7,
      risk_level: "Medium",
      season_suitability: "Kharif",
      water_requirement: "Medium",
      market_demand: "Medium"
    });
  }
  
  // Soybean - nitrogen fixing, good for moderate conditions
  if (features.ph >= 6.0 && features.ph <= 7.0 && weatherData.rainfall >= 60) {
    crops.push({
      crop: "Soybean",
      score: 0.76,
      predicted_yield_kg_per_ha: Math.round(2200 + (features.P / 5) * 50),
      estimated_profit_inr: Math.round(42000 * area_ha),
      sustainability_score: 0.95,
      confidence: 0.72,
      risk_level: "Medium",
      season_suitability: "Kharif",
      water_requirement: "Medium",
      market_demand: "Medium"
    });
  }
  
  // Sort by score and return top 3
  crops.sort((a, b) => b.score - a.score);
  return crops.slice(0, 3);
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🌾 ML Service should be running on http://localhost:8001`);
  console.log(`💾 Database: ${process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crop_recommendation'}`);
});

export default app;