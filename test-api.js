// Simple test script to verify API endpoints
const testData = {
  userId: "test_user",
  location: {
    lat: 22.57,
    lon: 88.36
  },
  soil_type: "Loamy",
  area_ha: 1.5,
  farming_method: "conventional",
  irrigation_type: "rainfed",
  previous_crops: ["Wheat"],
  experience_years: 5,
  budget_category: "medium",
  preferred_crops: ["Rice"],
  soil_values: {
    N: 30,
    P: 15,
    K: 80,
    ph: 6.5,
    moisture: 40,
    organic_carbon: 0.8
  }
};

async function testAPI() {
  try {
    console.log('Testing /api/recommend endpoint...');
    const response = await fetch('http://localhost:4000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API test successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ API test failed with status:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.log('❌ API test failed with error:', error.message);
  }
}

testAPI();
