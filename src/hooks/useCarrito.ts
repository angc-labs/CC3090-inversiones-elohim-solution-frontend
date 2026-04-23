import useSWR from "swr";
import { useState } from "react";
import { eliminarArticuloCarrito, obtenerCarrito } from "@/lib/api/carrito";
import { useAuthStore } from "@/stores/useAuthStore";
import { TCarritoApi } from "@/types";

export function useCarrito() {
  const token = useAuthStore((state) => state.token);
  const [isRemovingItemId, setIsRemovingItemId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    token ? ["carrito", token] : null,
    ([, authToken]: [string, string]) => obtenerCarrito(authToken),
    { revalidateOnFocus: false }
  );

  const eliminarItem = async (articuloId: string) => {
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    const previousCarrito = data;

    setIsRemovingItemId(articuloId);
    setRemoveError(null);

    await mutate(
      (current) => {
        if (!current) {
          return current;
        }

        const nextItems = current.items.filter((item) => item.articuloId !== articuloId);
        const nextTotal = nextItems.reduce((sum, item) => sum + item.subtotal, 0);

        return {
          ...current,
          items: nextItems,
          total: nextTotal,
        } as TCarritoApi;
      },
      false
    );

    try {
      await eliminarArticuloCarrito(token, articuloId);
      await mutate();
    } catch {
      await mutate(previousCarrito, false);
      setRemoveError("No se pudo eliminar el producto del carrito");
    } finally {
      setIsRemovingItemId(null);
    }
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
    isRemovingItemId,
    removeError,
  };
}
