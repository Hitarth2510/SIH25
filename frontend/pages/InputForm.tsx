import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Info, Loader2, ArrowLeft, CheckCircle2, Droplets, Thermometer, Zap, CloudRain, RefreshCw } from 'lucide-react';
import { getSoilDefaults } from '../utils/soilDefaults';
// Using direct fetch calls to the Express backend instead of the Encore-generated client
const API_BASE = (import.meta as any).env?.VITE_CLIENT_TARGET || 'http://localhost:4000';

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

interface FormData {
  latitude: string;
  longitude: string;
  soilType: string;
  area: string;
  farmingMethod: string;
  irrigationType: string;
  previousCrops: string[];
  experience: string;
  budget: string;
  organicCarbon: string;
  N: string;
  P: string;
  K: string;
  ph: string;
  moisture: string;
  preferredCrops: string[];
}

interface WeatherPreview {
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    wind_speed: number;
    description: string;
    feels_like: number;
    uv_index: number;
    pressure: number;
  };
  forecast?: {
    seasonal_outlook: string;
  };
}

export function InputForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [weatherPreview, setWeatherPreview] = useState<WeatherPreview | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingSoil, setLoadingSoil] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    latitude: '',
    longitude: '',
    soilType: '',
    area: '',
    farmingMethod: '',
    irrigationType: '',
    previousCrops: [],
    experience: '',
    budget: '',
    organicCarbon: '',
    N: '',
    P: '',
    K: '',
    ph: '',
    moisture: '',
    preferredCrops: []
  });

  const soilTypes = [
    { value: 'Sandy', label: 'Sandy Soil', description: 'Well-draining, low nutrients, good for root crops' },
    { value: 'Loamy', label: 'Loamy Soil', description: 'Balanced, ideal for most crops, excellent drainage' },
    { value: 'Clayey', label: 'Clayey Soil', description: 'High nutrients, water retention, heavy soil' },
    { value: 'Silty', label: 'Silty Soil', description: 'Fine particles, moderate drainage, fertile' },
    { value: 'Peaty', label: 'Peaty Soil', description: 'High organic matter, acidic, water-retaining' },
    { value: 'Black', label: 'Black Cotton Soil', description: 'High fertility, cotton-suitable, expansive' },
    { value: 'Red', label: 'Red Soil', description: 'Iron-rich, well-drained, moderate fertility' },
    { value: 'Alluvial', label: 'Alluvial Soil', description: 'River deposits, very fertile, mixed texture' }
  ];

  const cropOptions = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 
    'Groundnut', 'Sunflower', 'Chickpea', 'Pigeon Pea', 'Mustard', 'Barley'
  ];

  const fetchSoilPreview = async (lat: number, lon: number) => {
    setLoadingSoil(true);
    try {
      const response = await getJSON<{
        properties: {
          nitrogen: { mean: number }
          phosphorus: { mean: number }
          potassium: { mean: number }
          phh2o: { mean: number }
          organic_carbon: { mean: number }
        }
      }>(`${API_BASE}/api/soil/properties?lat=${lat}&lon=${lon}`);
      setFormData(prev => ({
        ...prev,
        N: response.properties.nitrogen.mean.toFixed(1),
        P: response.properties.phosphorus.mean.toFixed(1),
        K: response.properties.potassium.mean.toFixed(1),
        ph: response.properties.phh2o.mean.toFixed(1),
        organicCarbon: response.properties.organic_carbon.mean.toFixed(2)
      }));
      toast({
        title: "Soil data automatically applied",
        description: "Soil properties from SoilGrids have been filled into the form.",
      });
    } catch (error) {
      console.error('Soil preview error:', error);
      toast({
        title: "SoilGrids Error",
        description: "Could not fetch soil data. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setLoadingSoil(false);
    }
  };

  const fetchWeatherPreview = async (lat: number, lon: number) => {
    setLoadingWeather(true);
    try {
      // Express backend provides combined current weather via /api/weather/:lat/:lon
      const response = await getJSON<{
        temperature: number; humidity: number; rainfall: number; wind_speed: number;
        solar_radiation: number; pressure: number; description: string; feels_like: number;
      }>(`${API_BASE}/api/weather/${lat}/${lon}`);

      setWeatherPreview({
        current: {
          temperature: response.temperature,
          humidity: response.humidity,
          rainfall: response.rainfall,
          wind_speed: response.wind_speed,
          description: response.description,
          feels_like: response.feels_like,
          uv_index: 5,
          pressure: response.pressure,
        },
        // Forecast endpoint is not available on Express mock; provide a helpful placeholder
        forecast: { seasonal_outlook: 'Favorable conditions expected' },
      });
    } catch (error) {
      console.error('Weather preview error:', error);
      setWeatherPreview(null);
    } finally {
      setLoadingWeather(false);
    }
  };

  // Fetch weather and soil data when coordinates change
  useEffect(() => {
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      fetchWeatherPreview(lat, lon);
      fetchSoilPreview(lat, lon);
    }
  }, [formData.latitude, formData.longitude]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSoilTypeChange = (soilType: string) => {
    setFormData(prev => ({ ...prev, soilType }));
    // Only update soil type, keep existing SoilGrids data
  };

  const handleCropSelection = (crop: string, checked: boolean, field: 'previousCrops' | 'preferredCrops') => {
    const currentCrops = formData[field];
    if (checked) {
      handleInputChange(field, [...currentCrops, crop]);
    } else {
      handleInputChange(field, currentCrops.filter(c => c !== crop));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setGettingLocation(false);
        toast({
          title: "Location found",
          description: "GPS coordinates have been added to the form",
        });
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "Location error",
          description: "Could not get your location. Please enter coordinates manually.",
          variant: "destructive"
        });
        console.error("Geolocation error:", error);
      }
    );
  };

  const refreshPreviews = () => {
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      fetchWeatherPreview(lat, lon);
      fetchSoilPreview(lat, lon);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.latitude || !formData.longitude || !formData.soilType || !formData.area) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const userId = `user_${Date.now()}`; // In production, get from auth
      
      const response = await postJSON(`${API_BASE}/api/recommend`, {
        userId,
        location: {
          lat: parseFloat(formData.latitude),
          lon: parseFloat(formData.longitude)
        },
        soil_type: formData.soilType,
        area_acres: parseFloat(formData.area),
        farming_method: formData.farmingMethod,
        irrigation_type: formData.irrigationType,
        previous_crops: formData.previousCrops,
        experience_years: formData.experience ? parseInt(formData.experience) : undefined,
        budget_category: formData.budget,
        preferred_crops: formData.preferredCrops,
        soil_values: {
          N: formData.N ? parseFloat(formData.N) : undefined,
          P: formData.P ? parseFloat(formData.P) : undefined,
          K: formData.K ? parseFloat(formData.K) : undefined,
          ph: formData.ph ? parseFloat(formData.ph) : undefined,
          moisture: formData.moisture ? parseFloat(formData.moisture) : undefined,
          organic_carbon: formData.organicCarbon ? parseFloat(formData.organicCarbon) : undefined
        }
      });

      // Store results in sessionStorage for the results page
      console.log('InputForm: Storing results in sessionStorage:', response);
      sessionStorage.setItem('cropRecommendations', JSON.stringify(response));
      console.log('InputForm: Navigating to results page');
      navigate('/results');
      
    } catch (error) {
      console.error('Recommendation error:', error);
      toast({
        title: "Error",
        description: "Failed to get crop recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description: string) => {
    if (description.includes('rain')) return '🌧️';
    if (description.includes('cloud')) return '☁️';
    if (description.includes('clear')) return '☀️';
    if (description.includes('snow')) return '❄️';
    return '🌤️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Farm Analysis Form</h1>
            <p className="text-gray-600">Provide comprehensive farm details for personalized AI recommendations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Farm Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">
                    Latitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 22.5726"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">
                    Longitude <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 88.3639"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex-1 py-3 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Use Current Location
                    </>
                  )}
                </Button>
                
                {(formData.latitude && formData.longitude) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={refreshPreviews}
                    disabled={loadingWeather || loadingSoil}
                    className="py-3 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${(loadingWeather || loadingSoil) ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                    Farm Area (acres) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.5"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium text-gray-700">
                    Farming Experience (years)
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Preview */}
          {loadingWeather ? (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading weather data...</p>
              </CardContent>
            </Card>
          ) : weatherPreview && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CloudRain className="h-5 w-5" />
                  Weather Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{weatherPreview.current.temperature.toFixed(1)}°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{weatherPreview.current.humidity}%</div>
                    <div className="text-sm text-gray-600">Humidity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{weatherPreview.current.rainfall.toFixed(1)}mm</div>
                    <div className="text-sm text-gray-600">Rainfall</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-gray-700 capitalize">{weatherPreview.current.description}</div>
                    <div className="text-sm text-gray-600">Condition</div>
                  </div>
                </div>
                {weatherPreview.forecast && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <h4 className="font-semibold text-gray-800 mb-1">Seasonal Outlook</h4>
                    <p className="text-gray-600 text-sm">{weatherPreview.forecast.seasonal_outlook}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Soil Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="soilType" className="text-sm font-medium text-gray-700">
                  Soil Type <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={handleSoilTypeChange} required>
                  <SelectTrigger className="h-12 transition-all duration-200 focus:ring-2 focus:ring-green-500">
                    <SelectValue placeholder="Select your soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="py-3">
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loadingSoil && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Fetching soil data from SoilGrids...</p>
                </div>
              )}

              {autoFilled && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-800 text-sm">
                    Soil properties have been auto-filled. You can modify these values if you have specific lab results.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="N" className="text-sm font-medium text-gray-700">
                    Nitrogen (N) mg/kg
                  </Label>
                  <Input
                    id="N"
                    type="number"
                    step="0.1"
                    value={formData.N}
                    onChange={(e) => handleInputChange('N', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="P" className="text-sm font-medium text-gray-700">
                    Phosphorus (P) mg/kg
                  </Label>
                  <Input
                    id="P"
                    type="number"
                    step="0.1"
                    value={formData.P}
                    onChange={(e) => handleInputChange('P', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="K" className="text-sm font-medium text-gray-700">
                    Potassium (K) mg/kg
                  </Label>
                  <Input
                    id="K"
                    type="number"
                    step="0.1"
                    value={formData.K}
                    onChange={(e) => handleInputChange('K', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph" className="text-sm font-medium text-gray-700">
                    pH Level
                  </Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    value={formData.ph}
                    onChange={(e) => handleInputChange('ph', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moisture" className="text-sm font-medium text-gray-700">
                    Soil Moisture (%)
                  </Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.1"
                    value={formData.moisture}
                    onChange={(e) => handleInputChange('moisture', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organicCarbon" className="text-sm font-medium text-gray-700">
                    Organic Carbon (%)
                  </Label>
                  <Input
                    id="organicCarbon"
                    type="number"
                    step="0.1"
                    value={formData.organicCarbon}
                    onChange={(e) => handleInputChange('organicCarbon', e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Farming Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Farming Method</Label>
                  <RadioGroup 
                    value={formData.farmingMethod} 
                    onValueChange={(value) => handleInputChange('farmingMethod', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="organic" id="organic" />
                      <Label htmlFor="organic" className="text-sm">Organic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conventional" id="conventional" />
                      <Label htmlFor="conventional" className="text-sm">Conventional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed" className="text-sm">Mixed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Irrigation Type</Label>
                  <RadioGroup 
                    value={formData.irrigationType} 
                    onValueChange={(value) => handleInputChange('irrigationType', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rainfed" id="rainfed" />
                      <Label htmlFor="rainfed" className="text-sm">Rain-fed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="irrigated" id="irrigated" />
                      <Label htmlFor="irrigated" className="text-sm">Irrigated</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="drip" id="drip" />
                      <Label htmlFor="drip" className="text-sm">Drip Irrigation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sprinkler" id="sprinkler" />
                      <Label htmlFor="sprinkler" className="text-sm">Sprinkler</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Budget Category</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (&lt; ₹20,000/acre)</SelectItem>
                    <SelectItem value="medium">Medium (₹20,000 - ₹40,000/acre)</SelectItem>
                    <SelectItem value="high">High (&gt; ₹40,000/acre)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Crop History & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Previous Crops (Last 2 years)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cropOptions.map(crop => (
                    <div key={crop} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prev-${crop}`}
                        checked={formData.previousCrops.includes(crop)}
                        onCheckedChange={(checked) => handleCropSelection(crop, checked as boolean, 'previousCrops')}
                      />
                      <Label htmlFor={`prev-${crop}`} className="text-sm">{crop}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Preferred Crops (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cropOptions.map(crop => (
                    <div key={crop} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pref-${crop}`}
                        checked={formData.preferredCrops.includes(crop)}
                        onCheckedChange={(checked) => handleCropSelection(crop, checked as boolean, 'preferredCrops')}
                      />
                      <Label htmlFor={`pref-${crop}`} className="text-sm">{crop}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing your comprehensive farm data...
              </>
            ) : (
              "Get AI-Powered Crop Recommendations"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
