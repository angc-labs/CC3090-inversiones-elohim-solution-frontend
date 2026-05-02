import { useState } from "react";
import { crearReservacion } from "@/lib/api/reservacion";
import { useAuthStore } from "@/stores/useAuthStore";
import { TReservacion } from "@/types";

export function useConfirmarReservacion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservacion, setReservacion] = useState<TReservacion | null>(null);
  const token = useAuthStore((state) => state.token);

  const confirmar = async (metodoPagoId: string) => {
    if (!token) {
      setError("No hay sesión activa");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await crearReservacion(token, metodoPagoId);
      setReservacion(result);
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al confirmar la reservación");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { confirmar, isLoading, error, reservacion, clearError: () => setError(null) };
}
