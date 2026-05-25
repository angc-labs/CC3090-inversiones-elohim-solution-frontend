"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminInventario,
  exportAdminInventarioCsv,
  type TInventarioProducto,
  type TInventarioResumen,
  type TInventarioParams,
} from "@/lib/api/admin";
import { obtenerCategorias } from "@/lib/api/productos";
import type { TCategoria } from "@/types";

export function useAdminInventario() {
  const [resumen, setResumen] = useState<TInventarioResumen | null>(null);
  const [productos, setProductos] = useState<TInventarioProducto[]>([]);
  const [categorias, setCategorias] = useState<TCategoria[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);
  const [estado, setEstado] = useState<"" | "normal" | "critico" | "agotado">("");
  const [orderBy, setOrderBy] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const cargarCategorias = useCallback(async () => {
    try {
      const cats = await obtenerCategorias();
      setCategorias(cats);
    } catch (err) {
      // ignore
    }
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params: TInventarioParams = {
        q: q || undefined,
        categoriaId: categoriaId || undefined,
        estado: estado || undefined,
        orderBy: orderBy,
        order: order,
        page,
        limit,
      };

      const res = await getAdminInventario(params);
      setResumen(res.resumen);
      setProductos(res.productos);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCargando(false);
    }
  }, [q, categoriaId, estado, orderBy, order, page, limit]);

  useEffect(() => {
    void cargarCategorias();
  }, [cargarCategorias]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const exportCsv = useCallback(async () => {
    try {
      const params: TInventarioParams = {
        q: q || undefined,
        categoriaId: categoriaId || undefined,
        estado: estado || undefined,
        orderBy: orderBy,
        order: order,
      };
      const blob = await exportAdminInventarioCsv(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inventario.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      throw err;
    }
  }, [q, categoriaId, estado, orderBy, order]);

  return {
    resumen,
    productos,
    categorias,
    cargando,
    error,
    // filtros
    q,
    setQ,
    categoriaId,
    setCategoriaId,
    estado,
    setEstado,
    orderBy,
    setOrderBy,
    order,
    setOrder,
    page,
    setPage,
    limit,
    setLimit,
    recargar: cargar,
    exportCsv,
  } as const;
}
