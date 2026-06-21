"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Locale, defaultLocale } from "./config";
import { translations, TranslationKeys } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage on first render
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zamzam-locale") as Locale;
      if (stored && (stored === "az" || stored === "ru" || stored === "en")) {
        return stored;
      }
    }
    return defaultLocale;
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("zamzam-locale", newLocale);
      // Also set cookie for SSR compatibility
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    }
  };

  // Update HTML lang attribute when locale changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = (key: TranslationKeys): string => {
    return translations[locale][key] || translations[defaultLocale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
