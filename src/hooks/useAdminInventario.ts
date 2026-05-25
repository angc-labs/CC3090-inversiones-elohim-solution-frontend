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
  const [total, setTotal] = useState(0);

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
      let orderByValue = orderBy;
      let orderValue = order;

      // Si orderBy contiene el formato "campo:asc|desc", extraer ambos
      if (orderBy?.includes(":")) {
        const [campo, dir] = orderBy.split(":");
        orderByValue = campo;
        orderValue = (dir as "asc" | "desc") || order;
      }

      const params: TInventarioParams = {
        q: q || undefined,
        categoriaId: categoriaId || undefined,
        estado: estado || undefined,
        orderBy: orderByValue,
        order: orderValue,
        page,
        limit,
      };

      const res = await getAdminInventario(params);
      setResumen(res.resumen);
      setProductos(res.productos);
      setTotal(res.total);
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
      let orderByValue = orderBy;
      let orderValue = order;

      if (orderBy?.includes(":")) {
        const [campo, dir] = orderBy.split(":");
        orderByValue = campo;
        orderValue = (dir as "asc" | "desc") || order;
      }

      const params: TInventarioParams = {
        q: q || undefined,
        categoriaId: categoriaId || undefined,
        estado: estado || undefined,
        orderBy: orderByValue,
        order: orderValue,
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

  const handleOrderChange = (newOrderBy: string) => {
    setPage(1); // Reset a página 1 cuando cambia el ordenamiento
    setOrderBy(newOrderBy);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setPage(1); // Reset a página 1 cuando cambia el límite
    setLimit(newLimit);
  };

  const filtroActivo = !!(q || categoriaId || estado);

  return {
    resumen,
    productos,
    categorias,
    cargando,
    error,
    total,
    // filtros
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
    handleOrderChange,
    handlePageChange,
    handleLimitChange,
    recargar: cargar,
    exportCsv,
    filtroActivo,
  } as const;
}

