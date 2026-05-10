import useSWR from "swr";
import { obtenerReservaciones } from "@/lib/api/reservacion";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TReservacionListado } from "@/types";

export function useHistorialCompras() {
  const token = useAuthStore((s) => s.token);

  const { data, error, isLoading, mutate } = useSWR<TReservacionListado[]>(
    token ? ["historial-compras", token] : null,
    ([, authToken]: [string, string]) => obtenerReservaciones(authToken),
    { revalidateOnFocus: true }
  );

  return {
    reservaciones: data ?? [],
    isLoading,
    isError: !!error,
    error,
    refetch: mutate,
  };
}
