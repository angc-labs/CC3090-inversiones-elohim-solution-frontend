"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
  showLabel?: boolean;
  variant?: "sidebar" | "inline";
};

export function LogoutButton({
  className,
  showLabel = true,
  variant = "sidebar",
}: LogoutButtonProps) {
  const handleLogout = useLogout();

  const baseClass =
    variant === "sidebar"
      ? "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      : "flex items-center gap-2 rounded-lg p-2 font-medium text-slate-700 transition-colors hover:bg-slate-100";

  return (
    <button
      type="button"
      onClick={() => {
        void handleLogout();
      }}
      className={cn(baseClass, className)}
      aria-label="Cerrar sesión"
    >
      <LogOut size={variant === "sidebar" ? 16 : 20} />
      {showLabel && <span>Cerrar sesión</span>}
    </button>
  );
}
