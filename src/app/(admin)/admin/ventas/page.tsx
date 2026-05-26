"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { VentasFiltros } from "@/components/features/admin/VentasFiltros";
import { VentasStats } from "@/components/features/admin/VentasStats";

import {
  VentasTable,
  type TVenta,
} from "@/components/features/admin/VentasTable";

type TVentasStats = {
  ventasHoy: number;
  ingresosHoy: number;
  ticketPromedio: number;
  productosVendidos: number;
  totalDescuentos?: number;
  metodoPagoMasUsado?: string;
};

export default function VentasPage() {

  // Estados filtros

  const [busqueda, setBusqueda] = useState("");

  const [filtroFecha, setFiltroFecha] = useState("");

  const [filtroPrecio, setFiltroPrecio] = useState("todos");

  const [filtroMetodoPago, setFiltroMetodoPago] =
    useState("todos");

  // Estados backend

  const [ventas, setVentas] = useState<TVenta[]>([]);

  const [stats, setStats] =
    useState<TVentasStats | null>(null);

  const [cargando, setCargando] = useState(false);

  // Obtener ventas

  const obtenerVentas = async () => {
    try {
      setCargando(true);

      const params = new URLSearchParams();

      // Buscar por ID o cliente
      if (busqueda) {
        params.append("Busqueda", busqueda);
      }

      // Método pago
      if (filtroMetodoPago !== "todos") {
        params.append(
          "MetodoPago",
          filtroMetodoPago
        );
      }

      // Fecha
      if (filtroFecha) {
        params.append("Fecha", filtroFecha);
      }

      const response = await fetch(
        `http://localhost:5000/api/ventas?${params.toString()}`
      );

      const data = await response.json();

      setVentas(data);

    } catch (error) {
      console.error("Error obteniendo ventas:", error);

    } finally {
      setCargando(false);
    }
  };

  // Obtener métricas dashboard

  const obtenerDashboard = async () => {
    try {

      const response = await fetch(
        "http://localhost:5000/api/ventas/dashboard"
      );

      const data = await response.json();

      setStats(data);

    } catch (error) {
      console.error(
        "Error obteniendo dashboard:",
        error
      );
    }
  };

  // Exportar ventas

  const exportarVentas = async () => {
  try {

    const response = await fetch(
      "http://localhost:5000/api/ventas/export"
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "ventas.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

  } catch (error) {

    console.error(
      "Error exportando ventas:",
      error
    );
  }
  };

  // useEffect inicial

  useEffect(() => {
    obtenerVentas();

    obtenerDashboard();
  }, []);

  // Re-filtrar automáticamente

  useEffect(() => {
    obtenerVentas();

  }, [
    busqueda,
    filtroFecha,
    filtroMetodoPago,
    filtroPrecio,
  ]);

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Ventas y Transacciones
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Historial completo de ventas realizadas
          </p>

        </div>

        <Button
          onClick={exportarVentas}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5"
        >
          <Download size={16} />

          Exportar
        </Button>

      </div>

      {/* Stats */}

      {stats && (
        <VentasStats stats={stats} />
      )}

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

      {/* Tabla */}

      <VentasTable
        cargando={cargando}
        ventas={ventas}
      />

    </div>
  );
}