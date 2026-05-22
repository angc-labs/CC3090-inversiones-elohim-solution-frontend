import { Search } from "lucide-react";

type Props = {
  busqueda: string;
  setBusqueda: (v: string) => void;
  filtroRol: string;
  setFiltroRol: (v: string) => void;
  filtroEstado: string;
  setFiltroEstado: (v: string) => void;
};

export function UsuariosFiltros({
  busqueda,
  setBusqueda,
  filtroRol,
  setFiltroRol,
  filtroEstado,
  setFiltroEstado,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3 shadow-sm">
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        value={filtroRol}
        onChange={(e) => setFiltroRol(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
      >
        <option value="todos">Todos los roles</option>
        <option value="administrador">Administrador</option>
        <option value="empleado">Empleado</option>
        <option value="cliente">Cliente</option>
      </select>
      <select
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
      >
        <option value="todos">Todos</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>
    </div>
  );
}
