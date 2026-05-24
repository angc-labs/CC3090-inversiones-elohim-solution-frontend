"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  BarChart2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/components/features/auth/LogoutButton";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  sub?: boolean;
  adminOnly?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/productos", icon: Package, adminOnly: true },
  { label: "Ventas", href: "/admin/ventas", icon: DollarSign },
  { label: "Reportes", href: "/admin/reportes", icon: BarChart2 },
  { label: "Usuarios", href: "/admin/usuarios", icon: Users, adminOnly: true },
];

type AdminNavLinksProps = {
  items: AdminNavItem[];
  onNavigate?: () => void;
  className?: string;
};

export function AdminNavLinks({ items, onNavigate, className }: AdminNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex-1 space-y-0.5", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              item.sub && "pl-8",
              isActive
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon size={16} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

type AdminSidebarPanelProps = {
  items: AdminNavItem[];
  onNavigate?: () => void;
  showClose?: boolean;
  onClose?: () => void;
};

export function AdminSidebarPanel({
  items,
  onNavigate,
  showClose,
  onClose,
}: AdminSidebarPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 px-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
            E
          </div>
          <span className="font-semibold text-gray-900 tracking-wide">Esmira</span>
        </div>
        {showClose && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Cerrar menú"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      <AdminNavLinks items={items} onNavigate={onNavigate} />

      <div className="mt-4 px-1">
        <LogoutButton />
      </div>
    </>
  );
}
