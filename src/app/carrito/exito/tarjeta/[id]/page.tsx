"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ExitoPagoTarjeta } from "@/components/features/carrito/ExitoPagoTarjeta";

function ExitoTarjetaInner() {
  const params = useParams();
  const idReservacion = typeof params.id === "string" ? params.id : "";
  return <ExitoPagoTarjeta idReservacion={idReservacion} />;
}

export default function ExitoTarjetaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex! min-h-screen! items-center! justify-center! bg-[#f6f8fc]! text-slate-600!">
          Cargando…
        </div>
      }
    >
      <ExitoTarjetaInner />
    </Suspense>
  );
}
