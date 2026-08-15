export type SupportedLanguage = "es" | "en";
export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "dmhub-theme";
export const LANGUAGE_STORAGE_KEY = "dmhub-language";

export function normalizeLanguage(language?: string | null): SupportedLanguage {
  if (language === "en") return "en";
  return "es";
}

export function getCurrentLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "es";

  const paramLanguage = new URLSearchParams(window.location.search).get("lang");
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return normalizeLanguage(paramLanguage ?? storedLanguage ?? "es");
}

export function applyLanguageToDocument(language: SupportedLanguage) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = language;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

export function getCurrentTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const documentTheme = document.documentElement.dataset.theme;

  if (storedTheme === "light" || documentTheme === "light") return "light";
  return "dark";
}

export function syncDocumentTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;

  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }
}

export function getUpdatedUrlWithLanguage(currentUrl: string, language: SupportedLanguage) {
  if (typeof window === "undefined") {
    return `/?lang=${language}`;
  }

  const url = new URL(currentUrl, window.location.origin);
  url.searchParams.set("lang", language);

  return `${url.pathname}${url.search}`;
}
