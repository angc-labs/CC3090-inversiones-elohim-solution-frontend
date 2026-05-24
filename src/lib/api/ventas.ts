import { apiRequest, buildAuthHeaders } from "@/lib/api/client";

export type VentaAdminApi = {
  id: string;
  cliente: string;
  productos: number;
  subtotal: number;
  descuento: number;
  total: number;
  fecha: string;
  metodoPago: string;
  empleado: string;
  estadoVenta: string;
};

export type VentasResumenApi = {
  ventasHoy: number;
  ingresosHoy: number;
  ticketPromedio: number;
  productosVendidos: number;
};

export type VentasListadoApi = {
  resumen: VentasResumenApi;
  ventas: VentaAdminApi[];
};

export type VentasFiltroParams = {
  busqueda?: string;
  fecha?: string;
  filtroPrecio?: string;
  filtroMetodoPago?: string;
};

export async function getAdminVentas(
  token: string,
  params?: VentasFiltroParams
): Promise<VentasListadoApi> {
  const query = new URLSearchParams();
  if (params?.busqueda) query.set("busqueda", params.busqueda);
  if (params?.fecha) query.set("fecha", params.fecha);
  if (params?.filtroPrecio) query.set("filtroPrecio", params.filtroPrecio);
  if (params?.filtroMetodoPago) query.set("filtroMetodoPago", params.filtroMetodoPago);

  const qs = query.toString();
  return apiRequest<VentasListadoApi>(
    `/api/admin/ventas${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: buildAuthHeaders(token) },
    "No se pudo obtener el listado de ventas"
  );
}
