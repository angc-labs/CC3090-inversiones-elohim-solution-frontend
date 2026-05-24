"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TUsuarioAdmin } from "@/hooks/useAdminUsuarios";
import type { CrearUsuarioAdminDto, ActualizarUsuarioAdminDto } from "@/lib/api/admin";

type ModoCrear = {
  modo: "crear";
  onGuardar: (dto: CrearUsuarioAdminDto) => Promise<void>;
};

type ModoEditar = {
  modo: "editar";
  usuario: TUsuarioAdmin;
  onGuardar: (dto: ActualizarUsuarioAdminDto) => Promise<void>;
};

type Props = (ModoCrear | ModoEditar) & {
  guardando: boolean;
  onCancelar: () => void;
};

export function UsuarioFormModal(props: Props) {
  const esEditar = props.modo === "editar";

  const [nombre, setNombre]           = useState("");
  const [apellido, setApellido]       = useState("");
  const [correo, setCorreo]           = useState("");
  const [telefono, setTelefono]       = useState("");
  const [contrasena, setContrasena]   = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("empleado");
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (esEditar && props.modo === "editar") {
      const u = props.usuario;
      const partes = u.nombre.split(" ");
      setNombre(partes[0] ?? "");
      setApellido(partes.slice(1).join(" "));
      setCorreo(u.correo);
      setTelefono(u.telefono === "-" ? "" : u.telefono);
      setTipoUsuario(u.rol);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onCancelar();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.onCancelar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (props.modo === "crear") {
        await props.onGuardar({
          correo,
          nombre,
          contrasena,
          tipoUsuario,
          apellido: apellido || undefined,
          telefono: telefono || undefined,
        });
      } else {
        await props.onGuardar({
          nombre: nombre || undefined,
          apellido: apellido || undefined,
          correo: correo || undefined,
          telefono: telefono || undefined,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  return (
    <div
      className="fixed! inset-0! z-50! flex! items-center! justify-center! bg-slate-950/60! px-4! py-6! backdrop-blur-sm!"
      onClick={props.onCancelar}
      role="presentation"
    >
      <div
        className="w-full! max-w-md! rounded-3xl! border! border-slate-200! bg-white! p-6! shadow-2xl!"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl! font-bold! text-slate-900! mb-5!">
          {esEditar ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="flex! flex-col! gap-4!">
          <div className="grid! grid-cols-2! gap-3!">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Correo *</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!esEditar && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Contraseña *</label>
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo de Usuario *</label>
                <select
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="empleado">Empleado</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-2">
            <Button type="button" variant="outline" onClick={props.onCancelar} disabled={props.guardando}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={props.guardando}>
              {props.guardando ? "Guardando..." : esEditar ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
