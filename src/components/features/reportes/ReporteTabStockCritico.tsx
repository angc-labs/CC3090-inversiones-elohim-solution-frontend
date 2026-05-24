"use client";

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
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
import type { TReporteStockCritico } from "@/lib/api/reportes";

type ReporteTabStockCriticoProps = {
  data: TReporteStockCritico;
};

const chartConfig = {
  stockActual: { label: "Stock Actual", color: "#f97316" },
  stockMinimo: { label: "Stock Mínimo", color: "#3b82f6" },
};

function frecuenciaVariant(frecuencia: string): "destructive" | "warning" | "gold" {
  if (frecuencia === "Alta") return "destructive";
  if (frecuencia === "Media") return "warning";
  return "gold";
}

export function ReporteTabStockCritico({ data }: ReporteTabStockCriticoProps) {
  return (
    <div className="!space-y-6">
      <div className="!grid !gap-4 md:!grid-cols-3">
        <ReportesKpiCard
          label="Productos en Riesgo"
          value={data.productosEnRiesgo}
          valueClassName="!text-orange-600"
        />
        <ReportesKpiCard
          label="Unidades Faltantes"
          value={data.unidadesFaltantes}
          valueClassName="!text-red-600"
        />
        <ReportesKpiCard label="Frecuencia Alta" value={data.frecuenciaAlta} />
      </div>

      <Card className="!border-slate-200 !shadow-sm">
        <CardHeader>
          <CardTitle className="!text-base !font-semibold">
            Stock Actual vs Mínimo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="!h-80 !w-full">
            <BarChart data={data.grafico} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="producto"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="stockActual" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="stockMinimo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <ReportesDataTable
        title="Detalle de Stock Crítico"
        description="Productos por debajo del stock mínimo configurado"
      >
        <Table>
          <TableHeader>
            <TableRow className={reportesTableHeaderRowClass}>
              <TableHead className={reportesTableHeadClass}>Producto</TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>
                Stock Actual
              </TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>
                Stock Mínimo
              </TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>
                Faltante
              </TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>
                Frecuencia Quiebre
              </TableHead>
              <TableHead className={cn(reportesTableHeadClass, "!text-center")}>
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.detalle.map((row) => (
              <TableRow key={row.producto} className={reportesTableRowClass}>
                <TableCell className={cn(reportesTableCellClass, "!font-semibold !text-slate-900")}>
                  {row.producto}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant="stock">{row.stockActual}</Badge>
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center !text-slate-600"))}>
                  {row.stockMinimo}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, reportesTableNumericClass("!text-center !text-red-600"))}>
                  {row.faltante}
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant={frecuenciaVariant(row.frecuenciaQuiebre)}>
                    {row.frecuenciaQuiebre}
                  </Badge>
                </TableCell>
                <TableCell className={cn(reportesTableCellClass, "!text-center")}>
                  <Badge variant="critical">{row.estado}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ReportesDataTable>
    </div>
  );
}
