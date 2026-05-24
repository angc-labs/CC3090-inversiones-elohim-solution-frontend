"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  CreditCard,
  Download,
  LineChart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReporteTabProductos } from "@/components/features/reportes/ReporteTabProductos";
import { ReporteTabEmpleados } from "@/components/features/reportes/ReporteTabEmpleados";
import { ReporteTabStockCritico } from "@/components/features/reportes/ReporteTabStockCritico";
import { ReporteTabDemanda } from "@/components/features/reportes/ReporteTabDemanda";
import { ReporteTabMetodosPago } from "@/components/features/reportes/ReporteTabMetodosPago";
import {
  obtenerReporteDemanda,
  obtenerReporteEmpleados,
  obtenerReporteMetodosPago,
  obtenerReporteProductos,
  obtenerReporteStockCritico,
  type TReporteDemanda,
  type TReporteEmpleados,
  type TReporteMetodosPago,
  type TReporteProductos,
  type TReporteStockCritico,
  type TModoReporte,
  type TReportesFiltro,
} from "@/lib/api/reportes";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

type TReporteTab =
  | "productos"
  | "empleados"
  | "stock-critico"
  | "demanda"
  | "metodos-pago";

const TABS: Array<{
  id: TReporteTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "productos", label: "Productos", icon: LineChart },
  { id: "empleados", label: "Empleados", icon: Users },
  { id: "stock-critico", label: "Stock Crítico", icon: AlertTriangle },
  { id: "demanda", label: "Demanda", icon: Clock },
  { id: "metodos-pago", label: "Métodos de Pago", icon: CreditCard },
];

function defaultFiltro(): TReportesFiltro {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);
  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    modo: "todos",
  };
}

const MODOS_REPORTE: Array<{ id: TModoReporte; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "reservaciones", label: "Reservaciones" },
  { id: "ventas", label: "Solo ventas" },
];

const TABS_CON_MODO: TReporteTab[] = [
  "productos",
  "empleados",
  "demanda",
  "metodos-pago",
];

