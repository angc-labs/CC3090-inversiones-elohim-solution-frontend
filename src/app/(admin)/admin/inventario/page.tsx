"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAdminInventario } from "@/hooks/useAdminInventario";

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
    exportCsv,
  } = useAdminInventario();

  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        accent
        title="Inventario"
        description="Reporte y administración del inventario"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setImportOpen(true)} className="bg-gray-200 text-gray-700">Importar CSV/XLS</Button>
            <Button onClick={() => void exportCsv()} className="bg-blue-600 text-white">Exportar</Button>
          </div>
        }
      />

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>{resumen?.totalProductos ?? "-"}</CardTitle>
            <CardDescription>Total productos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-green-600">{resumen?.stockNormal ?? "-"}</CardTitle>
            <CardDescription>Stock normal</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="text-orange-600">{resumen?.stockCritico ?? "-"}</CardTitle>
            <CardDescription>Stock crítico</CardDescription>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>{resumen?.valorInventario ? `${resumen.valorInventario}` : "-"}</CardTitle>
            <CardDescription>Valor inventario</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Toolbar filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-[320px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg"
            />
          </div>

          <select
            value={categoriaId ?? ""}
            onChange={(e) => setCategoriaId(e.target.value || undefined)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombreCategoria}</option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="critico">Crítico</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => void exportCsv()} className="hidden sm:inline-block">Exportar CSV</Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {cargando ? (
          <div>Cargando...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Stock Min</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Valor Stock</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {productos.map((p) => (
                <TableRow key={p.idProducto}>
                  <TableCell>{p.codigoProducto}</TableCell>
                  <TableCell>{p.nombreProducto}</TableCell>
                  <TableCell>{p.categoria?.nombre ?? "-"}</TableCell>
                  <TableCell>{p.marca?.nombre ?? "-"}</TableCell>
                  <TableCell>{p.precio}</TableCell>
                  <TableCell>{p.stockActual}</TableCell>
                  <TableCell>{p.stockMinimo}</TableCell>
                  <TableCell>{p.estado}</TableCell>
                  <TableCell>{p.valorStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
