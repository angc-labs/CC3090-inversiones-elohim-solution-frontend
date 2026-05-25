"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import type { TProducto } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { ProductoFormModal } from "@/components/features/admin/ProductoFormModal";
import { ProductosTable } from "@/components/features/admin/ProductosTable";
import { OfertaModal } from "@/components/features/admin/OfertaModal";
import { useAdminProductos } from "@/hooks/useAdminProductos";

export default function ProductosAdminPage() {
  const {
    productos,
    marcas,
    categorias,
    cargando,
    guardando,
    busqueda,
    setBusqueda,
    modalAbierto,
    productoEditar,
    productoEliminar,
    setProductoEliminar,
    error,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardarProducto,
    confirmarEliminar,
    recargar: cargar,
  } = useAdminProductos();

  const [ofertaProducto, setOfertaProducto] = useState<null | TProducto>(null);
  const [ofertaOpen, setOfertaOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        accent
        title="Productos"
        description="Alta, edición y baja del catálogo"
        actions={
          <Button
            type="button"
            onClick={abrirCrear}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white sm:w-auto"
          >
            <Plus size={16} />
            Nuevo producto
          </Button>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o código…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <ProductosTable
        cargando={cargando}
        productos={productos}
        onEditar={abrirEditar}
        onEliminar={setProductoEliminar}
        onOferta={(p) => {
          setOfertaProducto(p);
          setOfertaOpen(true);
        }}
      />

      <ProductoFormModal
        open={modalAbierto}
        guardando={guardando}
        error={error}
        producto={productoEditar}
        marcas={marcas}
        categorias={categorias}
        onClose={cerrarModal}
        onSubmit={guardarProducto}
      />

      {productoEliminar && (
        <ConfirmModal
          open={true}
          title="Eliminar producto"
          message={`¿Eliminar "${productoEliminar.nombreProducto}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isConfirming={guardando}
          onConfirm={confirmarEliminar}
          onCancel={() => setProductoEliminar(null)}
        />
      )}

      <OfertaModal
        open={ofertaOpen}
        producto={ofertaProducto}
        onClose={() => setOfertaOpen(false)}
        onSuccess={() => void cargar()}
      />
    </div>
  );
}
