"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  BarChart2,
  Users,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",     href: "/admin",                          icon: LayoutDashboard, sub: false },
  { label: "Productos",     href: "/admin/productos",                icon: Package,         sub: false },
  { label: "Inventario",    href: "/admin/inventario",               icon: Warehouse,       sub: false },
  { label: "Stock Crítico", href: "/admin/inventario/stock-critico", icon: AlertTriangle,   sub: true  },
  { label: "Pedidos",       href: "/admin/pedidos",                  icon: ShoppingCart,    sub: false },
  { label: "Ventas",        href: "/admin/ventas",                   icon: DollarSign,      sub: false },
  { label: "Reportes",      href: "/admin/reportes",                 icon: BarChart2,       sub: false },
  { label: "Usuarios",      href: "/admin/clientes",                 icon: Users,           sub: false },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-200 py-6 px-3">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
            E
          </div>
          <span className="font-semibold text-gray-900 tracking-wide">ESMIRNA</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  item.sub && "pl-8",
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors mt-4"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
