import { api } from "encore.dev/api";
import { getTemperature, getWeatherForecast } from "./weather";

export interface IndiaWeatherRequest {
  city: string;
  state?: string;
}

export interface WeatherByIdRequest {
  cityId: number;
}

export interface GlobalWeatherRequest {
  lat: number;
  lon: number;
  country?: string;
}

export interface CityRequest {
  state?: string;
  limit?: number;
}

export interface WeatherResponse {
  location: {
    city?: string;
    state?: string;
    country?: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    wind_speed: number;
    solar_radiation: number;
    pressure: number;
    description: string;
    feels_like: number;
    uv_index: number;
    visibility: number;
    cloudiness: number;
  };
  forecast?: {
    daily_forecast: Array<{
      date: string;
      temperature_max: number;
      temperature_min: number;
      rainfall: number;
      humidity: number;
      wind_speed: number;
      description: string;
      weather_icon: string;
    }>;
    seasonal_outlook: string;
    weather_alerts: string[];
    farming_recommendations: string[];
  };
}

export interface CityInfo {
  id: number;
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CitiesResponse {
  cities: CityInfo[];
  total: number;
}

export interface CurrentWeatherResponse {
  location: {
    lat: number;
    lon: number;
    country: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    wind_speed: number;
    solar_radiation: number;
    pressure: number;
    description: string;
    feels_like: number;
    uv_index: number;
    visibility: number;
    cloudiness: number;
  };
}

export interface ForecastResponse {
  location: {
    lat: number;
    lon: number;
    country: string;
  };
  forecast: {
    daily_forecast: Array<{
      date: string;
      temperature_max: number;
      temperature_min: number;
      rainfall: number;
      humidity: number;
      wind_speed: number;
      description: string;
      weather_icon: string;
    }>;
    seasonal_outlook: string;
    weather_alerts: string[];
    farming_recommendations: string[];
  };
}

// Indian cities database for quick lookup
const indianCities: CityInfo[] = [
  // Major cities
  { id: 1273294, name: "Delhi", state: "Delhi", country: "IN", lat: 28.6139, lon: 77.2090 },
  { id: 1275339, name: "Mumbai", state: "Maharashtra", country: "IN", lat: 19.0760, lon: 72.8777 },
  { id: 1264527, name: "Chennai", state: "Tamil Nadu", country: "IN", lat: 13.0827, lon: 80.2707 },
  { id: 1275004, name: "Bangalore", state: "Karnataka", country: "IN", lat: 12.9716, lon: 77.5946 },
  { id: 1269843, name: "Hyderabad", state: "Telangana", country: "IN", lat: 17.3850, lon: 78.4867 },
  { id: 1275817, name: "Ahmedabad", state: "Gujarat", country: "IN", lat: 23.0225, lon: 72.5714 },
  { id: 1268865, name: "Kolkata", state: "West Bengal", country: "IN", lat: 22.5726, lon: 88.3639 },
  { id: 1277333, name: "Pune", state: "Maharashtra", country: "IN", lat: 18.5204, lon: 73.8567 },
  { id: 1269515, name: "Jaipur", state: "Rajasthan", country: "IN", lat: 26.9124, lon: 75.7873 },
  { id: 1275665, name: "Surat", state: "Gujarat", country: "IN", lat: 21.1702, lon: 72.8311 },
  
  // Agricultural centers
  { id: 1269006, name: "Ludhiana", state: "Punjab", country: "IN", lat: 30.9010, lon: 75.8573 },
  { id: 1278710, name: "Amritsar", state: "Punjab", country: "IN", lat: 31.6340, lon: 74.8723 },
  { id: 1270642, name: "Jalandhar", state: "Punjab", country: "IN", lat: 31.3260, lon: 75.5762 },
  { id: 1271715, name: "Hisar", state: "Haryana", country: "IN", lat: 29.1492, lon: 75.7217 },
  { id: 1270583, name: "Karnal", state: "Haryana", country: "IN", lat: 29.6857, lon: 76.9905 },
  { id: 1275841, name: "Rohtak", state: "Haryana", country: "IN", lat: 28.8955, lon: 76.6066 },
  { id: 1278149, name: "Panipat", state: "Haryana", country: "IN", lat: 29.3909, lon: 76.9635 },
  { id: 1271476, name: "Meerut", state: "Uttar Pradesh", country: "IN", lat: 28.9845, lon: 77.7064 },
  { id: 1278785, name: "Agra", state: "Uttar Pradesh", country: "IN", lat: 27.1767, lon: 78.0081 },
  { id: 1264733, name: "Lucknow", state: "Uttar Pradesh", country: "IN", lat: 26.8467, lon: 80.9462 },
  
  // Cotton growing regions
  { id: 1278988, name: "Ahmedabad", state: "Gujarat", country: "IN", lat: 23.0225, lon: 72.5714 },
  { id: 1271874, name: "Rajkot", state: "Gujarat", country: "IN", lat: 22.3039, lon: 70.8022 },
  { id: 1270022, name: "Nagpur", state: "Maharashtra", country: "IN", lat: 21.1458, lon: 79.0882 },
  { id: 1278483, name: "Aurangabad", state: "Maharashtra", country: "IN", lat: 19.8762, lon: 75.3433 },
  { id: 1270216, name: "Nashik", state: "Maharashtra", country: "IN", lat: 19.9975, lon: 73.7898 },
  { id: 1271513, name: "Solapur", state: "Maharashtra", country: "IN", lat: 17.6599, lon: 75.9064 },
  { id: 1278149, name: "Akola", state: "Maharashtra", country: "IN", lat: 20.7002, lon: 77.0082 },
  
  // Rice growing regions
  { id: 1278341, name: "Bhubaneswar", state: "Odisha", country: "IN", lat: 20.2961, lon: 85.8245 },
  { id: 1264728, name: "Cuttack", state: "Odisha", country: "IN", lat: 20.4625, lon: 85.8828 },
  { id: 1275816, name: "Berhampur", state: "Odisha", country: "IN", lat: 19.3150, lon: 84.7941 },
  { id: 1271231, name: "Raipur", state: "Chhattisgarh", country: "IN", lat: 21.2514, lon: 81.6296 },
  { id: 1271439, name: "Bilaspur", state: "Chhattisgarh", country: "IN", lat: 22.0797, lon: 82.1391 },
  { id: 1271308, name: "Durg", state: "Chhattisgarh", country: "IN", lat: 21.1938, lon: 81.2849 },
  
  // Sugarcane regions
  { id: 1269395, name: "Muzaffarnagar", state: "Uttar Pradesh", country: "IN", lat: 29.4727, lon: 77.7085 },
  { id: 1271306, name: "Saharanpur", state: "Uttar Pradesh", country: "IN", lat: 29.9680, lon: 77.5552 },
  { id: 1270926, name: "Moradabad", state: "Uttar Pradesh", country: "IN", lat: 28.8386, lon: 78.7733 },
  { id: 1271715, name: "Bareilly", state: "Uttar Pradesh", country: "IN", lat: 28.3670, lon: 79.4304 },
  
  // South Indian agricultural centers
  { id: 1264359, name: "Coimbatore", state: "Tamil Nadu", country: "IN", lat: 11.0168, lon: 76.9558 },
  { id: 1271279, name: "Salem", state: "Tamil Nadu", country: "IN", lat: 11.6643, lon: 78.1460 },
  { id: 1271644, name: "Madurai", state: "Tamil Nadu", country: "IN", lat: 9.9252, lon: 78.1198 },
  { id: 1271715, name: "Tiruchirappalli", state: "Tamil Nadu", country: "IN", lat: 10.7905, lon: 78.7047 },
  { id: 1277333, name: "Mysore", state: "Karnataka", country: "IN", lat: 12.2958, lon: 76.6394 },
  { id: 1271476, name: "Hubli", state: "Karnataka", country: "IN", lat: 15.3647, lon: 75.1240 },
  { id: 1269843, name: "Belgaum", state: "Karnataka", country: "IN", lat: 15.8497, lon: 74.4977 },
  { id: 1264728, name: "Gulbarga", state: "Karnataka", country: "IN", lat: 17.3297, lon: 76.8343 },
  
  // Kerala agricultural centers
  { id: 1273874, name: "Kochi", state: "Kerala", country: "IN", lat: 9.9312, lon: 76.2673 },
  { id: 1254163, name: "Thiruvananthapuram", state: "Kerala", country: "IN", lat: 8.5241, lon: 76.9366 },
  { id: 1273865, name: "Kozhikode", state: "Kerala", country: "IN", lat: 11.2588, lon: 75.7804 },
  { id: 1275339, name: "Thrissur", state: "Kerala", country: "IN", lat: 10.5276, lon: 76.2144 },
  
  // Andhra Pradesh and Telangana
  { id: 1278946, name: "Vijayawada", state: "Andhra Pradesh", country: "IN", lat: 16.5062, lon: 80.6480 },
  { id: 1271231, name: "Visakhapatnam", state: "Andhra Pradesh", country: "IN", lat: 17.6868, lon: 83.2185 },
  { id: 1275339, name: "Guntur", state: "Andhra Pradesh", country: "IN", lat: 16.3067, lon: 80.4365 },
  { id: 1269843, name: "Nellore", state: "Andhra Pradesh", country: "IN", lat: 14.4426, lon: 79.9865 },
  { id: 1271476, name: "Tirupati", state: "Andhra Pradesh", country: "IN", lat: 13.6288, lon: 79.4192 },
  { id: 1264728, name: "Warangal", state: "Telangana", country: "IN", lat: 17.9689, lon: 79.5941 },
  { id: 1273874, name: "Nizamabad", state: "Telangana", country: "IN", lat: 18.6725, lon: 78.0941 }
];

// Gets weather data for Indian cities by name
export const getIndiaWeather = api<IndiaWeatherRequest, WeatherResponse>(
  { expose: true, method: "GET", path: "/india/weather" },
  async (req) => {
    // Find city in Indian cities database
    const city = indianCities.find(c => 
      c.name.toLowerCase() === req.city.toLowerCase() &&
      (!req.state || c.state.toLowerCase() === req.state.toLowerCase())
    );
    
    if (!city) {
      // Try fuzzy search
      const fuzzyMatch = indianCities.find(c => 
        c.name.toLowerCase().includes(req.city.toLowerCase()) ||
        req.city.toLowerCase().includes(c.name.toLowerCase())
      );
      
      if (!fuzzyMatch) {
        throw new Error(`City "${req.city}" not found in India`);
      }
      
      return await getWeatherForLocation(fuzzyMatch);
    }
    
    return await getWeatherForLocation(city);
  }
);

// Gets weather data by city ID
export const getWeatherById = api<WeatherByIdRequest, WeatherResponse>(
  { expose: true, method: "GET", path: "/india/weather_by_id" },
  async (req) => {
    const city = indianCities.find(c => c.id === req.cityId);
    
    if (!city) {
      throw new Error(`City with ID ${req.cityId} not found`);
    }
    
    return await getWeatherForLocation(city);
  }
);

// Lists Indian cities
export const getIndianCities = api<CityRequest, CitiesResponse>(
  { expose: true, method: "GET", path: "/india/cities" },
  async (req) => {
    let filteredCities = indianCities;
    
    if (req.state) {
      filteredCities = indianCities.filter(c => 
        c.state.toLowerCase() === req.state!.toLowerCase()
      );
    }
    
    const limit = req.limit || 50;
    const cities = filteredCities.slice(0, limit);
    
    return {
      cities,
      total: filteredCities.length
    };
  }
);

// Gets global weather data by coordinates
export const getGlobalWeather = api<GlobalWeatherRequest, WeatherResponse>(
  { expose: true, method: "GET", path: "/global/weather" },
  async (req) => {
    const location: CityInfo = {
      id: 0,
      name: "Custom Location",
      state: "",
      country: req.country || "Unknown",
      lat: req.lat,
      lon: req.lon
    };
    
    return await getWeatherForLocation(location);
  }
);

// Gets current global weather (simplified endpoint)
export const getCurrentGlobalWeather = api<GlobalWeatherRequest, CurrentWeatherResponse>(
  { expose: true, method: "GET", path: "/global/current" },
  async (req) => {
    const weather = await getTemperature(req.lat, req.lon);
    
    return {
      location: {
        lat: req.lat,
        lon: req.lon,
        country: req.country || "Unknown"
      },
      weather
    };
  }
);

// Gets global weather forecast
export const getGlobalForecast = api<GlobalWeatherRequest, ForecastResponse>(
  { expose: true, method: "GET", path: "/global/forecast" },
  async (req) => {
    const forecast = await getWeatherForecast(req.lat, req.lon);
    
    return {
      location: {
        lat: req.lat,
        lon: req.lon,
        country: req.country || "Unknown"
      },
      forecast
    };
  }
);

// Helper function to get weather for a location
async function getWeatherForLocation(city: CityInfo): Promise<WeatherResponse> {
  const current = await getTemperature(city.lat, city.lon);
  const forecast = await getWeatherForecast(city.lat, city.lon);
  
  return {
    location: {
      city: city.name,
      state: city.state,
      country: city.country,
      lat: city.lat,
      lon: city.lon
    },
    current,
    forecast
  };
}

// Additional helper endpoints for agricultural regions

export interface AgriculturalRegionRequest {
  crop: string;
  limit?: number;
}

export interface AgriculturalRegionsResponse {
  regions: Array<{
    city: CityInfo;
    weather: {
      temperature: number;
      humidity: number;
      rainfall: number;
      wind_speed: number;
      solar_radiation: number;
      pressure: number;
      description: string;
      feels_like: number;
      uv_index: number;
      visibility: number;
      cloudiness: number;
    };
    suitability_score: number;
  }>;
}

// Gets weather for major agricultural regions of a specific crop
export const getAgriculturalRegions = api<AgriculturalRegionRequest, AgriculturalRegionsResponse>(
  { expose: true, method: "GET", path: "/india/agricultural-regions" },
  async (req) => {
    const cropRegions = getCropRegions(req.crop);
    const limit = req.limit || 10;
    
    const regions = [];
    
    for (const cityName of cropRegions.slice(0, limit)) {
      const city = indianCities.find(c => c.name === cityName);
      if (city) {
        const weather = await getTemperature(city.lat, city.lon);
        const suitability = calculateCropSuitability(req.crop, weather);
        
        regions.push({
          city,
          weather,
          suitability_score: suitability
        });
      }
    }
    
    // Sort by suitability score
    regions.sort((a, b) => b.suitability_score - a.suitability_score);
    
    return { regions };
  }
);

function getCropRegions(crop: string): string[] {
  const cropRegionMap: { [key: string]: string[] } = {
    "Rice": [
      "Bhubaneswar", "Cuttack", "Raipur", "Patna", "Kolkata", 
      "Thiruvananthapuram", "Kochi", "Chennai", "Vijayawada"
    ],
    "Wheat": [
      "Ludhiana", "Hisar", "Karnal", "Meerut", "Agra", 
      "Lucknow", "Jaipur", "Bhopal", "Indore"
    ],
    "Cotton": [
      "Ahmedabad", "Rajkot", "Nagpur", "Aurangabad", 
      "Hyderabad", "Guntur", "Nashik", "Akola"
    ],
    "Sugarcane": [
      "Muzaffarnagar", "Saharanpur", "Moradabad", "Bareilly",
      "Lucknow", "Pune", "Nashik", "Kolhapur"
    ],
    "Soybean": [
      "Indore", "Bhopal", "Nagpur", "Akola", "Aurangabad",
      "Jabalpur", "Raipur", "Nashik"
    ],
    "Maize": [
      "Hyderabad", "Bangalore", "Chennai", "Coimbatore",
      "Belgaum", "Hubli", "Vijayawada", "Guntur"
    ]
  };
  
  return cropRegionMap[crop] || [];
}

function calculateCropSuitability(crop: string, weather: any): number {
  // Simple suitability calculation based on temperature and humidity
  let score = 0.5; // Base score
  
  const cropRequirements: { [key: string]: { temp: [number, number], humidity: [number, number] } } = {
    "Rice": { temp: [25, 35], humidity: [70, 90] },
    "Wheat": { temp: [15, 25], humidity: [50, 70] },
    "Cotton": { temp: [25, 35], humidity: [50, 70] },
    "Sugarcane": { temp: [25, 35], humidity: [70, 90] },
    "Soybean": { temp: [20, 30], humidity: [60, 80] },
    "Maize": { temp: [20, 30], humidity: [60, 80] }
  };
  
  const requirements = cropRequirements[crop];
  if (!requirements) return score;
  
  // Temperature suitability
  if (weather.temperature >= requirements.temp[0] && weather.temperature <= requirements.temp[1]) {
    score += 0.3;
  } else {
    const tempDeviation = Math.min(
      Math.abs(weather.temperature - requirements.temp[0]),
      Math.abs(weather.temperature - requirements.temp[1])
    );
    score += Math.max(0, 0.3 - (tempDeviation * 0.02));
  }
  
  // Humidity suitability
  if (weather.humidity >= requirements.humidity[0] && weather.humidity <= requirements.humidity[1]) {
    score += 0.2;
  } else {
    const humidityDeviation = Math.min(
      Math.abs(weather.humidity - requirements.humidity[0]),
      Math.abs(weather.humidity - requirements.humidity[1])
    );
    score += Math.max(0, 0.2 - (humidityDeviation * 0.005));
  }
  
  return Math.min(1.0, Math.max(0.0, score));
}
