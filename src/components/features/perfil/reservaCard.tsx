"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Reserva = {
  id: number;
  estado: string;
};

export function ReservaCard() {
  // Mock de datos (puedes cambiarlo luego por API)
  const [reservas, setReservas] = useState<Reserva[]>([
    { id: 1, estado: "PENDIENTE" },
    { id: 2, estado: "COMPLETADA" },
  ]);

  const cancelarReserva = async (id: number) => {
    const confirmar = window.confirm("¿Deseas cancelar esta reservación?");
    if (!confirmar) return;

    try {
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, estado: "CANCELADA" } : r
        )
      );

      alert("Reservación cancelada correctamente");
    } catch (error) {
      alert("Error al cancelar la reservación");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {reservas.map((reserva) => (
        <div
          key={reserva.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <p className="text-sm font-medium">
              Reserva #{reserva.id}
            </p>
            <p className="text-xs text-gray-500">
              Estado: {reserva.estado}
            </p>
          </div>

          {reserva.estado === "PENDIENTE" && (
            <Button
              variant="destructive"
              onClick={() => cancelarReserva(reserva.id)}
            >
              Cancelar reservación
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}