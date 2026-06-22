import useSWR from "swr";
import { obtenerReservaciones } from "@/lib/api/reservacion";
import { useClientAuthStore } from "@/stores/useClientAuthStore";
import type { TReservacionListado } from "@/types";

export function useHistorialCompras() {
  const token = useClientAuthStore((s) => s.token);

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
