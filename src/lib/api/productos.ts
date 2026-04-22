import { apiRequest } from "@/lib/api/client";
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
    },
    "Error al obtener marcas"
  );
}

export async function obtenerCategorias(): Promise<TCategoria[]> {
  return apiRequest<TCategoria[]>(
    "/api/categorias",
    {
      method: "GET",
    },
    "Error al obtener categorías"
  );
}