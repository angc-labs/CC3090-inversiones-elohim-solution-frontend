"use client";

import { useTranslations } from "next-intl";
import { Loader2, Users } from "lucide-react";
import type { PlatformUsuarioDto } from "@/lib/api/admin";

interface ClientesTabProps {
  usuarios: PlatformUsuarioDto[];
  loadingUsuarios: boolean;
  esAdmin: boolean;
  onToggleEstado: (u: PlatformUsuarioDto) => void;
  onOpenChangeRol: (u: PlatformUsuarioDto) => void;
}

export function ClientesTab({
  usuarios,
  loadingUsuarios,
  esAdmin,
  onToggleEstado,
  onOpenChangeRol,
}: ClientesTabProps) {
  const t = useTranslations("Clientes");
  const clientUsuarios = usuarios.filter((u) => u.tipoUsuario === "cliente");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">{t("title")}</h2>
        <p className="text-xs text-slate-400">
          {t("subtitle")}
        </p>
      </div>

      {loadingUsuarios ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        </div>
      ) : clientUsuarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
          <Users className="mx-auto text-slate-600" size={40} />
          <p className="text-sm text-slate-400">{t("empty_state")}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="p-4">{t("table_client")}</th>
                  <th className="p-4">{t("table_email")}</th>
                  <th className="p-4">{t("table_status")}</th>
                  {esAdmin && <th className="p-4 text-right">{t("table_actions")}</th>}
                </tr>
              </thead>
              <tbody>
                {clientUsuarios.map((u) => (
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
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          u.estado
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {u.estado ? t("status_active") : t("status_suspended")}
                      </span>
                    </td>
                    {esAdmin && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onToggleEstado(u)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer border-none text-[10px] font-bold"
                        >
                          {u.estado ? t("action_suspend") : t("action_activate")}
                        </button>
                        <button
                          onClick={() => onOpenChangeRol(u)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[#38BDF8] cursor-pointer border-none text-[10px] font-bold ml-2"
                        >
                          {t("action_change_role")}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
