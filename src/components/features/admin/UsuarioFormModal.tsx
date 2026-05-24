"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CrearUsuarioAdminInput } from "@/lib/api/admin";

export type TUsuarioFormRol = "cliente" | "empleado" | "administrador";

type UsuarioFormModalProps = {
  open: boolean;
  guardando: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CrearUsuarioAdminInput) => Promise<void>;
};

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

export function UsuarioFormModal({
  open,
  guardando,
  error,
  onClose,
  onSubmit,
}: UsuarioFormModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState<TUsuarioFormRol>("cliente");
  const [tipoCliente, setTipoCliente] =
    useState<CrearUsuarioAdminInput["tipoCliente"]>("particular");
  const [direccion, setDireccion] = useState("");

  const reset = () => {
    setNombre("");
    setApellido("");
    setCorreo("");
    setTelefono("");
    setContrasena("");
    setRol("cliente");
    setTipoCliente("particular");
    setDireccion("");
  };

  const handleClose = () => {
    if (guardando) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CrearUsuarioAdminInput = {
      correo: correo.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim() || undefined,
      telefono: telefono.trim() || undefined,
      contrasena,
      tipoUsuario: rol === "cliente" ? "cliente" : "administrador",
      tipoCliente: rol === "cliente" ? tipoCliente : undefined,
      rol:
        rol === "empleado"
          ? "cajero"
          : rol === "administrador"
            ? "administrador"
            : undefined,
      direccion: rol === "cliente" ? direccion.trim() || undefined : undefined,
    };
    await onSubmit(payload);
    reset();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usuario-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="usuario-form-title" className="text-xl font-bold text-gray-900">
          Nuevo usuario
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Crea clientes, cajeros o administradores del sistema.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Nombre *
              </label>
              <Input
                className={inputClass}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Apellido
              </label>
              <Input
                className={inputClass}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Correo *
            </label>
            <Input
              type="email"
              className={inputClass}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Teléfono
              </label>
              <Input
                className={inputClass}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Contraseña *
              </label>
              <Input
                type="password"
                className={inputClass}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Rol *
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as TUsuarioFormRol)}
              className={inputClass}
            >
              <option value="cliente">Cliente</option>
              <option value="empleado">Empleado (cajero)</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          {rol === "cliente" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Tipo de cliente *
                </label>
                <select
                  value={tipoCliente}
                  onChange={(e) =>
                    setTipoCliente(
                      e.target.value as CrearUsuarioAdminInput["tipoCliente"]
                    )
                  }
                  className={inputClass}
                >
                  <option value="particular">Particular</option>
                  <option value="minorista">Minorista</option>
                  <option value="mayorista">Mayorista</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Dirección
                </label>
                <Input
                  className={inputClass}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={guardando}
            >
              {guardando ? "Guardando…" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
