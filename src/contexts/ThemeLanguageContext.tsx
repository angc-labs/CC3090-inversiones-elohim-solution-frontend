"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  type SupportedLanguage,
  type ThemeMode,
  getCurrentLanguage,
  getCurrentTheme,
  syncDocumentTheme,
  applyLanguageToDocument,
  getUpdatedUrlWithLanguage,
  normalizeLanguage,
} from "@/lib/theme-language";
import esMessages from "@/lib/i18n/es.json";
import enMessages from "@/lib/i18n/en.json";

const messagesByLanguage: Record<SupportedLanguage, typeof esMessages> = {
  es: esMessages,
  en: enMessages,
};

interface ThemeLanguageContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [language, setLanguageState] = useState<SupportedLanguage>("es");
  const [mounted, setMounted] = useState(false);

  // Initialize from storage or DOM
  useEffect(() => {
    const initialLang = getCurrentLanguage();
    const initialTheme = getCurrentTheme();

    setLanguageState(initialLang);
    setThemeState(initialTheme);
    applyLanguageToDocument(initialLang);
    syncDocumentTheme(initialTheme);
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    syncDocumentTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme: ThemeMode = prev === "dark" ? "light" : "dark";
      syncDocumentTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    const validLang = normalizeLanguage(newLang);
    setLanguageState(validLang);
    applyLanguageToDocument(validLang);

    if (typeof window !== "undefined") {
      const nextUrl = getUpdatedUrlWithLanguage(window.location.href, validLang);
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl !== currentUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", validLang);
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      }
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const nextLang: SupportedLanguage = prev === "es" ? "en" : "es";
      applyLanguageToDocument(nextLang);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", nextLang);
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      }

      return nextLang;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      language,
      setLanguage,
      toggleLanguage,
    }),
    [theme, setTheme, toggleTheme, language, setLanguage, toggleLanguage]
  );

  return (
    <ThemeLanguageContext.Provider value={value}>
      <NextIntlClientProvider locale={language} messages={messagesByLanguage[language]}>
        {children}
      </NextIntlClientProvider>
    </ThemeLanguageContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeLanguageProvider");
  }
  return {
    theme: context.theme,
    setTheme: context.setTheme,
    toggleTheme: context.toggleTheme,
    isDark: context.theme === "dark",
    isLight: context.theme === "light",
  };
}

export function useLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a ThemeLanguageProvider");
  }
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    toggleLanguage: context.toggleLanguage,
  };
}
