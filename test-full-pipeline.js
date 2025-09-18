const fetch = require('node-fetch');

async function testFullPipeline() {
    // Test data with different conditions to verify diverse results
    const testCases = [
        {
            name: "High pH, Low Rainfall (Desert-like)",
            data: {
                userId: "test1",
                location: { lat: 28.6139, lon: 77.2090 },
                soil_type: "Sandy",
                area_acres: 5,
                soil_values: {
                    N: 20,
                    P: 10,
                    K: 60,
                    ph: 8.2,
                    organic_carbon: 0.3
                }
            }
        },
        {
            name: "Optimal Rice Conditions",
            data: {
                userId: "test2", 
                location: { lat: 22.5726, lon: 88.3639 },
                soil_type: "Clayey",
                area_acres: 3,
                soil_values: {
                    N: 80,
                    P: 40,
                    K: 40,
                    ph: 6.0,
                    organic_carbon: 1.2
                }
            }
        },
        {
            name: "Wheat Growing Conditions",
            data: {
                userId: "test3",
                location: { lat: 30.7333, lon: 76.7794 },
                soil_type: "Loamy", 
                area_acres: 10,
                soil_values: {
                    N: 120,
                    P: 60,
                    K: 80,
                    ph: 7.2,
                    organic_carbon: 0.8
                }
            }
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n=== Testing: ${testCase.name} ===`);
        
        try {
            const response = await fetch('http://localhost:4000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testCase.data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend Error:', response.status, errorText);
                continue;
            }

            const result = await response.json();
            
            console.log('Top 3 Recommendations:');
            result.recommendations.slice(0, 3).forEach((rec, i) => {
                console.log(`${i+1}. ${rec.crop} - Score: ${rec.score}, Yield: ${rec.predicted_yield_kg_per_ha} kg/ha, Profit: ₹${rec.estimated_profit_inr}`);
            });
            
            console.log(`Model Version: ${result.model_version}`);
            console.log(`Explanation: ${result.explanation.substring(0, 100)}...`);
            
        } catch (error) {
            console.error(`Test failed for ${testCase.name}:`, error.message);
        }
    }
}

testFullPipeline();
