"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { obtenerReservacionPorId } from "@/lib/api/reservacion";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ConfirmadoRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const idReservacion = typeof params.id === "string" ? params.id : "";
  const [mensaje, setMensaje] = useState("Redirigiendo a tu comprobante…");

  useEffect(() => {
    if (!idReservacion) {
      setMensaje("Reservación no válida.");
      return;
    }
    if (!token) {
      setMensaje("Iniciá sesión para ver tu reservación.");
      return;
    }

    void (async () => {
      try {
        const r = await obtenerReservacionPorId(token, idReservacion);
        const qs = r.stripePaymentIntentId
          ? `?pi=${encodeURIComponent(r.stripePaymentIntentId)}`
          : "";
        if (r.metodoEsTarjeta) {
          router.replace(`/carrito/exito/tarjeta/${idReservacion}${qs}`);
        } else {
          router.replace(`/carrito/exito/reserva/${idReservacion}`);
        }
      } catch {
        setMensaje("No se pudo cargar la reservación.");
      }
    })();
  }, [idReservacion, token, router]);

  return (
    <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
      <div className="flex! min-h-screen! flex-col! items-center! justify-center! px-6! py-12!">
        <div className="max-w-md! rounded-2xl! border! border-slate-200! bg-white! p-8! text-center! shadow-md!">
          <p className="text-slate-700!">{mensaje}</p>
          <Link href="/carrito" className="mt-6! inline-block! rounded-lg! bg-blue-600! px-6! py-2! text-white! hover:bg-blue-700!">
            Ir al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
