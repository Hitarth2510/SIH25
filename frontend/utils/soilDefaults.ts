export interface SoilDefaults {
  ph: number;
  moisture: number;
  N: number;
  P: number;
  K: number;
  organic_carbon: number;
}

// Enhanced soil lookup with realistic Indian soil data
const soilLookup: Record<string, SoilDefaults> = {
  "Sandy": { 
    ph: 6.2, 
    moisture: 25, 
    N: 180, 
    P: 12, 
    K: 110, 
    organic_carbon: 0.4 
  },
  "Loamy": { 
    ph: 6.8, 
    moisture: 40, 
    N: 280, 
    P: 22, 
    K: 180, 
    organic_carbon: 0.8 
  },
  "Clayey": { 
    ph: 7.1, 
    moisture: 65, 
    N: 320, 
    P: 28, 
    K: 220, 
    organic_carbon: 1.0 
  },
  "Silty": { 
    ph: 6.6, 
    moisture: 50, 
    N: 240, 
    P: 18, 
    K: 160, 
    organic_carbon: 0.7 
  },
  "Peaty": { 
    ph: 5.8, 
    moisture: 75, 
    N: 450, 
    P: 35, 
    K: 140, 
    organic_carbon: 2.2 
  },
  "Black": { 
    ph: 7.8, 
    moisture: 55, 
    N: 380, 
    P: 25, 
    K: 420, 
    organic_carbon: 1.2 
  },
  "Red": { 
    ph: 6.4, 
    moisture: 35, 
    N: 200, 
    P: 15, 
    K: 120, 
    organic_carbon: 0.5 
  },
  "Alluvial": { 
    ph: 7.2, 
    moisture: 45, 
    N: 350, 
    P: 30, 
    K: 280, 
    organic_carbon: 1.1 
  }
};

export function getSoilDefaults(soilType: string): SoilDefaults {
  return soilLookup[soilType] || soilLookup["Loamy"];
}

export function getSoilDescription(soilType: string): string {
  const descriptions: Record<string, string> = {
    "Sandy": "Well-draining soil with low water retention. Good for root crops and early season planting.",
    "Loamy": "Ideal agricultural soil with balanced drainage and nutrients. Suitable for most crops.",
    "Clayey": "High water and nutrient retention. Excellent for rice and water-intensive crops.",
    "Silty": "Fine-textured soil with good fertility and moderate drainage. Good for cereals.",
    "Peaty": "High organic matter content with excellent water retention. Suitable for specialty crops.",
    "Black": "Rich cotton soil with high clay content and excellent nutrient holding capacity.",
    "Red": "Well-drained soil formed from crystalline rocks. Good for millets and drought-resistant crops.",
    "Alluvial": "Fertile riverine soil with excellent nutrients. Ideal for intensive agriculture."
  };
  
  return descriptions[soilType] || descriptions["Loamy"];
}
