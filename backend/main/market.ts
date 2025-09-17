export interface MarketPrices {
  [crop: string]: number;
}

export interface MarketData {
  prices: MarketPrices;
  msp: MarketPrices; // Minimum Support Price
  trends: {
    [crop: string]: {
      change_percent: number;
      trend: 'rising' | 'falling' | 'stable';
      demand_level: 'high' | 'medium' | 'low';
    };
  };
}

export async function getMarketPrices(state?: string): Promise<MarketPrices> {
  try {
    // Try to fetch from government AgMarkNet API (data.gov.in)
    const agmarknetPrices = await fetchAgmarknetPrices(state);
    if (agmarknetPrices) {
      return agmarknetPrices;
    }
    
    // Fallback to simulated realistic market prices with regional variations
    const baseRegionalMultiplier = getRegionalPriceMultiplier(state);
    const marketPrices = {
      "Rice": Math.round((2850 + Math.random() * 300) * baseRegionalMultiplier), 
      "Wheat": Math.round((2200 + Math.random() * 250) * baseRegionalMultiplier), 
      "Maize": Math.round((1800 + Math.random() * 200) * baseRegionalMultiplier), 
      "Cotton": Math.round((6500 + Math.random() * 500) * baseRegionalMultiplier), 
      "Sugarcane": Math.round((350 + Math.random() * 50) * baseRegionalMultiplier), 
      "Soybean": Math.round((4200 + Math.random() * 400) * baseRegionalMultiplier), 
      "Groundnut": Math.round((5500 + Math.random() * 500) * baseRegionalMultiplier), 
      "Sunflower": Math.round((6800 + Math.random() * 400) * baseRegionalMultiplier), 
      "Chickpea": Math.round((5200 + Math.random() * 600) * baseRegionalMultiplier), 
      "Pigeon Pea": Math.round((6500 + Math.random() * 500) * baseRegionalMultiplier), 
      "Mustard": Math.round((5800 + Math.random() * 400) * baseRegionalMultiplier), 
      "Barley": Math.round((1650 + Math.random() * 150) * baseRegionalMultiplier)
    };

    // Round to nearest 10
    Object.keys(marketPrices).forEach(crop => {
      marketPrices[crop as keyof typeof marketPrices] = Math.round(marketPrices[crop as keyof typeof marketPrices] / 10) * 10;
    });

    return marketPrices;
  } catch (error) {
    console.error("Failed to fetch market prices:", error);
    // Return MSP (Minimum Support Price) as fallback
    return {
      "Rice": 2040,
      "Wheat": 2125,
      "Maize": 1962,
      "Cotton": 6080,
      "Sugarcane": 315,
      "Soybean": 4300,
      "Groundnut": 5850,
      "Sunflower": 6760,
      "Chickpea": 5230,
      "Pigeon Pea": 6600,
      "Mustard": 5450,
      "Barley": 1735
    };
  }
}

async function fetchAgmarknetPrices(state?: string): Promise<MarketPrices | null> {
  try {
    // This is a placeholder for real AgMarkNet API integration
    // The actual API requires registration and has specific endpoints
    
    // Sample API call structure (commented out as it requires API key):
    /*
    const response = await fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', {
      method: 'GET',
      headers: {
        'api-key': process.env.AGMARKNET_API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return processAgmarknetData(data, state);
    }
    */
    
    return null; // Return null to fallback to simulated data
  } catch (error) {
    console.error("AgMarkNet API error:", error);
    return null;
  }
}

function getRegionalPriceMultiplier(state?: string): number {
  if (!state) return 1.0;
  
  // Regional price variations based on transportation costs and local demand
  const stateMultipliers: Record<string, number> = {
    "Punjab": 1.05,        // High productivity, good infrastructure
    "Haryana": 1.03,       // Good access to Delhi markets
    "Uttar Pradesh": 0.98,  // Large supply, varied infrastructure
    "Maharashtra": 1.02,    // Good industrial demand
    "Gujarat": 1.04,       // Export facilitation
    "Rajasthan": 0.96,     // Remote from major markets
    "Madhya Pradesh": 0.97, // Central location but infrastructure challenges
    "Tamil Nadu": 1.01,    // Port access
    "Karnataka": 1.00,     // Balanced supply-demand
    "Andhra Pradesh": 0.99, // Good production but transportation costs
    "Telangana": 1.01,     // Tech hub nearby
    "West Bengal": 0.95,   // High production, local consumption
    "Bihar": 0.93,         // Infrastructure challenges
    "Odisha": 0.94,        // Transport connectivity issues
    "Kerala": 1.08,        // High local demand, import dependency
    "Assam": 0.92,         // Remote markets
    "Jharkhand": 0.94,     // Industrial demand but poor connectivity
    "Chhattisgarh": 0.95   // Rice surplus state
  };
  
  return stateMultipliers[state] || 1.0;
}

export async function getMarketData(): Promise<MarketData> {
  const prices = await getMarketPrices();
  
  // MSP (Minimum Support Price) 2024-25
  const msp = {
    "Rice": 2300,
    "Wheat": 2275,
    "Maize": 2090,
    "Cotton": 7121,
    "Sugarcane": 340,
    "Soybean": 4600,
    "Groundnut": 6377,
    "Sunflower": 7287,
    "Chickpea": 5440,
    "Pigeon Pea": 7550,
    "Mustard": 5650,
    "Barley": 1890
  };

  // Generate realistic market trends
  const trends: Record<string, any> = {};
  Object.keys(prices).forEach(crop => {
    const changePercent = (Math.random() - 0.5) * 20; // -10% to +10%
    trends[crop] = {
      change_percent: Math.round(changePercent * 100) / 100,
      trend: changePercent > 2 ? 'rising' : changePercent < -2 ? 'falling' : 'stable',
      demand_level: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
    };
  });

  return {
    prices,
    msp,
    trends
  };
}
