"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAdminVentas } from "@/lib/api/ventas";
import {
  obtenerReporteDemanda,
  obtenerReporteProductos,
  // obtenerReporteStockCritico,
} from "@/lib/api/reportes";
import { obtenerProductos } from "@/lib/api/productos";
import { formatGtq } from "@/lib/format";
import { useAuthStore } from "@/stores/useAuthStore";

const METODO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  yape: "Yape",
  plin: "Plin",
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {up ? "+" : ""}
      {value}% vs ayer
    </span>
  );
}

export function AdminDashboardClient() {
  const token = useAuthStore((s) => s.token);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ventasHoy, setVentasHoy] = useState(0);
  const [ingresosHoy, setIngresosHoy] = useState(0);
  const [trendVentas, setTrendVentas] = useState<number | null>(null);
  const [trendIngresos, setTrendIngresos] = useState<number | null>(null);
  const [productosActivos, setProductosActivos] = useState(0);
  // const [stockCriticoCount, setStockCriticoCount] = useState(0);
  const [chartHoras, setChartHoras] = useState<{ horario: string; ventas: number }[]>([]);
  const [chartTopProductos, setChartTopProductos] = useState<
    { producto: string; cantidad: number }[]
  >([]);
  // const [alertasStock, setAlertasStock] = useState<
  //   { producto: string; stockActual: number; stockMinimo: number }[]
  // >([]);
  const [ultimasVentas, setUltimasVentas] = useState<
    {
      id: string;
      cliente: string;
      hora: string;
      total: number;
      metodo: string;
    }[]
  >([]);

  useEffect(() => {
    if (!token) return;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        const hace30 = new Date(hoy);
        hace30.setDate(hace30.getDate() - 30);

        const filtro = {
          desde: hace30.toISOString(),
          hasta: hoy.toISOString(),
          modo: "todos" as const,
        };

        const [ventasData, productosData, reporteProd, reporteDemanda] =
          await Promise.all([
            getAdminVentas(token),
            obtenerProductos({ page: 1, limit: 500 }),
            obtenerReporteProductos(token, filtro),
            obtenerReporteDemanda(token, filtro),
            // obtenerReporteStockCritico(token),
          ]);

        setProductosActivos(productosData.total ?? productosData.productos.length);
        // setStockCriticoCount(stock.productosEnRiesgo);

        const ventas = ventasData.ventas.map((v) => ({
          ...v,
          fechaDate: new Date(v.fecha),
        }));

        const hoyList = ventas.filter((v) => isSameDay(v.fechaDate, hoy));
        const ayerList = ventas.filter((v) => isSameDay(v.fechaDate, ayer));

        const ingresosHoySum = hoyList.reduce((s, v) => s + v.total, 0);
        const ingresosAyerSum = ayerList.reduce((s, v) => s + v.total, 0);

        setVentasHoy(hoyList.length);
        setIngresosHoy(ingresosHoySum);

        setTrendVentas(
          ayerList.length > 0
            ? Math.round(((hoyList.length - ayerList.length) / ayerList.length) * 100)
            : null
        );
        setTrendIngresos(
          ingresosAyerSum > 0
            ? Math.round(((ingresosHoySum - ingresosAyerSum) / ingresosAyerSum) * 100)
            : null
        );

        setChartHoras(
          reporteDemanda.grafico.map((g) => ({
            horario: g.horario,
            ventas: g.ventas,
          }))
        );

        setChartTopProductos(
          [...reporteProd.productos]
            .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
            .slice(0, 5)
            .map((p) => ({
              producto:
                p.producto.length > 18 ? `${p.producto.slice(0, 18)}…` : p.producto,
              cantidad: p.cantidadVendida,
            }))
        );

        // setAlertasStock(
        //   stock.detalle.slice(0, 3).map((d) => ({
        //     producto: d.producto,
        //     stockActual: d.stockActual,
        //     stockMinimo: d.stockMinimo,
        //   }))
        // );

        setUltimasVentas(
          ventas.slice(0, 4).map((v) => ({
            id: v.id.length > 10 ? v.id.slice(0, 10) : v.id,
            cliente: v.cliente,
            hora: v.fechaDate.toLocaleTimeString("es-GT", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            total: v.total,
            metodo: METODO_LABEL[v.metodoPago] ?? v.metodoPago,
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar el dashboard");
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, [token]);

  const chartConfig = useMemo(
    () => ({
      ventas: { label: "Ventas", color: "#3b82f6" },
      cantidad: { label: "Unidades", color: "#3b82f6" },
    }),
    []
  );

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Cargando dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Bienvenido al panel de administración</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-blue-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Ventas del Día</p>
            <ShoppingBag className="text-blue-500" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{ventasHoy}</p>
          <TrendBadge value={trendVentas} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-emerald-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Ingresos Totales</p>
            <TrendingUp className="text-emerald-500" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 sm:text-3xl">{formatGtq(ingresosHoy)}</p>
          <TrendBadge value={trendIngresos} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-violet-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Productos Activos</p>
            <Package className="text-violet-500" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{productosActivos}</p>
          <p className="text-xs text-slate-500 mt-1">En catálogo</p>
        </div>

        {/* Stock crítico — deshabilitado temporalmente
        <div className="bg-white rounded-xl border border-gray-200 border-b-4 border-b-orange-500 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Stock Crítico</p>
            <AlertTriangle className="text-orange-500" size={18} />
          </div>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stockCriticoCount}</p>
          <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
        </div>
        */}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Ventas por Hora</h2>
            <ChartContainer config={chartConfig} className="h-64 w-full !overflow-visible">
            <LineChart data={chartHoras}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="horario" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Productos Más Vendidos (Top 5)
          </h2>
            <ChartContainer config={chartConfig} className="h-64 w-full !overflow-visible">
            <BarChart data={chartTopProductos} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="producto"
                width={100}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        {/* Alertas de stock crítico — deshabilitado temporalmente
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          ...
        </div>
        */}

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm lg:max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Últimas Ventas</h2>
            <Link href="/admin/ventas" className="text-xs text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="space-y-2">
            {ultimasVentas.length === 0 ? (
              <li className="text-sm text-gray-400">No hay ventas registradas.</li>
            ) : (
              ultimasVentas.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.id}</p>
                    <p className="text-xs text-gray-500">
                      {v.cliente} · {v.hora}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatGtq(v.total)}</p>
                    <p className="text-xs text-gray-500">{v.metodo}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
