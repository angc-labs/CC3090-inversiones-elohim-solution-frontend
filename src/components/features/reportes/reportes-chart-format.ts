import { formatGtq } from "@/lib/format";

const MONETARY_KEYS = new Set(["ingresos", "monto", "montoTotal"]);

export function reportesChartValueFormatter(value: number, dataKey: string): string {
  if (MONETARY_KEYS.has(dataKey)) {
    return formatGtq(value);
  }
  return value.toLocaleString("es-GT");
}
