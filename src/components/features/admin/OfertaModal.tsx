"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crearOfertaProducto, eliminarOfertaProducto } from "@/lib/api/productos";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TProducto } from "@/types";

interface OfertaModalProps {
  open: boolean;
  producto: TProducto | null;
  onClose: () => void;
  onSuccess?: (producto: TProducto) => void;
}

export function OfertaModal({ open, producto, onClose, onSuccess }: OfertaModalProps) {
  const token = useAuthStore((s) => s.token);
  const [precio, setPrecio] = useState<string>(producto?.precio != null ? String(producto.precio) : "");
  const [fechaVence, setFechaVence] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !producto) return null;

  const handleCrear = async () => {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      const data = await crearOfertaProducto(token, producto.idProducto, {
        precioOferta: Number(precio),
        fechaVence: fechaVence || undefined,
      });
      onSuccess?.(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear oferta");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      await eliminarOfertaProducto(token, producto.idProducto);
      onSuccess?.(producto);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar oferta");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Oferta — {producto.nombreProducto}</h3>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <label className="block text-sm text-gray-700 mb-1">Precio de oferta</label>
        <Input value={precio} onChange={(e) => setPrecio(e.target.value)} />
        <label className="block text-sm text-gray-700 mt-3 mb-1">Fecha de vencimiento (opcional)</label>
        <Input type="date" value={fechaVence} onChange={(e) => setFechaVence(e.target.value)} />

        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleCrear} disabled={isSaving || !precio}>Guardar oferta</Button>
          <Button variant="destructive" onClick={handleEliminar} disabled={isSaving}>Quitar oferta</Button>
        </div>
      </div>
    </div>
  );
}
