"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useAdminUsuarios } from "@/hooks/useAdminUsuarios";
import { AdminPageHeader } from "@/components/features/admin/AdminPageHeader";
import { UsuariosStats } from "@/components/features/admin/UsuariosStats";
import { UsuariosFiltros } from "@/components/features/admin/UsuariosFiltros";
import { UsuariosTable } from "@/components/features/admin/UsuariosTable";
import { UsuarioFormModal } from "@/components/features/admin/UsuarioFormModal";
import { UsuarioRolModal } from "@/components/features/admin/UsuarioRolModal";
import { useAuthStore } from "@/stores/useAuthStore";

export default function UsuariosPage() {
  const esSuperAdmin = useAuthStore((s) => s.usuario?.esSuperAdmin === true);
  const {
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
    modalNuevo,
    setModalNuevo,
    guardando,
    errorCrear,
    handleCrearUsuario,
    modalRol,
    setModalRol,
    errorRol,
    handleCambiarRol,
  } = useAdminUsuarios();

  return (
    <div>
      <AdminPageHeader
        className="mb-6"
        accent
        title="Usuarios"
        description="Gestiona usuarios, empleados y roles"
        actions={
          <Button
            type="button"
            onClick={() => setModalNuevo(true)}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white sm:w-auto"
          >
            <Plus size={16} />
            Nuevo Usuario
          </Button>
        }
      />

      <UsuariosStats stats={stats} />

      <UsuariosFiltros
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroRol={filtroRol}
        setFiltroRol={setFiltroRol}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
      />

      <UsuariosTable
        cargando={cargando}
        filtrados={filtrados}
        onEditarUsuario={setModalUsuario}
        esSuperAdmin={esSuperAdmin}
        onCambiarRol={setModalRol}
      />

      <UsuarioFormModal
        open={modalNuevo}
        guardando={guardando}
        error={errorCrear}
        onClose={() => setModalNuevo(false)}
        onSubmit={handleCrearUsuario}
      />

      <UsuarioRolModal
        open={modalRol !== null}
        usuario={modalRol}
        guardando={guardando}
        error={errorRol}
        onClose={() => setModalRol(null)}
        onSubmit={handleCambiarRol}
      />

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
