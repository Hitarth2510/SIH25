import { api } from "encore.dev/api";

export interface SoilPropertiesRequest {
  lat: number;
  lon: number;
}

export interface SoilPropertiesResponse {
  properties: {
    phh2o: {
      mean: number;
      uncertainty: number;
      unit_measure: string;
    };
    nitrogen: {
      mean: number;
      uncertainty: number;
      unit_measure: string;
    };
    phosphorus: {
      mean: number;
      uncertainty: number;
      unit_measure: string;
    };
    potassium: {
      mean: number;
      uncertainty: number;
      unit_measure: string;
    };
    organic_carbon: {
      mean: number;
      uncertainty: number;
      unit_measure: string;
    };
  };
  location: {
    lat: number;
    lon: number;
  };
}

// Gets soil properties from SoilGrids API
export const getSoilProperties = api<SoilPropertiesRequest, SoilPropertiesResponse>(
  { expose: true, method: "GET", path: "/api/soil/properties" },
  async (req) => {
    try {
      // SoilGrids REST API endpoint
      const soilGridsUrl = `https://rest.soilgrids.org/soilgrids/v2.0/properties/query`;
      const params = new URLSearchParams({
        lon: req.lon.toString(),
        lat: req.lat.toString(),
        property: 'phh2o,nitrogen,phosphorus,potassium,orc',
        depth: '0-5cm',
        value: 'mean,uncertainty'
      });

      const response = await fetch(`${soilGridsUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error(`SoilGrids API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract properties from SoilGrids response
      const properties = data.properties;
      
      return {
        properties: {
          phh2o: {
            mean: properties.phh2o?.mapped_units === 'pH*10' 
              ? properties.phh2o.mean / 10 
              : properties.phh2o?.mean || 6.5,
            uncertainty: properties.phh2o?.uncertainty || 0,
            unit_measure: "pH"
          },
          nitrogen: {
            mean: properties.nitrogen?.mapped_units === 'kg/m3' 
              ? properties.nitrogen.mean * 100 // Convert to mg/kg
              : properties.nitrogen?.mean || 40,
            uncertainty: properties.nitrogen?.uncertainty || 0,
            unit_measure: "mg/kg"
          },
          phosphorus: {
            mean: properties.phosphorus?.mapped_units === 'kg/m3'
              ? properties.phosphorus.mean * 100 // Convert to mg/kg
              : properties.phosphorus?.mean || 20,
            uncertainty: properties.phosphorus?.uncertainty || 0,
            unit_measure: "mg/kg"
          },
          potassium: {
            mean: properties.potassium?.mapped_units === 'kg/m3'
              ? properties.potassium.mean * 100 // Convert to mg/kg
              : properties.potassium?.mean || 120,
            uncertainty: properties.potassium?.uncertainty || 0,
            unit_measure: "mg/kg"
          },
          organic_carbon: {
            mean: properties.orc?.mapped_units === 'g/kg'
              ? properties.orc.mean / 10 // Convert to %
              : properties.orc?.mean || 0.8,
            uncertainty: properties.orc?.uncertainty || 0,
            unit_measure: "%"
          }
        },
        location: {
          lat: req.lat,
          lon: req.lon
        }
      };
    } catch (error) {
      console.error("Failed to fetch soil properties:", error);
      
      // Return default values based on global averages
      return {
        properties: {
          phh2o: {
            mean: 6.5,
            uncertainty: 0.5,
            unit_measure: "pH"
          },
          nitrogen: {
            mean: 40,
            uncertainty: 10,
            unit_measure: "mg/kg"
          },
          phosphorus: {
            mean: 20,
            uncertainty: 5,
            unit_measure: "mg/kg"
          },
          potassium: {
            mean: 120,
            uncertainty: 20,
            unit_measure: "mg/kg"
          },
          organic_carbon: {
            mean: 0.8,
            uncertainty: 0.2,
            unit_measure: "%"
          }
        },
        location: {
          lat: req.lat,
          lon: req.lon
        }
      };
    }
  }
);
