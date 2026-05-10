"use client";

import { CarritoShell } from "@/components/features/carrito/CarritoShell";
import { useRouter } from "next/navigation";
import { CiLogout } from "react-icons/ci";
import { CiBoxList } from "react-icons/ci";
import Link from "next/link";
import { logout as logoutRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function CarritoPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      if (token) {
        await logoutRequest(token);
      }
    } catch {
      // Si falla el endpoint remoto, de todas formas se cierra la sesión local.
    } finally {
      logout();
      router.push("/login");
    }
  };

  const handleContinuarAlMetodo = () => {
    router.push("/metodoPago");
  };

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">

        {/* Header */}
        <div className="px-4! py-6! sm:px-6! lg:px-8!">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm!">
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4 p-4!">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold tracking-tight text-gray-900">
                    <Link href="/">ESMIRNA</Link>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4! mr-4!">
                <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                  <Link href="/catalogo" className="flex items-center gap-2! text-slate-700 font-medium">
                    <CiBoxList className="text-2xl" />
                  </Link>
                </button>
                <button
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="flex items-center gap-2 p-2! hover:bg-slate-100 rounded-lg transition-colors text-slate-700 font-medium"
                  aria-label="Cerrar sesión"
                >
                  <CiLogout className="text-2xl" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1! px-6! py-12! sm:px-8! lg:px-12! w-full!">
          <div className="w-full! mx-auto grid! grid-cols-1! lg:grid-cols-3! gap-10!">
            {/* Breadcrumb / Progreso */}
            <div className="col-span-1 lg:col-span-3 mb-8">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 font-medium">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
                  1
                </div>
                <span className="text-blue-600 font-semibold">Carrito</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-300 text-slate-400">
                  2
                </div>
                <span className="text-slate-400">Método</span>
                <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-300 text-slate-400">
                  3
                </div>
                <span className="text-slate-400">Resumen</span>
              </div>
            </div>

            <CarritoShell>
              <div className="flex items-center gap-4 mb-8!">
                <h2 className="text-2xl font-bold text-slate-900">
                  Productos seleccionados
                </h2>
              </div>
            </CarritoShell>

            {/* Botón continuar */}
            <div className="col-span-1 lg:col-span-3 flex justify-end">
              <button
                onClick={handleContinuarAlMetodo}
                className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Continuar 
              </button>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
