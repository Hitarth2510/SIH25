import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"

def test_predict_endpoint():
    """Test the prediction endpoint"""
    test_request = {
        "location": {
            "lat": 22.5726,
            "lon": 88.3639,
            "state": "West Bengal"
        },
        "features": {
            "N": 40,
            "P": 20,
            "K": 120,
            "ph": 6.8,
            "temperature": 28,
            "humidity": 75,
            "rainfall": 80,
            "soil_type": "Loamy",
            "area_ha": 2.5,
            "moisture": 40
        },
        "market_snapshot": {
            "Rice": 2000,
            "Wheat": 1800,
            "Maize": 1500
        }
    }
    
    response = client.post("/predict", json=test_request)
    assert response.status_code == 200
    
    data = response.json()
    assert "recommendations" in data
    assert "model_version" in data
    assert "timestamp" in data
    assert "explanation" in data
    assert "shap_top_features" in data
    
    # Check recommendations structure
    assert len(data["recommendations"]) == 3
    for rec in data["recommendations"]:
        assert "crop" in rec
        assert "score" in rec
        assert "predicted_yield_kg_per_ha" in rec
        assert "estimated_profit_inr" in rec
        assert "sustainability_score" in rec
        assert "confidence" in rec

def test_predict_validation():
    """Test input validation"""
    # Test with missing required field
    invalid_request = {
        "location": {
            "lat": 22.5726,
            "lon": 88.3639
        },
        "features": {
            "N": 40,
            "P": 20
            # Missing required fields
        }
    }
    
    response = client.post("/predict", json=invalid_request)
    assert response.status_code == 422  # Validation error

def test_soil_type_validation():
    """Test different soil types"""
    soil_types = ["Sandy", "Loamy", "Clayey", "Silty", "Peaty", "Black", "Red", "Alluvial"]
    
    for soil_type in soil_types:
        test_request = {
            "location": {"lat": 22.5726, "lon": 88.3639},
            "features": {
                "N": 40, "P": 20, "K": 120, "ph": 6.8,
                "temperature": 28, "humidity": 75, "rainfall": 80,
                "soil_type": soil_type, "area_ha": 2.5, "moisture": 40
            },
            "market_snapshot": {"Rice": 2000}
        }
        
        response = client.post("/predict", json=test_request)
        assert response.status_code == 200
        data = response.json()
        assert len(data["recommendations"]) == 3
