"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerProductoPorId } from "@/lib/api/productos";
import type { TProducto } from "@/types";
import { Button } from "@/components/ui/button";
import { formatGtq } from "@/lib/format";

export default function ProductoDetallePage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [producto, setProducto] = useState<TProducto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    setIsLoading(true);
    obtenerProductoPorId(id)
      .then((p) => setProducto(p))
      .catch((e) => setError(e.message || "Error al cargar el producto"))
      .finally(() => setIsLoading(false));
  }, [params]);

  if (isLoading) return <div className="p-8">Cargando producto...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!producto) return <div className="p-8">Producto no encontrado</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-lg p-4 shadow-sm">
          <img
            src={producto.imagenPrincipal ?? "/placeholder.png"}
            alt={producto.nombreProducto}
            className="w-full h-56 object-cover rounded-md"
          />
        </div>
        <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">{producto.nombreProducto}</h1>
          <div className="text-gray-600 mb-4">Código: {producto.codigoProducto}</div>
          <div className="text-emerald-700 text-2xl font-semibold mb-4">{formatGtq(producto.precio)}</div>
          <div className="mb-4 text-sm text-gray-700">{producto.descripcion ?? "Sin descripción"}</div>

          <div className="flex items-center gap-3 mt-6">
            <Button onClick={() => router.back()} variant="outline">Volver</Button>
            <Button onClick={() => router.push(`/admin/productos`)}>Ir a Inventario</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
