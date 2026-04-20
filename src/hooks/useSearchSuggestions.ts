import { useState, useMemo, useCallback } from "react";
import productosData from "@/mock/producto.json";

export type SearchSuggestion = {
  id: string;
  type: "product" | "category" | "brand";
  label: string;
  value: string;
  product?: typeof productosData.productos[0];
};

interface UseSearchSuggestionsReturn {
  query: string;
  setQuery: (query: string) => void;
  suggestions: SearchSuggestion[];
  isSearching: boolean;
  clearSearch: () => void;
  searchResults: typeof productosData.productos;
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (query.length < 2) return [] as SearchSuggestion[];

    const lowerQuery = query.toLowerCase();

    const productSuggestions: SearchSuggestion[] = productosData.productos
      .filter((product) =>
        product.nombreProducto.toLowerCase().includes(lowerQuery) ||
        product.descripcion?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5)
      .map((product) => ({
        id: `product-${product.idProducto}`,
        type: "product",
        label: product.nombreProducto,
        value: product.nombreProducto,
        product,
      }));

    const categorySuggestions: SearchSuggestion[] = Array.from(
      new Set(productosData.productos.map((p) => p.categoriaId))
    )
      .filter((category) => category.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((category) => ({
        id: `category-${category}`,
        type: "category",
        label: `Categoría: ${category}`,
        value: category,
      }));

    const brandSuggestions: SearchSuggestion[] = Array.from(
      new Set(productosData.productos.map((p) => p.idMarca))
    )
      .filter((brand) => brand.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((brand) => ({
        id: `brand-${brand}`,
        type: "brand",
        label: `Marca: ${brand}`,
        value: brand,
      }));

    return [...productSuggestions, ...categorySuggestions, ...brandSuggestions];
  }, [query]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return productosData.productos;

    const lowerQuery = query.toLowerCase();
    return productosData.productos.filter((product) =>
      product.nombreProducto.toLowerCase().includes(lowerQuery) ||
      product.descripcion?.toLowerCase().includes(lowerQuery) ||
      product.categoriaId.toLowerCase().includes(lowerQuery) ||
      product.idMarca.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isSearching: false,
    clearSearch,
    searchResults,
  };
}
