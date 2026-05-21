import { useState, useEffect } from "react";
import { TReserva } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useReservas() {
  const [reservas, setReservas] = useState<TReserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/reservas`, {
        credentials: "include", 
      });
      if (!response.ok) {
        throw new Error("Error al obtener reservas");
      }
      const data = await response.json();
      setReservas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return {
    reservas,
    isLoading,
    error,
    refetch: fetchReservas,
  };
}

export function useConfirmarReserva() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmarReserva = async (reservaId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/reservas/${reservaId}/confirmar`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Error al confirmar reserva");
      }
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    confirmarReserva,
    isLoading,
    error,
  };
}

export function useCancelarReserva() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelarReserva = async (reservaId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/reservas/${reservaId}/cancelar`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Error al cancelar reserva");
      }
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cancelarReserva,
    isLoading,
    error,
  };
}