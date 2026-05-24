import { useCallback, useEffect, useMemo, useState } from "react";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerMarcas,
  obtenerProductos,
  type ActualizarProductoInput,
  type CrearProductoInput,
} from "@/lib/api/productos";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TCategoria, TMarca, TProducto } from "@/types";

export function useAdminProductos() {
  const token = useAuthStore((s) => s.token);
  const [productos, setProductos] = useState<TProducto[]>([]);
  const [marcas, setMarcas] = useState<TMarca[]>([]);
  const [categorias, setCategorias] = useState<TCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<TProducto | null>(null);
  const [productoEliminar, setProductoEliminar] = useState<TProducto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [listado, marcasData, categoriasData] = await Promise.all([
        obtenerProductos({ page: 1, limit: 200 }),
        obtenerMarcas(),
        obtenerCategorias(),
      ]);
      setProductos(listado.productos);
      setMarcas(marcasData);
      setCategorias(categoriasData);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) =>
        p.nombreProducto.toLowerCase().includes(q) ||
        p.codigoProducto.toLowerCase().includes(q)
    );
  }, [productos, busqueda]);

  const abrirCrear = () => {
    setProductoEditar(null);
    setError(null);
    setModalAbierto(true);
  };

  const abrirEditar = (producto: TProducto) => {
    setProductoEditar(producto);
    setError(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setProductoEditar(null);
    setError(null);
  };

  const guardarProducto = async (
    payload: CrearProductoInput | (ActualizarProductoInput & { idProducto: string })
  ) => {
    if (!token) return;
    setGuardando(true);
    setError(null);
    try {
      if ("codigoProducto" in payload && !productoEditar) {
        const creado = await crearProducto(token, payload);
        setProductos((prev) => [creado, ...prev]);
      } else if (productoEditar) {
        const { idProducto, ...rest } = payload as ActualizarProductoInput & {
          idProducto: string;
        };
        const actualizado = await actualizarProducto(token, idProducto, rest);
        setProductos((prev) =>
          prev.map((p) => (p.idProducto === idProducto ? actualizado : p))
        );
      }
      setModalAbierto(false);
      setProductoEditar(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto");
      throw err;
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!token || !productoEliminar) return;
    setGuardando(true);
    try {
      await eliminarProducto(token, productoEliminar.idProducto);
      setProductos((prev) =>
        prev.filter((p) => p.idProducto !== productoEliminar.idProducto)
      );
      setProductoEliminar(null);
    } finally {
      setGuardando(false);
    }
  };

  return {
    productos: filtrados,
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
  };
}
