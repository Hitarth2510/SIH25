const fetch = require('node-fetch');

async function testMLService() {
    const testData = {
        location: { lat: 28.6139, lon: 77.2090 },
        features: {
            N: 40,
            P: 20,
            K: 80,
            ph: 6.5,
            temperature: 25,
            humidity: 60,
            rainfall: 100,
            organic_carbon: 0.5,
            soil_type: "Loamy",
            area_ha: 2.0,
            farming_method: "Traditional",
            irrigation_type: "Canal",
            previous_crops: ["Wheat"],
            experience_years: 5,
            budget_category: "Medium",
            preferred_crops: ["Rice"]
        },
        market_snapshot: { rice: 2100, wheat: 2000 },
        weather_data: {
            temperature: 25,
            humidity: 60,
            rainfall: 100,
            wind_speed: 5,
            solar_radiation: 20,
            pressure: 1013
        },
        forecast_data: {
            daily_forecast: [],
            seasonal_outlook: "Normal"
        }
    };

    try {
        console.log('Testing ML service with data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:8001/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ML Service Error:', response.status, errorText);
            return;
        }

        const result = await response.json();
        console.log('ML Service Response:', JSON.stringify(result, null, 2));
        
        console.log('\nRecommendations:');
        result.recommendations.forEach((rec, i) => {
            console.log(`${i+1}. ${rec.crop} - Score: ${rec.score}, Yield: ${rec.predicted_yield_kg_per_ha} kg/ha`);
        });
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testMLService();
