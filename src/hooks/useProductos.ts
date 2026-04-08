import useSWR from "swr";
import { obtenerProductos } from "@/lib/api/productos";
import { TProducto } from "@/types";

export function useProductos() {
  const { data, error, isLoading, mutate } = useSWR<TProducto[]>(
    "productos",
    obtenerProductos,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    productos: data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}