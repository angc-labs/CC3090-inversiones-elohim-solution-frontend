import {
  applyLanguageToDocument,
  getUpdatedUrlWithLanguage,
  normalizeLanguage,
  syncDocumentTheme,
} from "@/lib/theme-language";

describe("theme-language helpers", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.lang = "";
    localStorage.clear();
  });

  it("normaliza idiomas no soportados a español", () => {
    expect(normalizeLanguage("fr")).toBe("es");
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage(undefined)).toBe("es");
  });

  it("mantiene los parámetros existentes y añade el idioma a la URL", () => {
    const url = getUpdatedUrlWithLanguage("https://example.com/portal?tab=tablero&foo=bar", "en");

    expect(url).toContain("tab=tablero");
    expect(url).toContain("foo=bar");
    expect(url).toContain("lang=en");
  });

  it("aplica la clase dark al documento y persiste el tema", () => {
    syncDocumentTheme("dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem("dmhub-theme")).toBe("dark");
  });

  it("guarda el idioma en el documento y en localStorage", () => {
    applyLanguageToDocument("en");

    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("dmhub-language")).toBe("en");
  });

  it("puede alternar de tema oscuro a claro y limpiar la clase dark", () => {
    syncDocumentTheme("dark");
    syncDocumentTheme("light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(localStorage.getItem("dmhub-theme")).toBe("light");
  });
});
