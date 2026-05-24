import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminVentas } from "@/lib/api/ventas";
import { useAuthStore } from "@/stores/useAuthStore";
import type { TVenta } from "@/components/features/admin/VentasTable";

function mapMetodoPago(valor: string): TVenta["metodoPago"] {
  return valor === "tarjeta" ? "tarjeta" : "efectivo";
}

function formatFecha(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useAdminVentas() {
  const token = useAuthStore((s) => s.token);
  const [cargando, setCargando] = useState(true);
  const [ventas, setVentas] = useState<TVenta[]>([]);
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ingresosHoy: 0,
    ticketPromedio: 0,
    productosVendidos: 0,
  });
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("todos");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("todos");

  const cargarVentas = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const data = await getAdminVentas(token, {
        busqueda: busqueda || undefined,
        fecha: filtroFecha || undefined,
        filtroPrecio,
        filtroMetodoPago,
      });
      setStats({
        ventasHoy: data.resumen.ventasHoy,
        ingresosHoy: data.resumen.ingresosHoy,
        ticketPromedio: data.resumen.ticketPromedio,
        productosVendidos: data.resumen.productosVendidos,
      });
      setVentas(
        data.ventas.map((v) => ({
          id: v.id,
          cliente: v.cliente,
          productos: v.productos,
          subtotal: v.subtotal,
          descuento: v.descuento,
          total: v.total,
          fecha: formatFecha(v.fecha),
          metodoPago: mapMetodoPago(v.metodoPago),
          empleado: v.empleado,
        }))
      );
    } finally {
      setCargando(false);
    }
  }, [token, busqueda, filtroFecha, filtroPrecio, filtroMetodoPago]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargarVentas();
    }, 300);
    return () => clearTimeout(timer);
  }, [cargarVentas]);

  const exportarCsv = useMemo(
    () => () => {
      const headers = [
        "ID",
        "Cliente",
        "Productos",
        "Subtotal",
        "Descuento",
        "Total",
        "Fecha",
        "Método",
        "Empleado",
      ];
      const rows = ventas.map((v) => [
        v.id,
        v.cliente,
        String(v.productos),
        String(v.subtotal),
        String(v.descuento),
        String(v.total),
        v.fecha,
        v.metodoPago,
        v.empleado,
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ventas-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [ventas]
  );

  return {
    cargando,
    ventas,
    stats,
    busqueda,
    setBusqueda,
    filtroFecha,
    setFiltroFecha,
    filtroPrecio,
    setFiltroPrecio,
    filtroMetodoPago,
    setFiltroMetodoPago,
    exportarCsv,
    recargar: cargarVentas,
  };
}
