"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReportesDataTable } from "@/components/features/reportes/ReportesDataTable";
import { ReportesKpiCard } from "@/components/features/reportes/ReportesKpiCard";
import {
  reportesTableCellClass,
  reportesTableHeadClass,
  reportesTableHeaderRowClass,
  reportesTableNumericClass,
  reportesTableRowClass,
} from "@/components/features/reportes/reportes-table-styles";
import { reportesChartValueFormatter } from "@/components/features/reportes/reportes-chart-format";
import { formatGtq } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TReporteProductos } from "@/lib/api/reportes";

type ReporteTabProductosProps = {
  data: TReporteProductos;
};

const chartConfig = {
  cantidad: { label: "Cantidad", color: "#3b82f6" },
  ingresos: { label: "Ingresos", color: "#10b981" },
};

function rankVariant(posicion: number): "gold" | "secondary" | "outline" {
  if (posicion === 1) return "gold";
  if (posicion === 2) return "secondary";
  return "outline";
}

export function ReporteTabProductos({ data }: ReporteTabProductosProps) {
  const chartCantidad = data.productos.map((p) => ({
    producto: p.producto,
    cantidad: p.cantidadVendida,
  }));

  const chartIngresos = data.productos.map((p) => ({
    producto: p.producto,
    ingresos: p.ingresos,
  }));

  return (
    <div className="!space-y-6">
      <div className="!grid !gap-4 md:!grid-cols-3">
        <ReportesKpiCard
          label="Total Productos Vendidos"
          value={data.totalProductosVendidos.toLocaleString("es-GT")}
        />
        <ReportesKpiCard
          label="Ingresos Totales"
          value={formatGtq(data.ingresosTotales)}
          valueClassName="!text-emerald-600"
        />
        <ReportesKpiCard
          label="Producto Top"
          value={data.productoTop ?? "—"}
          subtext={
            data.unidadesProductoTop != null
              ? `${data.unidadesProductoTop} unidades`
              : undefined
          }
        />
      </div>

      <div className="!grid !gap-4 lg:!grid-cols-2">
        <Card className="!border-slate-200 !shadow-sm">
          <CardHeader className="!pb-2">
            <CardTitle className="!text-base !font-semibold">
              Cantidad Vendida por Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="!overflow-visible !pb-4">
            <ChartContainer config={chartConfig} className="!h-72 !w-full !overflow-visible">
              <BarChart data={chartCantidad} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="producto"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="!border-slate-200 !shadow-sm">
          <CardHeader className="!pb-2">
            <CardTitle className="!text-base !font-semibold">
              Ingresos por Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="!overflow-visible !pb-4">
            <ChartContainer config={chartConfig} className="!h-72 !w-full !overflow-visible">
              <BarChart data={chartIngresos} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="producto"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatGtq(Number(v))}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      valueFormatter={reportesChartValueFormatter}
                    />
                  }
                />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <ReportesDataTable title="Detalle de Productos Más Vendidos">
        <Table>
          <TableHeader>
            <TableRow className={reportesTableHeaderRowClass}>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Posición</TableHead>
              <TableHead className={reportesTableHeadClass}>Producto</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Cantidad</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-right")}>Ingresos</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-right")}>Precio Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.detalle.map((row) => (
              <TableRow key={row.posicion} className={reportesTableRowClass}>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant={rankVariant(row.posicion)}>#{row.posicion}</Badge>
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!font-semibold !text-slate-900")}>
                  {row.producto}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center"))}>
                  {row.cantidadVendida}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-emerald-700"))}>
                  {formatGtq(row.ingresos)}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-slate-600"))}>
                  {formatGtq(row.precioPromedio)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ReportesDataTable>
    </div>
  );
}
