"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CiShoppingCart } from "react-icons/ci";
import { CiLogout } from "react-icons/ci";
import { logout as logoutRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

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

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        {/* Header Card with Search */}
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
                  <Link href="/carrito" className="flex items-center gap-2! text-slate-700 font-medium">
                    <CiShoppingCart className="text-2xl" />
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
        <main className="flex flex-1 px-4! py-4! sm:px-6! lg:px-8!">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
