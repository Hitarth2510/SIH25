import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, TrendingUp, Shield, History, ArrowRight, Leaf, BarChart3, MapPin, CloudRain, DollarSign, Users, Star, CheckCircle } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 scale-150"></div>
              <div className="relative bg-white p-4 rounded-full shadow-lg">
                <Sprout className="h-12 w-12 text-green-600" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Smart Crop Advisor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered crop recommendations using real-time weather, soil data, and market prices
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Real-time Weather</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Market Integration</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Sustainability Focus</span>
            </div>
          </div>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/input')}
            >
              Get Crop Recommendations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="px-6 py-4 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              onClick={() => navigate('/history')}
            >
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Core Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">Core Features</h2>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Smart Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  ML-powered crop suggestions with yield predictions and profit estimates based on comprehensive analysis
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                    <CloudRain className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Weather Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  Real-time weather data from OpenWeatherMap API, seasonal forecasts, and climate pattern analysis
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Sustainability Score</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  Environmental impact assessment, soil health monitoring, and long-term sustainability analysis
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Data Points */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">Comprehensive Data Analysis</h3>
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <Leaf className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-2xl font-bold text-gray-800">12+</span>
                  </div>
                  <p className="text-sm text-gray-600">Crop Types</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-1" />
                    <span className="text-2xl font-bold text-gray-800">95%</span>
                  </div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="h-5 w-5 text-purple-600 mr-1" />
                    <span className="text-2xl font-bold text-gray-800">8</span>
                  </div>
                  <p className="text-sm text-gray-600">Soil Types</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-orange-600 mr-1" />
                    <span className="text-2xl font-bold text-gray-800">Live</span>
                  </div>
                  <p className="text-sm text-gray-600">Market Prices</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center text-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-800">10K+</div>
                    <div className="text-xs text-gray-600">Farmers Helped</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-lg font-bold text-gray-800">4.9</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-lg font-bold text-gray-800">25%</div>
                    <div className="text-xs text-gray-600">Avg Yield Increase</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - How it works */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">How It Works</h2>
            
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-1">Input Farm Data</h4>
                    <p className="text-sm text-gray-600">Enter your location, soil type, farming practices, and field conditions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-1">AI Analysis</h4>
                    <p className="text-sm text-gray-600">Our ML models analyze weather patterns, soil health, and market conditions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-base mb-1">Get Recommendations</h4>
                    <p className="text-sm text-gray-600">Receive personalized crop suggestions with profit estimates and sustainability scores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800">Data Sources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">OpenWeatherMap API</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Soil health indicators</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Live market prices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Seasonal forecasts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Agricultural best practices</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">FE</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Frontend</h3>
                <p className="text-sm text-gray-600">React, TypeScript, Tailwind CSS, shadcn/ui components</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">BE</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Backend</h3>
                <p className="text-sm text-gray-600">Encore.ts, PostgreSQL, REST APIs, real-time data integration</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-white/80 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">ML</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Machine Learning</h3>
                <p className="text-sm text-gray-600">Python, FastAPI, Random Forest, scikit-learn, feature engineering</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Key Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Increased Yield</h3>
              <p className="text-sm text-gray-600">Up to 25% improvement in crop yields through data-driven decisions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Higher Profits</h3>
              <p className="text-sm text-gray-600">Maximize revenue with optimal crop selection and market timing</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Risk Reduction</h3>
              <p className="text-sm text-gray-600">Minimize crop failure risks with scientific recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Sustainability</h3>
              <p className="text-sm text-gray-600">Promote environmentally friendly farming practices</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farming?</h2>
          <p className="text-lg mb-6 opacity-90">Join thousands of farmers who have increased their yields with AI-powered recommendations</p>
          <Button 
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            onClick={() => navigate('/input')}
          >
            Start Your Analysis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
