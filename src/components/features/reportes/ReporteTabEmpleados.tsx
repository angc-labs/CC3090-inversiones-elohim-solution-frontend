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
import type { TReporteEmpleados } from "@/lib/api/reportes";

type ReporteTabEmpleadosProps = {
  data: TReporteEmpleados;
};

const chartConfig = {
  ventas: { label: "Ventas", color: "#3b82f6" },
  monto: { label: "Monto", color: "#10b981" },
};

function desempenoVariant(desempeno: string): "success" | "info" | "secondary" {
  if (desempeno === "Excelente") return "success";
  if (desempeno === "Muy Bueno") return "info";
  return "secondary";
}

export function ReporteTabEmpleados({ data }: ReporteTabEmpleadosProps) {
  const chartVentas = data.empleados.map((e) => ({
    empleado: e.empleado,
    ventas: e.ventas,
  }));

  const chartMonto = data.empleados.map((e) => ({
    empleado: e.empleado,
    monto: e.monto,
  }));

  return (
    <div className="!space-y-6">
      <div className="!grid !gap-4 md:!grid-cols-2 xl:!grid-cols-4">
        <ReportesKpiCard label="Total Empleados" value={data.totalEmpleados} />
        <ReportesKpiCard label="Total Ventas" value={data.totalVentas} />
        <ReportesKpiCard
          label="Monto Total"
          value={formatGtq(data.montoTotal)}
          valueClassName="!text-emerald-600"
        />
        <ReportesKpiCard
          label="Top Vendedor"
          value={data.topVendedor ?? "—"}
          subtext={
            data.ventasTopVendedor != null
              ? `${data.ventasTopVendedor} ventas`
              : undefined
          }
        />
      </div>

      <div className="!grid !gap-4 lg:!grid-cols-2">
        <Card className="!border-slate-200 !shadow-sm">
          <CardHeader className="!pb-2">
            <CardTitle className="!text-base !font-semibold">
              Número de Ventas por Empleado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="!h-72 !w-full">
              <BarChart data={chartVentas} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="empleado"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ventas" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="!border-slate-200 !shadow-sm">
          <CardHeader className="!pb-2">
            <CardTitle className="!text-base !font-semibold">
              Monto Total Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="!h-72 !w-full">
              <BarChart data={chartMonto} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatGtq(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="empleado"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent valueFormatter={reportesChartValueFormatter} />
                  }
                />
                <Bar dataKey="monto" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <ReportesDataTable title="Productividad Detallada">
        <Table>
          <TableHeader>
            <TableRow className={reportesTableHeaderRowClass}>
              <TableHead className={reportesTableHeadClass}>Empleado</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Ventas</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-right")}>Monto Total</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-right")}>Promedio</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Desempeño</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.detalle.map((row) => (
              <TableRow key={row.empleado} className={reportesTableRowClass}>
                <TableCell className={cn(reportesTableCellClass, "!font-semibold !text-slate-900")}>
                  {row.empleado}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center"))}>
                  {row.ventasRealizadas}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-emerald-700"))}>
                  {formatGtq(row.montoTotal)}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-slate-600"))}>
                  {formatGtq(row.promedioPorVenta)}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant={desempenoVariant(row.desempeno)}>{row.desempeno}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ReportesDataTable>
    </div>
  );
}
