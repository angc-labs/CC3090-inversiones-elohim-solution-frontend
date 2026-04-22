import useSWR from "swr";
import { obtenerProductos } from "@/lib/api/productos";
import { TProducto } from "@/types";

export function useProductos() {
  const { data, error, isLoading, mutate } = useSWR(
    "productos",
    () => obtenerProductos({ page: 1, limit: 100 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    productos: (data?.productos ?? []) as TProducto[],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}