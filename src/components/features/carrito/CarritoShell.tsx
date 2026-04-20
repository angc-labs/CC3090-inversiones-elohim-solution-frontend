import type { ReactNode } from "react";
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
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">

        {/* Header */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <span className="text-4xl leading-none">🛒</span>
                </div>
                <p className="text-lg font-black uppercase tracking-[0.28em] text-blue-700">
                  {eyebrow}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-slate-700 font-medium">
                  <span className="text-lg">←</span>
                  <span>Regresar</span>
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <span className="text-2xl">👤</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 px-6 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Products — left */}
            <div className="lg:col-span-2 space-y-10 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-2xl">🛍️</span>
                <h2 className="text-2xl font-bold text-slate-900">Productos seleccionados</h2>
              </div>
              <div className="space-y-6 pb-10">
                {children || (
                  <>
                    {carritoData.items.map((item) => (
                      <div key={item.articuloId} className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-md backdrop-blur-sm hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">{item.nombreProducto}</h3>
                            <p className="text-sm text-slate-500 mt-1">Cantidad: {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'}</p>
                            <p className="text-2xl font-bold text-blue-600 mt-3">Q {item.subtotal.toFixed(2)}</p>
                          </div>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                            <span className="text-xl">🗑️</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Summary — right */}
            <div className="lg:col-span-1">
              <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <span className="text-2xl">📋</span>
                  <h2 className="text-xl font-bold text-slate-900">Resumen Total</h2>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-semibold text-lg">Q {subtotal.toFixed(2)}</span>
                </div>

                {/* Total a pagar */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold text-lg">Total a pagar:</span>
                  <div className="text-4xl font-bold text-blue-600">Q {total.toFixed(2)}</div>
                </div>

                {/* Card Info */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">💳</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium">Tarjeta terminada en</p>
                      <p className="text-slate-900 font-semibold">•••• 4589</p>
                    </div>
                    <button className="text-blue-600 text-xs font-semibold hover:underline flex-shrink-0">
                      Cambiar
                    </button>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-md shadow-blue-600/20">
                    <span className="text-2xl">🛒</span>
                    <div className="text-center leading-tight">
                      <div className="text-lg">FINALIZAR</div>
                      <div className="text-lg">COMPRA</div>
                    </div>
                  </button>
                  <p className="text-center text-sm text-slate-500">
                    Presione el botón grande azul para terminar.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}