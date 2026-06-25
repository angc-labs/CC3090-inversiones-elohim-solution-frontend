"use client";

import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { cambiarEstadoReservacion, type ReservacionDto } from "@/lib/api/admin";

interface PagosTabProps {
  token: string;
  reservaciones: ReservacionDto[];
  onRefresh: () => void;
}

export function PagosTab({ token, reservaciones, onRefresh }: PagosTabProps) {
  const handleToggleDespachoReservacion = async (res: ReservacionDto) => {
    if (!token) return;
    const nuevoEstado = res.estadoDespacho === "despachado" ? "procesando" : "despachado";
    try {
      await cambiarEstadoReservacion(token, res.id, { estadoDespacho: nuevoEstado });
      toast.success("Estado de despacho actualizado");
      onRefresh();
    } catch (err) {
      toast.error("Error al actualizar el estado de despacho");
    }
  };

  const paidReservations = reservaciones.filter((r) => r.estadoPago === "pagado");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Control de Caja y Pagos</h2>
        <p className="text-xs text-slate-400">
          Verifica las transacciones con estado de pago registrado como COMPLETADO
        </p>
      </div>

      {paidReservations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <CreditCard className="mx-auto text-slate-600" size={40} />
          <p className="text-sm text-slate-400">No hay pagos confirmados registrados para esta tienda.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="p-4">Identificador Pago</th>
                  <th className="p-4">Stripe Intent ID</th>
                  <th className="p-4">Fecha Transacción</th>
                  <th className="p-4">Importe Neto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Despacho / Entrega</th>
                </tr>
              </thead>
              <tbody>
                {paidReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all"
                  >
                    <td className="p-4 font-mono font-bold text-white">
                      PAG-{res.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td className="p-4 text-slate-450">{res.stripeIntentId || "Efectivo / Transferencia"}</td>
                    <td className="p-4 text-slate-400">{new Date(res.fechaReserva).toLocaleString()}</td>
                    <td className="p-4 text-[#22D3A6] font-bold">Q{res.montoTotal.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                        Verificado
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleDespachoReservacion(res)}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                          res.estadoDespacho === "despachado"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {res.estadoDespacho}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
