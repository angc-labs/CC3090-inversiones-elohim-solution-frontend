"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CiShoppingCart, CiUser, CiCheckCircle } from "react-icons/ci";
import { obtenerReservacionPorId } from "@/lib/api/reservacion";
import { useAuthStore } from "@/stores/useAuthStore";
import { TReservacion } from "@/types";

export function ReservacionConfirmada({ idReservacion }: { idReservacion: string }) {
  const [reservacion, setReservacion] = useState<TReservacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const cargarReservacion = async () => {
      if (!token) {
        setError("No hay sesión activa");
        setIsLoading(false);
        return;
      }

      try {
        const data = await obtenerReservacionPorId(token, idReservacion);
        setReservacion(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error al cargar la reservación");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void cargarReservacion();
  }, [idReservacion, token]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-md backdrop-blur-sm">
            <p className="text-slate-600">Cargando tu reservación...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reservacion) {
    return (
      <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 shadow-md backdrop-blur-sm max-w-md">
            <p className="text-red-700">{error || "No se pudo cargar la reservación"}</p>
            <Link
              href="/carrito"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fechaRetiro = new Date(reservacion.fechaLimiteRetiro);

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <div className="px-4! py-6! sm:px-6! lg:px-8!">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm!">
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4 p-4!">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold tracking-tight text-gray-900">
                    <Link href="/">ESMIRNA</Link>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4! mr-4!">
                <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                  <Link href="/catalogo" className="flex items-center gap-2! text-slate-700 font-medium">
                    <CiShoppingCart className="text-2xl" />
                  </Link>
                </button>
                <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                  <CiUser className="text-2xl" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1! px-6! py-12! sm:px-8! lg:px-12! w-full!">
          <div className="w-full! mx-auto max-w-2xl">
            {/* Éxito */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-12! text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white mb-6">
                <CiCheckCircle className="text-4xl" />
              </div>

              <h1 className="text-3xl! font-bold text-slate-900 mb-2">
                ¡Reservación confirmada!
              </h1>
              <p className="text-slate-600 mb-8">
                Tu reservación ha sido creada exitosamente.
              </p>

              {/* Número de reservación */}
              <div className="bg-white rounded-xl p-6 mb-8 border border-green-200">
                <p className="text-sm text-slate-600 mb-2">Número de reservación</p>
                <p className="text-2xl! font-bold text-slate-900">
                  {reservacion.codigoReservacion}
                </p>
              </div>

              {/* Detalles */}

              {/* Referencia de transferencia */}
              {reservacion.metodoPagoId === "transferencia" && reservacion.observaciones && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-slate-900 mb-2">Referencia de Transferencia</h3>
                  <p className="text-slate-700">{reservacion.observaciones}</p>
                </div>
              )}

              {/* Productos */}
              <div className="mb-8 text-left">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Productos en tu reservación</h2>
                <div className="space-y-2">
                  {reservacion.items.map((item) => (
                    <div key={item.productoId} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-b-0">
                      <div>
                        <p className="font-semibold text-slate-900">{item.nombreProducto}</p>
                        <p className="text-sm text-slate-500">{item.cantidad}x Q {item.precioUnitario.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-slate-900">Q {item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos pasos */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-slate-900 mb-3">Próximos pasos</h3>
                <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
                  <li>Realiza el pago a través del método seleccionado</li>
                  <li>Recibirás una confirmación por correo</li>
                  <li>Retira tu reservación en la fecha indicada</li>
                </ol>
              </div>

              {/* Botones */}
              <div className="flex flex-col! sm:flex-row! gap-4! justify-center">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Seguir comprando
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold hover:shadow-md transition-shadow"
                >
                  Ir a inicio
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
