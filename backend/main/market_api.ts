import { api } from "encore.dev/api";
import { getMarketData, getMarketPrices, MarketData, MarketPrices } from "./market";

export interface MarketPricesRequest {
  state?: string;
  crops?: string[];
}

export interface MarketPricesResponse {
  prices: MarketPrices;
  timestamp: string;
  source: string;
  state?: string;
}

export interface MarketDataRequest {
  state?: string;
  include_trends?: boolean;
  include_forecast?: boolean;
}

export interface MarketDataResponse extends MarketData {
  timestamp: string;
  source: string;
  state?: string;
  forecast?: {
    [crop: string]: {
      next_week: number;
      next_month: number;
      seasonal_outlook: 'bullish' | 'bearish' | 'stable';
    };
  };
}

export interface NearbyMarketsRequest {
  lat: number;
  lon: number;
  radius_km?: number;
  crop?: string;
}

export interface MarketInfo {
  name: string;
  location: {
    lat: number;
    lon: number;
    district: string;
    state: string;
  };
  distance_km: number;
  current_prices: { [crop: string]: number };
  market_timing: string;
  contact_info?: string;
  facilities: string[];
}

export interface NearbyMarketsResponse {
  markets: MarketInfo[];
  total_found: number;
  search_radius_km: number;
}

// Get current market prices for specific crops and state
export const getCurrentMarketPrices = api<MarketPricesRequest, MarketPricesResponse>(
  { expose: true, method: "GET", path: "/api/market/prices" },
  async (req) => {
    try {
      const allPrices = await getMarketPrices(req.state);
      
      // Filter by requested crops if specified
      let filteredPrices = allPrices;
      if (req.crops && req.crops.length > 0) {
        filteredPrices = {};
        req.crops.forEach(crop => {
          if (allPrices[crop] !== undefined) {
            filteredPrices[crop] = allPrices[crop];
          }
        });
      }
      
      return {
        prices: filteredPrices,
        timestamp: new Date().toISOString(),
        source: "AgMarkNet + Regional Markets",
        state: req.state
      };
    } catch (error) {
      console.error("Failed to fetch market prices:", error);
      throw new Error("Market data unavailable");
    }
  }
);

// Get comprehensive market data including trends and forecasts
export const getComprehensiveMarketData = api<MarketDataRequest, MarketDataResponse>(
  { expose: true, method: "GET", path: "/api/market/data" },
  async (req) => {
    try {
      const marketData = await getMarketData();
      
      let forecast = undefined;
      if (req.include_forecast) {
        forecast = generateMarketForecast(marketData.prices, marketData.trends);
      }
      
      return {
        prices: marketData.prices,
        msp: marketData.msp,
        trends: marketData.trends,
        timestamp: new Date().toISOString(),
        source: "AgMarkNet + Regional Markets + Analytics",
        state: req.state,
        forecast
      };
    } catch (error) {
      console.error("Failed to fetch comprehensive market data:", error);
      throw new Error("Market data service unavailable");
    }
  }
);

// Find nearby markets for farmers to sell their produce
export const getNearbyMarkets = api<NearbyMarketsRequest, NearbyMarketsResponse>(
  { expose: true, method: "GET", path: "/api/market/nearby" },
  async (req) => {
    try {
      const radius = req.radius_km || 50; // Default 50km radius
      const markets = await findNearbyMarkets(req.lat, req.lon, radius, req.crop);
      
      return {
        markets,
        total_found: markets.length,
        search_radius_km: radius
      };
    } catch (error) {
      console.error("Failed to find nearby markets:", error);
      throw new Error("Market location service unavailable");
    }
  }
);

function generateMarketForecast(currentPrices: MarketPrices, trends: any): any {
  const forecast: any = {};
  
  Object.keys(currentPrices).forEach(crop => {
    const currentPrice = currentPrices[crop];
    const trend = trends[crop];
    
    // Simple forecast based on current trends
    const weeklyChange = trend.change_percent * 0.3; // Moderate weekly change
    const monthlyChange = trend.change_percent * 1.2; // Accumulated monthly change
    
    forecast[crop] = {
      next_week: Math.round(currentPrice * (1 + weeklyChange / 100)),
      next_month: Math.round(currentPrice * (1 + monthlyChange / 100)),
      seasonal_outlook: trend.trend === 'rising' ? 'bullish' : 
                       trend.trend === 'falling' ? 'bearish' : 'stable'
    };
  });
  
  return forecast;
}

async function findNearbyMarkets(lat: number, lon: number, radiusKm: number, crop?: string): Promise<MarketInfo[]> {
  // Sample market data for major agricultural markets in India
  const majorMarkets: MarketInfo[] = [
    {
      name: "Azadpur Mandi",
      location: { lat: 28.7041, lon: 77.2025, district: "North Delhi", state: "Delhi" },
      distance_km: 0,
      current_prices: await getMarketPrices("Delhi"),
      market_timing: "4:00 AM - 2:00 PM",
      contact_info: "+91-11-2766-5432",
      facilities: ["Cold Storage", "Weighing", "Banking", "Transportation"]
    },
    {
      name: "Lasalgaon Onion Market",
      location: { lat: 20.1500, lon: 74.2333, district: "Nashik", state: "Maharashtra" },
      distance_km: 0,
      current_prices: await getMarketPrices("Maharashtra"),
      market_timing: "6:00 AM - 4:00 PM",
      contact_info: "+91-253-2571234",
      facilities: ["Auction Hall", "Grading", "Storage", "Processing"]
    },
    {
      name: "Kota Grain Market",
      location: { lat: 25.2138, lon: 75.8648, district: "Kota", state: "Rajasthan" },
      distance_km: 0,
      current_prices: await getMarketPrices("Rajasthan"),
      market_timing: "7:00 AM - 5:00 PM",
      contact_info: "+91-744-2345678",
      facilities: ["Quality Testing", "Weighing", "Banking", "Transport Hub"]
    },
    {
      name: "Khargone Cotton Market",
      location: { lat: 21.8234, lon: 75.6102, district: "Khargone", state: "Madhya Pradesh" },
      distance_km: 0,
      current_prices: await getMarketPrices("Madhya Pradesh"),
      market_timing: "9:00 AM - 6:00 PM",
      contact_info: "+91-7282-234567",
      facilities: ["Cotton Grading", "Ginning", "Banking", "Warehouse"]
    },
    {
      name: "Guntur Red Chilli Market", 
      location: { lat: 16.3067, lon: 80.4365, district: "Guntur", state: "Andhra Pradesh" },
      distance_km: 0,
      current_prices: await getMarketPrices("Andhra Pradesh"),
      market_timing: "8:00 AM - 4:00 PM",
      contact_info: "+91-863-2345678",
      facilities: ["Spice Processing", "Quality Labs", "Export Facilitation", "Cold Storage"]
    }
  ];
  
  // Calculate distances and filter by radius
  const nearbyMarkets = majorMarkets
    .map(market => ({
      ...market,
      distance_km: calculateDistance(lat, lon, market.location.lat, market.location.lon)
    }))
    .filter(market => market.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
  
  return nearbyMarkets;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}