"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CiShoppingCart, CiLogout, CiBoxList } from "react-icons/ci";
import { Receipt, UserRound } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";

export type ShopNavbarActionsProps = {
  showCart?: boolean;
  showCatalog?: boolean;
};

export function ShopNavbarActions({ showCart = true, showCatalog = false }: ShopNavbarActionsProps) {
  const pathname = usePathname();
  const handleLogout = useLogout();

  return (
    <div className="mr-4! flex! flex-wrap! items-center! justify-end! gap-1! sm:gap-2!">
      <Link
        href="/reservas"
        className={cn(
          "flex! items-center! gap-2! rounded-lg! p-2! font-medium! transition-colors! hover:bg-slate-100!",
          pathname === "/reservas" ? "bg-blue-50! text-blue-800!" : "text-slate-700!"
        )}
        aria-label="Historial de compras"
      >
        <Receipt className="h-5! w-5! shrink-0!" strokeWidth={2} />
        <span className="hidden! sm:inline!">Mis compras</span>
      </Link>
      <Link
        href="/perfil"
        className={cn(
          "flex! items-center! gap-2! rounded-lg! p-2! font-medium! transition-colors! hover:bg-slate-100!",
          pathname === "/perfil" ? "bg-blue-50! text-blue-800!" : "text-slate-700!"
        )}
        aria-label="Mi perfil"
      >
        <UserRound className="h-5! w-5! shrink-0!" strokeWidth={2} />
        <span className="hidden! sm:inline!">Mi perfil</span>
      </Link>
      {showCatalog && (
        <button type="button" className="rounded-lg! p-2! transition-colors! hover:bg-slate-100!">
          <Link
            href="/catalogo"
            className="flex! items-center! gap-2! font-medium! text-slate-700!"
            aria-label="Ir al catálogo"
          >
            <CiBoxList className="text-2xl!" />
            <span className="hidden! md:inline!">Catálogo</span>
          </Link>
        </button>
      )}
      {showCart && (
        <button type="button" className="rounded-lg! p-2! transition-colors! hover:bg-slate-100!">
          <Link
            href="/carrito"
            className="flex! items-center! gap-2! font-medium! text-slate-700!"
            aria-label="Ir al carrito"
          >
            <CiShoppingCart className="text-2xl!" />
            <span className="hidden! md:inline!">Carrito</span>
          </Link>
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          void handleLogout();
        }}
        className="flex! items-center! gap-2! rounded-lg! p-2! font-medium! text-slate-700! transition-colors! hover:bg-slate-100!"
        aria-label="Cerrar sesión"
      >
        <CiLogout className="text-2xl!" />
        <span className="hidden! sm:inline!">Cerrar sesión</span>
      </button>
    </div>
  );
}
