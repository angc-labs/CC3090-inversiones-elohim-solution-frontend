"use client";

import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";
import { ProductCard } from "@/components/features/catalogo/ProductCard";
import { FilterMenu } from "@/components/features/catalogo/FilterMenu";
import { SearchBar } from "@/components/features/catalogo/SearchBar";
import { useProductFilters } from "@/hooks/useProductFilters";
import { type SearchSuggestion } from "@/hooks/useSearchSuggestions";

export default function CatalogoPage() {
  // Función para determinar el número de columnas según la cantidad de productos
  const getGridColsClass = (productCount: number) => {
    if (productCount >= 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (productCount === 2) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  // Hook de filtros
  const {
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
    isLoading,
    isError,
  } = useProductFilters();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "category") {
      setFilterType("category");
      setSelectedValues([suggestion.value]);
    } else if (suggestion.type === "brand") {
      setFilterType("brand");
      setSelectedValues([suggestion.value]);
    } else if (suggestion.type === "product") {
      setSearchQuery(suggestion.value);
    }
  };

  // Agrupar productos filtrados según el tipo de filtro activo
  const getGroupedProducts = () => {
    if (activeFilterType === "price") {
      // Agrupar por rango de precio
      const priceRanges = getPriceRanges();
      const grouped: Record<string, typeof filteredProducts> = {};

      priceRanges.forEach((range) => {
        grouped[range.label] = filteredProducts.filter(
          (p) => p.precio >= range.min && p.precio <= range.max
        );
      });

      return grouped;
    } else if (activeFilterType === "brand") {
      // Agrupar por marca
      return filteredProducts.reduce(
        (acc, product) => {
          const brand = product.idMarca ?? "sin-marca";
          if (!acc[brand]) {
            acc[brand] = [];
          }
          acc[brand].push(product);
          return acc;
        },
        {} as Record<string, typeof filteredProducts>
      );
    } else {
      // Agrupar por categoría (default)
      return filteredProducts.reduce(
        (acc, product) => {
          const categoryId = product.categoriaId ?? "sin-categoria";
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(product);
          return acc;
        },
        {} as Record<string, typeof filteredProducts>
      );
    }
  };

  const productsByGroup = getGroupedProducts();

  return (
    <CatalogoShell eyebrow="ESMIRNA" showSidebar={false}>
      {/* ── Contenedor con margen lateral consistente y centrado ── */}
      <div className="flex flex-col! justify-center px-4! sm:px-8! lg:px-12! gap-12!">
        <div className="w-full max-w-6xl flex flex-col! gap-5!">
          {/* Search Bar */}
          <div className="mb-8 border-blue-500! border-2! rounded-lg!">
            <SearchBar
              onSearch={handleSearch}
              onSuggestionSelect={handleSuggestionSelect}
              placeholder="Buscar productos, categorías o marcas..."
            />
          </div>

          {/* Filter Menu */}
          <div className="mb-12 z-100!">
            <FilterMenu
              activeFilterType={activeFilterType}
              onFilterTypeChange={setFilterType}
              selectedValues={selectedValues}
              onSelectionChange={setSelectedValues}
              categories={categories}
              brands={brands}
              priceRanges={getPriceRanges()}
              onClearAll={clearFilters}
            />
          </div>

          {isLoading && (
            <div className="rounded-xl! border border-slate-200 bg-white! p-6! text-sm! text-slate-500!">
              Cargando productos y filtros...
            </div>
          )}

          {isError && (
            <div className="rounded-xl! border! border-red-200 bg-red-50! p-6! text-sm! text-red-700!">
              No se pudo cargar el catálogo en este momento.
            </div>
          )}

          {/* Results Summary */}
          {(searchQuery || selectedValues.length > 0) && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
                {searchQuery && ` para "${searchQuery}"`}
              </p>
              {(searchQuery || selectedValues.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Limpiar todo
                </button>
              )}
            </div>
          )}

          {/* Products by Group */}
          {!isLoading && !isError && Object.entries(productsByGroup).map(([groupId, products]) => (
            products.length > 0 && (
              <div key={groupId} className="mb-24">
                {/* Group Title - Dinámico según filtro */}
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-2xl text-blue-600">→</span>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeFilterType === "brand"
                      ? getBrandLabel(groupId)
                      : activeFilterType === "category"
                        ? getCategoryLabel(groupId)
                        : groupId}
                  </h2>
                </div>

              {/* Products Grid */}
              <div className={`grid gap-8 ${getGridColsClass(products.length)}`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.idProducto}
                    name={product.nombreProducto}
                    description={product.descripcion ?? "Sin descripción"}
                    price={`Q${product.precio.toFixed(2)}`}
                    rating={5}
                    badge={null}
                    image={product.imagenPrincipal ?? "/placeholder.png"}
                    href={`/catalogo/${product.idProducto}`}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {/* No products message */}
        {!isLoading && !isError && Object.keys(productsByGroup).every((key) => productsByGroup[key].length === 0) && (
          <div className="text-center! py-12!">
            <p className="text-lg font-semibold! text-slate-500">
              No hay productos que coincidan con los filtros seleccionados
            </p>
          </div>
        )}
        </div>
      </div>
    </CatalogoShell>
  );
}
