import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-sm"
    >
      <Languages className="h-4 w-4" />
      {t('nav.language')}
    </Button>
  );
}