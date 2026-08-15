"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Download, FileText, Loader2, AlertTriangle, Sliders, Play, Database, BookOpen, Copy, Check, Search, Clock, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { MonacoSqlEditor, type MonacoSqlEditorHandle } from "./MonacoSqlEditor";
import { SqlSchemaHelp } from "./SqlSchemaHelp";
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
  const defaultSqlQuery = 'SELECT id, nombre, stock_actual, stock_minimo FROM public."Producto" WHERE tienda_id = @tenant_id AND stock_actual <= stock_minimo ORDER BY stock_actual ASC;';
  const [customQuery, setCustomQuery] = useState(defaultSqlQuery);
  const [customQueryResult, setCustomQueryResult] = useState<Array<Record<string, any>> | null>(null);
  const [customQueryError, setCustomQueryError] = useState<string | null>(null);
  const [customQueryLoading, setCustomQueryLoading] = useState(false);
  const [customQueryStats, setCustomQueryStats] = useState<{
    durationMs: number;
    rowCount: number;
    executedAt: string;
    queryExecuted: string;
  } | null>(null);
  const [resultSearchFilter, setResultSearchFilter] = useState("");
  const [copiedResultJson, setCopiedResultJson] = useState(false);
  const [showSchemaHelp, setShowSchemaHelp] = useState(true);
  const monacoEditorRef = useRef<MonacoSqlEditorHandle>(null);

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
    
    // Always obtain the absolute freshest query directly from the Monaco Editor instance
    const queryToExecute = (monacoEditorRef.current?.getValue() ?? customQuery).trim();
    if (!queryToExecute) {
      toast.error("La consulta SQL no puede estar vacía");
      return;
    }

    setCustomQueryLoading(true);
    setCustomQueryError(null);
    setCustomQueryResult(null);
    setResultSearchFilter("");
    const startTime = performance.now();

    try {
      const result = await ejecutarRawReporte(token, queryToExecute);
      const durationMs = Math.round(performance.now() - startTime);
      setCustomQueryResult(result.rows);
      setCustomQueryStats({
        durationMs,
        rowCount: result.rows.length,
        executedAt: new Date().toLocaleTimeString(),
        queryExecuted: queryToExecute,
      });
      toast.success(`Consulta SQL ejecutada: ${result.rows.length} fila(s) en ${durationMs}ms`);
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
              {/* Monaco Editor Card */}
              <div className="rounded-xl border border-slate-900 bg-slate-955 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900/60 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="text-[#22D3A6]" size={18} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Consola SQL Custom (Soporta variables: @tenant_id)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSchemaHelp((prev) => !prev)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                        showSchemaHelp
                          ? "bg-[#22D3A6]/10 text-[#22D3A6] border-[#22D3A6]/30"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      <BookOpen size={13} />
                      <span>{showSchemaHelp ? "Ocultar Ayuda de Tablas" : "Mostrar Ayuda de Tablas"}</span>
                    </button>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                      READ-ONLY ACTIVE
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <MonacoSqlEditor
                    ref={monacoEditorRef}
                    value={customQuery}
                    onChange={(val) => setCustomQuery(val)}
                    onExecute={handleExecuteSql}
                    onToggleHelp={() => setShowSchemaHelp((prev) => !prev)}
                    isLoading={customQueryLoading}
                  />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    * Por razones de seguridad y aislamiento de datos, toda consulta SQL debe incluir un filtro
                    explícito en la columna <code className="text-[#38BDF8] font-mono">tienda_id</code> utilizando
                    la variable <code className="text-[#22D3A6] font-mono">@tenant_id</code> (ej:{" "}
                    <code className="text-[#22D3A6] font-mono">WHERE tienda_id = @tenant_id</code>). Solo se
                    permiten comandos de lectura (<code className="text-[#38BDF8] font-mono">SELECT</code> /{" "}
                    <code className="text-[#38BDF8] font-mono">WITH</code>).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Tus consultas se ejecutan con privilegios restringidos de base de datos PostgreSQL.
                  </span>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomQuery(defaultSqlQuery);
                        monacoEditorRef.current?.setValue(defaultSqlQuery);
                      }}
                      className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-800 transition-all"
                      title="Restaurar consulta de ejemplo inicial"
                    >
                      Restaurar Inicial
                    </button>
                    <button
                      onClick={handleExecuteSql}
                      disabled={customQueryLoading}
                      className="h-9 px-5 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold cursor-pointer border-none transition-all flex items-center gap-2 shadow-sm"
                    >
                      {customQueryLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          <span>Ejecutando...</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Play size={11} className="fill-slate-950" /> Ejecutar Query
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Schema Helper Component */}
              {showSchemaHelp && (
                <SqlSchemaHelp
                  onInsertSnippet={(snippet) => monacoEditorRef.current?.insertText(snippet)}
                  onSetQuery={(sql) => {
                    setCustomQuery(sql);
                    monacoEditorRef.current?.setValue(sql);
                  }}
                />
              )}

              {/* Custom Query Error */}
              {customQueryError && (
                <div className="rounded-xl border border-rose-900 bg-rose-955 p-5 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle size={16} />
                      <span>Error de Ejecución SQL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomQueryError(null)}
                      className="text-xs text-rose-400 hover:text-rose-200 cursor-pointer bg-transparent border-none"
                    >
                      ✕ Cerrar
                    </button>
                  </div>
                  <p className="text-xs font-mono text-rose-300 bg-rose-950/40 p-3 rounded-lg border border-rose-900/30 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {customQueryError}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    💡 Revisa las tablas y atributos disponibles en el panel de ayuda de arriba para asegurar que los nombres de tablas y columnas sean exactos.
                  </p>
                </div>
              )}

              {/* Custom Query Results */}
              {customQueryResult && (
                <div className="rounded-xl border border-slate-900 bg-slate-955/80 overflow-hidden shadow-lg animate-fade-in space-y-0">
                  {/* Results Header with Live Stats & Actions */}
                  <div className="border-b border-slate-900 bg-slate-950/90 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#22D3A6]/10 text-[#22D3A6] border border-[#22D3A6]/20">
                        <Database size={15} />
                      </div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Resultado en Tiempo Real</span>
                      </h3>

                      {/* Live Badges */}
                      <span className="text-[10px] font-bold text-[#22D3A6] bg-[#22D3A6]/10 px-2.5 py-0.5 rounded-full border border-[#22D3A6]/30 uppercase font-mono">
                        {customQueryResult.length} fila(s)
                      </span>

                      {customQueryStats && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <span className="flex items-center gap-1 text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                            <Clock size={11} /> {customQueryStats.durationMs}ms
                          </span>
                          <span className="hidden md:inline text-slate-500">
                            a las {customQueryStats.executedAt}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons & Result Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search in Result */}
                      {customQueryResult.length > 0 && (
                        <div className="relative">
                          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Filtrar resultados..."
                            value={resultSearchFilter}
                            onChange={(e) => setResultSearchFilter(e.target.value)}
                            className="h-8 w-36 sm:w-44 rounded-lg bg-slate-900/90 pl-8 pr-2 text-[11px] text-slate-200 placeholder:text-slate-500 border border-slate-800 focus:border-[#22D3A6] focus:outline-none transition-colors font-mono"
                          />
                          {resultSearchFilter && (
                            <button
                              type="button"
                              onClick={() => setResultSearchFilter("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer bg-transparent border-none"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}

                      {/* Copy JSON */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(customQueryResult, null, 2));
                          setCopiedResultJson(true);
                          toast.success("Datos copiados en formato JSON");
                          setTimeout(() => setCopiedResultJson(false), 2000);
                        }}
                        className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono font-medium border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Copiar resultado completo como JSON"
                      >
                        {copiedResultJson ? (
                          <>
                            <Check size={12} className="text-[#22D3A6]" />
                            <span className="text-[#22D3A6]">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>JSON</span>
                          </>
                        )}
                      </button>

                      {/* Export CSV */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!customQueryResult || customQueryResult.length === 0) return;
                          const ws = XLSX.utils.json_to_sheet(customQueryResult);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Consulta_SQL");
                          XLSX.writeFile(wb, `consulta_sql_${new Date().toISOString().slice(0, 10)}.csv`, { bookType: "csv" });
                          toast.success("CSV exportado con éxito");
                        }}
                        className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold border border-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Exportar a archivo CSV"
                      >
                        <Download size={12} className="text-[#22D3A6]" />
                        <span>Exportar CSV</span>
                      </button>
                    </div>
                  </div>

                  {customQueryResult.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-mono text-xs space-y-1">
                      <p className="text-slate-400 font-semibold">0 filas encontradas</p>
                      <p className="text-slate-600">La consulta se completó exitosamente en PostgreSQL pero no devolvió registros coincidentes.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[460px] sidebar-scrollbar">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-400 bg-slate-950 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-sm">
                            <th className="px-3.5 py-3 w-12 text-center text-slate-600 bg-slate-950">#</th>
                            {Object.keys(customQueryResult[0]).map((key) => (
                              <th key={key} className="px-4 py-3 whitespace-nowrap bg-slate-950 text-slate-300">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/70">
                          {customQueryResult
                            .filter((row) => {
                              if (!resultSearchFilter.trim()) return true;
                              const q = resultSearchFilter.toLowerCase();
                              return Object.values(row).some((val) =>
                                val !== null && val !== undefined && String(val).toLowerCase().includes(q)
                              );
                            })
                            .map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/40 transition-colors text-slate-300 group">
                                <td className="px-3.5 py-2.5 text-center text-[10px] text-slate-600 font-mono select-none group-hover:text-slate-400">
                                  {idx + 1}
                                </td>
                                {Object.keys(customQueryResult[0]).map((key) => {
                                  const cellVal = row[key];
                                  return (
                                    <td key={key} className="px-4 py-2.5 whitespace-nowrap max-w-[320px] truncate">
                                      {cellVal === null || cellVal === undefined ? (
                                        <span className="text-slate-600 font-semibold italic text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                                          NULL
                                        </span>
                                      ) : typeof cellVal === "boolean" ? (
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            cellVal
                                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                          }`}
                                        >
                                          {cellVal ? "true" : "false"}
                                        </span>
                                      ) : typeof cellVal === "number" ? (
                                        <span className="text-[#22D3A6] font-semibold">
                                          {Number.isInteger(cellVal) ? cellVal : cellVal.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                                        </span>
                                      ) : typeof cellVal === "object" ? (
                                        <span className="text-sky-300 font-mono text-[11px] bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-900/40">
                                          {JSON.stringify(cellVal)}
                                        </span>
                                      ) : typeof cellVal === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cellVal) ? (
                                        <span
                                          className="text-slate-400 font-mono text-[11px] hover:text-white cursor-pointer select-all"
                                          title="Haga clic para seleccionar UUID"
                                        >
                                          {cellVal}
                                        </span>
                                      ) : (
                                        <span className="text-slate-200">{String(cellVal)}</span>
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
