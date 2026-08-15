import { apiRequest, buildAuthHeaders } from "@/lib/api/client";
import { TCategoria, TMarca, TProducto } from "@/types";

export type TProductosParams = {
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
};

export type TProductosResponse = {
  total: number;
  pagina: number;
  limite: number;
  productos: TProducto[];
};

export type TProductoBusqueda = {
  idProducto: string;
  nombreProducto: string;
  precio: number;
  imagenPrincipal?: string;
};

type TBuscarProductosResponse = {
  query: string;
  resultados: TProductoBusqueda[];
};

function buildProductosQuery(params?: TProductosParams): string {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set("category", params.category);
  if (params?.brand) searchParams.set("brand", params.brand);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function obtenerProductos(params?: TProductosParams): Promise<TProductosResponse> {
  return apiRequest<TProductosResponse>(
    `/api/productos${buildProductosQuery(params)}`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
    },
    "Error al obtener productos"
  );
}

export async function obtenerProductosListado(params?: TProductosParams): Promise<TProducto[]> {
  const response = await obtenerProductos(params);
  return response.productos;
}

export async function obtenerProductoPorId(idProducto: string): Promise<TProducto> {
  return apiRequest<TProducto>(
    `/api/productos/${idProducto}`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
    },
    "Error al obtener detalle del producto"
  );
}

export async function buscarProductos(query: string): Promise<TProductoBusqueda[]> {
  const params = new URLSearchParams({ q: query });
  const response = await apiRequest<TBuscarProductosResponse>(
    `/api/productos/buscar?${params.toString()}`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
    },
    "Error al buscar productos"
  );

  return response.resultados;
}

export async function obtenerMarcas(): Promise<TMarca[]> {
  return apiRequest<TMarca[]>(
    "/api/marcas",
    {
      method: "GET",
      headers: buildAuthHeaders(),
    },
    "Error al obtener marcas"
  );
}

export async function obtenerCategorias(token?: string): Promise<TCategoria[]> {
  return apiRequest<TCategoria[]>(
    "/api/categorias",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener categorías"
  );
}

export type CrearProductoInput = {
  codigoProducto: string;
  nombreProducto: string;
  precio: number;
  stockActual: number;
  descripcion?: string;
  idMarca?: string;
  categoriaId?: string;
  fechaVencimiento?: string;
  imagenPrincipal?: string;
};

export type ActualizarProductoInput = {
  nombreProducto: string;
  precio: number;
  stockActual: number;
  descripcion?: string;
  idMarca?: string;
  categoriaId?: string;
  fechaVencimiento?: string;
  imagenPrincipal?: string;
};

export async function crearProducto(
  token: string,
  payload: CrearProductoInput
): Promise<TProducto> {
  return apiRequest<TProducto>(
    "/api/productos",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    },
    "No se pudo crear el producto"
  );
}

export async function actualizarProducto(
  token: string,
  idProducto: string,
  payload: ActualizarProductoInput
): Promise<TProducto> {
  return apiRequest<TProducto>(
    `/api/productos/${idProducto}`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    },
    "No se pudo actualizar el producto"
  );
}

export async function eliminarProducto(
  token: string,
  idProducto: string
): Promise<void> {
  await apiRequest<void>(
    `/api/productos/${idProducto}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(token),
    },
    "No se pudo eliminar el producto"
  );
}