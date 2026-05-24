"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { VentasFiltros } from "@/components/features/admin/VentasFiltros";
import { VentasStats } from "@/components/features/admin/VentasStats";
import {
  VentasTable,
  type TVenta,
} from "@/components/features/admin/VentasTable";

export default function VentasPage() {
  //  Estados filtros 
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState("todos");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("todos");

  //  Datos stats quemados 
  const stats = {
    ventasHoy: 5,
    ingresosHoy: 883.9,
    ticketPromedio: 176.78,
    productosVendidos: 20,
  };

  // Datos tabla quemados 
  const ventas: TVenta[] = [
    {
      id: "V-001234",
      cliente: "Juan Pérez",
      productos: 3,
      subtotal: 120,
      descuento: 0,
      total: 120,
      fecha: "2026-04-29 16:45",
      metodoPago: "efectivo",
      empleado: "Carlos Ruiz",
    },
    {
      id: "V-001233",
      cliente: "María García",
      productos: 5,
      subtotal: 250,
      descuento: 25,
      total: 225,
      fecha: "2026-04-29 16:32",
      metodoPago: "tarjeta",
      empleado: "Ana López",
    },
  ];

  return (
    <div className="space-y-6">

      {/*  Header  */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Ventas y Transacciones
          </h1>

          <p className="text-slate-500 mt-2 text-lg">
            Historial completo de ventas realizadas
          </p>
        </div>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5">
          <Download size={16} />
          Exportar
        </Button>
      </div>

      {/*  Stats  */}
      <VentasStats stats={stats} />

      {/*  Filtros  */}
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

      {/*  Tabla  */}
      <VentasTable
        cargando={false}
        ventas={ventas}
      />

    </div>
  );
}