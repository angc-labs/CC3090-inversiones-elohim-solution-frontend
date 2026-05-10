"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { TMetodoPagoGuardado } from "@/types";
import { useMetodoPagoStore } from "@/stores/useMetodoPagoStore";
import {
  asegurarMetodoContraEntrega,
  guardarMetodoStripe,
  listarMetodosPagoGuardados,
  obtenerConfigStripe,
} from "@/lib/api/pago";
import { useAuthStore } from "@/stores/useAuthStore";
import { StripeNuevaTarjetaForm } from "@/components/features/pago/StripeNuevaTarjetaForm";

type MetodoPagoShellProps = {
  onContinue?: () => void;
};

type TModalidadCheckout = "contra_entrega" | "tarjeta" | null;

export function MetodoPagoShell({ onContinue }: MetodoPagoShellProps) {
  const [modalidad, setModalidad] = useState<TModalidadCheckout>(null);
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState<TMetodoPagoGuardado[]>([]);
  const [tarjetaSeleccionadaId, setTarjetaSeleccionadaId] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cargaTarjetasOk, setCargaTarjetasOk] = useState(false);

  const seleccionarMetodoPago = useMetodoPagoStore((s) => s.seleccionarMetodoPago);
  const token = useAuthStore((state) => state.token);

  const cargarTarjetasYConfig = useCallback(async () => {
    if (!token) {
      return;
    }
    setError(null);
    try {
      const [lista, cfg] = await Promise.all([
        listarMetodosPagoGuardados(token),
        obtenerConfigStripe(token),
      ]);
      setTarjetasGuardadas(lista);
      setPublishableKey(cfg.publishableKey);
      setStripePromise(loadStripe(cfg.publishableKey));
      setCargaTarjetasOk(true);
    } catch (err) {
      setCargaTarjetasOk(false);
      setError(err instanceof Error ? err.message : "No se pudo cargar el pago con tarjeta.");
    }
  }, [token]);

  useEffect(() => {
    let timeoutId: number | undefined;
    let unsubFinish: (() => void) | undefined;

    const aplicarPersistido = () => {
      const p = useMetodoPagoStore.getState().metodoPagoSeleccionado;
      if (!p) {
        return;
      }
      timeoutId = window.setTimeout(() => {
        if (p.metodo === "efectivo") {
          setModalidad("contra_entrega");
        } else {
          setModalidad("tarjeta");
          setTarjetaSeleccionadaId(p.id);
        }
      }, 0);
    };

    if (useMetodoPagoStore.persist.hasHydrated()) {
      aplicarPersistido();
    } else {
      unsubFinish = useMetodoPagoStore.persist.onFinishHydration(() => {
        aplicarPersistido();
      });
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      unsubFinish?.();
    };
  }, []);

  useEffect(() => {
    if (modalidad !== "tarjeta" || !token) {
      return;
    }
    const t = window.setTimeout(() => {
      void cargarTarjetasYConfig();
    }, 0);
    return () => window.clearTimeout(t);
  }, [modalidad, token, cargarTarjetasYConfig]);

  const handleElegirModalidad = (m: TModalidadCheckout) => {
    setModalidad(m);
    setError(null);
    setTarjetaSeleccionadaId(null);
    if (m === "contra_entrega") {
      setPublishableKey(null);
      setStripePromise(null);
      setCargaTarjetasOk(false);
    }
    if (m === "tarjeta" && token) {
      void cargarTarjetasYConfig();
    }
  };

  const guardarNuevaTarjeta = useCallback(
    async (stripePaymentMethodId: string, alias?: string) => {
      if (!token) {
        throw new Error("No hay sesión activa");
      }
      const creado = await guardarMetodoStripe(token, { stripePaymentMethodId, alias });
      setTarjetasGuardadas((prev) => [creado, ...prev.filter((t) => t.idMetodoPago !== creado.idMetodoPago)]);
      return creado;
    },
    [token]
  );

  const aplicarSeleccionTarjeta = (idMetodoPago: string, alias?: string | null) => {
    setTarjetaSeleccionadaId(idMetodoPago);
    seleccionarMetodoPago({
      id: idMetodoPago,
      metodo: "tarjeta",
      tipoTransaccion: "anticipada",
      alias: alias ?? undefined,
    });
  };

  const handleContinuar = () => {
    if (!modalidad) {
      setError("Elegí una modalidad de pago.");
      return;
    }
    if (!token) {
      setError("No hay sesión activa");
      return;
    }

    setError(null);

    if (modalidad === "contra_entrega") {
      setIsLoading(true);
      void asegurarMetodoContraEntrega(token)
        .then((dto) => {
          seleccionarMetodoPago({
            id: dto.idMetodoPago,
            metodo: "efectivo",
            tipoTransaccion: "contraentrega",
            alias: dto.nombreMetodo,
          });
          onContinue?.();
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "No se pudo preparar el pago contra entrega.");
        })
        .finally(() => {
          setIsLoading(false);
        });
      return;
    }

    if (!tarjetaSeleccionadaId) {
      setError("Seleccioná una tarjeta guardada o guardá una tarjeta nueva.");
      return;
    }

    onContinue?.();
  };

  const opcionesModalidad = useMemo(
    () =>
      [
        {
          id: "contra_entrega" as const,
          titulo: "Pago contra entrega (reserva)",
          descripcion: "Reservamos los productos. Pagás al retirar en tienda. Recibís un comprobante al confirmar.",
          icono: "📦",
        },
        {
          id: "tarjeta" as const,
          titulo: "Pago con tarjeta (Stripe)",
          descripcion: "Cobro seguro con tarjeta antes de retirar. Podés usar una tarjeta guardada o ingresar una nueva.",
          icono: "💳",
        },
      ] as const,
    []
  );

  return (
    <div className="space-y-8!">
      <div>
        <h2 className="mb-2! text-3xl! font-bold! text-slate-900!">Modalidad de pago</h2>
        <p className="text-slate-600!">Elegí cómo querés completar tu compra</p>
      </div>

      <div className="space-y-3!">
        {opcionesModalidad.map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => handleElegirModalidad(op.id)}
            className={`w-full! rounded-xl! border-2! p-5! text-left! transition-all! ${
              modalidad === op.id
                ? "border-blue-600! bg-blue-50! shadow-md!"
                : "border-slate-200! bg-white! hover:border-slate-300! hover:shadow-sm!"
            }`}
          >
            <div className="flex! items-start! gap-4!">
              <span className="text-2xl!">{op.icono}</span>
              <div>
                <h3 className="font-semibold! text-slate-900!">{op.titulo}</h3>
                <p className="mt-1! text-sm! text-slate-600!">{op.descripcion}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {modalidad === "tarjeta" && token && publishableKey && stripePromise && (
        <div className="space-y-4!">
          <h3 className="text-lg! font-semibold! text-slate-900!">Tarjetas guardadas</h3>
          {tarjetasGuardadas.length === 0 && cargaTarjetasOk && (
            <p className="text-sm! text-slate-600!">No tenés tarjetas guardadas todavía. Agregá una abajo.</p>
          )}
          <div className="space-y-3!">
            {tarjetasGuardadas.map((t) => (
              <button
                key={t.idMetodoPago}
                type="button"
                onClick={() => aplicarSeleccionTarjeta(t.idMetodoPago, t.alias)}
                className={`w-full! rounded-xl! border-2! p-4! text-left! transition-all! ${
                  tarjetaSeleccionadaId === t.idMetodoPago
                    ? "border-blue-600! bg-blue-50!"
                    : "border-slate-200! bg-white! hover:border-slate-300!"
                }`}
              >
                <div className="flex! items-center! gap-3!">
                  <div className="flex! h-8! w-12! items-center! justify-center! rounded! bg-slate-100! text-xs! font-bold! uppercase! text-slate-600!">
                    {(t.marcaTarjeta ?? "card").slice(0, 4)}
                  </div>
                  <div>
                    <p className="font-semibold! text-slate-900!">{t.alias ?? "Tarjeta"}</p>
                    <p className="text-sm! text-slate-600!">
                      {t.ultimosDigitos ? `•••• ${t.ultimosDigitos}` : "Stripe"}{" "}
                      {t.expiraMes && t.expiraAnio ? `· ${t.expiraMes}/${t.expiraAnio}` : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <h3 className="text-lg! font-semibold! text-slate-900!">Nueva tarjeta</h3>
          <Elements stripe={stripePromise}>
            <StripeNuevaTarjetaForm
              guardarEnBackend={guardarNuevaTarjeta}
              onListo={(metodo) => aplicarSeleccionTarjeta(metodo.idMetodoPago, metodo.alias)}
            />
          </Elements>
        </div>
      )}

      {modalidad === "tarjeta" && token && !publishableKey && !error && (
        <p className="text-sm! text-slate-600!">Cargando Stripe…</p>
      )}

      {error && (
        <div className="rounded-lg! border! border-red-200! bg-red-50! p-4!">
          <p className="text-sm! font-medium! text-red-700!">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleContinuar}
        disabled={
          isLoading ||
          !modalidad ||
          (modalidad === "tarjeta" && (!cargaTarjetasOk || !tarjetaSeleccionadaId))
        }
        className="w-full! rounded-lg! bg-blue-600! px-6! py-3! font-semibold! text-white! transition-colors! hover:bg-blue-700! disabled:cursor-not-allowed! disabled:opacity-50!"
      >
        {isLoading ? "Procesando..." : "Continuar"}
      </button>
    </div>
  );
}
