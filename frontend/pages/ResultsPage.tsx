import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, TrendingUp, DollarSign, Leaf, Info, ThumbsUp, ThumbsDown, Award, BarChart3, Sparkles } from 'lucide-react';
// Define the response type locally to avoid Encore dependency
interface RecommendResponse {
  model_version: string;
  timestamp: string;
  recommendations: Array<{
    crop: string;
    score: number;
    predicted_yield_kg_per_ha: number;
    estimated_profit_inr: number;
    sustainability_score: number;
    confidence: number;
    risk_level: string;
    season_suitability: string;
    water_requirement: string;
    market_demand: string;
  }>;
  explanation: string;
  shap_top_features: Array<{
    feature: string;
    impact: number;
  }>;
}

// Use direct fetch to Express backend for feedback to avoid requiring Encore during dev
const API_BASE = (import.meta as any).env?.VITE_CLIENT_TARGET || 'http://localhost:4000';

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

export function ResultsPage() {
  console.log('ResultsPage: Component rendering started');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<RecommendResponse | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const storedResults = sessionStorage.getItem('cropRecommendations');
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
      } else {
        // If no results, navigate back to input form
        navigate('/input');
      }
    } catch (error) {
      console.error('Failed to load or parse results:', error);
      // Navigate away if data is corrupted
      navigate('/input');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleFeedback = async (helpful: boolean) => {
    try {
      // In production, you would get the actual recommendation ID from the stored results
      const userId = `user_${Date.now()}`;
      const recommendationId = 1; // Mock ID
      
      await postJSON(`${API_BASE}/api/feedback`, {
        recommendationId,
        userId,
        helpful,
        notes: helpful ? "Helpful recommendation" : "Not helpful",
      });
      
      setFeedbackGiven(true);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! It helps us improve our recommendations.",
      });
    } catch (error) {
      console.error('Feedback error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  // After loading, if results are null or invalid, show an error message.
  if (!results || !results.recommendations || !Array.isArray(results.recommendations) || results.recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Could Not Load Recommendations</h1>
          <p className="text-gray-600 mb-6">The recommendation data is missing or corrupted. Please try again.</p>
          <Button onClick={() => navigate('/input')} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back to Form
          </Button>
        </div>
      </div>
    );
  }

  console.log('ResultsPage: Rendering with results:', results);

  const getSustainabilityColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSustainabilityLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/input')}
            className="mb-6 hover:bg-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Form
          </Button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-20"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Your Crop Recommendations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Based on your soil conditions, current weather, and market prices - here are our AI-powered recommendations
            </p>
            <div className="flex justify-center items-center gap-2 mt-4">
              <Badge variant="outline" className="bg-white/80">
                Model: {results?.model_version || 'N/A'}
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                Generated: {results?.timestamp ? new Date(results.timestamp).toLocaleString() : 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid gap-8 mb-12">
          {results?.recommendations?.map((crop, index) => (
            <Card 
              key={crop?.crop || index}
              className={`transition-all duration-300 hover:shadow-2xl border-0 bg-white/90 backdrop-blur-sm ${
                index === 0 ? "ring-2 ring-green-500 shadow-green-100" : ""
              }`}
            >
              <CardHeader className={`pb-4 ${index === 0 ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg" : ""}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {index === 0 && (
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Award className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <CardTitle className={`text-2xl font-bold flex items-center gap-3 ${index === 0 ? "text-white" : "text-gray-800"}`}>
                        {crop?.crop || 'Unknown Crop'}
                        {index === 0 && <Badge className="bg-white text-green-600 font-semibold">Top Choice</Badge>}
                      </CardTitle>
                      <div className={`flex items-center gap-2 mt-2 ${index === 0 ? "text-white/90" : "text-gray-600"}`}>
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Confidence: {((crop?.confidence || 0) * 100).toFixed(0)}%
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(crop?.confidence || 0)}`}>
                          {(crop?.confidence || 0) >= 0.8 ? "Very High" : (crop?.confidence || 0) >= 0.6 ? "High" : "Moderate"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={`${getSustainabilityColor(crop?.sustainability_score || 0)} text-white font-medium px-3 py-1`}
                  >
                    {getSustainabilityLabel(crop?.sustainability_score || 0)} Sustainability
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-gray-700">Expected Yield</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {(crop?.predicted_yield_kg_per_ha || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">kg per hectare</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-gray-700">Estimated Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{(crop?.estimated_profit_inr || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">total estimated</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Leaf className="h-6 w-6 text-purple-600" />
                      <span className="font-semibold text-gray-700">Sustainability</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {((crop?.sustainability_score || 0) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-600">environmental score</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Dialog open={!!selectedCrop} onOpenChange={(isOpen) => !isOpen && setSelectedCrop(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setSelectedCrop(crop)}
                        className="px-6 py-3 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                      >
                        <Info className="mr-2 h-5 w-5" />
                        Why {crop?.crop || 'this crop'}? View Analysis
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-gray-800">
                          Why we recommend {selectedCrop?.crop || 'this crop'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{results?.explanation || 'No explanation available.'}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-4">Key Influencing Factors:</h4>
                          <div className="space-y-3">
                            {results?.shap_top_features?.map((feature, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                                <span className="capitalize font-medium text-gray-700">{(feature?.feature || 'N/A').replace('_', ' ')}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                      style={{ width: `${(feature?.impact || 0) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-600 min-w-[3rem]">
                                    {((feature?.impact || 0) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            )) || <p>No feature importance data available.</p>}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Section */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">How helpful were these recommendations?</CardTitle>
            <p className="text-gray-600">Your feedback helps us improve our AI recommendations</p>
          </CardHeader>
          <CardContent>
            {!feedbackGiven ? (
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => handleFeedback(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <ThumbsUp className="h-5 w-5" />
                  Very Helpful
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleFeedback(false)}
                  className="flex items-center gap-2 px-8 py-3 border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 font-semibold rounded-lg transition-all duration-200"
                >
                  <ThumbsDown className="h-5 w-5" />
                  Needs Improvement
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                  <ThumbsUp className="h-5 w-5" />
                  <span className="font-semibold">Thank you for your feedback!</span>
                </div>
                <p className="text-gray-600">We appreciate your input and will use it to improve our recommendations.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Button 
            onClick={() => navigate('/')}
            size="lg"
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
          >
            Get Another Recommendation
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/history')}
            size="lg"
            className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            View History
          </Button>
        </div>
      </div>
    </div>
  );
}
