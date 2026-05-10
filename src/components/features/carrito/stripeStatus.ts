/** Texto legible para estados de PaymentIntent (Stripe). */
export function describirEstadoStripe(status: string): string {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    succeeded: "Completado: el cobro con tarjeta se realizó correctamente.",
    processing: "Procesando: el banco o Stripe está confirmando el movimiento.",
    requires_payment_method: "Requiere un método de pago válido.",
    requires_confirmation: "Pendiente de confirmación del pago.",
    requires_action: "Requiere una acción adicional (por ejemplo 3D Secure).",
    requires_capture: "Autorizado: pendiente de captura del monto.",
    canceled: "Cancelado.",
    payment_failed: "El pago fue rechazado o falló.",
  };
  return map[s] ?? `Estado en Stripe: ${status}`;
}

export function esEstadoStripeTerminal(status: string): boolean {
  const s = status.toLowerCase();
  return s === "succeeded" || s === "canceled" || s === "payment_failed";
}
