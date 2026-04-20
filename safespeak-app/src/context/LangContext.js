import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSavedLang, saveLang, TRANSLATIONS } from '../utils/i18n';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    getSavedLang().then(setLang);
  }, []);

  const changeLang = async (code) => {
    setLang(code);
    await saveLang(code);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
