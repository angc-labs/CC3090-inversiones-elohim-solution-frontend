import useSWR from "swr";
import { useEffect, useState, useRef } from "react";
import { eliminarArticuloCarrito, actualizarArticuloCarrito, obtenerCarrito } from "@/lib/api/carrito";
import { obtenerProductoPorId } from "@/lib/api/productos";
import { useClientAuthStore } from "@/stores/useClientAuthStore";
import { TCarritoApi } from "@/types";

export function useCarrito() {
  const token = useClientAuthStore((state) => state.token);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [isRemovingItemId, setIsRemovingItemId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const inFlightAdjustments = useRef<Set<string>>(new Set());

  const { data, error, isLoading, mutate } = useSWR(
    token ? ["carrito", token] : null,
    ([, authToken]: [string, string]) => obtenerCarrito(authToken),
    { revalidateOnFocus: false }
  );

  // Ajustar cantidades si el stock cambió
  useEffect(() => {
    if (data?.items && token) {
      const ajustarStocks = async () => {
        let quantityAdjusted = false;
        let adjusted = false;

        for (const item of data.items) {
          if (inFlightAdjustments.current.has(item.articuloId)) {
            continue;
          }

          try {
            inFlightAdjustments.current.add(item.articuloId);
            const producto = await obtenerProductoPorId(item.productoId);
            if (item.cantidad > producto.stockActual) {
              await actualizarArticuloCarrito(token, item.articuloId, producto.stockActual);
              quantityAdjusted = true;
              adjusted = true;
            }
            inFlightAdjustments.current.delete(item.articuloId);
          } catch (err) {
            console.error(`Error obteniendo stock para ${item.productoId}:`, err);
            // Si el producto no se encuentra (404), eliminamos el artículo inválido del carrito automáticamente
            if (err && typeof err === "object" && "status" in err && err.status === 404) {
              try {
                await eliminarArticuloCarrito(token, item.articuloId);
                adjusted = true;
              } catch (deleteErr) {
                console.error(`Error al intentar eliminar artículo inválido ${item.articuloId}:`, deleteErr);
                inFlightAdjustments.current.delete(item.articuloId);
              }
            } else {
              inFlightAdjustments.current.delete(item.articuloId);
            }
          }
        }

        if (adjusted) {
          await mutate(); // Refrescar el carrito
          if (quantityAdjusted) {
            setStockWarning("Algunas cantidades se ajustaron debido a cambios en el stock disponible.");
          }
          inFlightAdjustments.current.clear();
        }
      };

      void ajustarStocks();
    }
  }, [data, token, mutate]);

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

  const cambiarCantidad = async (articuloId: string, cantidad: number) => {
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    await actualizarArticuloCarrito(token, articuloId, cantidad);
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
    cambiarCantidad,
    isRemovingItemId,
    removeError,
    clearRemoveError: () => setRemoveError(null),
    stockWarning,
    clearStockWarning: () => setStockWarning(null),
  };
}
