import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
// Use direct fetch to Express backend for history to avoid requiring Encore during dev
const API_BASE = (import.meta as any).env?.VITE_CLIENT_TARGET || 'http://localhost:4000';

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export function HistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const userId = `user_${Date.now()}`; // In production, get from auth
      const response = await getJSON<{recommendations: any[]}>(`${API_BASE}/api/history/${userId}`);
      setHistory(response.recommendations);
    } catch (error) {
      console.error('History loading error:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendation history",
        variant: "destructive"
      });
      // Set mock data for development
      setHistory([
        {
          id: 1,
          created_at: "2024-01-15T10:30:00Z",
          input_data: {
            location: { lat: 22.5726, lon: 88.3639, state: "West Bengal" },
            soil_type: "Loamy",
            area_ha: 2.5
          },
          ml_response: {
            recommendations: [
              { crop: "Rice", score: 0.85, predicted_yield_kg_per_ha: 4800, estimated_profit_inr: 72000 },
              { crop: "Wheat", score: 0.65, predicted_yield_kg_per_ha: 3200, estimated_profit_inr: 52000 }
            ]
          }
        },
        {
          id: 2,
          created_at: "2024-01-10T14:20:00Z",
          input_data: {
            location: { lat: 22.5726, lon: 88.3639, state: "West Bengal" },
            soil_type: "Clayey",
            area_ha: 1.8
          },
          ml_response: {
            recommendations: [
              { crop: "Cotton", score: 0.78, predicted_yield_kg_per_ha: 2800, estimated_profit_inr: 65000 },
              { crop: "Sugarcane", score: 0.72, predicted_yield_kg_per_ha: 65000, estimated_profit_inr: 180000 }
            ]
          }
        },
        {
          id: 3,
          created_at: "2024-01-05T09:15:00Z",
          input_data: {
            location: { lat: 19.0760, lon: 72.8777, state: "Maharashtra" },
            soil_type: "Black",
            area_ha: 3.2
          },
          ml_response: {
            recommendations: [
              { crop: "Soybean", score: 0.82, predicted_yield_kg_per_ha: 2200, estimated_profit_inr: 55000 },
              { crop: "Maize", score: 0.71, predicted_yield_kg_per_ha: 4200, estimated_profit_inr: 68000 }
            ]
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your recommendation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Recommendation History
            </h1>
            <p className="text-lg text-gray-600">
              Review your past crop recommendations and track your farming decisions
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="text-center py-16">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No recommendations yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start by getting your first crop recommendation to see your history here.
              </p>
              <Button 
                onClick={() => navigate('/input')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Get Your First Recommendation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {history.map((record, index) => (
              <Card key={record.id || index} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">#{record.id || index + 1}</span>
                        </div>
                        Crop Recommendation
                      </CardTitle>
                      <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{record.input_data?.location?.state || "Unknown location"}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {record.input_data?.soil_type} Soil
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Farm Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Farm Details
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Soil Type:</span>
                          <span className="font-medium">{record.input_data?.soil_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium">{record.input_data?.area_ha} hectares</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coordinates:</span>
                          <span className="font-medium text-sm">
                            {record.input_data?.location?.lat?.toFixed(4)}, {record.input_data?.location?.lon?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Top Recommendations
                      </h4>
                      <div className="space-y-3">
                        {record.ml_response?.recommendations?.slice(0, 3).map((rec: any, idx: number) => (
                          <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                                <span className="font-semibold text-gray-800">{rec.crop}</span>
                              </div>
                              <Badge className="bg-green-600 text-white">
                                {(rec.score * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Yield:</span>
                                <span className="ml-1 font-medium">{rec.predicted_yield_kg_per_ha?.toLocaleString()} kg/ha</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Profit:</span>
                                <span className="ml-1 font-medium text-green-600">₹{rec.estimated_profit_inr?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {history.length > 0 && (
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Your Farming Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4">
                  <div className="text-2xl font-bold text-green-600">{history.length}</div>
                  <div className="text-sm text-gray-600">Recommendations</div>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {Array.from(new Set(history.map(h => h.input_data?.soil_type))).length}
                  </div>
                  <div className="text-sm text-gray-600">Soil Types</div>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {Array.from(new Set(history.map(h => h.input_data?.location?.state))).length}
                  </div>
                  <div className="text-sm text-gray-600">Locations</div>
                </div>
                <div className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {history.reduce((sum, h) => sum + (h.input_data?.area_ha || 0), 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Total Hectares</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={() => navigate('/input')}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 font-semibold"
          >
            Get New Recommendation
          </Button>
        </div>
      </div>
    </div>
  );
}
