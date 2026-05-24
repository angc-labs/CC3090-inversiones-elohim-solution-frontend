import { cn } from "@/lib/utils";

export const reportesTableHeadClass =
  "!h-11 !whitespace-nowrap !px-5 !text-left !text-xs !font-semibold !uppercase !tracking-wide !text-slate-500";

export const reportesTableCellClass =
  "!whitespace-nowrap !px-5 !py-4 !text-sm !text-slate-700";

export const reportesTableRowClass =
  "!border-b !border-slate-100 !transition-colors hover:!bg-slate-50/70";

export const reportesTableHeaderRowClass =
  "!border-b !border-slate-200 !bg-slate-50 hover:!bg-slate-50";

export function reportesTableNumericClass(className?: string) {
  return cn("!tabular-nums !text-right !font-medium", className);
}
