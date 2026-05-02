"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { CiTrash } from "react-icons/ci";
import { useCarrito } from "@/hooks/useCarrito";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

type CarritoShellProps = {
  children: ReactNode;
};

export function CarritoShell({ children }: CarritoShellProps) {
  const { items, total, isLoading, isError, eliminarItem, stockWarning, clearStockWarning } = useCarrito();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState<{ id: string; nombre: string } | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleAbrirConfirmacion = (articuloId: string, nombreProducto: string) => {
    setItemAEliminar({ id: articuloId, nombre: nombreProducto });
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setItemAEliminar(null);
  };

  const handleConfirmarEliminacion = async () => {
    if (!itemAEliminar) return;
    setEliminando(true);
    try {
      await eliminarItem(itemAEliminar.id);
    } finally {
      setEliminando(false);
      handleCerrarModal();
    }
  };

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
      {stockWarning && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 text-sm text-orange-700">
          {stockWarning}
          <button
            onClick={clearStockWarning}
            className="ml-2 text-orange-600 hover:text-orange-800 font-medium"
          >
            ×
          </button>
        </div>
      )}
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
                onClick={() => handleAbrirConfirmacion(item.articuloId, item.nombreProducto)}
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

      {items.length > 0 && (
        <Link
          href="/carrito/confirmar"
          className="block w-full px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold text-center hover:shadow-md transition-shadow hover:from-blue-800 hover:to-blue-700"
        >
          Confirmar reservación
        </Link>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={modalAbierto}
        title="¿Estás seguro?"
        message={`¿Deseas eliminar "${itemAEliminar?.nombre}" de tu carrito?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous
        isLoading={eliminando}
        onConfirm={handleConfirmarEliminacion}
        onCancel={handleCerrarModal}
      />
    </div>
  );
}