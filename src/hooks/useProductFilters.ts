import { useState, useMemo } from "react";
import productosData from "@/mock/producto.json";

export type FilterType = "category" | "price" | "brand";

interface UseProductFiltersReturn {
  filteredProducts: typeof productosData.productos;
  activeFilterType: FilterType;
  setFilterType: (type: FilterType) => void;
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getCategories: () => string[];
  getBrands: () => string[];
  getPriceRanges: () => Array<{ label: string; min: number; max: number }>;
  clearFilters: () => void;
}

export function useProductFilters(): UseProductFiltersReturn {
  const [activeFilterType, setFilterType] = useState<FilterType>("category");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const priceRanges = [
    { label: "Q0 - Q5", min: 0, max: 5 },
    { label: "Q5 - Q10", min: 5, max: 10 },
    { label: "Q10 - Q15", min: 10, max: 15 },
    { label: "Q15 - Q20", min: 15, max: 20 },
    { label: "Q20+", min: 20, max: Infinity },
  ];

  const getCategories = () => {
    return Array.from(
      new Set(productosData.productos.map((p) => p.categoriaId))
    ).sort();
  };

  const getBrands = () => {
    return Array.from(
      new Set(productosData.productos.map((p) => p.idMarca))
    ).sort();
  };

  const getPriceRanges = () => priceRanges;

  const clearFilters = () => {
    setSelectedValues([]);
    setSearchQuery("");
  };

  const filteredProducts = useMemo(() => {
    let products = productosData.productos;

    // Aplicar búsqueda primero
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      products = products.filter((product) =>
        product.nombreProducto.toLowerCase().includes(lowerQuery) ||
        product.descripcion?.toLowerCase().includes(lowerQuery) ||
        product.categoriaId.toLowerCase().includes(lowerQuery) ||
        product.idMarca.toLowerCase().includes(lowerQuery)
      );
    }

    // Aplicar filtros
    if (selectedValues.length === 0) {
      return products;
    }

    return products.filter((product) => {
      if (activeFilterType === "category") {
        return selectedValues.includes(product.categoriaId);
      } else if (activeFilterType === "brand") {
        return selectedValues.includes(product.idMarca);
      } else if (activeFilterType === "price") {
        const priceRange = priceRanges.find((r) => r.label === selectedValues[0]);
        if (priceRange) {
          return (
            product.precio >= priceRange.min &&
            product.precio <= priceRange.max
          );
        }
      }
      return true;
    });
  }, [activeFilterType, selectedValues, searchQuery]);

  return {
    filteredProducts,
    activeFilterType,
    setFilterType,
    selectedValues,
    setSelectedValues,
    searchQuery,
    setSearchQuery,
    getCategories,
    getBrands,
    getPriceRanges,
    clearFilters,
  };
}
