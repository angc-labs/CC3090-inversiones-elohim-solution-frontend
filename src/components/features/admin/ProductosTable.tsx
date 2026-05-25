"use client";

import { Pencil, Trash2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatGtq } from "@/lib/format";
import type { TProducto } from "@/types";
import Link from "next/link";

type Props = {
  cargando: boolean;
  productos: TProducto[];
  onEditar: (producto: TProducto) => void;
  onEliminar: (producto: TProducto) => void;
  onOferta?: (producto: TProducto) => void;
};

export function ProductosTable({ cargando, productos, onEditar, onEliminar }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {cargando ? (
        <div className="px-4 py-10 text-center text-gray-400 text-sm">
          Cargando productos…
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Código</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Producto</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Precio</th>
                <th className="text-center px-4 py-3 text-slate-500 font-medium">Stock</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const critico =
                  producto.stockMinimo != null &&
                  producto.stockActual <= producto.stockMinimo;
                return (
                  <tr key={producto.idProducto} className="border-b last:border-0">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-4 hover:bg-slate-50 rounded-md p-3 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-gray-100 rounded-md p-2 text-sm font-medium">{producto.codigoProducto}</div>
                          <div>
                            <Link href={`/productos/${producto.idProducto}`} className="text-gray-900 font-medium hover:underline">
                              {producto.nombreProducto}
                            </Link>
                            <div className="text-sm text-gray-600">{formatGtq(producto.precio)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-sm text-gray-500">Stock</div>
                            <div className="font-medium text-gray-800">{producto.stockActual}</div>
                          </div>
                          <div>
                            <Badge className={critico ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                              {critico ? "Stock bajo" : "OK"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOferta?.(producto)}
                              className="p-1.5 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                              aria-label={`Oferta ${producto.nombreProducto}`}
                            >
                              <Tag size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditar(producto)}
                              className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                              aria-label={`Editar ${producto.nombreProducto}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onEliminar(producto)}
                              className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-100"
                              aria-label={`Eliminar ${producto.nombreProducto}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {productos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
