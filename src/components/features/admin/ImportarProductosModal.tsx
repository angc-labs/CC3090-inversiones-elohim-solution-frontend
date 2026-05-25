"use client";

import { DragEvent, useState, useRef } from "react";
import { AlertCircle, CheckCircle, Upload, Download, X } from "lucide-react";
import { read, utils } from "xlsx";
import { Button } from "@/components/ui/button";
import {
  importarProductosBulk,
  descargarPlantillaCsv,
  type TCrearProductoInput,
  type TProductoBulkResponse,
} from "@/lib/api/admin";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

type ImportarProductosModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type ParsedRow = {
  fila: number;
  datos: Record<string, string | number>;
};

type ModalStep = "upload" | "preview" | "results";

export function ImportarProductosModal({ open, onClose, onSuccess }: ImportarProductosModalProps) {
  const token = useAuthStore((s) => s.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [step, setStep] = useState<ModalStep>("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState<TProductoBulkResponse | null>(null);
  const [fallidos, setFallidos] = useState<ParsedRow[]>([]);

  // Parsear CSV simple
  function parseCSV(content: string): ParsedRow[] {
    const lines = content.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("El archivo CSV debe contener al menos un encabezado y una fila de datos");
    }

    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase());
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length === 0 || values.every((v) => !v)) continue;

      const datos: Record<string, string | number> = {};
      headers.forEach((header, idx) => {
        datos[header] = values[idx] || "";
      });

      rows.push({ fila: i + 1, datos });
    }

    return rows;
  }

  async function parseSpreadsheet(file: File): Promise<ParsedRow[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = utils.sheet_to_json<(string | number | null)[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });

    if (!rawData.length || rawData.length < 2) {
      throw new Error("El archivo debe contener al menos un encabezado y una fila de datos");
    }

    const headers = (rawData[0] as any[])
      .map((header) => String(header).trim().toLowerCase())
      .filter((header) => header.length > 0);

    if (headers.length === 0) {
      throw new Error("No se encontraron encabezados válidos en el archivo");
    }

    return rawData.slice(1).reduce<ParsedRow[]>((acc, row, index) => {
      const rowValues = row as any[];
      if (!rowValues.some((value) => String(value).trim() !== "")) return acc;

      const datos: Record<string, string | number> = {};
      headers.forEach((header, idx) => {
        datos[header] = rowValues[idx] ?? "";
      });

      acc.push({ fila: index + 2, datos });
      return acc;
    }, []);
  }

  async function handleFileSelect(file: File) {
    const isValidType =
      file.type === "text/csv" ||
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "application/vnd.ms-excel" ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.toLowerCase().endsWith(".xls") ||
      file.name.toLowerCase().endsWith(".xlsx");

    if (!isValidType) {
      setError("Por favor selecciona un archivo CSV o XLS/XLSX");
      return;
    }

    setArchivo(file);
    setError(null);

    try {
      let parsed: ParsedRow[] = [];
      if (file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv") {
        const text = await file.text();
        parsed = parseCSV(text);
      } else {
        parsed = await parseSpreadsheet(file);
      }

      if (parsed.length === 0) {
        setError("El archivo no contiene filas válidas");
        return;
      }

      setParsedRows(parsed);
      setPreviewRows(parsed.slice(0, 5));
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al parsear el archivo");
    }
  }

  // Drag & drop
  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      void handleFileSelect(files[0]);
    }
  }

  // Importar productos
  async function handleImportar() {
    if (!token || parsedRows.length === 0) return;

    setProcesando(true);
    setError(null);

    try {
      const productosAImportar: TCrearProductoInput[] = parsedRows.map((row) => ({
        codigoProducto: String(row.datos.codigoProducto || ""),
        nombreProducto: String(row.datos.nombreProducto || ""),
        descripcion: String(row.datos.descripcion || ""),
        precio: Number(row.datos.precio) || 0,
        stockActual: Number(row.datos.stockActual) || 0,
        stockMinimo: Number(row.datos.stockMinimo) || 0,
        categoriaId: row.datos.categoriaId ? String(row.datos.categoriaId) : undefined,
        idMarca: row.datos.idMarca ? String(row.datos.idMarca) : undefined,
        fechaVencimiento: row.datos.fechaVencimiento ? String(row.datos.fechaVencimiento) : undefined,
        imagenPrincipal: row.datos.imagenPrincipal ? String(row.datos.imagenPrincipal) : undefined,
      }));

      const response = await importarProductosBulk(token, productosAImportar);
      setResultados(response);

      if (response.errores.length > 0) {
        setFallidos(
          parsedRows.filter((row) =>
            response.errores.some(
              (err) =>
                err.fila === row.fila ||
                (err.codigoProducto && String(err.codigoProducto) === String(row.datos.codigoProducto))
            )
          )
        );
      } else {
        setFallidos([]);
      }

      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar productos");
    } finally {
      setProcesando(false);
    }
  }

  // Reintentar solo fallidos
  async function handleReintentar() {
    if (!token || fallidos.length === 0) return;

    setProcesando(true);
    setError(null);

    try {
      const productosAImportar: TCrearProductoInput[] = fallidos.map((row) => ({
        codigoProducto: String(row.datos.codigoProducto || ""),
        nombreProducto: String(row.datos.nombreProducto || ""),
        descripcion: String(row.datos.descripcion || ""),
        precio: Number(row.datos.precio) || 0,
        stockActual: Number(row.datos.stockActual) || 0,
        stockMinimo: Number(row.datos.stockMinimo) || 0,
        categoriaId: row.datos.categoriaId ? String(row.datos.categoriaId) : undefined,
        idMarca: row.datos.idMarca ? String(row.datos.idMarca) : undefined,
        fechaVencimiento: row.datos.fechaVencimiento ? String(row.datos.fechaVencimiento) : undefined,
        imagenPrincipal: row.datos.imagenPrincipal ? String(row.datos.imagenPrincipal) : undefined,
      }));

      const response = await importarProductosBulk(token, productosAImportar);
      setResultados((prev) =>
        prev
          ? {
              totalCreados: prev.totalCreados + response.totalCreados,
              totalFallidos: response.totalFallidos,
              errores: response.errores,
            }
          : response
      );

      if (response.errores.length > 0) {
        setFallidos(
          fallidos.filter((row) =>
            response.errores.some(
              (err) =>
                err.fila === row.fila ||
                (err.codigoProducto && String(err.codigoProducto) === String(row.datos.codigoProducto))
            )
          )
        );
      } else {
        setFallidos([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reintentar importación");
    } finally {
      setProcesando(false);
    }
  }

  function handleClose() {
    if (!procesando) {
      onClose();
      // Reset
      setStep("upload");
      setArchivo(null);
      setParsedRows([]);
      setPreviewRows([]);
      setResultados(null);
      setFallidos([]);
      setError(null);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Importar Productos</h2>
          <button
            onClick={handleClose}
            disabled={procesando}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer",
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Arrastra tu archivo aquí o haz click para seleccionar
                </p>
                <p className="text-xs text-gray-600 mt-1">CSV o XLS/XLSX</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {archivo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-700">{archivo.name}</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-between pt-4">
                <Button
                  onClick={() => descargarPlantillaCsv()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Descargar Plantilla
                </Button>
                <Button onClick={handleClose} disabled={procesando} variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Previsualización (primeras 5 filas)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        {Object.keys(previewRows[0]?.datos || {}).map((key) => (
                          <th key={key} className="border border-gray-300 px-2 py-1 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {Object.values(row.datos).map((value, vIdx) => (
                            <td key={vIdx} className="border border-gray-300 px-2 py-1">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Se importarán {parsedRows.length} productos
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  onClick={() => {
                    setStep("upload");
                    setArchivo(null);
                    setParsedRows([]);
                    setPreviewRows([]);
                    setError(null);
                  }}
                  disabled={procesando}
                  variant="outline"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleImportar}
                  disabled={procesando || parsedRows.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {procesando ? "Importando..." : "Importar"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Results */}
          {step === "results" && resultados && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium">Creados</p>
                  <p className="text-2xl font-bold text-green-700">{resultados.totalCreados}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs text-red-600 font-medium">Fallidos</p>
                  <p className="text-2xl font-bold text-red-700">{resultados.totalFallidos}</p>
                </div>
              </div>

              {resultados.errores.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Detalle de errores:</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {resultados.errores.map((err, idx) => (
                      <div key={idx} className="text-xs text-red-700 border-b border-red-200 pb-2 last:border-0">
                        <p className="font-medium">
                          {err.codigoProducto ? `Fila ${err.fila} - ${err.codigoProducto}` : `Fila ${err.fila}`}
                        </p>
                        <p className="text-red-600">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  onClick={handleClose}
                  variant="outline"
                >
                  Cerrar
                </Button>
                {fallidos.length > 0 && (
                  <Button
                    onClick={handleReintentar}
                    disabled={procesando}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {procesando ? "Reintentando..." : `Reintentar Fallidos (${fallidos.length})`}
                  </Button>
                )}
                {resultados.totalCreados > 0 && (
                  <Button
                    onClick={() => {
                      handleClose();
                      onSuccess?.();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Aceptar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
