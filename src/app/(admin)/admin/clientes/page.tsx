"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getAdminUsuarios, cambiarEstadoUsuario } from "@/lib/api/admin";
import { useAuthStore } from "@/stores/useAuthStore";

type TRolUsuario = "administrador" | "empleado" | "cliente";

type TUsuarioAdmin = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: TRolUsuario;
  estado: boolean;
  ultimoAcceso: string;
};

function getInitials(nombre: string) {
  return nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const ROL_STYLES: Record<TRolUsuario, string> = {
  administrador: "bg-purple-100 text-purple-700",
  empleado:      "bg-blue-100 text-blue-700",
  cliente:       "bg-gray-100 text-gray-700",
};

const ROL_LABEL: Record<TRolUsuario, string> = {
  administrador: "Administrador",
  empleado:      "Empleado",
  cliente:       "Cliente",
};

export default function ClientesPage() {
  const token = useAuthStore((s) => s.token);
  const [usuarios, setUsuarios] = useState<TUsuarioAdmin[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [busqueda, setBusqueda]         = useState("");
  const [filtroRol, setFiltroRol]       = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [modalUsuario, setModalUsuario] = useState<TUsuarioAdmin | null>(null);
  const [confirmando, setConfirmando]   = useState(false);

  const cargarUsuarios = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const data = await getAdminUsuarios(token);
      setUsuarios(
        data.map((u) => ({
          id: u.id,
          nombre: [u.nombre, u.apellido].filter(Boolean).join(" "),
          correo: u.correo,
          telefono: u.telefono ?? "-",
          rol: (u.tipoUsuario as TRolUsuario) ?? "cliente",
          estado: u.estado,
          ultimoAcceso: new Date(u.fechaCreacion).toLocaleDateString("es-GT"),
        }))
      );
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const q = busqueda.toLowerCase();
      const coincideBusqueda =
        busqueda === "" ||
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q);
      const coincideRol    = filtroRol    === "todos" || u.rol === filtroRol;
      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activo" ? u.estado : !u.estado);
      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [usuarios, busqueda, filtroRol, filtroEstado]);

  const stats = useMemo(() => ({
    total:           usuarios.length,
    administradores: usuarios.filter((u) => u.rol === "administrador").length,
    empleados:       usuarios.filter((u) => u.rol === "empleado").length,
    activos:         usuarios.filter((u) => u.estado).length,
  }), [usuarios]);

  const handleToggleEstado = async () => {
    if (!modalUsuario || !token) return;
    setConfirmando(true);
    try {
      await cambiarEstadoUsuario(token, modalUsuario.id, !modalUsuario.estado);
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === modalUsuario.id ? { ...u, estado: !u.estado } : u
        )
      );
      setModalUsuario(null);
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona usuarios, empleados y roles</p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Usuarios",   value: stats.total,           color: "text-gray-900"   },
          { label: "Administradores",  value: stats.administradores, color: "text-purple-600" },
          { label: "Empleados",        value: stats.empleados,       color: "text-blue-600"   },
          { label: "Activos",          value: stats.activos,         color: "text-green-600"  },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-3">
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

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="px-4 py-10 text-center text-gray-400 text-sm">Cargando usuarios…</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Último Acceso</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((usuario) => (
                <tr key={usuario.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(usuario.nombre)}
                      </div>
                      <span className="font-medium text-gray-900">{usuario.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{usuario.correo}</td>
                  <td className="px-4 py-3 text-gray-600">{usuario.telefono}</td>
                  <td className="px-4 py-3">
                    <Badge className={ROL_STYLES[usuario.rol]}>
                      {ROL_LABEL[usuario.rol]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={usuario.estado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {usuario.estado ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{usuario.ultimoAcceso}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setModalUsuario(usuario)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label={`Editar ${usuario.nombre}`}
                    >
                      <SquarePen size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No hay usuarios que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Modal cambiar estado */}
      {modalUsuario && (
        <ConfirmModal
          open={true}
          title={`Cambiar estado de ${modalUsuario.nombre}`}
          message={
            modalUsuario.estado
              ? `¿Deseas desactivar a ${modalUsuario.nombre}? No podrá iniciar sesión hasta que sea reactivado.`
              : `¿Deseas activar a ${modalUsuario.nombre}? Podrá volver a iniciar sesión.`
          }
          confirmLabel={modalUsuario.estado ? "Desactivar" : "Activar"}
          cancelLabel="Cancelar"
          isConfirming={confirmando}
          onConfirm={handleToggleEstado}
          onCancel={() => setModalUsuario(null)}
        />
      )}
    </div>
  );
}
