import { apiRequest, buildAuthHeaders, API_URL } from "@/lib/api/client";
import { TCarritoApi, TCarritoItemApi } from "@/types";

export async function obtenerCarrito(token: string): Promise<TCarritoApi> {
  return apiRequest<TCarritoApi>(
    "/api/carrito",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener el carrito"
  );
}

export async function agregarArticuloCarrito(
  token: string,
  payload: { productoId: string; cantidad: number }
): Promise<TCarritoItemApi> {
  return apiRequest<TCarritoItemApi>(
    "/api/carrito/articulos",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    },
    "Error al agregar artículo al carrito"
  );
}

export async function actualizarArticuloCarrito(
  token: string,
  articuloId: string,
  cantidad: number
): Promise<TCarritoItemApi> {
  return apiRequest<TCarritoItemApi>(
    `/api/carrito/articulos/${articuloId}`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ cantidad }),
    },
    "Error al actualizar el artículo del carrito"
  );
}

export async function eliminarArticuloCarrito(token: string, articuloId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/carrito/articulos/${articuloId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el artículo del carrito");
  }
}
