"use client";

import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";

export default function CatalogoPage() {
  const products = [
    {
      id: 1,
      name: "String1",
      description: "String1",
      price: "Q0.99",
      rating: 5,
      reviews: 74,
      badge: "NUEVO",
      color: "bg-blue-200",
    },
    {
      id: 2,
      name: "String2",
      description: "String2.",
      price: "Q0.99",
      rating: 5,
      reviews: 45,
      badge: null,
      color: "bg-purple-200",
    },
    {
      id: 3,
      name: "String3",
      description: "String3",
      price: "Q0.99",
      rating: 5,
      reviews: 92,
      badge: "NUEVO",
      color: "bg-pink-200",
    },
  ];

  return (
    <CatalogoShell eyebrow="ESMIRNA Tienda En Línea" showSidebar={false}>
      {products.map((product) => (
        <div key={product.id} className="h-full">
          {/* Product Card Container */}
          <div className="relative h-full">
            {/* Top colored card with image area and icons */}
            <div className={`${product.color} rounded-2xl h-64 relative flex items-start justify-between p-4`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xs font-semibold text-gray-700">💎 {product.badge}</span>
              </div>
              {/* Heart icon */}
              <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
                <span className="text-xl">♡</span>
              </button>
              {/* Cart icon */}
              <button className="absolute bottom-4 right-4 p-2 bg-white/80 rounded-lg shadow-md hover:shadow-lg transition-shadow text-lg">🛒</button>
            </div>

            {/* Bottom white card with product info - overlapping */}
            <div className="relative -mt-12 mx-2 rounded-2xl bg-white p-5 shadow-md hover:shadow-lg transition-shadow">
              {/* Stars and reviews */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">⭐</span>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">{product.reviews}</span>
              </div>

              {/* Product name */}
              <h3 className="text-sm font-bold text-slate-900 mb-2">{product.name}</h3>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 leading-tight">{product.description}</p>

              {/* Price */}
              <p className="text-xl font-bold text-slate-900 mb-4">{product.price}</p>

              {/* Add to cart button */}
              <button className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold text-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2">
                <span>🛒</span> Añadir al carrito
              </button>
            </div>
          </div>
        </div>
      ))}
    </CatalogoShell>
  );
}
