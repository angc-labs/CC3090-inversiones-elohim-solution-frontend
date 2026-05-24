"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
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
import type { TReporteMetodosPago } from "@/lib/api/reportes";

type ReporteTabMetodosPagoProps = {
  data: TReporteMetodosPago;
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f97316", "#ef4444", "#8b5cf6"];

const chartConfig = {
  monto: { label: "Monto", color: "#3b82f6" },
};

export function ReporteTabMetodosPago({ data }: ReporteTabMetodosPagoProps) {
  const pieData = data.distribucion.map((item, index) => ({
    ...item,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div className="!space-y-6">
      <div className="!grid !gap-4 md:!grid-cols-2 xl:!grid-cols-4">
        {data.resumen.map((item) => (
          <ReportesKpiCard
            key={item.metodo}
            label={item.metodo}
            value={item.transacciones}
            subtext={formatGtq(item.monto)}
          />
        ))}
      </div>

      <div className="!grid !gap-4 lg:!grid-cols-2">
        <Card className="!border-slate-200 !shadow-sm">
          <CardHeader>
            <CardTitle className="!text-base !font-semibold">
              Distribución por Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="!mx-auto !h-72 !w-full !max-w-sm">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  dataKey="transacciones"
                  nameKey="metodo"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ porcentaje }) => `${porcentaje}%`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.metodo} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="!border-slate-200 !shadow-sm">
          <CardHeader>
            <CardTitle className="!text-base !font-semibold">
              Monto por Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="!h-72 !w-full">
              <BarChart data={data.distribucion}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="metodo" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatGtq(Number(v))}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent valueFormatter={reportesChartValueFormatter} />
                  }
                />
                <Bar dataKey="monto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <ReportesDataTable title="Detalle de Métodos de Pago">
        <Table>
          <TableHeader>
            <TableRow className={reportesTableHeaderRowClass}>
              <TableHead className={reportesTableHeadClass}>Método</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Transacciones</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>%</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-right")}>Monto Total</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-right")}>Promedio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.detalle.map((row) => (
              <TableRow key={row.metodo} className={reportesTableRowClass}>
                <TableCell className={cn(reportesTableCellClass, "!font-semibold !text-slate-900")}>
                  {row.metodo}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center"))}>
                  {row.cantidadTransacciones}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant="info">{row.porcentaje}%</Badge>
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-emerald-700"))}>
                  {formatGtq(row.montoTotal)}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-slate-600"))}>
                  {formatGtq(row.montoPromedio)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ReportesDataTable>
    </div>
  );
}
