"use client";

import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";
import { ProductCard } from "@/components/features/catalogo/ProductCard";
import productosData from "@/mock/producto.json";

export default function CatalogoPage() {
  // Colores rotacionales para las tarjetas
  const colors = ["bg-blue-200", "bg-purple-200", "bg-pink-200", "bg-green-200", "bg-yellow-200"];

  // Función para determinar el número de columnas según la cantidad de productos
  const getGridColsClass = (productCount: number) => {
    if (productCount >= 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (productCount === 2) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1";
  };

  // Agrupar productos por categoriaId
  const productsByCategory = productosData.productos.reduce(
    (acc, product) => {
      const categoryId = product.categoriaId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    },
    {} as Record<string, typeof productosData.productos>
  );

  return (
    <CatalogoShell eyebrow="ESMIRNA Tienda En Línea" showSidebar={false}>
      {Object.entries(productsByCategory).map(([categoryId, products]) => (
        <div key={categoryId} className="mb-24">
          {/* Category Title */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl text-blue-600">→</span>
            <h2 className="text-2xl font-bold text-slate-900">{categoryId}</h2>
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
                reviews={Math.floor(Math.random() * 100) + 1}
                badge={null}
                color={colors[index % colors.length]}
                image={product.imagenPrincipal}
              />
            ))}
          </div>
        </div>
      ))}
    </CatalogoShell>
  );
}