function toInputDate(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ReportesPageClient() {
  const token = useAuthStore((state) => state.token);
  const [tabActiva, setTabActiva] = useState<TReporteTab>("productos");
  const [filtro, setFiltro] = useState<TReportesFiltro>(defaultFiltro);
  const [filtroBorrador, setFiltroBorrador] = useState({
    desde: toInputDate(defaultFiltro().desde),
    hasta: toInputDate(defaultFiltro().hasta),
  });
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productos, setProductos] = useState<TReporteProductos | null>(null);
  const [empleados, setEmpleados] = useState<TReporteEmpleados | null>(null);
  const [stockCritico, setStockCritico] = useState<TReporteStockCritico | null>(null);
  const [demanda, setDemanda] = useState<TReporteDemanda | null>(null);
  const [metodosPago, setMetodosPago] = useState<TReporteMetodosPago | null>(null);

  const cargarTab = useCallback(
    async (tab: TReporteTab, filtroActual: TReportesFiltro) => {
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        switch (tab) {
          case "productos":
            setProductos(await obtenerReporteProductos(token, filtroActual));
            break;
          case "empleados":
            setEmpleados(await obtenerReporteEmpleados(token, filtroActual));
            break;
          case "stock-critico":
            setStockCritico(await obtenerReporteStockCritico(token));
            break;
          case "demanda":
            setDemanda(await obtenerReporteDemanda(token, filtroActual));
            break;
          case "metodos-pago":
            setMetodosPago(await obtenerReporteMetodosPago(token, filtroActual));
            break;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar reportes");
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) return;
    void cargarTab(tabActiva, filtro);
  }, [token, tabActiva, filtro, cargarTab]);

  const aplicarFiltro = () => {
    const desde = filtroBorrador.desde
      ? new Date(`${filtroBorrador.desde}T00:00:00`).toISOString()
      : undefined;
    const hasta = filtroBorrador.hasta
      ? new Date(`${filtroBorrador.hasta}T23:59:59`).toISOString()
      : undefined;

    setFiltro((prev) => ({ ...prev, desde, hasta }));
    setMostrarFiltro(false);
  };

  const contenidoVacio = useMemo(() => {
    if (tabActiva === "productos") {
      return !productos?.detalle.length;
    }
    if (tabActiva === "empleados") {
      return !empleados?.detalle.length;
    }
    if (tabActiva === "stock-critico") {
      return !stockCritico?.detalle.length;
    }
    if (tabActiva === "demanda") {
      return !demanda?.detalle.some((fila) => fila.ventas > 0);
    }
    return !metodosPago?.detalle.length;
  }, [tabActiva, productos, empleados, stockCritico, demanda, metodosPago]);

  const exportarCsv = () => {
    let filas: string[][] = [];
    let nombre = `reporte-${tabActiva}`;

    if (tabActiva === "productos" && productos) {
      filas = [
        ["Posición", "Producto", "Cantidad", "Ingresos", "Precio Promedio"],
        ...productos.detalle.map((r) => [
          String(r.posicion),
          r.producto,
          String(r.cantidadVendida),
          String(r.ingresos),
          String(r.precioPromedio),
        ]),
      ];
    } else if (tabActiva === "empleados" && empleados) {
      filas = [
        ["Empleado", "Ventas", "Monto", "Promedio", "Desempeño"],
        ...empleados.detalle.map((r) => [
          r.empleado,
          String(r.ventasRealizadas),
          String(r.montoTotal),
          String(r.promedioPorVenta),
          r.desempeno,
        ]),
      ];
    } else if (tabActiva === "stock-critico" && stockCritico) {
      filas = [
        ["Producto", "Stock Actual", "Stock Mínimo", "Faltante", "Frecuencia", "Estado"],
        ...stockCritico.detalle.map((r) => [
          r.producto,
          String(r.stockActual),
          String(r.stockMinimo),
          String(r.faltante),
          r.frecuenciaQuiebre,
          r.estado,
        ]),
      ];
    } else if (tabActiva === "demanda" && demanda) {
      filas = [
        ["Horario", "Ventas", "Clientes", "Ratio", "Clasificación"],
        ...demanda.detalle.map((r) => [
          r.horario,
          String(r.ventas),
          String(r.clientes),
          String(r.ratioConversion),
          r.clasificacion,
        ]),
      ];
    } else if (tabActiva === "metodos-pago" && metodosPago) {
      filas = [
        ["Método", "Transacciones", "Porcentaje", "Monto Total", "Monto Promedio"],
        ...metodosPago.detalle.map((r) => [
          r.metodo,
          String(r.cantidadTransacciones),
          String(r.porcentaje),
          String(r.montoTotal),
          String(r.montoPromedio),
        ]),
      ];
    }

    if (!filas.length) return;

    const csv = filas
      .map((fila) => fila.map((celda) => `"${celda.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nombre}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="!w-full !space-y-6">
      <div className="!flex !flex-col !gap-4 sm:!flex-row sm:!items-start sm:!justify-between">
        <div>
          <h1 className="!text-2xl !font-bold !text-slate-900 sm:!text-3xl">Reportes</h1>
          <p className="!mt-1 !text-slate-500">
            Analiza el rendimiento de tu negocio
          </p>
        </div>
        <div className="!flex !flex-wrap !items-center !gap-2">
          <div className="!relative">
            <Button
              type="button"
              variant="outline"
              className="!border-slate-200 !bg-white"
              onClick={() => setMostrarFiltro((prev) => !prev)}
            >
              <Calendar size={16} />
              Filtrar por fecha
            </Button>
            {mostrarFiltro ? (
              <div className="!absolute !left-0 !right-0 !z-20 !mt-2 !w-full !max-w-sm !rounded-lg !border !border-slate-200 !bg-white !p-4 !shadow-lg sm:!left-auto sm:!right-0 sm:!w-72">
                <p className="!mb-3 !text-sm !font-medium !text-slate-700">
                  Rango de fechas
                </p>
                <div className="!space-y-3">
                  <label className="!block !text-xs !text-slate-500">
                    Desde
                    <input
                      type="date"
                      value={filtroBorrador.desde}
                      onChange={(e) =>
                        setFiltroBorrador((prev) => ({
                          ...prev,
                          desde: e.target.value,
                        }))
                      }
                      className="!mt-1 !block !h-9 !w-full !rounded-md !border !border-slate-200 !px-2 !text-sm"
                    />
                  </label>
                  <label className="!block !text-xs !text-slate-500">
                    Hasta
                    <input
                      type="date"
                      value={filtroBorrador.hasta}
                      onChange={(e) =>
                        setFiltroBorrador((prev) => ({
                          ...prev,
                          hasta: e.target.value,
                        }))
                      }
                      className="!mt-1 !block !h-9 !w-full !rounded-md !border !border-slate-200 !px-2 !text-sm"
                    />
                  </label>
                  <Button
                    type="button"
                    className="!w-full !bg-blue-600 hover:!bg-blue-700"
                    onClick={aplicarFiltro}
                  >
                    Aplicar filtro
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            className="!bg-blue-600 hover:!bg-blue-700"
            onClick={exportarCsv}
          >
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </div>

      {TABS_CON_MODO.includes(tabActiva) ? (
        <div className="!flex !flex-wrap !items-center !gap-2">
          <span className="!text-sm !text-slate-500">Origen de datos:</span>
          <div className="!inline-flex !flex-wrap !gap-1 !rounded-lg !bg-slate-100 !p-1">
            {MODOS_REPORTE.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                onClick={() =>
                  setFiltro((prev) => ({ ...prev, modo: opcion.id }))
                }
                className={cn(
                  "!rounded-md !px-3 !py-1.5 !text-sm !font-medium !transition-colors",
                  filtro.modo === opcion.id
                    ? "!bg-white !text-slate-900 !shadow-sm"
                    : "!text-slate-600 hover:!text-slate-900"
                )}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="!inline-flex !w-full !flex-wrap !gap-1 !rounded-xl !bg-slate-100 !p-1 md:!w-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const activa = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              className={cn(
                "!flex !items-center !gap-2 !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-all",
                activa
                  ? "!bg-white !text-slate-900 !shadow-sm"
                  : "!text-slate-600 hover:!text-slate-900"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="!rounded-lg !border !border-red-200 !bg-red-50 !p-4 !text-sm !text-red-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="!flex !min-h-64 !items-center !justify-center">
          <p className="!text-slate-500">Cargando reporte...</p>
        </div>
      ) : contenidoVacio ? (
        <div className="!flex !min-h-64 !flex-col !items-center !justify-center !rounded-xl !border !border-dashed !border-slate-200 !bg-white !p-8 !text-center">
          <BarChart3 className="!mb-3 !text-slate-300" size={40} />
          <p className="!font-medium !text-slate-700">
            Sin datos para este reporte
          </p>
          <p className="!mt-1 !max-w-md !text-sm !text-slate-500">
            No hay registros en el período seleccionado. Probá ampliar el rango
            de fechas o registrá ventas y reservaciones pagadas.
          </p>
        </div>
      ) : (
        <>
          {tabActiva === "productos" && productos ? (
            <ReporteTabProductos data={productos} />
          ) : null}
          {tabActiva === "empleados" && empleados ? (
            <ReporteTabEmpleados data={empleados} />
          ) : null}
          {tabActiva === "stock-critico" && stockCritico ? (
            <ReporteTabStockCritico data={stockCritico} />
          ) : null}
          {tabActiva === "demanda" && demanda ? (
            <ReporteTabDemanda data={demanda} />
          ) : null}
          {tabActiva === "metodos-pago" && metodosPago ? (
            <ReporteTabMetodosPago data={metodosPago} />
          ) : null}
        </>
      )}
    </div>
  );
}
