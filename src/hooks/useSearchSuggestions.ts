import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import {
  buscarProductos,
  obtenerCategorias,
  obtenerMarcas,
  TProductoBusqueda,
} from "@/lib/api/productos";
import type { SearchSuggestion } from "@/types";

interface UseSearchSuggestionsReturn {
  query: string;
  setQuery: (query: string) => void;
  suggestions: SearchSuggestion[];
  isSearching: boolean;
  clearSearch: () => void;
  searchResults: TProductoBusqueda[];
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();

  const { data: categoryOptions = [] } = useSWR("categorias", obtenerCategorias, {
    revalidateOnFocus: false,
  });
  const { data: brandOptions = [] } = useSWR("marcas", obtenerMarcas, {
    revalidateOnFocus: false,
  });
  const { data: productResults = [], isLoading: isSearching } = useSWR(
    normalizedQuery.length >= 2 ? ["buscar-productos", normalizedQuery] : null,
    ([, currentQuery]: [string, string]) => buscarProductos(currentQuery),
    {
      revalidateOnFocus: false,
      dedupingInterval: 500,
    }
  );

  const suggestions = useMemo(() => {
    if (normalizedQuery.length < 2) return [] as SearchSuggestion[];

    const lowerQuery = normalizedQuery.toLowerCase();

    const productSuggestions: SearchSuggestion[] = productResults
      .slice(0, 5)
      .map((product) => ({
        id: `product-${product.idProducto}`,
        type: "product" as const,
        label: product.nombreProducto,
        value: product.nombreProducto,
        product: {
          idProducto: product.idProducto,
          nombreProducto: product.nombreProducto,
          precio: product.precio,
          imagenPrincipal: product.imagenPrincipal,
        },
      }));

    const categorySuggestions: SearchSuggestion[] = categoryOptions
      .filter((category) => category.nombreCategoria.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((category) => ({
        id: `category-${category.id}`,
        type: "category",
        label: `Categoría: ${category.nombreCategoria}`,
        value: category.id,
      }));

    const brandSuggestions: SearchSuggestion[] = brandOptions
      .filter((brand) => brand.nombreMarca.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((brand) => ({
        id: `brand-${brand.id}`,
        type: "brand",
        label: `Marca: ${brand.nombreMarca}`,
        value: brand.id,
      }));

    return [...productSuggestions, ...categorySuggestions, ...brandSuggestions];
  }, [brandOptions, categoryOptions, normalizedQuery, productResults]);

  const searchResults = useMemo(
    () => (normalizedQuery.length >= 2 ? productResults : []),
    [normalizedQuery.length, productResults]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isSearching,
    clearSearch,
    searchResults,
  };
}
