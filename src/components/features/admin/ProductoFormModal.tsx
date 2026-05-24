"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ActualizarProductoInput,
  CrearProductoInput,
} from "@/lib/api/productos";
import type { TCategoria, TMarca, TProducto } from "@/types";

type ProductoFormModalProps = {
  open: boolean;
  guardando: boolean;
  error?: string | null;
  producto?: TProducto | null;
  marcas: TMarca[];
  categorias: TCategoria[];
  onClose: () => void;
  onSubmit: (
    payload: CrearProductoInput | (ActualizarProductoInput & { idProducto: string })
  ) => Promise<void>;
};

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ProductoFormModal({
  open,
  guardando,
  error,
  producto,
  marcas,
  categorias,
  onClose,
  onSubmit,
}: ProductoFormModalProps) {
  const esEdicion = Boolean(producto);
  const [codigoProducto, setCodigoProducto] = useState("");
  const [nombreProducto, setNombreProducto] = useState("");
  const [precio, setPrecio] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idMarca, setIdMarca] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [imagenPrincipal, setImagenPrincipal] = useState("");

  useEffect(() => {
    if (!open) return;
    setCodigoProducto(producto?.codigoProducto ?? "");
    setNombreProducto(producto?.nombreProducto ?? "");
    setPrecio(producto ? String(producto.precio) : "");
    setStockActual(producto ? String(producto.stockActual) : "");
    setDescripcion(producto?.descripcion ?? "");
    setIdMarca(producto?.idMarca ?? "");
    setCategoriaId(producto?.categoriaId ?? "");
    setFechaVencimiento(toDateInputValue(producto?.fechaVencimiento));
    setImagenPrincipal(producto?.imagenPrincipal ?? "");
  }, [open, producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precioNum = Number(precio);
    const stockNum = Number(stockActual);
    if (!nombreProducto.trim() || precioNum <= 0 || stockNum < 0) return;

    const fecha = fechaVencimiento
      ? new Date(`${fechaVencimiento}T12:00:00`).toISOString()
      : undefined;

    if (esEdicion && producto) {
      await onSubmit({
        idProducto: producto.idProducto,
        nombreProducto: nombreProducto.trim(),
        precio: precioNum,
        stockActual: stockNum,
        descripcion: descripcion.trim() || undefined,
        idMarca: idMarca || undefined,
        categoriaId: categoriaId || undefined,
        fechaVencimiento: fecha,
        imagenPrincipal: imagenPrincipal.trim() || undefined,
      });
      return;
    }

    if (!codigoProducto.trim()) return;

    await onSubmit({
      codigoProducto: codigoProducto.trim(),
      nombreProducto: nombreProducto.trim(),
      precio: precioNum,
      stockActual: stockNum,
      descripcion: descripcion.trim() || undefined,
      idMarca: idMarca || undefined,
      categoriaId: categoriaId || undefined,
      fechaVencimiento: fecha,
      imagenPrincipal: imagenPrincipal.trim() || undefined,
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900">
          {esEdicion ? "Editar producto" : "Nuevo producto"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {!esEdicion && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Código *
              </label>
              <Input
                className={inputClass}
                value={codigoProducto}
                onChange={(e) => setCodigoProducto(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Nombre *
            </label>
            <Input
              className={inputClass}
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Precio (Q) *
              </label>
              <Input
                type="number"
                min={1}
                className={inputClass}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Stock *
              </label>
              <Input
                type="number"
                min={0}
                className={inputClass}
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Marca
              </label>
              <select
                value={idMarca}
                onChange={(e) => setIdMarca(e.target.value)}
                className={inputClass}
              >
                <option value="">Sin marca</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombreMarca}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className={inputClass}
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Fecha de vencimiento
            </label>
            <Input
              type="date"
              className={inputClass}
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Descripción
            </label>
            <textarea
              className={`${inputClass} min-h-20`}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              URL imagen
            </label>
            <Input
              className={inputClass}
              value={imagenPrincipal}
              onChange={(e) => setImagenPrincipal(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={guardando}
            >
              {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
