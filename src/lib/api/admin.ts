import { apiRequest, buildAuthHeaders } from "@/lib/api/client";

export type UsuarioAdminDto = {
  id: string;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
  tipoUsuario: string;
  rol: string | null;
  estado: boolean;
  fechaCreacion: string;
};

export async function getAdminUsuarios(
  token: string,
  params?: { busqueda?: string; tipoUsuario?: string; estado?: boolean }
): Promise<UsuarioAdminDto[]> {
  const query = new URLSearchParams();
  if (params?.busqueda) query.set("busqueda", params.busqueda);
  if (params?.tipoUsuario) query.set("tipoUsuario", params.tipoUsuario);
  if (params?.estado !== undefined) query.set("estado", String(params.estado));

  const qs = query.toString();
  return apiRequest<UsuarioAdminDto[]>(
    `/api/admin/usuarios${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: buildAuthHeaders(token) },
    "No se pudo obtener la lista de usuarios"
  );
}

export type CrearUsuarioAdminInput = {
  correo: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  contrasena: string;
  tipoUsuario: "cliente" | "administrador";
  rol?: "cajero" | "administrador";
  tipoCliente?: "mayorista" | "minorista" | "particular";
  direccion?: string;
};

export async function crearUsuarioAdmin(
  token: string,
  payload: CrearUsuarioAdminInput
): Promise<UsuarioAdminDto> {
  return apiRequest<UsuarioAdminDto>(
    "/api/admin/usuarios",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    },
    "No se pudo crear el usuario"
  );
}

export type CambiarRolUsuarioInput = {
  rol: "cliente" | "cajero" | "administrador";
  tipoCliente?: "mayorista" | "minorista" | "particular";
  direccion?: string;
};

export async function cambiarRolUsuario(
  token: string,
  id: string,
  payload: CambiarRolUsuarioInput
): Promise<UsuarioAdminDto> {
  return apiRequest<UsuarioAdminDto>(
    `/api/admin/usuarios/${id}/rol`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    },
    "No se pudo cambiar el rol del usuario"
  );
}

export async function cambiarEstadoUsuario(
  token: string,
  id: string,
  estado: boolean
): Promise<UsuarioAdminDto> {
  return apiRequest<UsuarioAdminDto>(
    `/api/admin/usuarios/${id}/estado`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ estado }),
    },
    "No se pudo cambiar el estado del usuario"
  );
}

export type TInventarioResumen = {
  totalProductos: number;
  stockNormal: number;
  stockCritico: number;
  valorInventario: number;
};

export type TInventarioProducto = {
  idProducto: string;
  codigoProducto: string;
  nombreProducto: string;
  descripcion?: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  estado: "normal" | "critico" | "agotado";
  valorStock: number;
  descuentoPorcentaje?: number | null;
  ofertaHasta?: string | null;
  categoria?: { id: string; nombre: string } | null;
  marca?: { id: string; nombre: string } | null;
  imagenPrincipal?: string | null;
  fechaVencimiento?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
};

export type TInventarioResponse = {
  resumen: TInventarioResumen;
  total: number;
  pagina: number;
  limite: number;
  productos: TInventarioProducto[];
};

export type TInventarioParams = {
  q?: string;
  categoriaId?: string;
  estado?: "critico" | "normal" | "agotado";
  orderBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

function buildInventarioQuery(params?: TInventarioParams) {
  const qs = new URLSearchParams();
  if (!params) return "";
  if (params.q) qs.set("q", params.q);
  if (params.categoriaId) qs.set("categoriaId", params.categoriaId);
  if (params.estado) qs.set("estado", params.estado);
  if (params.orderBy) qs.set("orderBy", params.orderBy);
  if (params.order) qs.set("order", params.order);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export async function getAdminInventario(
  params?: TInventarioParams
): Promise<TInventarioResponse> {
  return apiRequest<TInventarioResponse>(
    `/api/admin/inventario${buildInventarioQuery(params)}`,
    { method: "GET" },
    "Error al obtener inventario"
  );
}

export async function exportAdminInventarioCsv(params?: TInventarioParams): Promise<Blob> {
  const query = buildInventarioQuery(params);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/inventario/exportar${query}`, {
    method: "GET",
    headers: { "Content-Type": "text/csv" },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "No se pudo exportar inventario");
  }

  return response.blob();
}

export type TActualizarInventarioProductoInput = Partial<{
  nombreProducto: string;
  descripcion: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  idMarca: string;
  categoriaId: string;
  fechaVencimiento: string;
  imagenPrincipal: string;
  codigoProducto: string;
}>;

export async function actualizarInventarioProducto(
  token: string,
  idProducto: string,
  payload: TActualizarInventarioProductoInput
): Promise<TInventarioProducto> {
  return apiRequest<TInventarioProducto>(
    `/api/productos/${idProducto}`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(payload),
    },
    "No se pudo actualizar el producto"
  );
}

export async function actualizarStockProducto(
  token: string,
  idProducto: string,
  stockActual: number,
  motivo?: string
): Promise<TInventarioProducto> {
  return apiRequest<TInventarioProducto>(
    `/api/productos/${idProducto}/stock`,
    {
      method: "PATCH",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ stockActual, motivo }),
    },
    "No se pudo actualizar el stock"
  );
}
