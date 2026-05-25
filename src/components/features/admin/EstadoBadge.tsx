"use client";

import { cn } from "@/lib/utils";

type EstadoBadgeProps = {
  estado: "normal" | "critico" | "agotado";
  className?: string;
};

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-semibold rounded-full",
        estado === "normal" && "bg-green-100 text-green-700",
        estado === "critico" && "bg-orange-100 text-orange-700",
        estado === "agotado" && "bg-red-100 text-red-700",
        className
      )}
    >
      {estado === "normal" ? "Normal" : estado === "critico" ? "Crítico" : "Agotado"}
    </span>
  );
}
