"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MdCreditCard, MdRefresh } from "react-icons/md";
import { ExitoCompraLayout } from "@/components/features/carrito/ExitoCompraLayout";
import { obtenerReservacionPorId } from "@/lib/api/reservacion";
import { obtenerEstadoPago, type TPagoEstado } from "@/lib/api/pago";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TReservacion } from "@/types";
import { describirEstadoStripe, esEstadoStripeTerminal } from "@/components/features/carrito/stripeStatus";

export function ExitoPagoTarjeta({ idReservacion }: { idReservacion: string }) {
  const searchParams = useSearchParams();
  const piFromUrl = searchParams.get("pi")?.trim() ?? "";
  const token = useAuthStore((s) => s.token);

  const [reservacion, setReservacion] = useState<TReservacion | null>(null);
  const [pagoStripe, setPagoStripe] = useState<TPagoEstado | null>(null);
  const [errorStripe, setErrorStripe] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingReserva, setIsLoadingReserva] = useState(true);

  const paymentIntentId =
    piFromUrl || (reservacion?.stripePaymentIntentId?.trim() ?? "");

  useEffect(() => {
    if (!token || !idReservacion) {
      setLoadError("No hay sesión o identificador de reservación.");
      setIsLoadingReserva(false);
      return;
    }

    void (async () => {
      try {
        const data = await obtenerReservacionPorId(token, idReservacion);
        setReservacion(data);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "No se pudo cargar la reservación.");
      } finally {
        setIsLoadingReserva(false);
      }
    })();
  }, [token, idReservacion]);

  useEffect(() => {
    if (!token || !paymentIntentId) {
      return;
    }

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let polls = 0;
    const maxPolls = 45;

    const consultar = async () => {
      try {
        const est = await obtenerEstadoPago(token, paymentIntentId);
        if (cancelled) return null;
        setPagoStripe(est);
        setErrorStripe(null);
        return est.status;
      } catch (e) {
        if (!cancelled) {
          setErrorStripe(e instanceof Error ? e.message : "No se pudo consultar Stripe.");
        }
        return null;
      }
    };

    void (async () => {
      const first = await consultar();
      if (cancelled || (first && esEstadoStripeTerminal(first))) {
        return;
      }
      interval = setInterval(() => {
        void (async () => {
          polls++;
          if (polls >= maxPolls) {
            if (interval) clearInterval(interval);
            return;
          }
          const status = await consultar();
          if (status && esEstadoStripeTerminal(status) && interval) {
            clearInterval(interval);
          }
        })();
      }, 2500);
    })();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [token, paymentIntentId]);

  useEffect(() => {
    if (!token || !idReservacion || !pagoStripe || pagoStripe.status.toLowerCase() !== "succeeded") {
      return;
    }
    if (reservacion?.pagado) {
      return;
    }

    let alive = true;
    let n = 0;
    const iv = setInterval(async () => {
      n++;
      if (n > 12 || !alive) {
        clearInterval(iv);
        return;
      }
      try {
        const data = await obtenerReservacionPorId(token, idReservacion);
        if (!alive) return;
        setReservacion(data);
        if (data.pagado) {
          clearInterval(iv);
        }
      } catch {
        /* ignorar */
      }
    }, 4000);

    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [token, idReservacion, pagoStripe?.status, reservacion?.pagado]);

  if (isLoadingReserva) {
    return (
      <ExitoCompraLayout>
        <div className="rounded-2xl! border! border-slate-200/80! bg-white/95! p-8! text-center! shadow-md! backdrop-blur-sm!">
          <p className="text-slate-600!">Cargando detalle del pago…</p>
        </div>
      </ExitoCompraLayout>
    );
  }

  if (loadError || !reservacion) {
    return (
      <ExitoCompraLayout>
        <div className="max-w-md! rounded-2xl! border! border-red-200! bg-red-50! p-8! shadow-md! backdrop-blur-sm!">
          <p className="text-red-800!">{loadError ?? "No se encontró la reservación."}</p>
          <Link href="/carrito" className="mt-4! inline-block! rounded-lg! bg-blue-600! px-6! py-2! text-white! hover:bg-blue-700!">
            Volver al carrito
          </Link>
        </div>
      </ExitoCompraLayout>
    );
  }

  const avisoMetodo =
    reservacion.metodoEsTarjeta === false ? (
      <div className="mb-6! rounded-xl! border! border-amber-200! bg-amber-50! p-4! text-sm! text-amber-900!">
        Esta reservación no está asociada a pago con tarjeta guardado en la app.{" "}
        <Link className="font-semibold! underline!" href={`/carrito/exito/reserva/${idReservacion}`}>
          Ver vista de reserva / contra entrega
        </Link>
        .
      </div>
    ) : null;

  const webhookPendiente =
    pagoStripe?.status.toLowerCase() === "succeeded" && !reservacion.pagado ? (
      <div className="mt-4! rounded-lg! border! border-blue-200! bg-blue-50! p-4! text-sm! text-blue-900!">
        Stripe ya marca el cobro como completado. Si el sistema aún muestra “pendiente” en tienda, puede ser un
        retraso de unos segundos al registrar el pago. Esta página se actualiza sola.
      </div>
    ) : null;

  return (
    <ExitoCompraLayout>
      {avisoMetodo}
      <div className="rounded-2xl! border! border-indigo-200! bg-indigo-50/90! p-8! text-center! shadow-md! backdrop-blur-sm!">
        <div className="mb-6! inline-flex! h-16! w-16! items-center! justify-center! rounded-full! bg-indigo-600! text-white!">
          <MdCreditCard className="text-3xl!" />
        </div>

        <h1 className="mb-2! text-3xl! font-bold! text-slate-900!">Pago con tarjeta</h1>
        <p className="mb-8! text-slate-600!">
          Detalle del cobro en Stripe y del registro en la tienda para la reservación{" "}
          <span className="font-semibold! text-slate-800!">{reservacion.codigoReservacion}</span>.
        </p>

        <div className="mb-6! space-y-4! text-left!">
          <div className="rounded-xl! border! border-indigo-200! bg-white! p-5!">
            <h2 className="mb-2! text-sm! font-semibold! uppercase! tracking-wide! text-indigo-800!">Estado en Stripe</h2>
            {!paymentIntentId ? (
              <p className="text-sm! text-slate-600!">
                No hay un identificador de pago (PaymentIntent) disponible aún. Si acabás de pagar, esperá unos
                segundos y recargá la página, o abrí el enlace desde el resumen de compra.
              </p>
            ) : errorStripe ? (
              <p className="text-sm! text-red-700!">{errorStripe}</p>
            ) : pagoStripe ? (
              <>
                <p className="text-lg! font-semibold! text-slate-900!">{describirEstadoStripe(pagoStripe.status)}</p>
                <p className="mt-1! font-mono! text-xs! text-slate-500!">ID: {pagoStripe.paymentIntentId}</p>
                <p className="mt-2! text-sm! text-slate-600!">
                  Monto: {(pagoStripe.montoCentavos / 100).toFixed(2)} {pagoStripe.moneda.toUpperCase()}
                </p>
              </>
            ) : (
              <p className="flex! items-center! gap-2! text-sm! text-slate-600!">
                <MdRefresh className="animate-spin! text-indigo-600!" /> Consultando Stripe…
              </p>
            )}
          </div>

          <div className="rounded-xl! border! border-slate-200! bg-white! p-5!">
            <h2 className="mb-2! text-sm! font-semibold! uppercase! tracking-wide! text-slate-700!">Registro en tienda</h2>
            <p className="text-lg! font-semibold! text-slate-900!">
              {reservacion.pagado ? "Pago registrado — listo para coordinar retiro." : "Pago aún no registrado en el sistema (pendiente)."}
            </p>
            <p className="mt-1! text-sm! text-slate-600!">Estado de la reserva: {reservacion.estado}</p>
          </div>
        </div>

        {webhookPendiente}

        <div className="mb-8! text-left!">
          <h2 className="mb-3! text-lg! font-bold! text-slate-900!">Productos</h2>
          <div className="space-y-2! rounded-xl! border! border-slate-200! bg-white! p-4!">
            {reservacion.items.map((item) => (
              <div
                key={item.productoId}
                className="flex! items-center! justify-between! border-b! border-slate-100! py-2! last:border-b-0!"
              >
                <div>
                  <p className="font-semibold! text-slate-900!">{item.nombreProducto}</p>
                  <p className="text-sm! text-slate-500!">
                    {item.cantidad}× Q {item.precioUnitario.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold! text-slate-900!">Q {item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex! flex-col! justify-center! gap-4! sm:flex-row!">
          <Link
            href="/reservas"
            className="inline-flex! items-center! justify-center! rounded-full! border! border-slate-300! px-8! py-3! font-semibold! text-slate-700! transition-colors! hover:bg-slate-50!"
          >
            Mis reservas / compras
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex! items-center! justify-center! rounded-full! bg-gradient-to-r! from-blue-900! to-blue-800! px-8! py-3! font-semibold! text-white! shadow-sm! transition-shadow! hover:shadow-md!"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </ExitoCompraLayout>
  );
}
