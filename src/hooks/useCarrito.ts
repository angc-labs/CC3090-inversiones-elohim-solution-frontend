import useSWR from "swr";
import { useEffect, useState } from "react";
import { eliminarArticuloCarrito, actualizarArticuloCarrito, obtenerCarrito } from "@/lib/api/carrito";
import { obtenerProductoPorId } from "@/lib/api/productos";
import { useAuthStore } from "@/stores/useAuthStore";

export function useCarrito() {
  const token = useAuthStore((state) => state.token);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    token ? ["carrito", token] : null,
    ([, authToken]: [string, string]) => obtenerCarrito(authToken),
    { revalidateOnFocus: false }
  );

  // Ajustar cantidades si el stock cambió
  useEffect(() => {
    if (data?.items && token) {
      const ajustarStocks = async () => {
        const ajustes: Promise<void>[] = [];
        let adjusted = false;

        for (const item of data.items) {
          try {
            const producto = await obtenerProductoPorId(item.productoId);
            if (item.cantidad > producto.stockActual) {
              ajustes.push(
                actualizarArticuloCarrito(token, item.articuloId, producto.stockActual)
              );
              adjusted = true;
            }
          } catch (err) {
            console.error(`Error obteniendo stock para ${item.productoId}:`, err);
          }
        }

        if (ajustes.length > 0) {
          await Promise.all(ajustes);
          await mutate(); // Refrescar el carrito
          if (adjusted) {
            setStockWarning("Algunas cantidades se ajustaron debido a cambios en el stock disponible.");
          }
        }
      };

      void ajustarStocks();
    }
  }, [data, token, mutate]);

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
    stockWarning,
    clearStockWarning: () => setStockWarning(null),
  };
}
