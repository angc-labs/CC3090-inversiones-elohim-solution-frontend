"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  AlertTriangle,
  Sliders,
  Play,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  obtenerReporteProductos,
  obtenerReporteEmpleados,
  obtenerReporteMetodosPago,
  ejecutarRawReporte,
  type TReporteProductos,
  type TReporteEmpleados,
  type TReporteMetodosPago,
} from "@/lib/api/reportes";
import type { TiendaDto } from "@/lib/api/admin";

interface ReportesTabProps {
  token: string;
  activeStore: TiendaDto | null;
}

export function ReportesTab({ token, activeStore }: ReportesTabProps) {
  const [reportSubTab, setReportSubTab] = useState<"productos" | "empleados" | "pagos" | "personalizado">(
    "productos"
  );
  const [reportProductos, setReportProductos] = useState<TReporteProductos | null>(null);
  const [reportEmpleados, setReportEmpleados] = useState<TReporteEmpleados | null>(null);
  const [reportMetodosPago, setReportMetodosPago] = useState<TReporteMetodosPago | null>(null);
  const [reportesLoading, setReportesLoading] = useState(false);
  const [reportesError, setReportesError] = useState<string | null>(null);

  // Date filters
  const [reportFiltro, setReportFiltro] = useState<{
    desde: string;
    hasta: string;
    modo: "todos" | "ventas" | "reservaciones";
  }>(() => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    return {
      desde: desde.toISOString().slice(0, 10),
      hasta: hasta.toISOString().slice(0, 10),
      modo: "todos",
    };
  });

  // Custom SQL Console states
  const defaultSqlQuery = 'SELECT id, nombre, stock_actual, stock_minimo FROM public."Producto" WHERE tienda_id = @tenant_id AND stock_actual < stock_minimo;';
  const [customQuery, setCustomQuery] = useState(defaultSqlQuery);
  const [customQueryResult, setCustomQueryResult] = useState<Array<Record<string, any>> | null>(null);
  const [customQueryError, setCustomQueryError] = useState<string | null>(null);
  const [customQueryLoading, setCustomQueryLoading] = useState(false);
  const [isQueryFocused, setIsQueryFocused] = useState(false);
  const [isFirstQueryFocus, setIsFirstQueryFocus] = useState(true);
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  // Calculate autocomplete suggestion
  const getQuerySuggestion = () => {
    if (!customQuery || customQuery === defaultSqlQuery) {
      return defaultSqlQuery;
    }
    // If the current query is a prefix of the default, suggest the rest
    if (defaultSqlQuery.startsWith(customQuery)) {
      return defaultSqlQuery.slice(customQuery.length);
    }
    return '';
  };

  const queryAutocomplete = getQuerySuggestion();

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Accept autocomplete with Tab or Enter when there's a suggestion
    if ((e.key === 'Tab' || (e.key === 'Enter' && e.ctrlKey)) && queryAutocomplete) {
      e.preventDefault();
      setCustomQuery(defaultSqlQuery);
    }
  };

  const handleQueryFocus = () => {
    // Only clear on FIRST focus if it contains the default query
    if (isFirstQueryFocus && customQuery === defaultSqlQuery) {
      setCustomQuery('');
      setIsFirstQueryFocus(false);
    }
    setIsQueryFocused(true);
  };

  const handleQueryBlur = () => {
    // If empty when blur, restore the default query
    if (customQuery.trim() === '') {
      setCustomQuery(defaultSqlQuery);
    }
    setIsQueryFocused(false);
  };

  // Fetch Reports Data
  useEffect(() => {
    if (!token || !activeStore) return;
    if (reportSubTab === "personalizado") return;

    setReportesLoading(true);
    setReportesError(null);

    const desdeIso = reportFiltro.desde ? new Date(`${reportFiltro.desde}T00:00:00`).toISOString() : undefined;
    const hastaIso = reportFiltro.hasta ? new Date(`${reportFiltro.hasta}T23:59:59`).toISOString() : undefined;
    const filtro = { desde: desdeIso, hasta: hastaIso, modo: reportFiltro.modo };

    if (reportSubTab === "productos") {
      obtenerReporteProductos(token, filtro)
        .then(setReportProductos)
        .catch((err) =>
          setReportesError(
            err instanceof Error ? err.message : "Error al cargar reporte de productos"
          )
        )
        .finally(() => setReportesLoading(false));
    } else if (reportSubTab === "empleados") {
      obtenerReporteEmpleados(token, filtro)
        .then(setReportEmpleados)
        .catch((err) =>
          setReportesError(
            err instanceof Error ? err.message : "Error al cargar reporte de empleados"
          )
        )
        .finally(() => setReportesLoading(false));
    } else if (reportSubTab === "pagos") {
      obtenerReporteMetodosPago(token, filtro)
        .then(setReportMetodosPago)
        .catch((err) =>
          setReportesError(
            err instanceof Error ? err.message : "Error al cargar reporte de métodos de pago"
          )
        )
        .finally(() => setReportesLoading(false));
    }
  }, [token, activeStore, reportSubTab, reportFiltro]);

  // Execute SQL
  const handleExecuteSql = async () => {
    if (!token) return;
    setCustomQueryLoading(true);
    setCustomQueryError(null);
    setCustomQueryResult(null);

    try {
      const result = await ejecutarRawReporte(token, customQuery);
      setCustomQueryResult(result.rows);
      toast.success("Consulta SQL ejecutada con éxito");
    } catch (err) {
      setCustomQueryError(err instanceof Error ? err.message : "Error al ejecutar la consulta SQL");
      toast.error("Error al ejecutar la consulta");
    } finally {
      setCustomQueryLoading(false);
    }
  };

  const tieneDatosReporte = () => {
    if (reportSubTab === "productos" && reportProductos?.detalle && reportProductos.detalle.length > 0)
      return true;
    if (reportSubTab === "empleados" && reportEmpleados?.detalle && reportEmpleados.detalle.length > 0)
      return true;
    if (reportSubTab === "pagos" && reportMetodosPago?.detalle && reportMetodosPago.detalle.length > 0)
      return true;
    if (reportSubTab === "personalizado" && customQueryResult && customQueryResult.length > 0) return true;
    return false;
  };

  const exportarReporte = (format: "csv" | "xlsx") => {
    if (!token) return;

    let data: any[] = [];
    let fileNameName = "";

    if (reportSubTab === "productos" && reportProductos) {
      data = reportProductos.detalle.map((row) => ({
        Posicion: row.posicion,
        Producto: row.producto,
        "Cantidad Vendida": row.cantidadVendida,
        "Ingresos (Q)": row.ingresos,
        "Precio Promedio (Q)": row.precioPromedio,
      }));
      fileNameName = "ventas_por_producto";
    } else if (reportSubTab === "empleados" && reportEmpleados) {
      data = reportEmpleados.detalle.map((row) => ({
        Empleado: row.empleado,
        "Ventas Realizadas": row.ventasRealizadas,
        "Monto Total (Q)": row.montoTotal,
        "Promedio por Venta (Q)": row.promedioPorVenta,
        Desempeño: row.desempeno,
      }));
      fileNameName = "desempeno_empleados";
    } else if (reportSubTab === "pagos" && reportMetodosPago) {
      data = reportMetodosPago.detalle.map((row) => ({
        "Método de Pago": row.metodo,
        "Cantidad de Transacciones": row.cantidadTransacciones,
        "Porcentaje (%)": row.porcentaje,
        "Monto Total (Q)": row.montoTotal,
        "Monto Promedio (Q)": row.montoPromedio,
      }));
      fileNameName = "metodos_pago";
    } else if (reportSubTab === "personalizado" && customQueryResult) {
      data = customQueryResult;
      fileNameName = "consulta_personalizada";
    }

    if (data.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    XLSX.writeFile(
      workbook,
      `reporte_${fileNameName}_${new Date().toISOString().slice(0, 10)}.${format}`,
      { bookType: format === "xlsx" ? "xlsx" : "csv" }
    );
    toast.success(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`);
  };

  const isDark = activeStore?.configuracionVisual ? true : true; // Keep dark portal theme default

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-black text-white">Reportes de Negocio</h2>
          <p className="text-xs text-slate-400">
            Analiza el rendimiento de tu tienda y realiza consultas personalizadas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {reportSubTab !== "personalizado" && (
            <>
              {/* Mode selection */}
              <div className="inline-flex rounded-xl bg-slate-955 p-1 border border-slate-900">
                {(["todos", "ventas", "reservaciones"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setReportFiltro((prev) => ({ ...prev, modo: m }))}
                    className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border-none bg-transparent cursor-pointer ${
                      reportFiltro.modo === m
                        ? "bg-[#22D3A6] text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "todos" ? "Todos" : m === "ventas" ? "Ventas" : "Reservaciones"}
                  </button>
                ))}
              </div>

              {/* Date picker */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-955 p-1 border border-slate-900 text-xs">
                <input
                  type="date"
                  value={reportFiltro.desde}
                  onChange={(e) => setReportFiltro((prev) => ({ ...prev, desde: e.target.value }))}
                  className="bg-transparent border-none text-slate-300 font-mono text-[10px] focus:outline-none p-1 w-28 cursor-pointer"
                />
                <span className="text-slate-600">al</span>
                <input
                  type="date"
                  value={reportFiltro.hasta}
                  onChange={(e) => setReportFiltro((prev) => ({ ...prev, hasta: e.target.value }))}
                  className="bg-transparent border-none text-slate-300 font-mono text-[10px] focus:outline-none p-1 w-28 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Export Buttons */}
          {tieneDatosReporte() && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportarReporte("csv")}
                className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
              >
                <Download size={12} />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={() => exportarReporte("xlsx")}
                className="h-8 px-3 rounded-lg bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-none shrink-0"
              >
                <FileText size={12} />
                <span>Exportar Excel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-900 gap-6">
        {(["productos", "empleados", "pagos", "personalizado"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setReportSubTab(tab);
              setReportesError(null);
            }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative border-none bg-transparent cursor-pointer ${
              reportSubTab === tab ? "text-[#22D3A6] font-extrabold" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "productos"
              ? "Productos"
              : tab === "empleados"
              ? "Empleados"
              : tab === "pagos"
              ? "Métodos de Pago"
              : "Personalizado (SQL)"}
            {reportSubTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#22D3A6]" />}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {reportesError && reportSubTab !== "personalizado" && (
        <div className="rounded-xl border border-rose-900 bg-rose-950/20 p-4 text-xs text-rose-400 flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{reportesError}</span>
        </div>
      )}

      {/* Loading State */}
      {reportesLoading && reportSubTab !== "personalizado" && (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      )}

      {/* Content Panel */}
      {!reportesLoading && (
        <div className="space-y-6">
          {/* SUBTAB: PRODUCTOS */}
          {reportSubTab === "productos" && reportProductos && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Total Productos Vendidos
                  </span>
                  <span className="text-2xl font-black text-white">
                    {reportProductos.totalProductosVendidos.toLocaleString("es-GT")}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Ingresos Totales
                  </span>
                  <span className="text-2xl font-black text-[#22D3A6]">
                    Q{" "}
                    {reportProductos.ingresosTotales.toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Producto Top
                  </span>
                  <span className="text-lg font-black text-white truncate">
                    {reportProductos.productoTop ?? "—"}
                  </span>
                  {reportProductos.unidadesProductoTop != null && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {reportProductos.unidadesProductoTop} unidades
                    </span>
                  )}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Cantidad Vendida */}
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Cantidad Vendida por Producto
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportProductos.productos.map((p) => ({
                          name: p.producto,
                          cantidad: p.cantidadVendida,
                        }))}
                        margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                      >
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#475569"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          angle={-25}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  <p className="font-semibold text-[#38BDF8] text-xs">
                                    Cantidad: {payload[0].value}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="cantidad" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ingresos por Producto */}
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ingresos por Producto
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportProductos.productos.map((p) => ({
                          name: p.producto,
                          ingresos: p.ingresos,
                        }))}
                        margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                      >
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#475569"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          angle={-25}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis
                          stroke="#475569"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `Q${v}`}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  <p className="font-semibold text-[#22D3A6] text-xs">
                                    Ingresos: Q
                                    {Number(payload[0].value).toLocaleString("es-GT", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="ingresos" fill="#22D3A6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Detalle de Productos Más Vendidos
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/10 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-5 py-3 text-center w-16">Posición</th>
                        <th className="px-5 py-3">Producto</th>
                        <th className="px-5 py-3 text-center">Cantidad Vendida</th>
                        <th className="px-5 py-3 text-right">Ingresos</th>
                        <th className="px-5 py-3 text-right">Precio Promedio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {reportProductos.detalle.map((row) => (
                        <tr
                          key={row.posicion}
                          className="hover:bg-slate-900/10 transition-colors text-slate-300"
                        >
                          <td className="px-5 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold ${
                                row.posicion === 1
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                  : row.posicion === 2
                                  ? "bg-slate-400/15 text-slate-300 border border-slate-400/20"
                                  : "bg-slate-800/40 text-slate-400"
                              }`}
                            >
                              #{row.posicion}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-white">{row.producto}</td>
                          <td className="px-5 py-3 text-center font-mono">{row.cantidadVendida}</td>
                          <td className="px-5 py-3 text-right text-[#22D3A6] font-mono">
                            Q {row.ingresos.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-400 font-mono">
                            Q {row.precioPromedio.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: EMPLEADOS */}
          {reportSubTab === "empleados" && reportEmpleados && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Total Empleados
                  </span>
                  <span className="text-2xl font-black text-white">{reportEmpleados.totalEmpleados}</span>
                </div>
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Total Ventas
                  </span>
                  <span className="text-2xl font-black text-white">{reportEmpleados.totalVentas}</span>
                </div>
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Monto Total
                  </span>
                  <span className="text-2xl font-black text-[#22D3A6]">
                    Q{" "}
                    {reportEmpleados.montoTotal.toLocaleString("es-GT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Top Vendedor
                  </span>
                  <span className="text-lg font-black text-white truncate">
                    {reportEmpleados.topVendedor ?? "—"}
                  </span>
                  {reportEmpleados.ventasTopVendedor != null && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {reportEmpleados.ventasTopVendedor} ventas
                    </span>
                  )}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Ventas por Empleado */}
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Número de Ventas por Empleado
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportEmpleados.empleados.map((e) => ({ name: e.empleado, ventas: e.ventas }))}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#475569"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(38, 189, 248, 0.05)" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  <p className="font-semibold text-[#38BDF8] text-xs">
                                    Ventas: {payload[0].value}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="ventas" fill="#38BDF8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monto por Empleado */}
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Monto Total Vendido
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={reportEmpleados.empleados.map((e) => ({ name: e.empleado, monto: e.monto }))}
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                          type="number"
                          stroke="#475569"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `Q${v}`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#475569"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  <p className="font-semibold text-[#22D3A6] text-xs">
                                    Monto: Q
                                    {Number(payload[0].value).toLocaleString("es-GT", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="monto" fill="#22D3A6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Productividad Detallada
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/10 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-5 py-3">Empleado</th>
                        <th className="px-5 py-3 text-center">Ventas Realizadas</th>
                        <th className="px-5 py-3 text-right">Monto Total</th>
                        <th className="px-5 py-3 text-right">Promedio por Venta</th>
                        <th className="px-5 py-3 text-center">Desempeño</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {reportEmpleados.detalle.map((row) => (
                        <tr
                          key={row.empleado}
                          className="hover:bg-slate-900/10 transition-colors text-slate-300"
                        >
                          <td className="px-5 py-3 font-bold text-white">{row.empleado}</td>
                          <td className="px-5 py-3 text-center font-mono">{row.ventasRealizadas}</td>
                          <td className="px-5 py-3 text-right text-[#22D3A6] font-mono">
                            Q {row.montoTotal.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-400 font-mono">
                            Q {row.promedioPorVenta.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.desempeno === "Excelente"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : row.desempeno === "Muy Bueno"
                                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                  : "bg-slate-800/60 text-slate-300"
                              }`}
                            >
                              {row.desempeno}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: METODOS DE PAGO */}
          {reportSubTab === "pagos" && reportMetodosPago && (
            <div className="space-y-6">
              {/* KPIs Summary */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {reportMetodosPago.resumen.map((item) => (
                  <div
                    key={item.metodo}
                    className="rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex flex-col gap-1 hover:border-slate-800 transition-all"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      {item.metodo}
                    </span>
                    <span className="text-2xl font-black text-white">{item.transacciones} transacciones</span>
                    <span className="text-xs text-[#22D3A6] font-bold">
                      Total: Q {item.monto.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Distribución por Método */}
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Distribución por Método de Pago
                  </h3>
                  <div className="h-64 w-full flex items-center justify-center text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                                    {data.metodo}
                                  </p>
                                  <p className="font-semibold text-[#38BDF8] text-xs">
                                    Transacciones: {data.transacciones}
                                  </p>
                                  <p className="font-semibold text-[#22D3A6] text-xs">
                                    Porcentaje: {data.porcentaje}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Pie
                          data={reportMetodosPago.distribucion}
                          dataKey="transacciones"
                          nameKey="metodo"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#38BDF8"
                          label={({ name, porcentaje }) => `${name} (${porcentaje}%)`}
                          labelLine={{ stroke: "#475569", strokeWidth: 1 }}
                        >
                          {reportMetodosPago.distribucion.map((entry, idx) => {
                            const colors = ["#38BDF8", "#22D3A6", "#F59E0B", "#EF4444", "#8B5CF6"];
                            return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monto por Método */}
                <div className="rounded-xl border border-slate-900 bg-slate-955/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Monto por Método de Pago
                  </h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportMetodosPago.distribucion} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="metodo" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis
                          stroke="#475569"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `Q${v}`}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  <p className="font-semibold text-[#38BDF8] text-xs">
                                    Monto Total: Q
                                    {Number(payload[0].value).toLocaleString("es-GT", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="monto" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Detalle de Métodos de Pago
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/10 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-5 py-3">Método</th>
                        <th className="px-5 py-3 text-center">Cantidad de Transacciones</th>
                        <th className="px-5 py-3 text-center">Porcentaje</th>
                        <th className="px-5 py-3 text-right">Monto Total</th>
                        <th className="px-5 py-3 text-right">Monto Promedio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {reportMetodosPago.detalle.map((row) => (
                        <tr
                          key={row.metodo}
                          className="hover:bg-slate-900/10 transition-colors text-slate-350"
                        >
                          <td className="px-5 py-3 font-bold text-white">{row.metodo}</td>
                          <td className="px-5 py-3 text-center font-mono">{row.cantidadTransacciones}</td>
                          <td className="px-5 py-3 text-center">
                            <span className="inline-flex items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold">
                              {row.porcentaje}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right text-[#22D3A6] font-mono">
                            Q {row.montoTotal.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-400 font-mono">
                            Q {row.montoPromedio.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB: PERSONALIZADO */}
          {reportSubTab === "personalizado" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-900 bg-slate-955 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="text-[#22D3A6]" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Consola SQL Custom (Soporta variables: @tenant_id)
                    </h3>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                    READ-ONLY ACTIVE
                  </span>
                </div>
{/* Ayuda para consultas SQL */}
<div className="rounded-lg border border-slate-900 bg-slate-950/30 overflow-hidden">
  {/* Botón para mostrar/ocultar la documentación */}
  <button
    type="button"
    onClick={() => setShowSqlHelp((prev) => !prev)}
    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-900/40 transition-colors"
    aria-expanded={showSqlHelp}
  >
    <div className="flex items-center gap-2">
      <Info size={14} className="text-[#22D3A6] shrink-0" />

      <span className="text-[11px] font-semibold text-slate-300">
        ¿Necesitas ayuda para crear tu consulta?
      </span>
    </div>

    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#22D3A6] whitespace-nowrap">
      {showSqlHelp ? "Ocultar" : "Más información"}

      {showSqlHelp ? (
        <ChevronUp size={13} />
      ) : (
        <ChevronDown size={13} />
      )}
    </span>
  </button>

  {/* Contenido desplegable */}
  {showSqlHelp && (
    <div className="border-t border-slate-900 px-4 py-4 space-y-5">

      {/* Instrucciones */}
      <div>
        <h4 className="text-[11px] font-bold text-white mb-2">
          Cómo crear una consulta
        </h4>

        <ul className="space-y-1.5 text-[10px] text-slate-400 list-disc pl-4">
          <li>
            Utiliza consultas{" "}
            <code className="text-[#38BDF8] font-mono">SELECT</code>{" "}
            para obtener información de las tablas disponibles.
          </li>

          <li>
            Especifica los campos que deseas consultar y la tabla de donde
            provienen.
          </li>

          <li>
            Puedes utilizar cláusulas SQL como{" "}
            <code className="text-[#38BDF8] font-mono">WHERE</code>,{" "}
            <code className="text-[#38BDF8] font-mono">ORDER BY</code> y{" "}
            <code className="text-[#38BDF8] font-mono">GROUP BY</code>{" "}
            para organizar o filtrar los resultados.
          </li>

          <li>
            Presiona{" "}
            <span className="font-semibold text-slate-200">
              Ejecutar Query
            </span>{" "}
            para obtener los resultados.
          </li>
        </ul>

        {/* Ejemplo */}
        <div className="mt-3 rounded-md border border-slate-800 bg-slate-950 px-3 py-2">
          <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold mb-1">
            Ejemplo
          </p>

          <code className="text-[10px] text-[#22D3A6] font-mono">
            SELECT nombre_producto, precio, stock_actual FROM Producto;
          </code>
        </div>
      </div>

      {/* Tablas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-bold text-white">
            Tablas disponibles
          </h4>

          <span className="text-[9px] text-slate-600">
            Campos disponibles para consultas
          </span>
        </div>

        <div className="space-y-2">

          {/* Producto */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Producto
              </span>

              <span className="text-[9px] text-slate-600">
                Catálogo e inventario
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_producto · codigo_producto · nombre_producto · descripcion ·
              precio · stock_actual · id_marca · categoria_id ·
              fecha_vencimiento · imagen_principal · fecha_creacion ·
              fecha_actualizacion
            </p>
          </div>

          {/* Usuario */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Usuario
              </span>

              <span className="text-[9px] text-slate-600">
                Usuarios registrados
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id · correo · nombre · apellido · telefono · tipo_usuario ·
              estado · fecha_creacion
            </p>
          </div>

          {/* Reservacion */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Reservacion
              </span>

              <span className="text-[9px] text-slate-600">
                Reservaciones de clientes
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_reservacion · codigo_reservacion · cliente_id ·
              fecha_renovacion · estado_renovacion · total_renovacion ·
              metodo_pago_id · pagado · observaciones · fecha_limite_retiro
            </p>
          </div>

          {/* DetalleReservacion */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                DetalleReservacion
              </span>

              <span className="text-[9px] text-slate-600">
                Productos de cada reservación
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_details · reservacion_id · producto_id · nombre_producto ·
              cantidad · precio_unitario · subtotal
            </p>
          </div>

          {/* Venta */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Venta
              </span>

              <span className="text-[9px] text-slate-600">
                Ventas realizadas
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_venta · reservacion_id · monto_total · usuario_cajero_id ·
              fecha_venta · tipo_comprobante · estado_venta
            </p>
          </div>

          {/* Categoria */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Categoria
              </span>

              <span className="text-[9px] text-slate-600">
                Categorías de productos
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id · nombre_categoria · descripcion · fecha_creacion
            </p>
          </div>

          {/* Marca */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Marca
              </span>

              <span className="text-[9px] text-slate-600">
                Marcas de productos
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id · nombre_marca · descripcion
            </p>
          </div>

          {/* MetodoPago */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                MetodoPago
              </span>

              <span className="text-[9px] text-slate-600">
                Métodos de pago
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_metodo_pago · usuario_id · nombre_metodo · descripcion ·
              alias_tarjeta · marca_tarjeta · ultimos_digitos · expira_mes ·
              expira_anio · activo
            </p>
          </div>

          {/* Carrito */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                Carrito
              </span>

              <span className="text-[9px] text-slate-600">
                Carritos de clientes
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_carrito · cliente_id · activo · fecha_creacion ·
              fecha_actualizacion
            </p>
          </div>

          {/* ArticuloCarrito */}
          <div className="rounded-md border border-slate-900 bg-slate-950/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#22D3A6] font-mono">
                ArticuloCarrito
              </span>

              <span className="text-[9px] text-slate-600">
                Productos agregados al carrito
              </span>
            </div>

            <p className="text-[9px] text-slate-500 font-mono leading-relaxed">
              id_articulo · carrito_id · producto_id · nombre_producto ·
              cantidad · precio_unitario · subtotal
            </p>
          </div>

        </div>
      </div>
    </div>
  )}
</div>

                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      onKeyDown={handleQueryKeyDown}
                      onFocus={handleQueryFocus}
                      onBlur={handleQueryBlur}
                      placeholder="Escribe tu consulta SQL SELECT... (Presiona Tab para autocompletar)"
                      className="w-full h-32 p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs focus:border-[#22D3A6] focus:ring-1 focus:ring-[#22D3A6] outline-none resize-y relative z-10 bg-opacity-90"
                    />
                    {/* Autocomplete suggestion overlay */}
                    {queryAutocomplete && (
                      <div className="absolute top-4 left-4 pointer-events-none h-32 max-h-32 overflow-hidden">
                        <div className="text-slate-600 font-mono text-xs leading-relaxed">
                          {customQuery}
                          <span className="text-slate-500 opacity-60">{queryAutocomplete}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    💡 Tip: Presiona <code className="text-[#22D3A6] font-mono bg-slate-900 px-1.5 py-0.5 rounded">Tab</code> o <code className="text-[#22D3A6] font-mono bg-slate-900 px-1.5 py-0.5 rounded">Ctrl+Enter</code> para aceptar la sugerencia de autocomplete.
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    * Por razones de seguridad y aislamiento de datos, toda consulta SQL debe incluir un filtro
                    explícito en la columna <code className="text-[#38BDF8] font-mono">tienda_id</code> utilizando
                    la variable <code className="text-[#22D3A6] font-mono">@tenant_id</code> (ej:{" "}
                    <code className="text-[#22D3A6] font-mono">WHERE tienda_id = @tenant_id</code>). Solo se
                    permiten comandos de lectura (<code className="text-[#38BDF8] font-mono">SELECT</code> /{" "}
                    <code className="text-[#38BDF8] font-mono">WITH</code>).
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Tus consultas se ejecutan con privilegios restringidos de base de datos.
                  </span>
                  <button
                    onClick={handleExecuteSql}
                    disabled={customQueryLoading}
                    className="h-9 px-5 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold cursor-pointer border-none transition-all flex items-center gap-2"
                  >
                    {customQueryLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Ejecutando...</span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Play size={10} className="fill-slate-950" /> Ejecutar Query
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Custom Query Error */}
              {customQueryError && (
                <div className="rounded-xl border border-rose-900 bg-rose-955 p-5 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={16} />
                    <span>Error de Ejecución SQL</span>
                  </div>
                  <p className="text-xs font-mono text-rose-300 bg-rose-950/40 p-3 rounded-lg border border-rose-900/30 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {customQueryError}
                  </p>
                </div>
              )}

              {/* Custom Query Results */}
              {customQueryResult && (
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden animate-fade-in">
                  <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Resultado de la Consulta
                    </h3>
                    <span className="text-[10px] font-bold text-[#22D3A6] bg-[#22D3A6]/10 px-2 py-0.5 rounded border border-[#22D3A6]/20 uppercase">
                      {customQueryResult.length} fila(s) encontrada(s)
                    </span>
                  </div>

                  {customQueryResult.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 font-mono text-xs">
                      La consulta se completó con éxito pero no devolvió ninguna fila.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/20 font-bold uppercase tracking-wider text-[10px] sticky top-0">
                            {Object.keys(customQueryResult[0]).map((key) => (
                              <th key={key} className="px-5 py-3 whitespace-nowrap bg-slate-950">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {customQueryResult.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                              {Object.keys(customQueryResult[0]).map((key) => {
                                const cellVal = row[key];
                                return (
                                  <td key={key} className="px-5 py-3 whitespace-nowrap max-w-[250px] truncate">
                                    {cellVal === null ? (
                                      <span className="text-slate-600 font-semibold italic">NULL</span>
                                    ) : typeof cellVal === "object" ? (
                                      JSON.stringify(cellVal)
                                    ) : (
                                      String(cellVal)
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
