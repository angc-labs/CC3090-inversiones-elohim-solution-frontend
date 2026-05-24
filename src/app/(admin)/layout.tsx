"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminRoute } from "@/components/features/auth/AdminRoute";
import {
  ADMIN_NAV_ITEMS,
  AdminSidebarPanel,
} from "@/components/features/admin/AdminNav";
import { isAdminRol } from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const usuario = useAuthStore((s) => s.usuario);
  const esAdmin = usuario ? isAdminRol(usuario.rol) : false;
  const itemsVisibles = ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || esAdmin);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <AdminRoute>
      <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
        {/* Sidebar escritorio */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white py-6 px-3 lg:flex">
          <AdminSidebarPanel items={itemsVisibles} />
        </aside>

        {/* Drawer móvil */}
        {menuAbierto ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            aria-label="Cerrar menú"
            onClick={cerrarMenu}
          />
        ) : null}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(100%,16rem)] flex-col border-r border-gray-200 bg-white py-6 px-3 shadow-xl transition-transform duration-200 lg:hidden",
            menuAbierto ? "translate-x-0" : "-translate-x-full"
          )}
          aria-hidden={!menuAbierto}
        >
          <AdminSidebarPanel
            items={itemsVisibles}
            onNavigate={cerrarMenu}
            showClose
            onClose={cerrarMenu}
          />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-gray-900">Esmira Admin</span>
          </header>

          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}
