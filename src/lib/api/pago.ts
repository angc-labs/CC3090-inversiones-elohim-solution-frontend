import { apiRequest, buildAuthHeaders } from "@/lib/api/client";
import type { TMetodoPagoGuardado } from "@/types";

export type TConfigStripeCliente = {
  publishableKey: string;
  defaultCurrency: string;
};

export type TPaymentIntentCreado = {
  clientSecret: string;
  reservacionId: string;
  montoCentavos: number;
  moneda: string;
};

export type TPagoEstado = {
  paymentIntentId: string;
  status: string;
  reservacionId: string;
  montoCentavos: number;
  moneda: string;
};

export async function obtenerConfigStripe(token: string): Promise<TConfigStripeCliente> {
  return apiRequest<TConfigStripeCliente>(
    "/api/metodoPago/config-stripe",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "No se pudo obtener la configuración de pago"
  );
}

export async function listarMetodosPagoGuardados(token: string): Promise<TMetodoPagoGuardado[]> {
  return apiRequest<TMetodoPagoGuardado[]>(
    "/api/metodoPago",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al obtener métodos de pago"
  );
}

export async function guardarMetodoStripe(
  token: string,
  payload: { stripePaymentMethodId: string; alias?: string }
): Promise<TMetodoPagoGuardado> {
  return apiRequest<TMetodoPagoGuardado>(
    "/api/metodoPago",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({
        stripePaymentMethodId: payload.stripePaymentMethodId,
        alias: payload.alias,
      }),
    },
    "Error al guardar la tarjeta"
  );
}

export async function asegurarMetodoContraEntrega(token: string): Promise<TMetodoPagoGuardado> {
  return apiRequest<TMetodoPagoGuardado>(
    "/api/metodoPago/contra-entrega",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
    },
    "Error al preparar pago contra entrega"
  );
}

export async function crearPaymentIntent(
  token: string,
  reservacionId: string,
  metodoPagoId?: string
): Promise<TPaymentIntentCreado> {
  return apiRequest<TPaymentIntentCreado>(
    "/api/pagos/create-intent",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ reservacionId, metodoPagoId }),
    },
    "Error al iniciar el pago con tarjeta"
  );
}

export async function obtenerEstadoPago(token: string, paymentIntentId: string): Promise<TPagoEstado> {
  return apiRequest<TPagoEstado>(
    `/api/pagos/${encodeURIComponent(paymentIntentId)}/status`,
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "Error al consultar el estado del pago"
  );
}

export async function eliminarMetodoStripe(token: string, id: string): Promise<void> {
  return apiRequest<void>(
    `/api/metodoPago/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(token),
    },
    "Error al eliminar la tarjeta"
  );
}
