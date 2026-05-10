"use client";

import { useCarrito } from "@/hooks/useCarrito";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConfirmarPage() {
  const { items } = useCarrito();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/carrito");
      return;
    }
    router.replace("/metodoPago");
  }, [items.length, router]);

  return (
    <div className="flex! min-h-screen! items-center! justify-center! bg-[#f6f8fc]! px-6!">
      <p className="text-slate-600!">Redirigiendo al checkout…</p>
    </div>
  );
}
