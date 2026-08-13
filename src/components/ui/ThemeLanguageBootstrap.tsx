"use client";

import { useEffect } from "react";
import {
  applyLanguageToDocument,
  getCurrentLanguage,
  getCurrentTheme,
  syncDocumentTheme,
  normalizeLanguage,
} from "@/lib/theme-language";

export function ThemeLanguageBootstrap() {
  useEffect(() => {
    const queryLanguage = new URLSearchParams(window.location.search).get("lang");
    const currentLanguage = normalizeLanguage(queryLanguage ?? getCurrentLanguage());
    const currentTheme = getCurrentTheme();

    applyLanguageToDocument(currentLanguage);
    syncDocumentTheme(currentTheme);
  }, []);

  return null;
}
