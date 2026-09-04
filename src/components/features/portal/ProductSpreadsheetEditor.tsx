"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Plus, Trash2, Download, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { TCategoria } from "@/types";
import type { CrearPlatformProductoBulkInput } from "@/lib/api/admin";

// Dynamically import Spreadsheet to prevent any SSR issues with Next.js
const Spreadsheet = dynamic(() => import("react-spreadsheet"), { ssr: false });

interface ProductSpreadsheetEditorProps {
  categorias: TCategoria[];
  onParsedProducts: (products: CrearPlatformProductoBulkInput[]) => void;
}

type SpreadsheetCell = { value: string };

const createEmptyRow = (): SpreadsheetCell[] => [
  { value: "" },
  { value: "" },
  { value: "" },
  { value: "" },
  { value: "" },
  { value: "" },
  { value: "" },
  { value: "" },
];

const INITIAL_ROWS: SpreadsheetCell[][] = [
  [
    { value: "Camiseta Algodón Premium" },
    { value: "19.99" },
    { value: "15.00" },
    { value: "50" },
    { value: "10" },
    { value: "" },
    { value: "TS-001" },
    { value: "100% Algodón de alta calidad" },
  ],
  [
    { value: "Zapatillas Deportivas" },
    { value: "49.99" },
    { value: "40.00" },
    { value: "30" },
    { value: "5" },
    { value: "" },
    { value: "ZD-002" },
    { value: "Suela antideslizante" },
  ],
  createEmptyRow(),
  createEmptyRow(),
  createEmptyRow(),
];

export const ProductSpreadsheetEditor: React.FC<ProductSpreadsheetEditorProps> = ({
  categorias,
  onParsedProducts,
}) => {
  const t = useTranslations("SpreadsheetEditor");
  const columnLabels = [
    t("col_nombre"),
    t("col_precio_detalle"),
    t("col_precio_mayoreo"),
    t("col_stock_actual"),
    t("col_stock_minimo"),
    t("col_categoria"),
    t("col_sku"),
    t("col_descripcion"),
  ];
  const [data, setData] = useState<SpreadsheetCell[][]>(INITIAL_ROWS);

  const handleAddRow = () => {
    setData((prev) => [...prev, createEmptyRow()]);
  };

  const handleClear = () => {
    setData([
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
    ]);
    onParsedProducts([]);
    toast.info(t("toast_cleared"));
  };

  const handleDownloadExcel = () => {
    const rawRows = data.map((row) => ({
      Nombre: row[0]?.value || "",
      PrecioDetalle: row[1]?.value || "",
      PrecioMayoreo: row[2]?.value || "",
      StockActual: row[3]?.value || "",
      StockMinimo: row[4]?.value || "",
      Categoria: row[5]?.value || "",
      Sku: row[6]?.value || "",
      Descripcion: row[7]?.value || "",
    })).filter((r) => r.Nombre || r.PrecioDetalle);

    if (rawRows.length === 0) {
      toast.error(t("toast_no_data_export"));
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rawRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "mis_productos_creados.xlsx");
    toast.success(t("toast_excel_generated"));
  };

  const handleParseAndConvert = () => {
    try {
      const validProducts: CrearPlatformProductoBulkInput[] = [];
      const errors: string[] = [];

      data.forEach((row, index) => {
        const nombre = String(row[0]?.value || "").trim();
        const rawPrecioDetalle = String(row[1]?.value || "").trim();
        const rawPrecioMayoreo = String(row[2]?.value || "").trim();
        const rawStockActual = String(row[3]?.value || "").trim();
        const rawStockMinimo = String(row[4]?.value || "").trim();
        const rawCategoria = String(row[5]?.value || "").trim();
        const sku = String(row[6]?.value || "").trim() || null;
        const descripcion = String(row[7]?.value || "").trim() || null;

        // Skip completely empty rows
        if (!nombre && !rawPrecioDetalle && !rawPrecioMayoreo && !rawStockActual) {
          return;
        }

        if (!nombre) {
          errors.push(t("err_name_required", { row: index + 1 }));
          return;
        }

        const precioDetalle = parseFloat(rawPrecioDetalle);
        if (isNaN(precioDetalle) || precioDetalle < 0) {
          errors.push(t("err_invalid_price", { row: index + 1, name: nombre }));
          return;
        }

        let precioMayoreo = parseFloat(rawPrecioMayoreo);
        if (isNaN(precioMayoreo) || precioMayoreo < 0) {
          precioMayoreo = precioDetalle;
        }

        const stockActual = parseInt(rawStockActual, 10);
        const stockMinimo = parseInt(rawStockMinimo, 10);

        // Resolve Category by ID or Name
        let matchedCategoriaId: string | null = null;
        if (rawCategoria) {
          const found = categorias.find(
            (c) =>
              c.id === rawCategoria ||
              (c.nombreCategoria && c.nombreCategoria.toLowerCase() === rawCategoria.toLowerCase()) ||
              ((c as unknown as { nombre?: string }).nombre && (c as unknown as { nombre?: string }).nombre?.toLowerCase() === rawCategoria.toLowerCase())
          );
          if (found) {
            matchedCategoriaId = found.id;
          }
        }

        validProducts.push({
          nombre,
          precioDetalle,
          precioMayoreo,
          stockActual: isNaN(stockActual) ? 0 : Math.max(0, stockActual),
          stockMinimo: isNaN(stockMinimo) ? 0 : Math.max(0, stockMinimo),
          categoriaId: matchedCategoriaId,
          sku,
          descripcion,
          publicado: true,
        });
      });

      if (errors.length > 0) {
        toast.error(errors[0]);
        if (errors.length > 1) {
          console.warn("Errores adicionales:", errors);
        }
      }

      if (validProducts.length === 0) {
        if (errors.length === 0) {
          toast.error(t("toast_min_one_row"));
        }
        onParsedProducts([]);
        return;
      }

      onParsedProducts(validProducts);
      toast.success(t("toast_products_processed", { count: validProducts.length }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("err_process_generic");
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Sparkles size={16} className="text-[#22D3A6]" />
          <span>{t("toolbar_title")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="h-8 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Plus size={14} />
            <span>{t("add_row_button")}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="h-8 px-3 text-xs font-bold bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-900/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} />
            <span>{t("clear_button")}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="h-8 px-3 text-xs font-bold bg-sky-950/40 hover:bg-sky-900/50 text-sky-400 border border-sky-900/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>{t("download_button")}</span>
          </button>

          <button
            type="button"
            onClick={handleParseAndConvert}
            className="h-8 px-4 text-xs font-bold bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-955 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/20"
          >
            <CheckCircle2 size={14} />
            <span>{t("load_preview_button")}</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="rounded-xl border border-slate-800 bg-[#081018] p-2 overflow-x-auto sidebar-scrollbar max-h-[340px] overflow-y-auto">
        <div className="min-w-[750px] text-xs font-mono">
          <Spreadsheet
            data={data}
            onChange={(newData) => {
              setData(newData as SpreadsheetCell[][]);
            }}
            columnLabels={columnLabels}
          />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-normal">
        {t("tip_prefix")} <span className="text-[#22D3A6] font-bold">{t("load_preview_button")}</span> {t("tip_suffix")}
      </p>
    </div>
  );
};

export default ProductSpreadsheetEditor;
