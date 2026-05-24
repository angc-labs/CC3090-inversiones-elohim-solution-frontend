"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { VentasFiltros } from "@/components/features/admin/VentasFiltros";
import { VentasStats } from "@/components/features/admin/VentasStats";

export default function VentasPage() {
  // ─── Estados filtros ─────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("todos");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("todos");

  // ─── Mock stats ──────────────────────────────────────────
  const stats = {
    ventasHoy: 5,
    ingresosHoy: 883.9,
    ticketPromedio: 176.78,
    productosVendidos: 20,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ventas y Transacciones
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Historial completo de ventas realizadas
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Download size={16} />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <VentasStats stats={stats} />

      {/* Filtros */}
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

      {/* Tabla placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-500 text-sm">
          Tabla de ventas próximamente...
        </p>
      </div>
    </div>
  );
}