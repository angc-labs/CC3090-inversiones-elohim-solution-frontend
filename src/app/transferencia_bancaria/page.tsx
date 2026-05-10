"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Flujo histórico: el checkout unificado vive en /metodoPago y /resumenCompra.
 */
export default function TransferenciaBancariaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/metodoPago");
  }, [router]);

  return (
    <div className="flex! min-h-screen! items-center! justify-center! bg-[#f6f8fc]! px-6!">
      <p className="text-slate-600!">Redirigiendo al checkout…</p>
    </div>
  );
}
