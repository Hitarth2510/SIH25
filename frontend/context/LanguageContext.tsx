import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.input': 'Get Recommendations',
    'nav.history': 'History',
    'nav.language': 'हिन्दी',
    
    // Homepage
    'home.title': 'Smart Crop Advisor',
    'home.subtitle': 'AI-powered crop recommendations using real-time weather, soil data, and market prices',
    'home.features.ai': 'AI-Powered',
    'home.features.weather': 'Real-time Weather',
    'home.features.market': 'Market Integration',
    'home.features.sustainability': 'Sustainability Focus',
    'home.getRecommendations': 'Get Crop Recommendations',
    'home.viewHistory': 'View History',
    
    // Core Features
    'features.title': 'Core Features',
    'features.smart.title': 'Smart Recommendations',
    'features.smart.desc': 'ML-powered crop suggestions with yield predictions and profit estimates',
    'features.weather.title': 'Weather Integration',
    'features.weather.desc': 'Real-time weather data and seasonal forecasts',
    'features.sustainability.title': 'Sustainability Score',
    'features.sustainability.desc': 'Environmental impact assessment and soil health monitoring',
    
    // Data Analysis
    'data.title': 'Data Analysis',
    'data.crops': 'Crop Types',
    'data.accuracy': 'Accuracy',
    'data.soilTypes': 'Soil Types',
    'data.marketPrices': 'Market Prices',
    'data.farmersHelped': 'Farmers Helped',
    'data.rating': 'Rating',
    'data.yieldIncrease': 'Avg Yield Increase',
    
    // How it Works
    'howItWorks.title': 'How It Works',
    'howItWorks.step1.title': 'Input Farm Data',
    'howItWorks.step1.desc': 'Enter your location, soil type, farming practices, and field conditions',
    'howItWorks.step2.title': 'AI Analysis',
    'howItWorks.step2.desc': 'Our ML models analyze weather patterns, soil health, and market conditions',
    'howItWorks.step3.title': 'Get Recommendations',
    'howItWorks.step3.desc': 'Receive personalized crop suggestions with profit estimates and sustainability scores',
    
    // Benefits
    'benefits.title': 'Key Benefits',
    'benefits.yield.title': 'Increased Yield',
    'benefits.yield.desc': 'Up to 25% improvement in crop yields through data-driven decisions',
    'benefits.profits.title': 'Higher Profits',
    'benefits.profits.desc': 'Maximize revenue with optimal crop selection and market timing',
    'benefits.risk.title': 'Risk Reduction',
    'benefits.risk.desc': 'Minimize crop failure risks with scientific recommendations',
    'benefits.sustainability.title': 'Sustainability',
    'benefits.sustainability.desc': 'Promote environmentally friendly farming practices',
    
    // CTA
    'cta.title': 'Ready to Transform Your Farming?',
    'cta.subtitle': 'Join thousands of farmers who have increased their yields with AI-powered recommendations',
    'cta.button': 'Start Your Analysis',
    
    // Form
    'form.title': 'Crop Recommendation Form',
    'form.location': 'Location',
    'form.latitude': 'Latitude',
    'form.longitude': 'Longitude',
    'form.state': 'State',
    'form.soilType': 'Soil Type',
    'form.farmArea': 'Farm Area (hectares)',
    'form.farmingMethod': 'Farming Method',
    'form.irrigation': 'Irrigation Type',
    'form.experience': 'Years of Experience',
    'form.budget': 'Budget Category',
    'form.soilValues': 'Soil Nutrients (Optional)',
    'form.nitrogen': 'Nitrogen (N)',
    'form.phosphorus': 'Phosphorus (P)',
    'form.potassium': 'Potassium (K)',
    'form.ph': 'pH Level',
    'form.organicCarbon': 'Organic Carbon',
    'form.moisture': 'Soil Moisture',
    'form.previousCrops': 'Previous Crops',
    'form.preferredCrops': 'Preferred Crops',
    'form.submit': 'Get Recommendations',
    'form.reset': 'Reset Form',
    
    // Results
    'results.title': 'Crop Recommendations',
    'results.score': 'Score',
    'results.yield': 'Predicted Yield',
    'results.profit': 'Estimated Profit',
    'results.sustainability': 'Sustainability',
    'results.confidence': 'Confidence',
    'results.risk': 'Risk Level',
    'results.season': 'Season Suitability',
    'results.water': 'Water Requirement',
    'results.marketDemand': 'Market Demand',
    'results.backToForm': 'Back to Form',
    'results.saveToHistory': 'Save to History',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.kg_per_ha': 'kg/ha',
    'common.inr': '₹',
    'common.percent': '%',
    
    // Soil Types
    'soil.Sandy': 'Sandy',
    'soil.Loamy': 'Loamy',
    'soil.Clayey': 'Clayey',
    'soil.Silty': 'Silty',
    'soil.Peaty': 'Peaty',
    'soil.Black': 'Black Cotton',
    'soil.Red': 'Red',
    'soil.Alluvial': 'Alluvial',
    
    // Farming Methods
    'farming.organic': 'Organic',
    'farming.conventional': 'Conventional',
    'farming.mixed': 'Mixed',
    
    // Irrigation Types
    'irrigation.rainfed': 'Rainfed',
    'irrigation.irrigated': 'Irrigated',
    'irrigation.drip': 'Drip Irrigation',
    'irrigation.sprinkler': 'Sprinkler',
    
    // Budget Categories
    'budget.low': 'Low Budget',
    'budget.medium': 'Medium Budget',
    'budget.high': 'High Budget'
  },
  hi: {
    // Navigation
    'nav.home': 'मुख्य पृष्ठ',
    'nav.input': 'सुझाव प्राप्त करें',
    'nav.history': 'इतिहास',
    'nav.language': 'English',
    
    // Homepage
    'home.title': 'स्मार्ट फसल सलाहकार',
    'home.subtitle': 'वास्तविक समय मौसम, मिट्टी डेटा और बाजार मूल्यों का उपयोग करके AI-संचालित फसल सुझाव',
    'home.features.ai': 'AI-संचालित',
    'home.features.weather': 'वास्तविक समय मौसम',
    'home.features.market': 'बाजार एकीकरण',
    'home.features.sustainability': 'स्थिरता फोकस',
    'home.getRecommendations': 'फसल सुझाव प्राप्त करें',
    'home.viewHistory': 'इतिहास देखें',
    
    // Core Features
    'features.title': 'मुख्य विशेषताएं',
    'features.smart.title': 'स्मार्ट सुझाव',
    'features.smart.desc': 'ML-संचालित फसल सुझाव उत्पादन पूर्वानुमान और लाभ अनुमान के साथ',
    'features.weather.title': 'मौसम एकीकरण',
    'features.weather.desc': 'वास्तविक समय मौसम डेटा और मौसमी पूर्वानुमान',
    'features.sustainability.title': 'स्थिरता स्कोर',
    'features.sustainability.desc': 'पर्यावरणीय प्रभाव मूल्यांकन और मिट्टी स्वास्थ्य निगरानी',
    
    // Data Analysis
    'data.title': 'डेटा विश्लेषण',
    'data.crops': 'फसल प्रकार',
    'data.accuracy': 'सटीकता',
    'data.soilTypes': 'मिट्टी के प्रकार',
    'data.marketPrices': 'बाजार मूल्य',
    'data.farmersHelped': 'किसानों की सहायता की',
    'data.rating': 'रेटिंग',
    'data.yieldIncrease': 'औसत उत्पादन वृद्धि',
    
    // How it Works
    'howItWorks.title': 'यह कैसे काम करता है',
    'howItWorks.step1.title': 'खेत डेटा दर्ज करें',
    'howItWorks.step1.desc': 'अपना स्थान, मिट्टी का प्रकार, खेती की प्रथाएं और खेत की स्थिति दर्ज करें',
    'howItWorks.step2.title': 'AI विश्लेषण',
    'howItWorks.step2.desc': 'हमारे ML मॉडल मौसम पैटर्न, मिट्टी स्वास्थ्य और बाजार स्थितियों का विश्लेषण करते हैं',
    'howItWorks.step3.title': 'सुझाव प्राप्त करें',
    'howItWorks.step3.desc': 'लाभ अनुमान और स्थिरता स्कोर के साथ व्यक्तिगत फसल सुझाव प्राप्त करें',
    
    // Benefits
    'benefits.title': 'मुख्य लाभ',
    'benefits.yield.title': 'उत्पादन में वृद्धि',
    'benefits.yield.desc': 'डेटा-संचालित निर्णयों के माध्यम से फसल उत्पादन में 25% तक सुधार',
    'benefits.profits.title': 'अधिक लाभ',
    'benefits.profits.desc': 'इष्टतम फसल चयन और बाजार समय के साथ राजस्व को अधिकतम करें',
    'benefits.risk.title': 'जोखिम में कमी',
    'benefits.risk.desc': 'वैज्ञानिक सुझावों के साथ फसल विफलता के जोखिमों को कम करें',
    'benefits.sustainability.title': 'स्थिरता',
    'benefits.sustainability.desc': 'पर्यावरण-अनुकूल कृषि प्रथाओं को बढ़ावा दें',
    
    // CTA
    'cta.title': 'अपनी खेती को बदलने के लिए तैयार हैं?',
    'cta.subtitle': 'हजारों किसानों से जुड़ें जिन्होंने AI-संचालित सुझावों से अपनी उत्पादन बढ़ाई है',
    'cta.button': 'अपना विश्लेषण शुरू करें',
    
    // Form
    'form.title': 'फसल सुझाव फॉर्म',
    'form.location': 'स्थान',
    'form.latitude': 'अक्षांश',
    'form.longitude': 'देशांतर',
    'form.state': 'राज्य',
    'form.soilType': 'मिट्टी का प्रकार',
    'form.farmArea': 'खेत का क्षेत्रफल (हेक्टेयर)',
    'form.farmingMethod': 'खेती की पद्धति',
    'form.irrigation': 'सिंचाई का प्रकार',
    'form.experience': 'अनुभव के वर्ष',
    'form.budget': 'बजट श्रेणी',
    'form.soilValues': 'मिट्टी पोषक तत्व (वैकल्पिक)',
    'form.nitrogen': 'नाइट्रोजन (N)',
    'form.phosphorus': 'फास्फोरस (P)',
    'form.potassium': 'पोटाशियम (K)',
    'form.ph': 'pH स्तर',
    'form.organicCarbon': 'जैविक कार्बन',
    'form.moisture': 'मिट्टी की नमी',
    'form.previousCrops': 'पिछली फसलें',
    'form.preferredCrops': 'पसंदीदा फसलें',
    'form.submit': 'सुझाव प्राप्त करें',
    'form.reset': 'फॉर्म रीसेट करें',
    
    // Results
    'results.title': 'फसल सुझाव',
    'results.score': 'स्कोर',
    'results.yield': 'अनुमानित उत्पादन',
    'results.profit': 'अनुमानित लाभ',
    'results.sustainability': 'स्थिरता',
    'results.confidence': 'आत्मविश्वास',
    'results.risk': 'जोखिम स्तर',
    'results.season': 'मौसम उपयुक्तता',
    'results.water': 'जल आवश्यकता',
    'results.marketDemand': 'बाजार मांग',
    'results.backToForm': 'फॉर्म पर वापस जाएं',
    'results.saveToHistory': 'इतिहास में सहेजें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.close': 'बंद करें',
    'common.kg_per_ha': 'किग्रा/हेक्टेयर',
    'common.inr': '₹',
    'common.percent': '%',
    
    // Soil Types
    'soil.Sandy': 'रेतीली',
    'soil.Loamy': 'दोमट',
    'soil.Clayey': 'चिकनी',
    'soil.Silty': 'गाद युक्त',
    'soil.Peaty': 'पीटी',
    'soil.Black': 'काली कपास',
    'soil.Red': 'लाल',
    'soil.Alluvial': 'जलोढ़',
    
    // Farming Methods
    'farming.organic': 'जैविक',
    'farming.conventional': 'पारंपरिक',
    'farming.mixed': 'मिश्रित',
    
    // Irrigation Types
    'irrigation.rainfed': 'वर्षा आधारित',
    'irrigation.irrigated': 'सिंचित',
    'irrigation.drip': 'ड्रिप सिंचाई',
    'irrigation.sprinkler': 'स्प्रिंकलर',
    
    // Budget Categories
    'budget.low': 'कम बजट',
    'budget.medium': 'मध्यम बजट',
    'budget.high': 'उच्च बजट'
  }
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}