import { Suspense } from "react";
import { ReservasShell } from "@/components/features/reservas";

export default function ReservasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Historial de Reservas
        </h1>
        <Suspense fallback={<div className="text-center py-8">Cargando reservas...</div>}>
          <ReservasShell />
        </Suspense>
      </div>
    </div>
  );
}