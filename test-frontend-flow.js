// Test the complete frontend flow
const testData = {
  userId: "test_user",
  location: {
    lat: 22.57,
    lon: 88.36
  },
  soil_type: "Loamy",
  area_acres: 2.5,
  farming_method: "conventional",
  irrigation_type: "rainfed",
  previous_crops: [],
  experience_years: 5,
  budget_category: "medium",
  preferred_crops: [],
  soil_values: {
    N: 30,
    P: 15,
    K: 80,
    ph: 6.5,
    moisture: 40,
    organic_carbon: 0.8
  }
};

async function testRecommendationFlow() {
  try {
    console.log('Testing recommendation API...');
    
    const response = await fetch('http://localhost:4000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ API Response received');
    console.log('Model version:', result.model_version);
    console.log('Number of recommendations:', result.recommendations?.length || 0);
    
    if (result.recommendations && result.recommendations.length > 0) {
      console.log('Top recommendation:', result.recommendations[0].crop);
      console.log('Score:', result.recommendations[0].score);
    }
    
    // Test if the response structure matches what ResultsPage expects
    const requiredFields = ['model_version', 'timestamp', 'recommendations', 'explanation'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
    } else {
      console.log('✅ All required fields present');
    }
    
    // Test recommendations structure
    if (result.recommendations && result.recommendations.length > 0) {
      const rec = result.recommendations[0];
      const recFields = ['crop', 'score', 'predicted_yield_kg_per_ha', 'estimated_profit_inr', 'confidence'];
      const missingRecFields = recFields.filter(field => rec[field] === undefined);
      
      if (missingRecFields.length > 0) {
        console.log('❌ Missing recommendation fields:', missingRecFields);
      } else {
        console.log('✅ Recommendation structure is valid');
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

testRecommendationFlow();
