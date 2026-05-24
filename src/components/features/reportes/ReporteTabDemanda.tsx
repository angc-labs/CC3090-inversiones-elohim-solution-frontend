"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { cn } from "@/lib/utils";
import type { TReporteDemanda } from "@/lib/api/reportes";

type ReporteTabDemandaProps = {
  data: TReporteDemanda;
};

const chartConfig = {
  ventas: { label: "Ventas", color: "#3b82f6" },
  clientes: { label: "Clientes", color: "#10b981" },
};

function clasificacionVariant(
  clasificacion: string
): "success" | "warning" | "destructive" {
  if (clasificacion === "Hora Pico") return "destructive";
  if (clasificacion === "Alta") return "warning";
  return "success";
}

export function ReporteTabDemanda({ data }: ReporteTabDemandaProps) {
  return (
    <div className="!space-y-6">
      <div className="!grid !gap-4 md:!grid-cols-3">
        <ReportesKpiCard label="Hora Pico" value={data.horaPico} />
        <ReportesKpiCard
          label="Ventas en Hora Pico"
          value={data.ventasHoraPico}
          valueClassName="!text-blue-600"
        />
        <ReportesKpiCard
          label="Promedio por Hora"
          value={data.promedioPorHora}
        />
      </div>

      <Card className="!border-slate-200 !shadow-sm">
        <CardHeader>
          <CardTitle className="!text-base !font-semibold">
            Ventas por Horario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="!h-80 !w-full">
            <LineChart data={data.grafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="horario" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="clientes"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <ReportesDataTable
        title="Análisis de Picos de Atención"
        description="Horarios con mayor concentración de ventas y clientes"
      >
        <Table>
          <TableHeader>
            <TableRow className={reportesTableHeaderRowClass}>
              <TableHead className={reportesTableHeadClass}>Horario</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Ventas</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Clientes</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Conversión</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>Clasificación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.detalle.map((row) => (
              <TableRow
                key={row.horario}
                className={cn(
                  reportesTableRowClass,
                  row.clasificacion === "Hora Pico" && "!bg-blue-50/80"
                )}
              >
                <TableCell className={cn(reportesTableCellClass, "!font-semibold !text-slate-900")}>
                  {row.horario}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center"))}>
                  {row.ventas}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center"))}>
                  {row.clientes}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center !text-slate-600"))}>
                  {row.ratioConversion}%
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant={clasificacionVariant(row.clasificacion)}>
                    {row.clasificacion}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ReportesDataTable>
    </div>
  );
}
