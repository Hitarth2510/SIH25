import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, TrendingUp, DollarSign, Leaf, Info, ThumbsUp, ThumbsDown, Award, BarChart3, Sparkles } from 'lucide-react';
import type { RecommendResponse } from '~backend/main/recommend';
import backend from '~backend/client';

export function ResultsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<RecommendResponse | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('cropRecommendations');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      navigate('/input');
    }
  }, [navigate]);

  const handleFeedback = async (helpful: boolean) => {
    try {
      // In production, you would get the actual recommendation ID from the stored results
      const userId = `user_${Date.now()}`;
      const recommendationId = 1; // Mock ID
      
      await backend.main.submitFeedback({
        recommendationId,
        userId,
        helpful,
        notes: helpful ? "Helpful recommendation" : "Not helpful"
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

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized recommendations...</p>
        </div>
      </div>
    );
  }

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
                Model: {results.model_version}
              </Badge>
              <Badge variant="outline" className="bg-white/80">
                Generated: {new Date(results.timestamp).toLocaleString()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="grid gap-8 mb-12">
          {results.recommendations.map((crop, index) => (
            <Card 
              key={crop.crop} 
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
                        {crop.crop}
                        {index === 0 && <Badge className="bg-white text-green-600 font-semibold">Top Choice</Badge>}
                      </CardTitle>
                      <div className={`flex items-center gap-2 mt-2 ${index === 0 ? "text-white/90" : "text-gray-600"}`}>
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Confidence: {(crop.confidence * 100).toFixed(0)}%
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(crop.confidence)}`}>
                          {crop.confidence >= 0.8 ? "Very High" : crop.confidence >= 0.6 ? "High" : "Moderate"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    className={`${getSustainabilityColor(crop.sustainability_score)} text-white font-medium px-3 py-1`}
                  >
                    {getSustainabilityLabel(crop.sustainability_score)} Sustainability
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
                      {crop.predicted_yield_kg_per_ha.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">kg per hectare</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-gray-700">Estimated Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{crop.estimated_profit_inr.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">total estimated</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Leaf className="h-6 w-6 text-purple-600" />
                      <span className="font-semibold text-gray-700">Sustainability</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {(crop.sustainability_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-600">environmental score</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setSelectedCrop(crop)}
                        className="px-6 py-3 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                      >
                        <Info className="mr-2 h-5 w-5" />
                        Why {crop.crop}? View Analysis
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-gray-800">
                          Why we recommend {crop.crop}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{results.explanation}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-lg text-gray-800 mb-4">Key Influencing Factors:</h4>
                          <div className="space-y-3">
                            {results.shap_top_features.map((feature, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                                <span className="capitalize font-medium text-gray-700">{feature.feature.replace('_', ' ')}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                      style={{ width: `${feature.impact * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-600 min-w-[3rem]">
                                    {(feature.impact * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ))}
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
