"use client";

import { useParams } from "next/navigation";
import { ExitoReservaDetalle } from "@/components/features/carrito/ExitoReservaDetalle";

export default function ExitoReservaPage() {
  const params = useParams();
  const idReservacion = typeof params.id === "string" ? params.id : "";
  return <ExitoReservaDetalle idReservacion={idReservacion} />;
}
