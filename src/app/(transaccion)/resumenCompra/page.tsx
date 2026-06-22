"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { ShopNavbarActions } from "@/components/ui/ShopNavbarActions";
import { ClientProtectedRoute } from "@/components/features/auth/ClientProtectedRoute";
import { crearReservacion } from "@/lib/api/reservacion";
import {
  crearPaymentIntent,
  obtenerConfigStripe,
  obtenerEstadoPago,
} from "@/lib/api/pago";
import { useClientAuthStore } from "@/stores/useClientAuthStore";
import { useCarrito } from "@/hooks/useCarrito";
import { useMetodoPagoStore } from "@/stores/useMetodoPagoStore";
import { useConfirmarReservacion } from "@/hooks/useConfirmarReservacion";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { ResumenCompraUI } from "@/components/features/resumen";

export default function ResumenCompraPage() {
  const router = useRouter();
  const token = useClientAuthStore((state) => state.token);
  const { items, total, isLoading, isError, error, mutate } = useCarrito();
  const { metodoPagoSeleccionado } = useMetodoPagoStore();
  const { confirmar, isLoading: isConfirmingReserva, error: confirmError, clearError } =
    useConfirmarReservacion();

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isStripeBusy, setIsStripeBusy] = useState(false);

  const isBusy = isConfirmingReserva || isStripeBusy;
  const errorMessage =
    checkoutError ?? confirmError ?? (error instanceof Error ? error.message : null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!items || items.length === 0) {
      router.push("/carrito");
      return;
    }
    if (!metodoPagoSeleccionado) {
      router.push("/metodoPago");
      return;
    }
  }, [items, isLoading, metodoPagoSeleccionado, router]);

  const handleBack = () => {
    router.push("/metodoPago");
  };

  const handleConfirmarTarjeta = async () => {
    if (!metodoPagoSeleccionado || !token) {
      return;
    }

    setCheckoutError(null);
    clearError();
    setIsStripeBusy(true);

    try {
      const reservacion = await crearReservacion(token, metodoPagoSeleccionado.id);
      const config = await obtenerConfigStripe(token);
      const stripe = await loadStripe(config.publishableKey);
      if (!stripe) {
        throw new Error("No se pudo inicializar Stripe.");
      }

      const intent = await crearPaymentIntent(token, reservacion.idReservacion);
      const { error: confirmErr, paymentIntent } = await stripe.confirmCardPayment(intent.clientSecret);

      if (confirmErr) {
        throw new Error(confirmErr.message);
      }

      let status: string = paymentIntent?.status ?? "";
      const piId = paymentIntent?.id;

      if (piId && status !== "succeeded") {
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 500));
          const est = await obtenerEstadoPago(token, piId);
          status = est.status;
          if (status === "succeeded" || status === "canceled") {
            break;
          }
        }
      }

      if (status !== "succeeded") {
        throw new Error(
          "El pago no se completó. Si ves un movimiento en tu cuenta, escribinos con el código de reservación."
        );
      }

      await mutate();
      const piQuery = piId ? `?pi=${encodeURIComponent(piId)}` : "";
      router.push(`/carrito/exito/tarjeta/${reservacion.idReservacion}${piQuery}`);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Error al procesar el pago.");
    } finally {
      setIsStripeBusy(false);
    }
  };

  const handleConfirmar = () => {
    if (!metodoPagoSeleccionado || !token) {
      return;
    }

    setCheckoutError(null);
    clearError();

    if (metodoPagoSeleccionado.metodo === "tarjeta") {
      void handleConfirmarTarjeta();
      return;
    }

    void (async () => {
      const reservacion = await confirmar(metodoPagoSeleccionado.id);
      if (reservacion) {
        await mutate();
        router.push(`/carrito/exito/reserva/${reservacion.idReservacion}`);
      }
    })();
  };

  if (isLoading) {
    return (
      <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
        <div className="flex! min-h-screen! items-center! justify-center! px-6! py-12!">
          <div className="rounded-2xl! border! border-slate-200! bg-white! p-8! shadow-md!">
            Cargando resumen...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
        <div className="flex! min-h-screen! items-center! justify-center! px-6! py-12!">
          <ErrorMessage mensaje={errorMessage ?? "No se pudo cargar el carrito"} />
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
        <div className="flex! min-h-screen! items-center! justify-center! px-6! py-12!">
          <EstadoVacio
            mensaje="Tu carrito está vacío"
            descripcion="Agrega productos antes de continuar con la reserva."
          />
        </div>
      </div>
    );
  }

  if (!metodoPagoSeleccionado) {
    return null;
  }

  return (
    <ClientProtectedRoute>
      <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
        <div className="pointer-events-none! absolute! inset-0! bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]!" />
        <div className="pointer-events-none! absolute! left-1/2! top-10! h-32! w-32! -translate-x-1/2! rounded-full! bg-blue-500/10! blur-3xl!" />

        <div className="relative! flex! min-h-screen! flex-col!">
          <div className="px-4! py-6! sm:px-6! lg:px-8!">
            <div className="rounded-3xl! border! border-slate-200/80! bg-white/95! p-4! shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm!">
              <div className="flex! flex-wrap! items-center! justify-between! gap-3! sm:gap-6!">
                <div className="flex! min-w-0! items-center! gap-3! p-2! sm:gap-4! sm:p-4!">
                  <div className="flex! h-7! w-7! items-center! justify-center! rounded-md! bg-blue-600! text-white! shadow-sm!">
                    <svg
                      className="h-4! w-4!"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm! font-semibold! tracking-tight! text-gray-900!">
                      <Link href="/">ESMIRNA</Link>
                    </span>
                  </div>
                </div>
                <ShopNavbarActions showCart showCatalog />
              </div>
            </div>
          </div>

          <main className="w-full! flex-1! px-4! py-8! sm:px-6! sm:py-12! lg:px-12!">
            <div className="mx-auto! w-full! max-w-2xl!">
              <div className="mb-6! sm:mb-8!">
                <div className="flex! flex-wrap! items-center! justify-center! gap-1.5! text-xs! font-medium! text-slate-600! sm:gap-2! sm:text-sm!">
                  <div className="flex! h-8! w-8! items-center! justify-center! rounded-full! bg-blue-600! text-white!">
                    1
                  </div>
                  <span className="font-semibold! text-blue-600!">Carrito</span>
                  <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex! h-8! w-8! items-center! justify-center! rounded-full! bg-blue-600! text-white!">
                    2
                  </div>
                  <span className="font-semibold! text-blue-600!">Método</span>
                  <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="flex! h-8! w-8! items-center! justify-center! rounded-full! bg-blue-600! text-white!">
                    3
                  </div>
                  <span className="font-semibold! text-blue-600!">Resumen</span>
                </div>
              </div>

              <div className="mb-8!">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex! items-center! gap-2! rounded-lg! border! border-slate-200! px-4! py-2! font-medium! text-slate-700! transition-colors! hover:bg-slate-50!"
                >
                  <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
              </div>

              <ResumenCompraUI
                items={items}
                totalPrecio={total}
                metodoPagoSeleccionado={metodoPagoSeleccionado}
                onConfirm={() => {
                  void handleConfirmar();
                }}
                isConfirming={isBusy}
                error={errorMessage}
                showConfirmButton
                confirmLabel={
                  metodoPagoSeleccionado.metodo === "tarjeta" ? "Pagar con tarjeta" : "Confirmar reserva"
                }
              />
            </div>
          </main>
        </div>
      </div>
    </ClientProtectedRoute>
  );
}
