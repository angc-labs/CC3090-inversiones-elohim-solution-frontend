"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MdDownload, MdCheckCircle } from "react-icons/md";
import { ExitoCompraLayout } from "@/components/features/carrito/ExitoCompraLayout";
import { obtenerReservacionPorId } from "@/lib/api/reservacion";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TReservacion } from "@/types";

export function ExitoReservaDetalle({ idReservacion }: { idReservacion: string }) {
  const [reservacion, setReservacion] = useState<TReservacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
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
        setError(err instanceof Error ? err.message : "Error al cargar la reservación");
      } finally {
        setIsLoading(false);
      }
    };

    void cargarReservacion();
  }, [idReservacion, token]);

  const handleDescargarComprobante = async () => {
    if (!reservacion) return;
    setIsDownloadingPDF(true);
    try {
      /* PDF opcional */
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <ExitoCompraLayout>
        <div className="rounded-2xl! border! border-slate-200/80! bg-white/95! p-8! text-center! shadow-md! backdrop-blur-sm!">
          <p className="text-slate-600!">Cargando tu reservación…</p>
        </div>
      </ExitoCompraLayout>
    );
  }

  if (error || !reservacion) {
    return (
      <ExitoCompraLayout>
        <div className="max-w-md! rounded-2xl! border! border-red-200! bg-red-50! p-8! shadow-md! backdrop-blur-sm!">
          <p className="text-red-700!">{error ?? "No se pudo cargar la reservación"}</p>
          <Link href="/carrito" className="mt-4! inline-block! rounded-lg! bg-blue-600! px-6! py-2! text-white! hover:bg-blue-700!">
            Volver al carrito
          </Link>
        </div>
      </ExitoCompraLayout>
    );
  }

  const fechaRetiro = new Date(reservacion.fechaLimiteRetiro);

  const avisoTarjeta =
    reservacion.metodoEsTarjeta === true ? (
      <div className="mb-6! rounded-xl! border! border-amber-200! bg-amber-50! p-4! text-sm! text-amber-900!">
        Esta compra se realizó con tarjeta. Para ver el estado del cobro en Stripe, abrí{" "}
        <Link className="font-semibold! underline!" href={`/carrito/exito/tarjeta/${idReservacion}`}>
          la página de pago con tarjeta
        </Link>
        .
      </div>
    ) : null;

  return (
    <ExitoCompraLayout>
      {avisoTarjeta}
      <div className="rounded-2xl! border! border-green-200! bg-green-50! p-8! text-center! shadow-md! backdrop-blur-sm!">
        <div className="mb-6! inline-flex! h-16! w-16! items-center! justify-center! rounded-full! bg-green-500! text-white!">
          <MdCheckCircle className="text-4xl!" />
        </div>

        <h1 className="mb-2! text-3xl! font-bold! text-slate-900!">Reserva confirmada</h1>
        <p className="mb-8! text-slate-600!">
          Guardamos tu pedido. El pago se completa al retirar (contra entrega) según lo acordado con la tienda.
        </p>

        <div className="mb-8! rounded-xl! border! border-green-200! bg-white! p-6!">
          <p className="mb-2! text-sm! text-slate-600!">Número de reservación</p>
          <p className="text-2xl! font-bold! text-slate-900!">{reservacion.codigoReservacion}</p>
        </div>

        {reservacion.observaciones && (
          <div className="mb-8! rounded-xl! border! border-orange-200! bg-orange-50! p-6! text-left!">
            <h3 className="mb-2! font-semibold! text-slate-900!">Notas</h3>
            <p className="text-slate-700!">{reservacion.observaciones}</p>
          </div>
        )}

        <div className="mb-8! text-left!">
          <h2 className="mb-4! text-lg! font-bold! text-slate-900!">Productos reservados</h2>
          <div className="space-y-2!">
            {reservacion.items.map((item) => (
              <div
                key={item.productoId}
                className="flex! items-center! justify-between! border-b! border-slate-200! py-2! last:border-b-0!"
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

        <div className="mb-8! rounded-xl! border! border-blue-200! bg-blue-50! p-6! text-left!">
          <h3 className="mb-3! font-semibold! text-slate-900!">Próximos pasos</h3>
          <ol className="list-inside! list-decimal! space-y-2! text-sm! text-slate-700!">
            <li>Presentá tu código en tienda y completá el pago al retirar.</li>
            <li>Te contactaremos por correo si hay novedades sobre tu pedido.</li>
            <li>
              Fecha límite de retiro:{" "}
              {fechaRetiro.toLocaleDateString("es-GT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </li>
          </ol>
        </div>

        <div className="flex! flex-col! justify-center! gap-4! sm:flex-row!">
          <button
            type="button"
            onClick={() => void handleDescargarComprobante()}
            disabled={isDownloadingPDF}
            className="inline-flex! items-center! justify-center! gap-2! rounded-full! border-2! border-green-600! px-8! py-3! font-semibold! text-green-600! transition-colors! hover:bg-green-50! disabled:cursor-not-allowed! disabled:opacity-50!"
          >
            <MdDownload className="text-lg!" />
            {isDownloadingPDF ? "Descargando…" : "Descargar comprobante (PDF)"}
          </button>
          <Link
            href="/catalogo"
            className="inline-flex! items-center! justify-center! rounded-full! border! border-slate-300! px-8! py-3! font-semibold! text-slate-700! transition-colors! hover:bg-slate-50!"
          >
            Seguir comprando
          </Link>
          <Link
            href="/"
            className="inline-flex! items-center! justify-center! rounded-full! bg-gradient-to-r! from-blue-900! to-blue-800! px-8! py-3! font-semibold! text-white! shadow-sm! transition-shadow! hover:shadow-md!"
          >
            Ir a inicio
          </Link>
        </div>
      </div>
    </ExitoCompraLayout>
  );
}
