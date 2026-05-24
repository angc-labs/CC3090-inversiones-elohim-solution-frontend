"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TUsuarioAdmin, TRolUsuario } from "@/hooks/useAdminUsuarios";
import type { CambiarRolUsuarioInput } from "@/lib/api/admin";

type UsuarioRolModalProps = {
  open: boolean;
  usuario: TUsuarioAdmin | null;
  guardando: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (usuarioId: string, payload: CambiarRolUsuarioInput) => Promise<void>;
};

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

export function UsuarioRolModal({
  open,
  usuario,
  guardando,
  error,
  onClose,
  onSubmit,
}: UsuarioRolModalProps) {
  const [rol, setRol] = useState<TRolUsuario>("cliente");
  const [tipoCliente, setTipoCliente] =
    useState<CambiarRolUsuarioInput["tipoCliente"]>("particular");

  useEffect(() => {
    if (usuario) {
      setRol(usuario.rol);
      setTipoCliente("particular");
    }
  }, [usuario]);

  if (!open || !usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CambiarRolUsuarioInput = {
      rol:
        rol === "empleado"
          ? "cajero"
          : rol === "administrador"
            ? "administrador"
            : "cliente",
      tipoCliente: rol === "cliente" ? tipoCliente : undefined,
    };
    await onSubmit(usuario.id, payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900">Cambiar rol</h2>
        <p className="mt-1 text-sm text-slate-500">
          {usuario.nombre} · {usuario.correo}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Rol *
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as TRolUsuario)}
              className={inputClass}
            >
              <option value="cliente">Cliente</option>
              <option value="empleado">Empleado (cajero)</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {rol === "cliente" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Tipo de cliente
              </label>
              <select
                value={tipoCliente}
                onChange={(e) =>
                  setTipoCliente(
                    e.target.value as CambiarRolUsuarioInput["tipoCliente"]
                  )
                }
                className={inputClass}
              >
                <option value="particular">Particular</option>
                <option value="minorista">Minorista</option>
                <option value="mayorista">Mayorista</option>
              </select>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={guardando || rol === usuario.rol}
            >
              {guardando ? "Guardando…" : "Guardar rol"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
