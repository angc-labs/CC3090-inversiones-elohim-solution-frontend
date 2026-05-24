"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { UsuarioFormModal } from "@/components/features/admin/UsuarioFormModal";
import { useAdminUsuarios } from "@/hooks/useAdminUsuarios";
import { UsuariosStats } from "@/components/features/admin/UsuariosStats";
import { UsuariosFiltros } from "@/components/features/admin/UsuariosFiltros";
import { UsuariosTable } from "@/components/features/admin/UsuariosTable";

export default function ClientesPage() {
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
    modalCrear,
    setModalCrear,
    modalEditar,
    setModalEditar,
    modalEliminar,
    setModalEliminar,
    guardando,
    handleCrear,
    handleActualizar,
    handleEliminar,
  } = useAdminUsuarios();

  return (
    <div>
      <div className="flex items-start justify-between mb-6 bg-white rounded-xl border border-gray-200 border-b-4 border-b-blue-600 px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestiona usuarios, empleados y roles</p>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setModalCrear(true)}
        >
          <Plus size={16} />
          Nuevo Usuario
        </Button>
      </div>

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
        onEditarInfo={setModalEditar}
        onEliminar={setModalEliminar}
      />

      {/* Modal: cambiar estado */}
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

      {/* Modal: crear usuario */}
      {modalCrear && (
        <UsuarioFormModal
          modo="crear"
          guardando={guardando}
          onGuardar={handleCrear}
          onCancelar={() => setModalCrear(false)}
        />
      )}

      {/* Modal: editar usuario */}
      {modalEditar && (
        <UsuarioFormModal
          modo="editar"
          usuario={modalEditar}
          guardando={guardando}
          onGuardar={handleActualizar}
          onCancelar={() => setModalEditar(null)}
        />
      )}

      {/* Modal: confirmar eliminación */}
      {modalEliminar && (
        <ConfirmModal
          open={true}
          title={`Eliminar a ${modalEliminar.nombre}`}
          message={`¿Estás seguro de que deseas eliminar a ${modalEliminar.nombre}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isConfirming={guardando}
          onConfirm={handleEliminar}
          onCancel={() => setModalEliminar(null)}
        />
      )}
    </div>
  );
}
