"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminInventario } from "@/hooks/useAdminInventario";
import { InventarioTable } from "@/components/features/admin/InventarioTable";

export default function InventarioAdminPage() {
  const {
    resumen,
    productos,
    categorias,
    cargando,
    error,
    q,
    setQ,
    categoriaId,
    setCategoriaId,
    estado,
    setEstado,
    orderBy,
    order,
    page,
    limit,
    total,
    handleOrderChange,
    handlePageChange,
    handleLimitChange,
    exportCsv,
    filtroActivo,
  } = useAdminInventario();

  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportCsv();
    } catch (err) {
      alert("Error al exportar: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        accent
        title="Inventario"
        description="Reporte y administración del inventario"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setImportOpen(true)}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Importar CSV/XLS
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download size={16} className="mr-2" />
              Exportar
            </Button>
          </div>
        }
      />

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">{resumen?.totalProductos ?? "-"}</CardTitle>
            <CardDescription>Total productos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl text-green-600">{resumen?.stockNormal ?? "-"}</CardTitle>
            <CardDescription>Stock normal</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl text-orange-600">{resumen?.stockCritico ?? "-"}</CardTitle>
            <CardDescription>Stock crítico</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">{resumen?.valorInventario ? `Q${resumen.valorInventario.toLocaleString("es-AR")}` : "-"}</CardTitle>
            <CardDescription>Valor inventario</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Toolbar filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:flex-none sm:w-[320px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoriaId ?? ""}
            onChange={(e) => setCategoriaId(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="critico">Crítico</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <InventarioTable
        productos={productos}
        cargando={cargando}
        orderBy={orderBy}
        order={order}
        onOrderChange={handleOrderChange}
        onPageChange={handlePageChange}
        page={page}
        total={total}
        limit={limit}
        onLimitChange={handleLimitChange}
        filtroActivo={filtroActivo}
      />

      {/* Import modal placeholder */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold">Importar CSV/XLS</h3>
            <p className="text-sm text-slate-500 mt-2">Funcionalidad a implementar (Tarea 4).</p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setImportOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
