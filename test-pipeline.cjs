const fetch = require('node-fetch');

async function testPipeline() {
    const testData = {
        userId: "test1",
        location: { lat: 28.6139, lon: 77.2090 },
        soil_type: "Loamy",
        area_acres: 5,
        soil_values: {
            N: 40,
            P: 20,
            K: 80,
            ph: 6.5,
            organic_carbon: 0.8
        }
    };

    try {
        console.log('Testing backend API...');
        const response = await fetch('http://localhost:4000/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error:', response.status, errorText);
            return;
        }

        const result = await response.json();
        console.log('\nRecommendations:');
        result.recommendations.forEach((rec, i) => {
            console.log(`${i+1}. ${rec.crop} - Score: ${rec.score}`);
        });
        
        console.log(`\nModel: ${result.model_version}`);
        console.log(`Total crops: ${result.recommendations.length}`);
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testPipeline();
