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

export async function getMarketPrices(): Promise<MarketPrices> {
  try {
    // In production, this would integrate with real market APIs like:
    // - Agmarknet API
    // - FPO marketplace APIs
    // - Commodity exchange APIs
    
    // Realistic Indian market prices (INR per quintal) as of 2024
    const marketPrices = {
      "Rice": 2850 + Math.random() * 300, // ₹2850-3150
      "Wheat": 2200 + Math.random() * 250, // ₹2200-2450
      "Maize": 1800 + Math.random() * 200, // ₹1800-2000
      "Cotton": 6500 + Math.random() * 500, // ₹6500-7000 (per quintal of lint)
      "Sugarcane": 350 + Math.random() * 50, // ₹350-400 (per quintal)
      "Soybean": 4200 + Math.random() * 400, // ₹4200-4600
      "Groundnut": 5500 + Math.random() * 500, // ₹5500-6000
      "Sunflower": 6800 + Math.random() * 400, // ₹6800-7200
      "Chickpea": 5200 + Math.random() * 600, // ₹5200-5800
      "Pigeon Pea": 6500 + Math.random() * 500, // ₹6500-7000
      "Mustard": 5800 + Math.random() * 400, // ₹5800-6200
      "Barley": 1650 + Math.random() * 150 // ₹1650-1800
    };

    // Round to nearest 10
    Object.keys(marketPrices).forEach(crop => {
      marketPrices[crop] = Math.round(marketPrices[crop] / 10) * 10;
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
  const trends = {};
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
