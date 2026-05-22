import { useState, useMemo, useEffect, useCallback } from "react";
import { getAdminUsuarios, cambiarEstadoUsuario } from "@/lib/api/admin";
import { useAuthStore } from "@/stores/useAuthStore";

export type TRolUsuario = "administrador" | "empleado" | "cliente";

export type TUsuarioAdmin = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  rol: TRolUsuario;
  estado: boolean;
  ultimoAcceso: string;
};

export function useAdminUsuarios() {
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

  return {
    cargando,
    filtrados,
    stats,
    busqueda,
    setBusqueda,
    filtroRol,
    setFiltroRol,
    filtroEstado,
    setFiltroEstado,
    modalUsuario,
    setModalUsuario,
    confirmando,
    handleToggleEstado,
  };
}
