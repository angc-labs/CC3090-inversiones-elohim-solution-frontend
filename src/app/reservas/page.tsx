"use client";

import { Suspense } from "react";
import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";
import { CatalogoShell } from "@/components/features/catalogo/CatalogoShell";
import { ReservasShell } from "@/components/features/reservas";

export default function ReservasPage() {
  return (
    <ProtectedRoute>
      <CatalogoShell eyebrow="ESMIRNA" showSidebar={false}>
        <div className="mb-8!">
          <h1 className="text-2xl! font-bold! tracking-tight! text-slate-900! sm:text-3xl!">Mis compras</h1>
          <p className="mt-2! text-slate-600!">
            Historial de reservaciones y pagos asociados a tu cuenta.
          </p>
        </div>
        <Suspense fallback={<div className="py-12! text-center! text-slate-600!">Cargando…</div>}>
          <ReservasShell />
        </Suspense>
      </CatalogoShell>
    </ProtectedRoute>
  );
}
