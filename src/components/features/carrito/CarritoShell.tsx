"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useCarrito } from "@/hooks/useCarrito";

type CarritoShellProps = {
  children: ReactNode;
};

export function CarritoShell({ children }: CarritoShellProps) {
  const { items, total, eliminarItem, cambiarCantidad, isLoading, error, isError } = useCarrito();
  const [itemPendiente, setItemPendiente] = useState<string | null>(null);

  const subtotal = total;

  const handleOpenConfirm = (productoId: string) => {
    setItemPendiente(productoId);
  };

  const handleCloseConfirm = () => {
    setItemPendiente(null);
  };

  const handleConfirmDelete = () => {
    if (!itemPendiente) {
      return;
    }

    eliminarItem(itemPendiente);
    setItemPendiente(null);
  };

  return (
    <div className="lg:col-span-2! space-y-10! overflow-y-auto! w-full!">
      {children}
      {isLoading && (
        <div className="rounded-2xl! border! border-slate-200/80! bg-white/95! p-6! text-slate-600! shadow-md!">
          Cargando productos del carrito...
        </div>
      )}
      {isError && (
        <ErrorMessage mensaje={error instanceof Error ? error.message : "No se pudo cargar el carrito"} />
      )}
      {items.length === 0 && !isLoading && !isError && (
        <EstadoVacio
          mensaje="Tu carrito está vacío"
          descripcion="Agrega productos desde el catálogo para verlos aquí."
        />
      )}
      <div className="space-y-6! pb-10!">
        {items.map((item) => (
          <div key={item.productoId} className="rounded-2xl! border! border-slate-200/80! bg-white/95! p-6! shadow-md! backdrop-blur-sm! hover:shadow-lg! transition-shadow!">
            <div className="flex! flex-col! gap-6! lg:flex-row! lg:items-start! lg:justify-between!">
              <div className="flex-1!">
                <h3 className="text-lg! font-bold! text-slate-900!">{item.nombreProducto}</h3>
                <p className="text-sm! text-slate-500! mt-1!">
                  {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}
                </p>
                <p className="text-2xl! font-bold! text-blue-600! mt-3!">Q {item.subtotal.toFixed(2)}</p>
              </div>

              <div className="flex! flex-col! gap-4! sm:items-end!">
                <QuantitySelector
                  value={item.cantidad}
                  onChange={(cantidad) => {
                    void cambiarCantidad(item.articuloId, cantidad);
                  }}
                  label="Cantidad"
                />
                <button
                  className="inline-flex! items-center! gap-2! rounded-full! border! border-red-200! bg-red-50! px-4! py-2! text-sm! font-semibold! text-red-700! transition! hover:bg-red-100!"
                  onClick={() => {
                    handleOpenConfirm(item.articuloId);
                  }}
                  aria-label={`Eliminar ${item.nombreProducto} del carrito`}
                >
                  <Trash2 className="w-4! h-4!" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={itemPendiente !== null}
        title="Eliminar producto"
        message={
          itemPendiente
            ? "¿Seguro que deseas eliminar este producto del carrito? Esta acción no se puede deshacer."
            : ""
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        isConfirming={false}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseConfirm}
      />

      {items.length > 0 && (
        <div className="rounded-2xl! border! border-slate-200/80! bg-white/95! p-6! text-sm! text-slate-700!">
          Subtotal: <span className="font-semibold!">Q {subtotal.toFixed(2)}</span>
          <br />
          Total: <span className="font-semibold!">Q {total.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}