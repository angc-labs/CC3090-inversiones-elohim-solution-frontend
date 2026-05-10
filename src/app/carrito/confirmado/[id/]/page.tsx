"use client";

import { ReservacionConfirmada } from "@/components/features/carrito/ReservacionConfirmada";
import { useParams } from "next/navigation";

export default function ConfirmadoPage() {
  const params = useParams();
  const idReservacion = params.id as string;

  return <ReservacionConfirmada idReservacion={idReservacion} />;
}
