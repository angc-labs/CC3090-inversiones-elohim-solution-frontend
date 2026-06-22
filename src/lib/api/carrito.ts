import { apiRequest, buildAuthHeaders } from "@/lib/api/client";
import { TCarritoApi, TCarritoItemApi } from "@/types";

type TCarritoElementoDto = {
  id: string;
  tiendaId: string;
  usuarioId: string;
  productoId: string;
  cantidad: number;
  fechaAdicion: string;
  productoNombre: string;
  precioDetalle: number;
  subtotal: number;
};

export async function obtenerCarrito(token: string): Promise<TCarritoApi> {
  const rawItems = await apiRequest<TCarritoElementoDto[]>(
    "/api/v1/carrito",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener el carrito"
  );

  const items: TCarritoItemApi[] = rawItems.map((item) => ({
    articuloId: item.id,
    productoId: item.productoId,
    nombreProducto: item.productoNombre || "Producto",
    cantidad: item.cantidad,
    precioUnitario: item.precioDetalle || 0,
    subtotal: item.subtotal || 0,
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    carritoId: "v1-cart",
    items,
    total,
  };
}

export async function agregarArticuloCarrito(
  token: string,
  payload: { productoId: string; cantidad: number }
): Promise<TCarritoItemApi> {
  const item = await apiRequest<TCarritoElementoDto>(
    "/api/v1/carrito/articulos",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ productoId: payload.productoId, cantidad: payload.cantidad }),
    },
    "Error al agregar artículo al carrito"
  );

  return {
    articuloId: item.id,
    productoId: item.productoId,
    nombreProducto: item.productoNombre || "Producto",
    cantidad: item.cantidad,
    precioUnitario: item.precioDetalle || 0,
    subtotal: item.subtotal || 0,
  };
}

export async function actualizarArticuloCarrito(
  token: string,
  articuloId: string,
  cantidad: number
): Promise<TCarritoItemApi> {
  const item = await apiRequest<TCarritoElementoDto>(
    `/api/v1/carrito/articulos/${articuloId}`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ cantidad }),
    },
    "Error al actualizar el artículo del carrito"
  );

  return {
    articuloId: item.id,
    productoId: item.productoId,
    nombreProducto: item.productoNombre || "Producto",
    cantidad: item.cantidad,
    precioUnitario: item.precioDetalle || 0,
    subtotal: item.subtotal || 0,
  };
}

export async function eliminarArticuloCarrito(token: string, articuloId: string): Promise<void> {
  await apiRequest<void>(
    `/api/v1/carrito/articulos/${articuloId}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(token),
    },
    "No se pudo eliminar el artículo del carrito"
  );
}
