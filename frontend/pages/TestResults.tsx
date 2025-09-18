import React from 'react';

// Simple test component to verify ResultsPage functionality
export function TestResults() {
  const testData = {
    model_version: "test_v1.0",
    timestamp: new Date().toISOString(),
    recommendations: [
      {
        crop: "Rice",
        score: 0.85,
        predicted_yield_kg_per_ha: 4500,
        estimated_profit_inr: 45000,
        sustainability_score: 0.7,
        confidence: 0.8,
        risk_level: "Low",
        season_suitability: "Kharif",
        water_requirement: "High",
        market_demand: "High"
      }
    ],
    explanation: "Test recommendation based on test data",
    shap_top_features: [
      { feature: "temperature", impact: 0.3 },
      { feature: "ph", impact: 0.25 }
    ]
  };

  const handleTestNavigation = () => {
    // Store test data and navigate to results
    sessionStorage.setItem('cropRecommendations', JSON.stringify(testData));
    window.location.href = '/results';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Test Results Page</h1>
        <p className="text-gray-600 mb-6">
          This will store test data in sessionStorage and navigate to the results page.
        </p>
        <button 
          onClick={handleTestNavigation}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Test Results Page
        </button>
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <strong>Current sessionStorage:</strong>
          <pre className="mt-2 text-xs overflow-auto">
            {sessionStorage.getItem('cropRecommendations') || 'No data'}
          </pre>
        </div>
      </div>
    </div>
  );
}
