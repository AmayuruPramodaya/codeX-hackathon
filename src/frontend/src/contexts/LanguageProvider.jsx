import React, { useState, useEffect } from 'react';
import { LanguageContext, translations } from './LanguageContext.js';

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
      { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
