import { apiRequest, buildAuthHeaders } from "@/lib/api/client";
import type { TMetodoPago } from "@/stores/useMetodoPagoStore";

export async function obtenerMetodosPago(token: string): Promise<TMetodoPago[]> {
  return apiRequest<TMetodoPago[]>(
    "/api/metodos-pago",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener métodos de pago"
  );
}

export async function guardarMetodoPago(
  token: string,
  metodoPagoId: string
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(
    "/api/pedido/metodo-pago",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ metodoPagoId }),
    },
    "Error al guardar método de pago"
  );
}
