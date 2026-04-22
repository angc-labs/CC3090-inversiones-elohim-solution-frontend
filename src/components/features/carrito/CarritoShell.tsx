import type { ReactNode } from "react";
import { CiTrash } from "react-icons/ci";
import carritoData from "@/mock/carrito.json";

type CarritoShellProps = {
  children: ReactNode;
  eyebrow?: string;
};

export function CarritoShell({
  children,
  eyebrow = "CARRITO DE COMPRAS",
}: CarritoShellProps) {
  // Calculate subtotal from carrito items
  const subtotal = carritoData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = carritoData.total;

  return (
    <div className="lg:col-span-2! space-y-10! overflow-y-auto">
      {children}
      <div className="space-y-6! pb-10!">
        {carritoData.items.map((item) => (
          <div key={item.articuloId} className="rounded-2xl border border-slate-200/80 bg-white/95 p-6! shadow-md backdrop-blur-sm hover:shadow-lg transition-shadow">
            <div className="flex! items-start! justify-between! gap-4!">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{item.nombreProducto}</h3>
                <p className="text-sm text-slate-500 mt-1">Cantidad: {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}</p>
                <p className="text-2xl font-bold text-blue-600 mt-3">Q {item.subtotal.toFixed(2)}</p>
              </div>
              <button className="p-2! hover:bg-red-50 rounded-lg 
              transition-colors flex-shrink-0!">
                  <CiTrash className="text-xl!"/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}