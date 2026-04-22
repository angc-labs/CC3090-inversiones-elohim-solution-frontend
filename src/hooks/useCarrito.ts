import useSWR from "swr";
import { eliminarArticuloCarrito, obtenerCarrito } from "@/lib/api/carrito";
import { useAuthStore } from "@/stores/useAuthStore";

export function useCarrito() {
  const token = useAuthStore((state) => state.token);

  const { data, error, isLoading, mutate } = useSWR(
    token ? ["carrito", token] : null,
    ([, authToken]: [string, string]) => obtenerCarrito(authToken),
    { revalidateOnFocus: false }
  );

  const eliminarItem = async (articuloId: string) => {
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    await eliminarArticuloCarrito(token, articuloId);
    await mutate();
  };

  return {
    carrito: data,
    items: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
    eliminarItem,
  };
}
