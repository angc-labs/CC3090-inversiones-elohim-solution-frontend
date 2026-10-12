"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cambiarEstadoReservacion, type ReservacionDto } from "@/lib/api/admin";

interface ReservacionesTabProps {
  token: string;
  reservaciones: ReservacionDto[];
  loadingReservaciones: boolean;
  onRefresh: () => void;
}

export function ReservacionesTab({
  token,
  reservaciones,
  loadingReservaciones,
  onRefresh,
}: ReservacionesTabProps) {
  const t = useTranslations("Reservaciones");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dispatchFilter, setDispatchFilter] = useState("all");
  const [codeFilter, setCodeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const handleToggleEstadoPagoReservacion = async (res: ReservacionDto) => {
    if (!token) return;
    if (res.estadoPago === "pagado") {
      toast.info("El estado de pago ya está verificado y no puede regresarse.");
      return;
    }
    if (res.estadoPago === "cancelado") {
      toast.info("Este pedido ha sido cancelado.");
      return;
    }
    try {
      await cambiarEstadoReservacion(token, res.id, { estadoPago: "pagado" });
      toast.success(t("toast_payment_updated"));
      onRefresh();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "") || t("toast_payment_error"));
    }
  };

  const handleToggleDespachoReservacion = async (res: ReservacionDto) => {
    if (!token) return;
    if (res.estadoDespacho === "despachado" || res.estadoDespacho === "entregado") {
      toast.info("El pedido ya se encuentra despachado y no puede regresarse.");
      return;
    }
    if (res.estadoDespacho === "cancelado") {
      toast.info("Este pedido ha sido cancelado.");
      return;
    }
    try {
      await cambiarEstadoReservacion(token, res.id, { estadoDespacho: "despachado" });
      toast.success(t("toast_dispatch_updated"));
      onRefresh();
    } catch (err) {
      toast.error((err instanceof Error ? err.message : "") || t("toast_dispatch_error"));
    }
  };

  const activeReservations = reservaciones.filter((r) => r.estadoPago !== "pagado");
  const filteredReservations = activeReservations.filter((res) => {
    const normalizedCode = codeFilter.trim().replace(/^#/, "").toUpperCase();
    const shortCode = res.id.substring(0, 8).toUpperCase();
    const matchesCode = !normalizedCode || res.id.toUpperCase().includes(normalizedCode) || shortCode.includes(normalizedCode);
    const matchesDate = !dateFilter || res.fechaReserva.slice(0, 10) === dateFilter;
    const matchesStatus = statusFilter === "all" || res.estadoPago === statusFilter;
    const isDispatched = res.estadoDespacho === "despachado" || res.estadoDespacho === "entregado";
    const matchesDispatch = dispatchFilter === "all" || (dispatchFilter === "yes" ? isDispatched : !isDispatched);

    return matchesCode && matchesDate && matchesStatus && matchesDispatch;
  });
  const totalPages = Math.ceil(filteredReservations.length / pageSize);
  const displayedPage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedReservations = filteredReservations.slice(
    (displayedPage - 1) * pageSize,
    displayedPage * pageSize,
  );
  const firstDisplayedReservation = (displayedPage - 1) * pageSize + 1;
  const lastDisplayedReservation = Math.min(displayedPage * pageSize, filteredReservations.length);

  const resetPageAnd = (updateFilter: () => void) => {
    updateFilter();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">{t("title")}</h2>
        <p className="text-xs text-slate-400">{t("subtitle")}</p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-900 bg-slate-950/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("filter_code")}
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="search"
              value={codeFilter}
              onChange={(event) => resetPageAnd(() => setCodeFilter(event.target.value))}
              placeholder={t("filter_code_placeholder")}
              className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 pl-9 pr-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition-colors placeholder:text-slate-600 focus:border-[#22D3A6]"
            />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("filter_date")}
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => resetPageAnd(() => setDateFilter(event.target.value))}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition-colors focus:border-[#22D3A6]"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("filter_status")}
          <select
            value={statusFilter}
            onChange={(event) => resetPageAnd(() => setStatusFilter(event.target.value))}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition-colors focus:border-[#22D3A6]"
          >
            <option value="all">{t("filter_all")}</option>
            <option value="pendiente">{t("status_pending")}</option>
            <option value="cancelado">{t("status_cancelled")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {t("filter_dispatch")}
          <select
            value={dispatchFilter}
            onChange={(event) => resetPageAnd(() => setDispatchFilter(event.target.value))}
            className="h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm font-normal normal-case tracking-normal text-white outline-none transition-colors focus:border-[#22D3A6]"
          >
            <option value="all">{t("filter_all")}</option>
            <option value="yes">{t("dispatch_yes")}</option>
            <option value="no">{t("dispatch_no")}</option>
          </select>
        </label>
      </div>

      {loadingReservaciones ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <Calendar className="mx-auto text-slate-600" size={40} />
          <p className="text-sm text-slate-400">
            {activeReservations.length === 0 ? t("empty_state") : t("no_filter_results")}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="p-4">{t("table_code")}</th>
                  <th className="p-4">{t("table_date")}</th>
                  <th className="p-4">{t("table_amount")}</th>
                  <th className="p-4">{t("table_payment_status")}</th>
                  <th className="p-4">{t("table_dispatch")}</th>
                  <th className="p-4">{t("table_items_detail")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all"
                  >
                    <td className="p-4 font-mono font-bold text-white">
                      #{res.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(res.fechaReserva).toLocaleString("es-ES")}
                    </td>
                    <td className="p-4 text-[#22D3A6] font-bold">Q{res.montoTotal.toFixed(2)}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleEstadoPagoReservacion(res)}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                          res.estadoPago === "pagado"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {res.estadoPago}
                      </button>
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
                    <td className="p-4 text-slate-300">
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        {res.detalles.map((d, index) => (
                          <span key={index}>
                            • {d.productoNombre ?? t("item_fallback")}: {d.cantidad} ud x Q
                            {d.precioCobrado.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-900 px-4 py-3">
              <span className="text-xs text-slate-400">
                {t("pagination_status", {
                  from: firstDisplayedReservation,
                  to: lastDisplayedReservation,
                  total: filteredReservations.length,
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={displayedPage === 1}
                  aria-label={t("pagination_previous")}
                  className="rounded-md border border-slate-800 p-2 text-slate-300 transition-colors hover:border-[#22D3A6] hover:text-[#22D3A6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="min-w-20 text-center text-xs font-bold text-slate-300">
                  {t("pagination_page", { page: displayedPage, totalPages })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                  disabled={displayedPage === totalPages}
                  aria-label={t("pagination_next")}
                  className="rounded-md border border-slate-800 p-2 text-slate-300 transition-colors hover:border-[#22D3A6] hover:text-[#22D3A6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
