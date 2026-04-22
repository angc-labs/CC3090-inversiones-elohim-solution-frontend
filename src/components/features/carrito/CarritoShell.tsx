"use client";

import type { ReactNode } from "react";
import { CiTrash } from "react-icons/ci";
import { useCarrito } from "@/hooks/useCarrito";

type CarritoShellProps = {
  children: ReactNode;
};

export function CarritoShell({ children }: CarritoShellProps) {
  const { items, total, isLoading, isError, eliminarItem } = useCarrito();

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (isLoading) {
    return (
      <div className="lg:col-span-2! space-y-8!">
        {children}
        <div className="rounded-2xl border! border-slate-200 bg-white! p-6! text-sm! text-slate-500!">
          Cargando carrito...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="lg:col-span-2! space-y-8!">
        {children}
        <div className="rounded-2xl border! border-red-200 bg-red-50! p-6! text-sm! text-red-700!">
          No se pudo cargar tu carrito.
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2! space-y-10! overflow-y-auto w-full!">
      {children}
      {items.length === 0 && (
        <div className="rounded-2xl! w-full! border! border-slate-200/80 bg-white/95 p-6! text-slate-600!">
          Tu carrito está vacío.
        </div>
      )}
      <div className="space-y-6! pb-10!">
        {items.map((item) => (
          <div key={item.articuloId} className="rounded-2xl border border-slate-200/80 bg-white/95 p-6! shadow-md backdrop-blur-sm hover:shadow-lg transition-shadow">
            <div className="flex! items-start! justify-between! gap-4!">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{item.nombreProducto}</h3>
                <p className="text-sm text-slate-500 mt-1">Cantidad: {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}</p>
                <p className="text-2xl font-bold text-blue-600 mt-3">Q {item.subtotal.toFixed(2)}</p>
              </div>
              <button
                className="p-2! hover:bg-red-50 rounded-lg transition-colors flex-shrink-0!"
                onClick={() => {
                  void eliminarItem(item.articuloId);
                }}
                aria-label={`Eliminar ${item.nombreProducto} del carrito`}
              >
                  <CiTrash className="text-xl!"/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 text-sm text-slate-700">
          Subtotal: <span className="font-semibold">Q {subtotal.toFixed(2)}</span>
          <br />
          Total: <span className="font-semibold">Q {total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}