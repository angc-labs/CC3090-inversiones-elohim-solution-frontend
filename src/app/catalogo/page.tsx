"use client";

import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";
import { ProductCard } from "@/components/features/catalogo/ProductCard";
import { FilterMenu } from "@/components/features/catalogo/FilterMenu";
import { useProductFilters } from "@/hooks/useProductFilters";

export default function CatalogoPage() {
  // Función para determinar el número de columnas según la cantidad de productos
  const getGridColsClass = (productCount: number) => {
    if (productCount >= 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (productCount === 2) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1";
  };

  // Hook de filtros
  const {
    filteredProducts,
    activeFilterType,
    setFilterType,
    selectedValues,
    setSelectedValues,
    getCategories,
    getBrands,
    getPriceRanges,
  } = useProductFilters();

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
          const brand = product.idMarca;
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
          const categoryId = product.categoriaId;
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
    <CatalogoShell eyebrow="ESMIRNA Tienda En Línea" showSidebar={false}>
      {/* ── Contenedor con margen lateral consistente y centrado ── */}
      <div className="flex justify-center px-4 sm:px-8 lg:px-12">
        <div className="w-full max-w-6xl">
        {/* Filter Menu */}
        <div className="mb-12">
          <FilterMenu
            activeFilterType={activeFilterType}
            onFilterTypeChange={setFilterType}
            selectedValues={selectedValues}
            onSelectionChange={setSelectedValues}
            categories={getCategories()}
            brands={getBrands()}
            priceRanges={getPriceRanges()}
          />
        </div>

        {/* Products by Group */}
        {Object.entries(productsByGroup).map(([groupId, products]) => (
          products.length > 0 && (
            <div key={groupId} className="mb-24">
              {/* Group Title - Dinámico según filtro */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl text-blue-600">→</span>
                <h2 className="text-2xl font-bold text-slate-900">{groupId}</h2>
              </div>

              {/* Products Grid */}
              <div className={`grid gap-8 ${getGridColsClass(products.length)}`}>
                {products.map((product, index) => (
                  <ProductCard
                    key={product.idProducto}
                    id={parseInt(product.idProducto)}
                    name={product.nombreProducto}
                    description={product.descripcion}
                    price={`Q${product.precio.toFixed(2)}`}
                    rating={5}
                    badge={null}
                    image={product.imagenPrincipal}
                  />
                ))}
              </div>
            </div>
          )
        ))}

        {/* No products message */}
        {Object.keys(productsByGroup).every((key) => productsByGroup[key].length === 0) && (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-slate-500">
              No hay productos que coincidan con los filtros seleccionados
            </p>
          </div>
        )}
        </div>
      </div>
    </CatalogoShell>
  );
}
