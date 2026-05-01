"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import productosCompradosData from "@/mock/productosComprados.json";

export function HistorialCard() {
  return (
    <div className="w-full space-y-4 pt-6 border-t border-gray-300">
      <div className="px-4 pt-4">
        <h4 className="text-sm font-semibold tracking-tight text-gray-700">
          Productos más comprados
        </h4>
      </div>

      <div className="space-y-2 px-4 pb-4">
        {productosCompradosData.productosComprados.map((producto) => (
          <div
            key={producto.idProducto}
            className="flex items-center gap-3 rounded-lg bg-white p-3 transition-all hover:shadow-sm hover:border-blue-200 border border-gray-200"
          >
            {/* Imagen */}
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              <Image
                src={producto.imagenPrincipal}
                alt={producto.nombreProducto}
                fill
                className="object-cover"
              />
            </div>

            {/* Información */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-gray-900">
                {producto.nombreProducto}
              </p>
              <p className="truncate text-xs text-gray-500">
                {producto.descripcion}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600">
                  ${producto.precio.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">
                  ×{producto.vecesComprado}
                </span>
              </div>
            </div>

            {/* Botón agregar */}
            <button
              className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700"
              aria-label={`Agregar ${producto.nombreProducto} al carrito`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
