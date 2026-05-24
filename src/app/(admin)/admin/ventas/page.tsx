"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { VentasFiltros } from "@/components/features/admin/VentasFiltros";
import { VentasStats } from "@/components/features/admin/VentasStats";
import { VentasTable } from "@/components/features/admin/VentasTable";
import { useAdminVentas } from "@/hooks/useAdminVentas";

export default function VentasPage() {
  const {
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
  } = useAdminVentas();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ventas y Transacciones"
        description="Historial completo de ventas realizadas"
        actions={
          <Button
            type="button"
            onClick={exportarCsv}
            disabled={cargando || ventas.length === 0}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white sm:w-auto"
          >
            <Download size={16} />
            Exportar
          </Button>
        }
      />

      <VentasStats stats={stats} />

      <VentasFiltros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroFecha={filtroFecha}
        setFiltroFecha={setFiltroFecha}
        filtroPrecio={filtroPrecio}
        setFiltroPrecio={setFiltroPrecio}
        filtroMetodoPago={filtroMetodoPago}
        setFiltroMetodoPago={setFiltroMetodoPago}
      />

      <VentasTable cargando={cargando} ventas={ventas} />
    </div>
  );
}
