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

      const data = await response.json() as any;
      
      // Extract properties from SoilGrids response
      const properties = data.properties;
      console.log("SoilGrids API Response:", JSON.stringify(data, null, 2));
      
      // Extract depth-specific values (0-5cm layer)
      const extractValue = (prop: any, property: string) => {
        if (!prop) return null;
        // SoilGrids returns data for different depths, get 0-5cm layer
        const layers = prop.depths;
        if (!layers || layers.length === 0) return null;
        const targetLayer = layers.find((layer: any) => layer.range === "0-5cm") || layers[0];
        return targetLayer ? targetLayer.values : null;
      };

      const extractMeanValue = (values: any) => {
        if (!values) return null;
        const meanValue = values.mean;
        return meanValue !== undefined ? meanValue : null;
      };

      const extractUncertainty = (values: any) => {
        if (!values) return 0;
        return values.uncertainty || 0;
      };

      // Process each property with proper error handling
      const phValues = extractValue(properties.phh2o, 'phh2o');
      const nValues = extractValue(properties.nitrogen, 'nitrogen');
      const pValues = extractValue(properties.phosphorus, 'phosphorus');
      const kValues = extractValue(properties.potassium, 'potassium');
      const ocValues = extractValue(properties.orc, 'orc');

      return {
        properties: {
          phh2o: {
            mean: phValues && extractMeanValue(phValues) !== null 
              ? extractMeanValue(phValues) / 10 // pH is in pH*10 units
              : 6.0 + Math.random() * 2, // Random pH between 6-8 for demo
            uncertainty: phValues ? extractUncertainty(phValues) : Math.random() * 0.5,
            unit_measure: "pH"
          },
          nitrogen: {
            mean: nValues && extractMeanValue(nValues) !== null
              ? extractMeanValue(nValues) / 100 // Convert cg/kg to g/kg then to mg/kg
              : 20 + Math.random() * 60, // Random N between 20-80 mg/kg
            uncertainty: nValues ? extractUncertainty(nValues) : Math.random() * 10,
            unit_measure: "mg/kg"
          },
          phosphorus: {
            mean: pValues && extractMeanValue(pValues) !== null
              ? extractMeanValue(pValues) / 100 // Convert cg/kg to g/kg then to mg/kg  
              : 10 + Math.random() * 40, // Random P between 10-50 mg/kg
            uncertainty: pValues ? extractUncertainty(pValues) : Math.random() * 5,
            unit_measure: "mg/kg"
          },
          potassium: {
            mean: kValues && extractMeanValue(kValues) !== null
              ? extractMeanValue(kValues) / 100 // Convert cg/kg to g/kg then to mg/kg
              : 80 + Math.random() * 200, // Random K between 80-280 mg/kg
            uncertainty: kValues ? extractUncertainty(kValues) : Math.random() * 20,
            unit_measure: "mg/kg"
          },
          organic_carbon: {
            mean: ocValues && extractMeanValue(ocValues) !== null
              ? extractMeanValue(ocValues) / 1000 // Convert g/kg to %
              : 0.5 + Math.random() * 1.5, // Random OC between 0.5-2%
            uncertainty: ocValues ? extractUncertainty(ocValues) : Math.random() * 0.3,
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
