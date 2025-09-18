import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
import json

class CropPredictor:
    def __init__(self):
        # Crop suitability database based on Indian agricultural data
        self.crop_requirements = {
            'Rice': {
                'temp_range': (20, 35), 'ph_range': (5.5, 7.0), 'rainfall_min': 100,
                'N_min': 40, 'P_min': 20, 'K_min': 20, 'seasons': ['Kharif'],
                'soil_types': ['Clayey', 'Loamy', 'Alluvial'], 'water_req': 'High'
            },
            'Wheat': {
                'temp_range': (15, 25), 'ph_range': (6.0, 7.5), 'rainfall_min': 50,
                'N_min': 80, 'P_min': 25, 'K_min': 30, 'seasons': ['Rabi'],
                'soil_types': ['Loamy', 'Clayey', 'Alluvial'], 'water_req': 'Medium'
            },
            'Maize': {
                'temp_range': (21, 27), 'ph_range': (5.8, 7.0), 'rainfall_min': 60,
                'N_min': 120, 'P_min': 60, 'K_min': 40, 'seasons': ['Kharif', 'Rabi'],
                'soil_types': ['Loamy', 'Sandy', 'Alluvial'], 'water_req': 'Medium'
            },
            'Cotton': {
                'temp_range': (21, 30), 'ph_range': (5.8, 8.0), 'rainfall_min': 50,
                'N_min': 60, 'P_min': 30, 'K_min': 30, 'seasons': ['Kharif'],
                'soil_types': ['Black', 'Alluvial', 'Red'], 'water_req': 'Medium'
            },
            'Sugarcane': {
                'temp_range': (21, 27), 'ph_range': (6.5, 7.5), 'rainfall_min': 75,
                'N_min': 200, 'P_min': 80, 'K_min': 100, 'seasons': ['Year-round'],
                'soil_types': ['Loamy', 'Clayey', 'Alluvial'], 'water_req': 'Very High'
            },
            'Soybean': {
                'temp_range': (20, 30), 'ph_range': (6.0, 7.0), 'rainfall_min': 45,
                'N_min': 20, 'P_min': 60, 'K_min': 70, 'seasons': ['Kharif'],
                'soil_types': ['Black', 'Red', 'Loamy'], 'water_req': 'Medium'
            },
            'Groundnut': {
                'temp_range': (20, 30), 'ph_range': (6.0, 7.0), 'rainfall_min': 50,
                'N_min': 25, 'P_min': 50, 'K_min': 75, 'seasons': ['Kharif', 'Rabi'],
                'soil_types': ['Sandy', 'Red', 'Black'], 'water_req': 'Low'
            },
            'Sunflower': {
                'temp_range': (20, 25), 'ph_range': (6.0, 7.2), 'rainfall_min': 50,
                'N_min': 60, 'P_min': 30, 'K_min': 40, 'seasons': ['Kharif', 'Rabi'],
                'soil_types': ['Black', 'Red', 'Alluvial'], 'water_req': 'Medium'
            },
            'Chickpea': {
                'temp_range': (20, 30), 'ph_range': (6.2, 7.8), 'rainfall_min': 40,
                'N_min': 20, 'P_min': 40, 'K_min': 30, 'seasons': ['Rabi'],
                'soil_types': ['Black', 'Loamy', 'Sandy'], 'water_req': 'Low'
            },
            'Mustard': {
                'temp_range': (15, 25), 'ph_range': (6.0, 7.5), 'rainfall_min': 25,
                'N_min': 60, 'P_min': 40, 'K_min': 30, 'seasons': ['Rabi'],
                'soil_types': ['Loamy', 'Sandy', 'Alluvial'], 'water_req': 'Low'
            },
            'Barley': {
                'temp_range': (12, 22), 'ph_range': (6.0, 7.8), 'rainfall_min': 30,
                'N_min': 50, 'P_min': 25, 'K_min': 25, 'seasons': ['Rabi'],
                'soil_types': ['Loamy', 'Sandy', 'Clayey'], 'water_req': 'Low'
            },
            'Pigeon Pea': {
                'temp_range': (20, 30), 'ph_range': (6.0, 7.5), 'rainfall_min': 60,
                'N_min': 25, 'P_min': 50, 'K_min': 40, 'seasons': ['Kharif'],
                'soil_types': ['Black', 'Red', 'Loamy'], 'water_req': 'Medium'
            }
        }
        
        # Market prices (INR per quintal) - realistic Indian prices
        self.market_prices = {
            'Rice': 2100, 'Wheat': 2000, 'Maize': 1800, 'Cotton': 5500,
            'Sugarcane': 350, 'Soybean': 4200, 'Groundnut': 5000, 'Sunflower': 6000,
            'Chickpea': 5200, 'Mustard': 4800, 'Barley': 1700, 'Pigeon Pea': 6500
        }
        
        # Average yields (kg/ha) under good conditions
        self.base_yields = {
            'Rice': 4000, 'Wheat': 3200, 'Maize': 5500, 'Cotton': 500,
            'Sugarcane': 70000, 'Soybean': 1200, 'Groundnut': 1500, 'Sunflower': 1200,
            'Chickpea': 1000, 'Mustard': 1200, 'Barley': 2500, 'Pigeon Pea': 800
        }

    def calculate_suitability_score(self, crop: str, features: Dict) -> float:
        """Calculate how suitable a crop is for given conditions"""
        req = self.crop_requirements[crop]
        score = 1.0
        
        # Temperature suitability
        temp = features.get('temperature', 25)
        temp_min, temp_max = req['temp_range']
        if temp_min <= temp <= temp_max:
            temp_score = 1.0
        else:
            temp_score = max(0, 1 - abs(temp - (temp_min + temp_max)/2) / 10)
        score *= temp_score
        
        # pH suitability
        ph = features.get('ph', 6.5)
        ph_min, ph_max = req['ph_range']
        if ph_min <= ph <= ph_max:
            ph_score = 1.0
        else:
            ph_score = max(0, 1 - abs(ph - (ph_min + ph_max)/2) / 2)
        score *= ph_score
        
        # Rainfall suitability
        rainfall = features.get('rainfall', 50)
        if rainfall >= req['rainfall_min']:
            rain_score = min(1.0, rainfall / req['rainfall_min'])
        else:
            rain_score = rainfall / req['rainfall_min']
        score *= rain_score
        
        # Nutrient suitability
        N = features.get('N', 30)
        P = features.get('P', 15)
        K = features.get('K', 80)
        
        nutrient_score = (
            min(1.0, N / req['N_min']) * 0.4 +
            min(1.0, P / req['P_min']) * 0.3 +
            min(1.0, K / req['K_min']) * 0.3
        )
        score *= nutrient_score
        
        # Soil type bonus
        soil_type = features.get('soil_type', 'Loamy')
        if soil_type in req['soil_types']:
            score *= 1.2
        
        return min(1.0, score)

    def predict_yield(self, crop: str, features: Dict, suitability: float) -> int:
        """Predict crop yield based on conditions"""
        base_yield = self.base_yields[crop]
        
        # Yield factors
        factors = []
        
        # Temperature factor
        temp = features.get('temperature', 25)
        req = self.crop_requirements[crop]
        temp_optimal = (req['temp_range'][0] + req['temp_range'][1]) / 2
        temp_factor = 1 - abs(temp - temp_optimal) / 15
        factors.append(max(0.5, temp_factor))
        
        # Nutrient factor
        N = features.get('N', 30)
        P = features.get('P', 15) 
        K = features.get('K', 80)
        nutrient_factor = (
            min(1.5, N / req['N_min']) * 0.4 +
            min(1.5, P / req['P_min']) * 0.3 +
            min(1.5, K / req['K_min']) * 0.3
        )
        factors.append(nutrient_factor)
        
        # Rainfall factor
        rainfall = features.get('rainfall', 50)
        rain_factor = min(1.3, rainfall / req['rainfall_min'])
        factors.append(rain_factor)
        
        # Area efficiency (smaller farms often have higher yields per hectare)
        area = features.get('area_ha', 1)
        area_factor = 1.1 if area < 2 else (1.05 if area < 5 else 1.0)
        factors.append(area_factor)
        
        # Experience factor
        experience = features.get('experience_years', 5)
        exp_factor = min(1.2, 0.8 + experience * 0.08)
        factors.append(exp_factor)
        
        # Calculate final yield
        yield_multiplier = np.mean(factors) * suitability
        predicted_yield = int(base_yield * yield_multiplier)
        
        return max(int(base_yield * 0.3), predicted_yield)  # Minimum 30% of base yield

    def calculate_profit(self, crop: str, yield_kg_ha: int, area_ha: float) -> int:
        """Calculate estimated profit"""
        price_per_kg = self.market_prices[crop] / 100  # Convert quintal to kg price
        revenue = yield_kg_ha * area_ha * price_per_kg
        
        # Estimate costs (simplified)
        cost_factors = {
            'Rice': 0.6, 'Wheat': 0.5, 'Maize': 0.55, 'Cotton': 0.7,
            'Sugarcane': 0.65, 'Soybean': 0.5, 'Groundnut': 0.6,
            'Sunflower': 0.55, 'Chickpea': 0.45, 'Mustard': 0.4,
            'Barley': 0.4, 'Pigeon Pea': 0.5
        }
        
        cost = revenue * cost_factors.get(crop, 0.5)
        profit = revenue - cost
        
        return int(profit)

    def get_risk_level(self, suitability: float, crop: str, features: Dict) -> str:
        """Determine risk level"""
        if suitability > 0.8:
            return "Low"
        elif suitability > 0.6:
            return "Medium" 
        else:
            return "High"

    def get_season_suitability(self, crop: str) -> str:
        """Get appropriate season for crop"""
        seasons = self.crop_requirements[crop]['seasons']
        current_month = pd.Timestamp.now().month
        
        if current_month in [6, 7, 8, 9, 10]:  # Kharif season
            return seasons[0] if 'Kharif' in seasons else seasons[0]
        elif current_month in [11, 12, 1, 2, 3]:  # Rabi season
            return 'Rabi' if 'Rabi' in seasons else seasons[0]
        else:
            return seasons[0]

    def predict_crops(self, features: Dict) -> List[Dict]:
        """Main prediction function"""
        results = []
        print(f"DEBUG: Input features: {features}")
        
        for crop in self.crop_requirements.keys():
            suitability = self.calculate_suitability_score(crop, features)
            print(f"DEBUG: {crop} suitability: {suitability:.3f}")
            
            if suitability > 0.1:  # Include more crops with lower threshold
                yield_kg_ha = self.predict_yield(crop, features, suitability)
                area_ha = features.get('area_ha', 1)
                profit = self.calculate_profit(crop, yield_kg_ha, area_ha)
                
                # Calculate sustainability score (simplified)
                water_req = self.crop_requirements[crop]['water_req']
                sustainability = 0.9 if water_req == 'Low' else (0.7 if water_req == 'Medium' else 0.5)
                
                result = {
                    'crop': crop,
                    'score': round(suitability, 3),
                    'predicted_yield_kg_per_ha': yield_kg_ha,
                    'estimated_profit_inr': profit,
                    'sustainability_score': sustainability,
                    'confidence': round(min(0.95, suitability + 0.1), 2),
                    'risk_level': self.get_risk_level(suitability, crop, features),
                    'season_suitability': self.get_season_suitability(crop),
                    'water_requirement': self.crop_requirements[crop]['water_req'],
                    'market_demand': 'High' if crop in ['Rice', 'Wheat', 'Cotton'] else 'Medium'
                }
                results.append(result)
        
        # Sort by suitability score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:5]  # Return top 5 recommendations

    def get_feature_importance(self, crop: str, features: Dict) -> List[Dict]:
        """Dynamically calculate feature importance for the given crop and features."""
        req = self.crop_requirements[crop]
        importance = {}

        # Temperature impact
        temp = features.get('temperature', 25)
        temp_min, temp_max = req['temp_range']
        temp_optimal = (temp_min + temp_max) / 2
        importance['temperature'] = max(0, 1 - abs(temp - temp_optimal) / 15) # Closer to optimal is better

        # pH impact
        ph = features.get('ph', 6.5)
        ph_min, ph_max = req['ph_range']
        ph_optimal = (ph_min + ph_max) / 2
        importance['ph'] = max(0, 1 - abs(ph - ph_optimal) / 2)

        # Rainfall impact
        rainfall = features.get('rainfall', 50)
        importance['rainfall'] = min(1.0, rainfall / req['rainfall_min'])

        # Nutrient impacts (N, P, K)
        N = features.get('N', 30)
        P = features.get('P', 15)
        K = features.get('K', 80)
        importance['nitrogen (N)'] = min(1.0, N / req['N_min'])
        importance['phosphorus (P)'] = min(1.0, P / req['P_min'])
        importance['potassium (K)'] = min(1.0, K / req['K_min'])
        
        # Soil type impact (bonus)
        soil_type = features.get('soil_type', 'Loamy')
        importance['soil type'] = 1.2 if soil_type in req['soil_types'] else 0.8

        # Normalize impacts to sum to 1 (or close to it for interpretation)
        total_impact = sum(importance.values())
        normalized_importance = [{'feature': k, 'impact': round(v / total_impact, 2)} for k, v in importance.items()]
        
        # Sort by impact and return top 5
        normalized_importance.sort(key=lambda x: x['impact'], reverse=True)
        return normalized_importance[:5]

    def generate_explanation(self, top_crop: str, features: Dict) -> str:
        """Generate human-readable explanation"""
        temp = features.get('temperature', 25)
        ph = features.get('ph', 6.5)
        rainfall = features.get('rainfall', 50)
        soil_type = features.get('soil_type', 'Loamy')
        
        explanation = f"Based on your location's conditions - temperature of {temp:.1f}°C, soil pH of {ph:.1f}, "
        explanation += f"rainfall of {rainfall:.0f}mm, and {soil_type} soil - {top_crop} is the most suitable crop. "
        explanation += f"This crop thrives in your current environmental conditions and soil nutrient levels."
        
        return explanation
