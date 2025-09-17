import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, TrendingUp, Shield, History, ArrowRight, Leaf, BarChart3, CloudRain, DollarSign, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Sprout className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">{t('home.title')}</h1>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-8">
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('home.features.ai')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{t('home.features.weather')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{t('home.features.market')}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>{t('home.features.sustainability')}</span>
            </div>
          </div>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={() => navigate('/input')}
            >
              {t('home.getRecommendations')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="px-6 py-4"
              onClick={() => navigate('/history')}
            >
              <History className="mr-2 h-4 w-4" />
              {t('home.viewHistory')}
            </Button>
          </div>
        </div>

        {/* Core Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">{t('features.smart.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                {t('features.smart.desc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CloudRain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t('features.weather.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                {t('features.weather.desc')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">{t('features.sustainability.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm">
                {t('features.sustainability.desc')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Data Points */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200 mb-12">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">{t('data.title')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Leaf className="h-5 w-5 text-green-600 mr-1" />
                <span className="text-2xl font-bold text-gray-800">12+</span>
              </div>
              <p className="text-sm text-gray-600">{t('data.crops')}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600 mr-1" />
                <span className="text-2xl font-bold text-gray-800">90%+</span>
              </div>
              <p className="text-sm text-gray-600">{t('data.accuracy')}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-gray-800">8</span>
              </div>
              <p className="text-sm text-gray-600">{t('data.soilTypes')}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-orange-600 mr-1" />
                <span className="text-2xl font-bold text-gray-800">Live</span>
              </div>
              <p className="text-sm text-gray-600">{t('data.marketPrices')}</p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <Card className="bg-white/80 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-xl text-center">{t('howItWorks.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-green-600">1</span>
                </div>
                <h4 className="font-medium text-base mb-2">{t('howItWorks.step1.title')}</h4>
                <p className="text-sm text-gray-600">{t('howItWorks.step1.desc')}</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-medium text-base mb-2">{t('howItWorks.step2.title')}</h4>
                <p className="text-sm text-gray-600">{t('howItWorks.step2.desc')}</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-medium text-base mb-2">{t('howItWorks.step3.title')}</h4>
                <p className="text-sm text-gray-600">{t('howItWorks.step3.desc')}</p>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-center mb-4">Data Sources</h4>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>OpenWeatherMap API</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>SoilGrids Database</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Market Price APIs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-lg mb-6 opacity-90">{t('cta.subtitle')}</p>
          <Button 
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            onClick={() => navigate('/input')}
          >
            {t('cta.button')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
