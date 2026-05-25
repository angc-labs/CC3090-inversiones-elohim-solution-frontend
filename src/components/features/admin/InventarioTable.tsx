"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Edit, Eye } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "./EstadoBadge";
import { InventarioTableCell } from "./InventarioTableCell";
import { actualizarInventarioProducto } from "@/lib/api/admin";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TInventarioProducto } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

type InventarioTableProps = {
  productos: TInventarioProducto[];
  cargando: boolean;
  orderBy?: string;
  order?: "asc" | "desc";
  onOrderChange: (orderBy: string) => void;
  onPageChange: (page: number) => void;
  page: number;
  total: number;
  limit: number;
  onLimitChange: (limit: number) => void;
  filtroActivo: boolean;
};

const SORTEABLE_COLUMNS = [
  { key: "nombreProducto", label: "Nombre" },
  { key: "precio", label: "Precio" },
  { key: "stockActual", label: "Stock Actual" },
  { key: "fechaVencimiento", label: "Fecha Vencimiento" },
];

export function InventarioTable({
  productos,
  cargando,
  orderBy,
  order,
  onOrderChange,
  onPageChange,
  page,
  total,
  limit,
  onLimitChange,
  filtroActivo,
}: InventarioTableProps) {
  const token = useAuthStore((s) => s.token);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [localProductos, setLocalProductos] = useState<TInventarioProducto[]>(productos);

  // Sincronizar productos cuando cambian desde props
  React.useEffect(() => {
    setLocalProductos(productos);
  }, [productos]);

  const handleSort = (column: string) => {
    if (orderBy === column) {
      onOrderChange(column + ":" + (order === "asc" ? "desc" : "asc"));
    } else {
      onOrderChange(column + ":asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    const isSorted = orderBy?.startsWith(column);
    const isAsc = isSorted && orderBy?.includes(":asc");
    if (!isSorted) return <ChevronUp size={14} className="text-gray-300" />;
    return isAsc ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const handleUpdateField = async (
    productoId: string,
    field: string,
    newValue: string | number
  ) => {
    if (!token) return;

    try {
      setErrorMap((prev) => {
        const next = { ...prev };
        delete next[`${productoId}-${field}`];
        return next;
      });

      const payload: Record<string, any> = {};
      if (field === "precio" || field === "stockActual" || field === "stockMinimo") {
        payload[field] = Number(newValue);
      } else {
        payload[field] = String(newValue);
      }

      const updated = await actualizarInventarioProducto(token, productoId, payload);

      // Actualizar estado local
      setLocalProductos((prev) =>
        prev.map((p) => (p.idProducto === productoId ? updated : p))
      );
      setEditingId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar";
      setErrorMap((prev) => ({
        ...prev,
        [`${productoId}-${field}`]: message,
      }));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  if (cargando) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-gray-500 text-lg font-medium">
            {filtroActivo ? "No hay productos que coincidan con los filtros" : "No hay productos"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {filtroActivo ? "Intenta cambiar los filtros" : "Comienza agregando un nuevo producto"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[60px]">Imagen</TableHead>
              <TableHead className="min-w-[80px]">Código</TableHead>
              <TableHead className="min-w-[150px] cursor-pointer hover:bg-gray-50" onClick={() => handleSort("nombreProducto")}>
                <div className="flex items-center gap-1">
                  Nombre
                  <SortIcon column="nombreProducto" />
                </div>
              </TableHead>
              <TableHead className="min-w-[120px]">Categoría</TableHead>
              <TableHead className="min-w-[120px]">Marca</TableHead>
              <TableHead className="min-w-[100px] cursor-pointer hover:bg-gray-50" onClick={() => handleSort("precio")}>
                <div className="flex items-center gap-1">
                  Precio
                  <SortIcon column="precio" />
                </div>
              </TableHead>
              <TableHead className="min-w-[120px] cursor-pointer hover:bg-gray-50" onClick={() => handleSort("stockActual")}>
                <div className="flex items-center gap-1">
                  Stock Actual
                  <SortIcon column="stockActual" />
                </div>
              </TableHead>
              <TableHead className="min-w-[120px]">Stock Mín</TableHead>
              <TableHead className="min-w-[100px]">Estado</TableHead>
              <TableHead className="min-w-[150px]">Oferta</TableHead>
              <TableHead className="min-w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localProductos.map((producto) => (
              <TableRow key={producto.idProducto}>
                <TableCell>
                  {producto.imagenPrincipal ? (
                    <img
                      src={producto.imagenPrincipal}
                      alt={producto.nombreProducto}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded" />
                  )}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {producto.codigoProducto}
                </TableCell>
                <TableCell>
                  <InventarioTableCell
                    value={producto.nombreProducto}
                    onSave={(v) =>
                      handleUpdateField(producto.idProducto, "nombreProducto", v)
                    }
                    error={errorMap[`${producto.idProducto}-nombreProducto`]}
                  />
                </TableCell>
                <TableCell className="text-sm">
                  {producto.categoria?.nombre || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {producto.marca?.nombre || "-"}
                </TableCell>
                <TableCell>
                  <InventarioTableCell
                    value={producto.precio}
                    type="number"
                    onSave={(v) =>
                      handleUpdateField(producto.idProducto, "precio", v)
                    }
                    error={errorMap[`${producto.idProducto}-precio`]}
                  />
                </TableCell>
                <TableCell>
                  <InventarioTableCell
                    value={producto.stockActual}
                    type="number"
                    onSave={(v) =>
                      handleUpdateField(producto.idProducto, "stockActual", v)
                    }
                    error={errorMap[`${producto.idProducto}-stockActual`]}
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {producto.stockMinimo}
                </TableCell>
                <TableCell>
                  <EstadoBadge estado={producto.estado} />
                </TableCell>
                <TableCell className="text-sm">
                  {producto.descuentoPorcentaje ? (
                    <div className="text-orange-600 font-medium">
                      {producto.descuentoPorcentaje}% hasta {producto.ofertaHasta ? new Date(producto.ofertaHasta).toLocaleDateString("es-AR") : "-"}
                    </div>
                  ) : (
                    <Button size="sm" variant="outline">
                      + Añadir
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" title="Ajustar stock">
                      <Edit size={14} />
                    </Button>
                    <Link href={`/admin/inventario/${producto.idProducto}`}>
                      <Button size="sm" variant="outline" title="Ver detalle">
                        <Eye size={14} />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
        <div className="text-sm text-gray-600">
          Mostrando {startIndex} a {endIndex} de {total} productos
        </div>
        <div className="flex items-center gap-4">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-200 rounded text-sm"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
          <div className="flex gap-1">
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Anterior
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
