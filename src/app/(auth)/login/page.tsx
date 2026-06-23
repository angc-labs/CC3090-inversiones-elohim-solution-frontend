"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/api/auth";
import { getPostLoginPath } from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!correo || !contrasena) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    try {
      setSuccess("Iniciando sesión...");
      const response = await login(correo, contrasena);

      loginStore(
        {
          usuarioId: response.usuarioId,
          correo: response.correo,
          nombre: response.nombre,
          rol: response.rol,
          esSuperAdmin: response.esSuperAdmin,
        },
        response.token,
        response.expiraEn
      );

      setSuccess("¡Bienvenido! Redirigiendo...");
      setTimeout(() => {
        router.push(getPostLoginPath(response.rol));
      }, 500);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "ACCOUNT_LOCKED") {
          setError("Cuenta bloqueada temporalmente");
        } else {
          setError(err.message);
        }
      } else {
        setError("Error al iniciar sesión");
      }
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative! flex! min-h-screen! flex-col! items-center! justify-center! bg-gradient-to-b! from-[#081018]! via-[#0b1420]! to-[#081018]! text-slate-100! px-4! py-12! font-sans! overflow-hidden!">
      {/* Decorative Blur Gradients */}
      <div className="pointer-events-none! absolute! top-0! left-1/4! h-[500px]! w-[500px]! -translate-x-1/2! rounded-full! bg-brand-primary/5! blur-[120px]! opacity-50!" />
      <div className="pointer-events-none! absolute! top-1/3! right-1/4! h-[600px]! w-[600px]! translate-x-1/2! rounded-full! bg-brand-secondary/5! blur-[150px]! opacity-40!" />

      {/* Login Card */}
      <div className="w-full! max-w-md! rounded-2xl! border! border-slate-800/80! bg-slate-950/80! p-8! shadow-2xl! shadow-black/80! backdrop-blur-md!">
        <div className="flex! items-center! justify-center! mb-6!">
          <div className="flex! h-11! w-11! items-center! justify-center! rounded-xl! bg-gradient-to-tr! from-brand-primary! to-brand-secondary! text-slate-900! font-black! shadow-[0_0_20px_rgba(34,211,166,0.3)]!">
            DH
          </div>
        </div>

        <h3 className="text-center! text-2xl! font-black! tracking-tight! text-white! mb-2!">Iniciar sesión</h3>
        <p className="text-center! text-xs! text-slate-400! mb-8!">Ingresa a tu cuenta para continuar</p>

        <form onSubmit={handleSubmit} className="flex! flex-col!">
          {error && (
            <div className="mb-6! p-3.5! rounded-xl! border! border-rose-900/50! bg-rose-950/30! text-xs! font-mono! text-rose-400! leading-relaxed!">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6! p-3.5! rounded-xl! border! border-emerald-900/50! bg-emerald-950/30! text-xs! font-mono! text-emerald-400! leading-relaxed!">
              {success}
            </div>
          )}

          <div className="flex! flex-col! gap-1.5! mb-5!">
            <label htmlFor="correo" className="text-xs! font-bold! text-slate-400! uppercase! tracking-wider!">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={isLoading}
              required
              className="h-11! w-full! rounded-xl! border! border-slate-800! bg-slate-900/60! px-4! text-sm! text-slate-100! placeholder:text-slate-650! outline-none! transition-all! focus:border-brand-primary! focus:ring-1! focus:ring-brand-primary!"
            />
          </div>

          <div className="flex! flex-col! gap-1.5! mb-6!">
            <div className="flex! items-center! justify-between!">
              <label htmlFor="contrasena" className="text-xs! font-bold! text-slate-400! uppercase! tracking-wider!">
                Contraseña
              </label>
              <Link
                href="/recuperar"
                className="text-[11px]! font-bold! text-brand-primary! hover:text-[#1ebda1]! transition-colors!"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative!">
              <input
                id="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                disabled={isLoading}
                required
                className="h-11! w-full! rounded-xl! border! border-slate-800! bg-slate-900/60! pr-11! pl-4! text-sm! text-slate-100! placeholder:text-slate-650! outline-none! transition-all! focus:border-brand-primary! focus:ring-1! focus:ring-brand-primary!"
              />
              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                className="absolute! right-3.5! top-1/2! -translate-y-1/2! text-slate-500! hover:text-slate-350! transition-colors! cursor-pointer! bg-transparent! border-none! p-0!"
              >
                {mostrarContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2! h-12! w-full! rounded-xl! bg-brand-primary! hover:bg-[#1ebda1]! text-brand-tertiary! font-bold! shadow-[0_4px_14px_0_rgba(34,211,166,0.2)]! transition-all! hover:scale-[1.01]! cursor-pointer! border-none!"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-8! text-center! text-xs! text-slate-500!">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const role = params.get("role") || params.get("tipo") || "";
                router.push(`/register${role ? `?role=${role}` : ""}`);
              } else {
                router.push("/register");
              }
            }}
            className="font-bold! text-brand-primary! hover:text-[#1ebda1]! transition-colors! cursor-pointer! bg-transparent! border-none! p-0!"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}
