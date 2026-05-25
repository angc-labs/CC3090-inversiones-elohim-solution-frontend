"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actualizarStockProducto } from "@/lib/api/admin";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TInventarioProducto } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type AjusteStockModalProps = {
  open: boolean;
  producto: TInventarioProducto | null;
  onClose: () => void;
  onSuccess: (productoActualizado: TInventarioProducto, advertencia?: string) => void;
};

export function AjusteStockModal({
  open,
  producto,
  onClose,
  onSuccess,
}: AjusteStockModalProps) {
  const token = useAuthStore((s) => s.token);
  const [nuevoStock, setNuevoStock] = useState<number | "">("");
  const [motivo, setMotivo] = useState("ajuste manual");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (open && producto) {
      setNuevoStock(producto.stockActual);
      setMotivo("ajuste manual");
      setError(null);
      setWarning(null);
    }
  }, [open, producto]);

  const handleConfirm = async () => {
    if (!token || !producto || nuevoStock === "") return;

    // Validar que sea un número entero no negativo
    const stock = Number(nuevoStock);
    if (!Number.isInteger(stock) || stock < 0) {
      setError("El stock debe ser un número entero no negativo");
      return;
    }

    setCargando(true);
    setError(null);
    setWarning(null);

    try {
      const actualizado = await actualizarStockProducto(
        token,
        producto.idProducto,
        stock,
        motivo
      );

      // Verificar si hay advertencia en la respuesta
      // const hasWarning = (actualizado as any)?.advertencia;

      onSuccess(actualizado, (actualizado as any)?.advertencia);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar stock");
    } finally {
      setCargando(false);
    }
  };

  if (!open || !producto) return null;

  const stockDiferencia = Number(nuevoStock) - producto.stockActual;
  const movimiento =
    stockDiferencia > 0
      ? `+${stockDiferencia}`
      : stockDiferencia < 0
        ? `${stockDiferencia}`
        : "sin cambios";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ajustar Stock</h2>
          <p className="text-sm text-gray-600 mt-1">{producto.nombreProducto}</p>
        </div>

        {/* Current stock info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Stock actual:</span>
            <span className="text-lg font-semibold text-blue-600">
              {producto.stockActual}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-700">Stock mínimo:</span>
            <span className="text-sm text-gray-600">{producto.stockMinimo}</span>
          </div>
        </div>

        {/* New stock input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Nuevo Stock
          </label>
          <input
            type="number"
            min="0"
            value={nuevoStock}
            onChange={(e) => setNuevoStock(e.target.value === "" ? "" : Number(e.target.value))}
            className={cn(
              "w-full px-3 py-2 border rounded-lg text-lg font-semibold focus:outline-none focus:ring-2",
              error ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-blue-500"
            )}
            placeholder="Ingresa el nuevo stock"
            disabled={cargando}
          />
          {nuevoStock !== "" && (
            <p className="text-xs text-gray-600">
              Movimiento: <span className={stockDiferencia > 0 ? "text-green-600" : stockDiferencia < 0 ? "text-red-600" : ""}>
                {movimiento}
              </span>
            </p>
          )}
        </div>

        {/* Motivo dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Motivo
          </label>
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            disabled={cargando}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ajuste manual">Ajuste manual</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Warning message (si viene del backend) */}
        {warning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-700">{warning}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={onClose}
            disabled={cargando}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={cargando || nuevoStock === ""}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {cargando ? "Guardando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
