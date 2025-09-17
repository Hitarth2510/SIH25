import { secret } from "encore.dev/config";

const weatherApiKey = secret("WeatherAPIKey");

export interface WeatherData {
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
}

export interface WeatherForecast {
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
}

export async function getTemperature(lat: number, lon: number): Promise<WeatherData> {
  try {
    const apiKey = weatherApiKey();
    if (!apiKey) {
      console.warn("WeatherAPIKey not configured, using location-based default values");
      return getLocationBasedWeatherData(lat, lon);
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      return getLocationBasedWeatherData(lat, lon);
    }
    
    const data = await response.json() as any;
    
    // Get UV index data
    let uvIndex = 5; // default
    try {
      const uvResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      if (uvResponse.ok) {
        const uvData = await uvResponse.json() as any;
        uvIndex = uvData.value || 5;
      }
    } catch (error) {
      console.warn("Failed to fetch UV index:", error);
    }
    
    return {
      temperature: data.main?.temp || 25,
      humidity: data.main?.humidity || 60,
      rainfall: data.rain?.["1h"] || data.rain?.["3h"] || 0,
      wind_speed: data.wind?.speed || 0,
      solar_radiation: calculateSolarRadiation(data.clouds?.all || 0),
      pressure: data.main?.pressure || 1013,
      description: data.weather?.[0]?.description || "Clear sky",
      feels_like: data.main?.feels_like || 25,
      uv_index: uvIndex,
      visibility: (data.visibility || 10000) / 1000, // Convert to km
      cloudiness: data.clouds?.all || 0
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return getLocationBasedWeatherData(lat, lon);
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
  try {
    const apiKey = weatherApiKey();
    if (!apiKey) {
      return getLocationBasedForecast(lat, lon);
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    
    if (!response.ok) {
      return getLocationBasedForecast(lat, lon);
    }
    
    const data = await response.json() as any;
    
    // Process 5-day forecast (data comes in 3-hour intervals)
    const dailyForecast = [];
    const processedDates = new Set();
    
    for (let i = 0; i < data.list.length; i += 8) { // Every 8th item is roughly next day
      const item = data.list[i];
      if (!item) continue;
      
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (processedDates.has(date)) continue;
      processedDates.add(date);
      
      // Find min/max temps for the day
      const dayItems = data.list.slice(i, i + 8);
      const temps = dayItems.map((d: any) => d.main.temp);
      const rainfalls = dayItems.map((d: any) => d.rain?.["3h"] || 0);
      const humidities = dayItems.map((d: any) => d.main.humidity);
      const windSpeeds = dayItems.map((d: any) => d.wind?.speed || 0);
      
      dailyForecast.push({
        date,
        temperature_max: Math.max(...temps),
        temperature_min: Math.min(...temps),
        rainfall: rainfalls.reduce((a: number, b: number) => a + b, 0),
        humidity: humidities.reduce((a: number, b: number) => a + b, 0) / humidities.length,
        wind_speed: windSpeeds.reduce((a: number, b: number) => a + b, 0) / windSpeeds.length,
        description: item.weather[0]?.description || "Clear sky",
        weather_icon: item.weather[0]?.icon || "01d"
      });
    }
    
    // Generate weather alerts and farming recommendations
    const { weatherAlerts, farmingRecommendations } = generateWeatherInsights(dailyForecast, lat, lon);
    
    return {
      daily_forecast: dailyForecast.slice(0, 7), // 7-day forecast
      seasonal_outlook: generateSeasonalOutlook(lat, lon),
      weather_alerts: weatherAlerts,
      farming_recommendations: farmingRecommendations
    };
  } catch (error) {
    console.error("Failed to fetch weather forecast:", error);
    return getLocationBasedForecast(lat, lon);
  }
}

function calculateSolarRadiation(cloudCover: number): number {
  // Estimate solar radiation based on cloud cover (MJ/m²/day)
  const maxRadiation = 25; // Clear sky radiation
  return maxRadiation * (1 - cloudCover / 100) * 0.7;
}

function generateSeasonalOutlook(lat: number, lon: number): string {
  const month = new Date().getMonth();
  
  // Determine region based on latitude
  const isNorthIndia = lat > 26;
  const isCentralIndia = lat >= 20 && lat <= 26;
  const isSouthIndia = lat < 20;
  
  if (month >= 2 && month <= 5) { // March-June
    if (isNorthIndia) {
      return "Summer season: Rising temperatures with hot and dry conditions. Wheat harvesting season. Prepare for summer crops like cotton and sugarcane.";
    } else if (isCentralIndia) {
      return "Pre-monsoon summer: Hot and dry weather expected. Good time for irrigation-dependent crops. Monitor heat stress in standing crops.";
    } else {
      return "Summer season: Warm and moderately dry conditions. Suitable for summer rice and sugarcane cultivation with adequate irrigation.";
    }
  } else if (month >= 6 && month <= 9) { // July-October
    if (isNorthIndia) {
      return "Monsoon season: Heavy rainfall expected. Excellent for kharif crops like rice, maize, and cotton. Monitor for waterlogging.";
    } else if (isCentralIndia) {
      return "Southwest monsoon: Good rainfall for kharif crops. Ideal for soybean, cotton, and sugarcane planting. Watch for pest outbreaks.";
    } else {
      return "Monsoon season: Consistent rainfall with high humidity. Perfect for rice cultivation and other water-intensive crops.";
    }
  } else { // November-February
    if (isNorthIndia) {
      return "Winter season: Cool and dry conditions. Ideal for rabi crops like wheat, mustard, and chickpea. Risk of frost in January.";
    } else if (isCentralIndia) {
      return "Post-monsoon winter: Pleasant weather for rabi crops. Good for wheat, gram, and vegetable cultivation.";
    } else {
      return "Northeast monsoon/Winter: Mild weather with occasional showers. Suitable for rabi crops and winter vegetables.";
    }
  }
}

function generateWeatherInsights(forecast: any[], lat: number, lon: number) {
  const weatherAlerts: string[] = [];
  const farmingRecommendations: string[] = [];
  
  // Analyze forecast for alerts
  forecast.forEach((day, index) => {
    // Temperature alerts
    if (day.temperature_max > 40) {
      weatherAlerts.push(`Heat wave warning for ${day.date}: Temperature may reach ${day.temperature_max.toFixed(1)}°C`);
      farmingRecommendations.push("Increase irrigation frequency during hot weather and provide shade for livestock");
    }
    
    if (day.temperature_min < 5) {
      weatherAlerts.push(`Cold wave alert for ${day.date}: Minimum temperature may drop to ${day.temperature_min.toFixed(1)}°C`);
      farmingRecommendations.push("Protect sensitive crops from frost and cold damage");
    }
    
    // Rainfall alerts
    if (day.rainfall > 50) {
      weatherAlerts.push(`Heavy rainfall expected on ${day.date}: ${day.rainfall.toFixed(1)}mm precipitation`);
      farmingRecommendations.push("Ensure proper drainage and delay pesticide application during heavy rains");
    }
    
    if (index < 3 && day.rainfall < 1) {
      farmingRecommendations.push("Dry spell expected - monitor soil moisture and plan irrigation accordingly");
    }
    
    // Wind alerts
    if (day.wind_speed > 25) {
      weatherAlerts.push(`Strong winds expected on ${day.date}: ${day.wind_speed.toFixed(1)} km/h`);
      farmingRecommendations.push("Secure farm structures and avoid spraying operations during windy conditions");
    }
  });
  
  // Seasonal recommendations based on location
  const month = new Date().getMonth();
  if (month >= 6 && month <= 9) { // Monsoon
    farmingRecommendations.push("Monitor for fungal diseases due to high humidity and rainfall");
    farmingRecommendations.push("Ensure good drainage to prevent waterlogging in fields");
  } else if (month >= 3 && month <= 5) { // Summer
    farmingRecommendations.push("Focus on water conservation and efficient irrigation methods");
    farmingRecommendations.push("Consider heat-resistant crop varieties for summer planting");
  } else { // Winter
    farmingRecommendations.push("Utilize favorable weather for rabi crop cultivation");
    farmingRecommendations.push("Monitor for frost conditions that may damage sensitive crops");
  }
  
  return { weatherAlerts, farmingRecommendations };
}

function getLocationBasedWeatherData(lat: number, lon: number): WeatherData {
  const month = new Date().getMonth();
  
  // Determine region and season
  const isNorthIndia = lat > 26;
  const isCentralIndia = lat >= 20 && lat <= 26;
  const isSouthIndia = lat < 20;
  
  let baseTemp = 25;
  let baseHumidity = 60;
  let baseRainfall = 20;
  
  // Adjust based on region
  if (isNorthIndia) {
    if (month >= 3 && month <= 5) { // Summer
      baseTemp = 35; baseHumidity = 45; baseRainfall = 10;
    } else if (month >= 6 && month <= 9) { // Monsoon
      baseTemp = 28; baseHumidity = 80; baseRainfall = 150;
    } else { // Winter
      baseTemp = 18; baseHumidity = 60; baseRainfall = 5;
    }
  } else if (isCentralIndia) {
    if (month >= 3 && month <= 5) { // Summer
      baseTemp = 38; baseHumidity = 40; baseRainfall = 15;
    } else if (month >= 6 && month <= 9) { // Monsoon
      baseTemp = 30; baseHumidity = 75; baseRainfall = 120;
    } else { // Winter
      baseTemp = 22; baseHumidity = 55; baseRainfall = 8;
    }
  } else { // South India
    if (month >= 3 && month <= 5) { // Summer
      baseTemp = 32; baseHumidity = 65; baseRainfall = 25;
    } else if (month >= 6 && month <= 9) { // Monsoon
      baseTemp = 28; baseHumidity = 85; baseRainfall = 180;
    } else { // Winter
      baseTemp = 25; baseHumidity = 70; baseRainfall = 40;
    }
  }
  
  return {
    temperature: baseTemp + (Math.random() - 0.5) * 4,
    humidity: baseHumidity + (Math.random() - 0.5) * 10,
    rainfall: Math.max(0, baseRainfall + (Math.random() - 0.5) * 20),
    wind_speed: 5 + Math.random() * 10,
    solar_radiation: 15 + Math.random() * 10,
    pressure: 1013 + (Math.random() - 0.5) * 20,
    description: getWeatherDescription(month),
    feels_like: baseTemp + (Math.random() - 0.5) * 3,
    uv_index: Math.min(11, Math.max(1, 6 + (Math.random() - 0.5) * 4)),
    visibility: 8 + Math.random() * 4,
    cloudiness: 30 + Math.random() * 40
  };
}

function getLocationBasedForecast(lat: number, lon: number): WeatherForecast {
  const today = new Date();
  const dailyForecast = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const weather = getLocationBasedWeatherData(lat, lon);
    
    dailyForecast.push({
      date: date.toISOString().split('T')[0],
      temperature_max: weather.temperature + Math.random() * 5,
      temperature_min: weather.temperature - 5 - Math.random() * 5,
      rainfall: Math.max(0, weather.rainfall + (Math.random() - 0.5) * 30),
      humidity: weather.humidity + (Math.random() - 0.5) * 15,
      wind_speed: weather.wind_speed,
      description: weather.description,
      weather_icon: "01d"
    });
  }
  
  const { weatherAlerts, farmingRecommendations } = generateWeatherInsights(dailyForecast, lat, lon);
  
  return {
    daily_forecast: dailyForecast,
    seasonal_outlook: generateSeasonalOutlook(lat, lon),
    weather_alerts: weatherAlerts,
    farming_recommendations: farmingRecommendations
  };
}

function getWeatherDescription(month: number): string {
  if (month >= 2 && month <= 5) {
    return "Hot and dry conditions";
  } else if (month >= 6 && month <= 9) {
    return "Monsoon with frequent showers";
  } else {
    return "Cool and pleasant weather";
  }
}
