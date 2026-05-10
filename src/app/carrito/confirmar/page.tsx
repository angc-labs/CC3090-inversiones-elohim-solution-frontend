"use client";

import { ConfirmacionReserva } from "@/components/features/carrito/ConfirmacionReserva";
import { useCarrito } from "@/hooks/useCarrito";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConfirmarPage() {
  const { items } = useCarrito();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push("/carrito");
    }
  }, [items, router]);

  if (items.length === 0) {
    return null;
  }

  return <ConfirmacionReserva />;
}
