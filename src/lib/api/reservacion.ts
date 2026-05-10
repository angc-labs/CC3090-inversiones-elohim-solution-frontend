import { apiRequest, buildAuthHeaders } from "@/lib/api/client";
import { TReservacion } from "@/types";

export async function crearReservacion(
  token: string,
  metodoPagoId: string,
  observaciones?: string
): Promise<TReservacion> {
  const body: any = { metodoPagoId };
  if (observaciones) {
    body.observaciones = observaciones;
  }
  return apiRequest<TReservacion>(
    "/api/reservacion",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(body),
    },
    "Error al crear la reservación"
  );
}

export async function obtenerReservaciones(token: string): Promise<TReservacion[]> {
  return apiRequest<TReservacion[]>(
    "/api/reservacion",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener reservaciones"
  );
}

export async function obtenerReservacionPorId(
  token: string,
  idReservacion: string
): Promise<TReservacion> {
  return apiRequest<TReservacion>(
    `/api/reservacion/${idReservacion}`,
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener la reservación"
  );
}
