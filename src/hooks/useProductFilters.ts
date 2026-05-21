import { useMemo, useState } from "react";
import useSWR from "swr";
import { useProductos } from "@/hooks/useProductos";
import { obtenerCategorias, obtenerMarcas } from "@/lib/api/productos";

export type FilterType = "category" | "price" | "brand";
export type TFilterOption = { value: string; label: string };

const PRICE_RANGES = [
  { label: "Q0 - Q5", min: 0, max: 5 },
  { label: "Q5 - Q10", min: 5, max: 10 },
  { label: "Q10 - Q15", min: 10, max: 15 },
  { label: "Q15 - Q20", min: 15, max: 20 },
  { label: "Q20+", min: 20, max: Infinity },
];

interface UseProductFiltersReturn {
  filteredProducts: ReturnType<typeof useProductos>["productos"];
  activeFilterType: FilterType;
  setFilterType: (type: FilterType) => void;
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: TFilterOption[];
  brands: TFilterOption[];
  getPriceRanges: () => Array<{ label: string; min: number; max: number }>;
  getCategoryLabel: (id: string) => string;
  getBrandLabel: (id: string) => string;
  clearFilters: () => void;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export function useProductFilters(): UseProductFiltersReturn {
  const { productos, isLoading: isLoadingProductos, isError, error } = useProductos();
  const { data: categorias = [], isLoading: isLoadingCategorias } = useSWR(
    "categorias",
    obtenerCategorias,
    { revalidateOnFocus: false }
  );
  const { data: marcas = [], isLoading: isLoadingMarcas } = useSWR(
    "marcas",
    obtenerMarcas,
    { revalidateOnFocus: false }
  );

  const [activeFilterType, setFilterType] = useState<FilterType>("category");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(
    () => categorias.map((categoria) => ({
      value: categoria.id,
      label: categoria.nombreCategoria,
    })),
    [categorias]
  );

  const brands = useMemo(
    () => marcas.map((marca) => ({
      value: marca.id,
      label: marca.nombreMarca,
    })),
    [marcas]
  );

  const getPriceRanges = () => PRICE_RANGES;

  const getCategoryLabel = (id: string) => {
    const option = categories.find((category) => category.value === id);
    return option?.label ?? id;
  };

  const getBrandLabel = (id: string) => {
    const option = brands.find((brand) => brand.value === id);
    return option?.label ?? id;
  };

  const clearFilters = () => {
    setSelectedValues([]);
    setSearchQuery("");
  };

  const filteredProducts = useMemo(() => {
    let products = productos;

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      products = products.filter((product) =>
        product.nombreProducto.toLowerCase().includes(lowerQuery) ||
        product.descripcion?.toLowerCase().includes(lowerQuery) ||
        product.categoriaId?.toLowerCase().includes(lowerQuery) ||
        product.idMarca?.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedValues.length === 0) {
      return products;
    }

    return products.filter((product) => {
      if (activeFilterType === "category") {
        return product.categoriaId ? selectedValues.includes(product.categoriaId) : false;
      } else if (activeFilterType === "brand") {
        return product.idMarca ? selectedValues.includes(product.idMarca) : false;
      } else if (activeFilterType === "price") {
        const priceRange = PRICE_RANGES.find((r) => r.label === selectedValues[0]);
        if (priceRange) {
          return (
            product.precio >= priceRange.min &&
            product.precio <= priceRange.max
          );
        }
      }
      return true;
    });
  }, [activeFilterType, productos, selectedValues, searchQuery]);

  return {
    filteredProducts,
    activeFilterType,
    setFilterType,
    selectedValues,
    setSelectedValues,
    searchQuery,
    setSearchQuery,
    categories,
    brands,
    getPriceRanges,
    getCategoryLabel,
    getBrandLabel,
    clearFilters,
    isLoading: isLoadingProductos || isLoadingCategorias || isLoadingMarcas,
    isError,
    error,
  };
}
