"use client";

import { useReservas, useConfirmarReserva, useCancelarReserva } from "@/hooks/useReservas";
import { TEstadoReserva } from "@/types";
import { ReservaCard } from "./index";
import { EstadoVacio, ErrorMessage, ConfirmModal } from "@/components/ui";
import { useState } from "react";

export function ReservasShell() {
  const { reservas, isLoading, error, refetch } = useReservas();
  const { confirmarReserva, isLoading: isConfirming } = useConfirmarReserva();
  const { cancelarReserva, isLoading: isCanceling } = useCancelarReserva();

  const [modalConfirmacion, setModalConfirmacion] = useState<{
    isOpen: boolean;
    reservaId: string;
    accion: "confirmar" | "cancelar";
    mensaje: string;
  }>({
    isOpen: false,
    reservaId: "",
    accion: "confirmar",
    mensaje: "",
  });

  const handleConfirmarReserva = async (reservaId: string) => {
    try {
      await confirmarReserva(reservaId);
      refetch(); // Recargar la lista de reservas
      setModalConfirmacion({ isOpen: false, reservaId: "", accion: "confirmar", mensaje: "" });
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleCancelarReserva = async (reservaId: string) => {
    try {
      await cancelarReserva(reservaId);
      refetch(); // Recargar la lista de reservas
      setModalConfirmacion({ isOpen: false, reservaId: "", accion: "cancelar", mensaje: "" });
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const abrirModalConfirmacion = (reservaId: string, accion: "confirmar" | "cancelar") => {
    const mensaje = accion === "confirmar"
      ? "¿Estás seguro de que deseas confirmar esta reserva?"
      : "¿Estás seguro de que deseas cancelar esta reserva?";

    setModalConfirmacion({
      isOpen: true,
      reservaId,
      accion,
      mensaje,
    });
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion({ isOpen: false, reservaId: "", accion: "confirmar", mensaje: "" });
  };

  const handleAccionModal = () => {
    if (modalConfirmacion.accion === "confirmar") {
      handleConfirmarReserva(modalConfirmacion.reservaId);
    } else {
      handleCancelarReserva(modalConfirmacion.reservaId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando reservas...</span>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage mensaje={error} />;
  }

  if (!reservas.length) {
    return (
      <EstadoVacio
        mensaje="No tienes reservas registradas"
        descripcion="Cuando realices una reserva, aparecerá aquí tu historial"
      />
    );
  }

  // Agrupar reservas por estado
  const reservasPorEstado = reservas.reduce((acc, reserva) => {
    if (!acc[reserva.estado]) {
      acc[reserva.estado] = [];
    }
    acc[reserva.estado].push(reserva);
    return acc;
  }, {} as Record<TEstadoReserva, typeof reservas>);

  return (
    <div className="space-y-8">
      {/* Reservas Pendientes */}
      {reservasPorEstado.pendiente && reservasPorEstado.pendiente.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reservas Pendientes
          </h2>
          <div className="space-y-4">
            {reservasPorEstado.pendiente.map((reserva) => (
              <ReservaCard
                key={reserva.reservaId}
                reserva={reserva}
                onConfirmar={() => abrirModalConfirmacion(reserva.reservaId, "confirmar")}
                onCancelar={() => abrirModalConfirmacion(reserva.reservaId, "cancelar")}
                isLoading={isConfirming || isCanceling}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reservas Confirmadas */}
      {reservasPorEstado.confirmada && reservasPorEstado.confirmada.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reservas Confirmadas
          </h2>
          <div className="space-y-4">
            {reservasPorEstado.confirmada.map((reserva) => (
              <ReservaCard
                key={reserva.reservaId}
                reserva={reserva}
                onConfirmar={() => abrirModalConfirmacion(reserva.reservaId, "confirmar")}
                onCancelar={() => abrirModalConfirmacion(reserva.reservaId, "cancelar")}
                isLoading={isConfirming || isCanceling}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reservas Canceladas */}
      {reservasPorEstado.cancelada && reservasPorEstado.cancelada.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reservas Canceladas
          </h2>
          <div className="space-y-4">
            {reservasPorEstado.cancelada.map((reserva) => (
              <ReservaCard
                key={reserva.reservaId}
                reserva={reserva}
                onConfirmar={() => abrirModalConfirmacion(reserva.reservaId, "confirmar")}
                onCancelar={() => abrirModalConfirmacion(reserva.reservaId, "cancelar")}
                isLoading={isConfirming || isCanceling}
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={modalConfirmacion.isOpen}
        onCancel={cerrarModalConfirmacion}
        onConfirm={handleAccionModal}
        title="Confirmar Acción"
        message={modalConfirmacion.mensaje}
        confirmLabel={modalConfirmacion.accion === "confirmar" ? "Confirmar" : "Cancelar"}
        cancelLabel="Volver"
        isConfirming={isConfirming || isCanceling}
      />
    </div>
  );
}