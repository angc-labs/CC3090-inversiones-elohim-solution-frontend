"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLocked, setIsLocked] = useState(false);
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
        },
        response.token,
        response.expiraEn
      );

      setSuccess("¡Bienvenido! Redirigiendo...");
      setTimeout(() => {
        router.push("/home");
      }, 500);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "ACCOUNT_LOCKED") {
          setError("Cuenta bloqueada temporalmente");
          setIsLocked(true);
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
    <div className="relative flex min-h-screen flex-col bg-[#f8f8f6] md:flex-row">
      <div className="relative mr-6 flex-1 overflow-hidden bg-[#f0f0ec]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative flex h-full min-h-50 flex-col justify-between p-10! md:pt-20 md:pr-16 md:pb-14 md:pl-24">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              <Link href="/">ESMIRNA</Link>
            </span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Bienvenido de nuevo<br />a ESMIRNA.
            </h2>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-gray-400">
              Accede para continuar tu experiencia de compra sin fricciones.
            </p>
          </div>

          <p className="text-xs text-gray-400"></p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-10 md:p-20">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">Iniciar sesión</h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 space-y-7">
            {error && <Alert type="error" message={error} onClose={() => setError("")} />}
            {success && <Alert type="success" message={success} />}

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Correo electrónico</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={isLoading || isLocked}
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Contraseña</label>
              <div className="relative">
                <Input
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={isLoading || isLocked}
                  required
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 pr-10 text-gray-900 placeholder:text-gray-300 transition-colors focus:border-blue-400 focus:bg-white focus:ring-blue-400/30"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-300 transition-colors hover:text-gray-500"
                >
                  {mostrarContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-end">
                <Link
                  href="/recuperar"
                  className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isLocked}
              className="mt-2 h-11 w-full rounded-lg bg-blue-600 font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              {isLoading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Regístrate
            </button>
          </p>

          <p className="mt-3 text-center text-xs text-gray-400">
            ¿Ya tienes enlace de recuperación?{" "}
            <Link href="/new-password" className="font-medium text-blue-600 transition-colors hover:text-blue-700">
              Cambiar contraseña
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
