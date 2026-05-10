"use client";

import { TReserva } from "@/types";
import { Card, Button, Badge } from "@/components/ui";
import { Calendar, Package, DollarSign } from "lucide-react";

interface ReservaCardProps {
  reserva: TReserva;
  onConfirmar: () => void;
  onCancelar: () => void;
  isLoading: boolean;
}

export function ReservaCard({ reserva, onConfirmar, onCancelar, isLoading }: ReservaCardProps) {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "confirmada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "Pendiente";
      case "confirmada":
        return "Confirmada";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Reserva #{reserva.reservaId.slice(-8)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {formatFecha(reserva.fechaReserva)}
            </span>
          </div>
        </div>
        <Badge className={getEstadoColor(reserva.estado)}>
          {getEstadoTexto(reserva.estado)}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {reserva.items.length} producto{reserva.items.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-lg font-semibold text-gray-900">
            Q{reserva.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Productos:</h4>
        <div className="space-y-2">
          {reserva.items.map((item) => (
            <div key={item.reservaItemId} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.nombreProducto} x{item.cantidad}
              </span>
              <span className="text-gray-900 font-medium">
                Q{item.subtotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {reserva.estado === "pendiente" && (
        <div className="flex gap-2 mt-4">
          <Button
            onClick={onConfirmar}
            disabled={isLoading}
            className="flex-1"
            variant="default"
          >
            {isLoading ? "Confirmando..." : "Confirmar Reserva"}
          </Button>
          <Button
            onClick={onCancelar}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? "Cancelando..." : "Cancelar Reserva"}
          </Button>
        </div>
      )}

      {reserva.fechaConfirmacion && (
        <div className="mt-4 text-sm text-green-600">
          Confirmada el {formatFecha(reserva.fechaConfirmacion)}
        </div>
      )}

      {reserva.fechaCancelacion && (
        <div className="mt-4 text-sm text-red-600">
          Cancelada el {formatFecha(reserva.fechaCancelacion)}
        </div>
      )}
    </Card>
  );
}