import type { ReactNode } from "react";

type CatalogoShellProps = {
  children: ReactNode;
  eyebrow?: string;
  showSidebar?: boolean;
};

export function CatalogoShell({
  children,
  eyebrow = "CATÁLOGO DE PRODUCTOS",
  showSidebar = false,
}: CatalogoShellProps) {
  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        {/* Header Card with Search */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <span className="text-4xl leading-none">🛍</span>
                </div>
                <div>
                  <p className="text-lg font-black uppercase tracking-[0.28em] text-blue-700">
                    {eyebrow}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <span className="text-2xl">🛒</span>
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <span className="text-2xl">👤</span>
                </button>
              </div>
            </div>
            <div className="w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full px-6 py-3 rounded-2xl border border-slate-200/80 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Product Category Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">→</span>
                <h2 className="text-2xl font-bold text-slate-900">Producto 1</h2>
              </div>
              
              {/* Product Cards Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
