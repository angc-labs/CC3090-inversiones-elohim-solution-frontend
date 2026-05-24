import { Search } from "lucide-react";

type Props = {
  busqueda: string;
  setBusqueda: (v: string) => void;

  filtroFecha: string;
  setFiltroFecha: (v: string) => void;

  filtroPrecio: string;
  setFiltroPrecio: (v: string) => void;

  filtroMetodoPago: string;
  setFiltroMetodoPago: (v: string) => void;
};

export function VentasFiltros({
  busqueda,
  setBusqueda,
  filtroFecha,
  setFiltroFecha,
  filtroPrecio,
  setFiltroPrecio,
  filtroMetodoPago,
  setFiltroMetodoPago,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-center">
      <div className="relative w-full md:min-w-[12rem] md:flex-1 md:max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Buscar por ID o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <input
        type="date"
        value={filtroFecha}
        onChange={(e) => setFiltroFecha(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 md:w-auto"
      />

      <select
        value={filtroPrecio}
        onChange={(e) => setFiltroPrecio(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 md:w-auto"
      >
        <option value="todos">Todos los precios</option>
        <option value="mayor-menor">Mayor a menor</option>
        <option value="menor-mayor">Menor a mayor</option>
      </select>

      <select
        value={filtroMetodoPago}
        onChange={(e) => setFiltroMetodoPago(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 md:w-auto"
      >
        <option value="todos">Todos los métodos</option>
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
      </select>
    </div>
  );
}