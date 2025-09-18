import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SimpleResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('SimpleResults: Component mounted');
    
    try {
      const storedResults = sessionStorage.getItem('cropRecommendations');
      console.log('SimpleResults: Raw stored data:', storedResults);
      
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        console.log('SimpleResults: Parsed results:', parsedResults);
        setResults(parsedResults);
      } else {
        console.log('SimpleResults: No stored results found');
        setError('No recommendation data found');
        setTimeout(() => navigate('/input'), 3000);
      }
    } catch (err) {
      console.error('SimpleResults: Error:', err);
      setError(`Error loading results: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate('/input')}>Go Back to Form</button>
      </div>
    );
  }

  if (!results) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading...</h1>
        <p>Loading your recommendations...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Crop Recommendations</h1>
      <button onClick={() => navigate('/input')}>Back to Form</button>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Model: {results.model_version}</h2>
        <p>Generated: {results.timestamp}</p>
        
        {results.recommendations && results.recommendations.length > 0 ? (
          <div>
            <h3>Recommendations:</h3>
            {results.recommendations.map((crop: any, index: number) => (
              <div key={index} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
                <h4>{crop.crop}</h4>
                <p>Score: {crop.score}</p>
                <p>Yield: {crop.predicted_yield_kg_per_ha} kg/ha</p>
                <p>Profit: ₹{crop.estimated_profit_inr}</p>
                <p>Confidence: {(crop.confidence * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No recommendations found</p>
        )}
        
        {results.explanation && (
          <div style={{ marginTop: '20px' }}>
            <h3>Explanation:</h3>
            <p>{results.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
