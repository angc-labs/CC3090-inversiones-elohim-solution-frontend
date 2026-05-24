import { Shield, SquarePen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TUsuarioAdmin, TRolUsuario } from "@/hooks/useAdminUsuarios";

const ROL_STYLES: Record<TRolUsuario, string> = {
  administrador: "bg-orange-100 text-orange-700",
  empleado:      "bg-blue-100 text-blue-700",
  cliente:       "bg-sky-100 text-sky-700",
};

const ROL_LABEL: Record<TRolUsuario, string> = {
  administrador: "Administrador",
  empleado:      "Empleado",
  cliente:       "Cliente",
};

function getInitials(nombre: string) {
  return nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

type Props = {
  cargando: boolean;
  filtrados: TUsuarioAdmin[];
  onEditarUsuario: (u: TUsuarioAdmin) => void;
  esSuperAdmin?: boolean;
  onCambiarRol?: (u: TUsuarioAdmin) => void;
};

export function UsuariosTable({
  cargando,
  filtrados,
  onEditarUsuario,
  esSuperAdmin = false,
  onCambiarRol,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {cargando ? (
        <div className="px-4 py-10 text-center text-gray-400 text-sm">Cargando usuarios…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-blue-100">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Usuario</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Rol</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Último Acceso</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors last:border-0"
                >
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
                    <div className="flex items-center justify-end gap-1">
                      {esSuperAdmin && onCambiarRol ? (
                        <button
                          type="button"
                          onClick={() => onCambiarRol(usuario)}
                          className="p-1.5 rounded-md bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-800 transition-colors"
                          aria-label={`Cambiar rol de ${usuario.nombre}`}
                          title="Cambiar rol"
                        >
                          <Shield size={15} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onEditarUsuario(usuario)}
                        className="p-1.5 rounded-md bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        aria-label={`Cambiar estado de ${usuario.nombre}`}
                        title="Activar / desactivar"
                      >
                        <SquarePen size={15} />
                      </button>
                    </div>
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
  );
}
