"use client";

import { useHistorialCompras } from "@/hooks/useHistorialCompras";
import { CompraReservacionCard } from "./CompraReservacionCard";
import { EstadoVacio, ErrorMessage } from "@/components/ui";

export function ReservasShell() {
  const { reservaciones, isLoading, isError, error } = useHistorialCompras();

  if (isLoading) {
    return (
      <div className="flex! items-center! justify-center! py-12!">
        <div className="h-8! w-8! animate-spin! rounded-full! border-b-2! border-blue-600!" />
        <span className="ml-2! text-gray-600!">Cargando tu historial…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorMessage
        mensaje={error instanceof Error ? error.message : "No se pudo cargar el historial de compras."}
      />
    );
  }

  if (!reservaciones.length) {
    return (
      <EstadoVacio
        mensaje="Aún no tenés compras registradas"
        descripcion="Cuando completes una reserva o pago, aparecerá aquí el historial."
      />
    );
  }

  const ordenadas = [...reservaciones].sort((a, b) => {
    const ta = new Date(a.fechaLimiteRetiro).getTime();
    const tb = new Date(b.fechaLimiteRetiro).getTime();
    return tb - ta;
  });

  return (
    <div className="space-y-4!">
      {ordenadas.map((r) => (
        <CompraReservacionCard key={r.idReservacion} reservacion={r} />
      ))}
    </div>
  );
}
