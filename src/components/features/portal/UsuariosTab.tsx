"use client";

import { useState } from "react";
import { Loader2, Mail, Users, X, AlertTriangle, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { PortalModal } from "@/components/ui/PortalModal";
import {
  invitarPlatformUsuario,
  cambiarRolPlatformUsuario,
  cambiarEstadoPlatformUsuario,
  eliminarPlatformUsuario,
  type PlatformUsuarioDto,
  type SucursalDto,
} from "@/lib/api/admin";
import { adminResetPassword } from "@/lib/api/auth";

interface UsuariosTabProps {
  token: string;
  usuarios: PlatformUsuarioDto[];
  loadingUsuarios: boolean;
  sucursales: SucursalDto[];
  usuario: any;
  esAdmin: boolean;
  onRefresh: () => void;
}

export function UsuariosTab({
  token,
  usuarios,
  loadingUsuarios,
  sucursales,
  usuario,
  esAdmin,
  onRefresh,
}: UsuariosTabProps) {
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChangeRolModalOpen, setIsChangeRolModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Selected user for edits
  const [selectedUsuario, setSelectedUsuario] = useState<PlatformUsuarioDto | null>(null);
  const [resetPasswordUsuario, setResetPasswordUsuario] = useState<PlatformUsuarioDto | null>(null);

  // Reset codes state
  const [resetCodes, setResetCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);

  // Forms
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    tipoUsuario: "staff",
    rolStaff: "cajero",
    contrasena: "",
    sucursalId: "",
  });

  const [changeRolForm, setChangeRolForm] = useState({
    tipoUsuario: "cliente",
    rolStaff: "cajero",
    sucursalId: "",
  });

  // Load staff list
  const staffUsuarios = usuarios.filter(
    (u) => u.tipoUsuario === "staff" || u.tipoUsuario === "administrador"
  );

  // Fallback active user if not in backend list yet
  if (usuario && !staffUsuarios.some((u) => u.email === usuario.correo)) {
    staffUsuarios.push({
      id: usuario.usuarioId,
      name: usuario.nombre,
      email: usuario.correo,
      emailVerified: true,
      image: null,
      tipoUsuario: "staff",
      rolStaff: usuario.rol === "admin" ? "administrador" : usuario.rol,
      estado: true,
      createdAt: new Date().toISOString(),
      sucursalId: null,
      sucursalNombre: null,
    });
  }

  const handleOpenInviteModal = () => {
    setInviteForm({
      email: "",
      name: "",
      tipoUsuario: "staff",
      rolStaff: "cajero",
      contrasena: "",
      sucursalId: "",
    });
    setIsInviteModalOpen(true);
  };

  const handleInviteUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        email: inviteForm.email,
        name: inviteForm.name,
        contrasena: inviteForm.contrasena || undefined,
        tipoUsuario: inviteForm.tipoUsuario,
        rolStaff: inviteForm.tipoUsuario === "staff" ? inviteForm.rolStaff : undefined,
        sucursalId:
          inviteForm.tipoUsuario === "staff" && inviteForm.sucursalId
            ? inviteForm.sucursalId
            : null,
      };
      await invitarPlatformUsuario(token, payload);
      toast.success("Usuario registrado exitosamente");
      setIsInviteModalOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar el usuario");
    }
  };

  const handleOpenChangeRolModal = (u: PlatformUsuarioDto) => {
    setSelectedUsuario(u);
    setChangeRolForm({
      tipoUsuario: u.tipoUsuario,
      rolStaff: u.rolStaff || "cajero",
      sucursalId: u.sucursalId || "",
    });
    setIsChangeRolModalOpen(true);
  };

  const handleChangeRolUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUsuario) return;

    try {
      const payload = {
        tipoUsuario: changeRolForm.tipoUsuario,
        rolStaff: changeRolForm.tipoUsuario === "staff" ? changeRolForm.rolStaff : undefined,
        sucursalId:
          changeRolForm.tipoUsuario === "staff" && changeRolForm.sucursalId
            ? changeRolForm.sucursalId
            : null,
      };
      await cambiarRolPlatformUsuario(token, selectedUsuario.id, payload);
      toast.success("Rol actualizado exitosamente");
      setIsChangeRolModalOpen(false);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar el rol del usuario");
    }
  };

  const handleToggleEstadoUsuario = async (u: PlatformUsuarioDto) => {
    if (!token) return;

    try {
      const updated = await cambiarEstadoPlatformUsuario(token, u.id, !u.estado);
      toast.success(`Usuario ${updated.estado ? "activado" : "desactivado"} exitosamente`);
      onRefresh();
    } catch (err) {
      toast.error("Error al actualizar el estado del usuario");
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas suspender/eliminar a este colaborador?"))
      return;

    try {
      await eliminarPlatformUsuario(token, id);
      toast.success("Usuario eliminado o suspendido exitosamente");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar el colaborador");
    }
  };

  const handleOpenResetPasswordModal = (u: PlatformUsuarioDto) => {
    setResetPasswordUsuario(u);
    setResetCodes([]);
    setIsResetPasswordModalOpen(true);
  };

  const handleGenerateRecoveryCodes = async () => {
    if (!token || !resetPasswordUsuario) return;
    setIsGeneratingCodes(true);
    try {
      const result = await adminResetPassword(resetPasswordUsuario.id, token);
      setResetCodes(result.codigos);

      // Auto-download the .txt file
      const now = new Date().toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
      const contenido = [
        "=== CÓDIGOS DE RECUPERACIÓN DE CONTRASEÑA ===",
        "",
        `Usuario: ${result.nombre}`,
        `Correo:  ${result.correo}`,
        `Generado el: ${now}`,
        "",
        "INSTRUCCIONES:",
        "1. Guarda estos códigos en un lugar seguro.",
        "2. Para recuperar tu contraseña, ve a: /recuperar",
        "3. Ingresa tu correo y uno de estos códigos.",
        "4. Cada código solo puede usarse UNA vez.",
        "5. Los códigos expiran en 365 días.",
        "",
        "--- CÓDIGOS (úsalos en MAYÚSCULAS) ---",
        ...result.codigos.map((c, i) => `  ${i + 1}. ${c}`),
        "",
        "⚠️  No compartas estos códigos con nadie.",
        "⚠️  Guárdalos fuera del sistema (papel, gestor de contraseñas).",
      ].join("\n");

      const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codigos-recuperacion-${result.correo.replace(/@.*/, "")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Códigos generados y descargados exitosamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reestablecer la contraseña");
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Usuarios de la Tienda (Personal)</h2>
          <p className="text-xs text-slate-400">
            Administra los roles, permisos y estados de los colaboradores del staff
          </p>
        </div>
        {esAdmin && (
          <button
            onClick={handleOpenInviteModal}
            className="h-10 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none"
          >
            <Mail size={16} />
            <span>Invitar Colaborador</span>
          </button>
        )}
      </div>

      {loadingUsuarios ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      ) : staffUsuarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <Users className="mx-auto text-slate-600" size={40} />
          <p className="text-sm text-slate-400">No se encontraron usuarios de staff.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="p-4">Colaborador</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Rol Staff</th>
                  <th className="p-4">Estado</th>
                  {esAdmin && <th className="p-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {staffUsuarios.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-[#38BDF8]">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-white">{u.name}</span>
                    </td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/10 text-[#38BDF8] text-[9px] font-black uppercase tracking-wider">
                        {u.rolStaff || "Cajero"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        disabled={!esAdmin}
                        onClick={() => handleToggleEstadoUsuario(u)}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                          u.estado ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {u.estado ? "Activo" : "Suspendido"}
                      </button>
                    </td>
                    {esAdmin && (
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenChangeRolModal(u)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[#38BDF8] cursor-pointer border-none text-[10px] font-bold"
                          title="Cambiar Tipo / Rol"
                        >
                          Editar Permisos
                        </button>
                        <button
                          onClick={() => handleOpenResetPasswordModal(u)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-amber-950/40 text-amber-400 cursor-pointer border-none text-[10px] font-bold"
                          title="Generar códigos de recuperación de contraseña"
                        >
                          Reestablecer Contraseña
                        </button>
                        {usuario?.correo !== u.email && (
                          <button
                            onClick={() => handleDeleteUsuario(u.id)}
                            className="p-1.5 rounded bg-slate-900 hover:bg-rose-950/30 text-rose-400 cursor-pointer border-none text-[10px] font-bold"
                            title="Eliminar Colaborador"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITE USER MODAL */}
      {isInviteModalOpen && (
        <PortalModal onClose={() => setIsInviteModalOpen(false)} ariaLabel="Agregar o invitar usuario">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Agregar / Invitar Usuario</h3>
              <p className="text-xs text-slate-400">Registra o invita a un nuevo colaborador a la tienda</p>
            </div>

            <form onSubmit={handleInviteUsuario} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. José Fernando"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contraseña Inicial (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="Por defecto: DMHub123*"
                  value={inviteForm.contrasena}
                  onChange={(e) => setInviteForm({ ...inviteForm, contrasena: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tipo de Usuario
                </label>
                <select
                  value={inviteForm.tipoUsuario}
                  onChange={(e) => setInviteForm({ ...inviteForm, tipoUsuario: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                >
                  <option value="staff">Personal (Staff)</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>

              {inviteForm.tipoUsuario === "staff" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rol de Staff
                    </label>
                    <select
                      value={inviteForm.rolStaff}
                      onChange={(e) => setInviteForm({ ...inviteForm, rolStaff: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                    >
                      <option value="cajero">Cajero</option>
                      <option value="administrador">Administrador</option>
                      <option value="superadmin">Super Administrador</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sucursal
                    </label>
                    <select
                      value={inviteForm.sucursalId}
                      onChange={(e) => setInviteForm({ ...inviteForm, sucursalId: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                    >
                      <option value="">Ninguna sucursal (Sin asignar)</option>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <span>Agregar Usuario</span>
              </button>
            </form>
          </div>
        </PortalModal>
      )}

      {/* CHANGE ROLE MODAL */}
      {isChangeRolModalOpen && (
        <PortalModal onClose={() => setIsChangeRolModalOpen(false)} ariaLabel="Cambiar rol de usuario">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsChangeRolModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Cambiar Tipo & Rol</h3>
              <p className="text-xs text-slate-400">Modifica los permisos de {selectedUsuario?.name}</p>
            </div>

            <form onSubmit={handleChangeRolUsuario} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tipo de Usuario
                </label>
                <select
                  value={changeRolForm.tipoUsuario}
                  onChange={(e) => setChangeRolForm({ ...changeRolForm, tipoUsuario: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                >
                  <option value="cliente">Cliente</option>
                  <option value="staff">Personal (Staff)</option>
                </select>
              </div>

              {changeRolForm.tipoUsuario === "staff" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rol de Staff
                    </label>
                    <select
                      value={changeRolForm.rolStaff}
                      onChange={(e) => setChangeRolForm({ ...changeRolForm, rolStaff: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                    >
                      <option value="cajero">Cajero</option>
                      <option value="administrador">Administrador</option>
                      <option value="superadmin">Super Administrador</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sucursal
                    </label>
                    <select
                      value={changeRolForm.sucursalId}
                      onChange={(e) => setChangeRolForm({ ...changeRolForm, sucursalId: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                    >
                      <option value="">Ninguna sucursal (Sin asignar)</option>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <span>Guardar Permisos</span>
              </button>
            </form>
          </div>
        </PortalModal>
      )}

      {/* REESTABLECER CONTRASEÑA MODAL */}
      {isResetPasswordModalOpen && (
        <PortalModal onClose={() => setIsResetPasswordModalOpen(false)} ariaLabel="Restablecer contraseña">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Reestablecer Contraseña</h3>
              <p className="text-xs text-slate-400">
                Genera códigos de recuperación para {resetPasswordUsuario?.name}
              </p>
            </div>

            {resetCodes.length === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-xs text-amber-300 leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle size={14} />
                    <span>Importante</span>
                  </p>
                  <p>Al reestablecer la contraseña, se generarán 8 códigos de recuperación de un solo uso.</p>
                  <p>
                    Se descargará automáticamente un archivo de texto con las instrucciones y códigos. Debes
                    proveerle uno de estos códigos al usuario para que pueda ingresar su nueva contraseña.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRecoveryCodes}
                  disabled={isGeneratingCodes}
                  className="h-11 w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isGeneratingCodes ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generando códigos...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Generar y Descargar Códigos</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-950/40 bg-emerald-950/20 text-xs text-emerald-400 leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>¡Códigos Generados Exitosamente!</span>
                  </p>
                  <p>Se ha descargado un archivo de texto (.txt) con la información.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Códigos de Recuperación
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-100 select-all max-h-40 overflow-y-auto">
                    {resetCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-955 px-2.5 py-1.5 rounded-lg border border-slate-900"
                      >
                        <span className="text-slate-400 text-[10px] font-bold">{idx + 1}.</span>
                        <span className="font-bold text-white tracking-wide">{code}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500">
                    Haz clic y arrastra para seleccionar y copiar cualquiera de los códigos.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateRecoveryCodes}
                    className="h-11 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={15} />
                    <span>Descargar Nuevamente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="h-11 flex-1 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
                  >
                    <span>Listo / Cerrar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </PortalModal>
      )}
    </div>
  );
}
