"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login, register } from "@/lib/api/auth";
import { useClientAuthStore } from "@/stores/useClientAuthStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  Store,
  User as UserIcon,
  UserRound,
  X,
} from "lucide-react";

type StoreProfileViewProps = {
  variant?: "page" | "modal";
  onClose?: () => void;
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#1AB38C] focus:bg-white focus:ring-4 focus:ring-[#1AB38C]/10";

function resolveTenantId(tiendaId: string | null) {
  if (typeof window === "undefined") {
    return tiendaId || "";
  }

  const hostname = window.location.hostname;

  if (hostname.includes(".lvh.me")) {
    return hostname.split(".lvh.me")[0] || "";
  }

  if (hostname.includes(".localhost")) {
    return hostname.split(".localhost")[0] || "";
  }

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN;
  if (mainDomain && hostname.includes(`.${mainDomain}`)) {
    return hostname.split(`.${mainDomain}`)[0] || "";
  }

  return window.localStorage.getItem("active_tenant_id") || tiendaId || "";
}

export function StoreProfileView({ variant = "page", onClose }: StoreProfileViewProps) {
  const router = useRouter();
  const cliente = useClientAuthStore((state) => state.cliente);
  const tiendaId = useClientAuthStore((state) => state.tiendaId);
  const isAuthenticated = useClientAuthStore((state) => state.isAuthenticated);
  const isSessionExpired = useClientAuthStore((state) => state.isSessionExpired());
  const logout = useClientAuthStore((state) => state.logout);
  const loginClient = useClientAuthStore((state) => state.login);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const resolvedTenantId = resolveTenantId(tiendaId);
  const tenantLabel = resolvedTenantId || tiendaId || "Tienda activa";

  useEffect(() => {
    if (!isAuthenticated || !isSessionExpired) {
      return;
    }

    logout();
    toast.error("Tu sesión expiró. Inicia sesión nuevamente.");
  }, [isAuthenticated, isSessionExpired, logout]);

  const goBackToStore = () => {
    if (onClose) {
      onClose();
      return;
    }

    if (variant === "modal") {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!correo || !contrasena) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(correo, contrasena);

      loginClient(
        {
          usuarioId: response.usuarioId,
          correo: response.correo,
          nombre: response.nombre,
          tipoCliente: "particular",
        },
        response.token,
        response.expiraEn,
        resolvedTenantId
      );

      toast.success(`¡Bienvenido, ${response.nombre}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!correo || !contrasena || !nombre || !apellido) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await register({
        correo,
        nombre,
        apellido,
        contrasena,
        tipoUsuario: "cliente",
        tipoCliente: "particular",
      });

      loginClient(
        {
          usuarioId: response.usuarioId,
          correo: response.correo,
          nombre: response.nombre,
          tipoCliente: "particular",
        },
        response.token,
        response.expiraEn,
        resolvedTenantId
      );

      toast.success(`¡Cuenta creada con éxito! Bienvenido, ${response.nombre}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  const shellClassName = cn(
    "relative overflow-hidden bg-[#fafafa] text-slate-900",
    variant === "modal"
      ? "flex min-h-screen items-center justify-center px-4 py-6"
      : "min-h-screen px-4 py-8 sm:px-6 lg:px-8"
  );

  const panelClassName = cn(
    "relative w-full overflow-hidden border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]",
    variant === "modal"
      ? "max-w-4xl rounded-[32px]"
      : "mx-auto max-w-4xl rounded-[36px]"
  );

  return (
    <div className={shellClassName}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-120px] top-10 h-72 w-72 rounded-full bg-[#1AB38C]/12 blur-3xl" />
        <div className="absolute right-[-90px] top-32 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl" />
      </div>

      <div className={panelClassName}>
        {variant === "modal" && (
          <button
            type="button"
            onClick={goBackToStore}
            className="absolute right-5 top-5 z-20 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Cerrar perfil"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="grid min-h-[72vh]">
          <section className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(26,179,140,0.14),rgba(250,250,250,0.7)_42%,#ffffff)] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1AB38C] text-white shadow-lg shadow-[#1AB38C]/25">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#1AB38C]">Perfil de cliente</p>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Mi cuenta</h1>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Usuario activo</p>
                      <h2 className="mt-2 truncate text-2xl font-black text-slate-950">{cliente?.nombre || "Cliente"}</h2>
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#1AB38C]" />
                          <span className="truncate">{cliente?.correo || "Correo no disponible"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#1AB38C]" />
                          <span>Tipo de cliente: {cliente?.tipoCliente || "particular"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <span>Tienda: {tenantLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">Inicia sesión o crea una cuenta para seguir comprando en esta tienda.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goBackToStore}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la tienda
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast.success("Sesión cerrada");
                    router.push("/");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
