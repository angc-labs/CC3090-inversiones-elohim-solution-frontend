"use client";

import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import type { TMetodoPagoGuardado } from "@/types";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#b91c1c" },
  },
};

export type StripeNuevaTarjetaFormProps = {
  guardarEnBackend: (stripePaymentMethodId: string, alias?: string) => Promise<TMetodoPagoGuardado>;
  onListo: (metodo: TMetodoPagoGuardado) => void;
};

export function StripeNuevaTarjetaForm({ guardarEnBackend, onListo }: StripeNuevaTarjetaFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [alias, setAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!stripe || !elements) {
      setError("El formulario de pago aún se está cargando. Espera un momento.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("No se pudo inicializar el campo de tarjeta.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
        billing_details: alias.trim() ? { name: alias.trim() } : undefined,
      });

      if (pmError || !paymentMethod) {
        setError(pmError?.message ?? "No se pudo validar la tarjeta.");
        return;
      }

      const metodo = await guardarEnBackend(paymentMethod.id, alias.trim() || undefined);
      onListo(metodo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la tarjeta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4! rounded-xl! border! border-slate-200! bg-white! p-5!">
      <div>
        <label htmlFor="alias-tarjeta" className="mb-1! block! text-sm! font-medium! text-slate-700!">
          Nombre o alias (opcional)
        </label>
        <input
          id="alias-tarjeta"
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          className="w-full! rounded-lg! border! border-slate-200! px-3! py-2! text-slate-900!"
          placeholder="Ej. Mi Visa"
          autoComplete="cc-name"
        />
      </div>
      <div className="rounded-lg! border! border-slate-200! bg-slate-50! px-3! py-3!">
        <CardElement options={cardElementOptions} />
      </div>
      {error && (
        <div className="rounded-lg! border! border-red-200! bg-red-50! px-3! py-2! text-sm! text-red-700!">{error}</div>
      )}
      <button
        type="button"
        onClick={() => {
          void handleGuardar();
        }}
        disabled={isLoading || !stripe}
        className="w-full! rounded-lg! bg-slate-900! px-4! py-2.5! font-semibold! text-white! transition-colors! hover:bg-slate-800! disabled:opacity-50!"
      >
        {isLoading ? "Validando..." : "Guardar tarjeta"}
      </button>
    </div>
  );
}
