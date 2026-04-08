"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";


export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore(state => state.login);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(correo, contrasena);
      loginStore(
        {
          clienteId: response.clienteId,
          correo: response.correo,
          nombre: response.nombre,
          rol: "cliente",
        },
        response.token
      );
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f8f6] md:flex-row">

      {/* Left panel */}
      <div className="relative flex-1 overflow-hidden mr-6 bg-[#f0f0ec]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative flex h-full min-h-50 flex-col justify-between p-10! md:py-14 md:pl-24 md:pr-16 md:pt-20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              <Link href="/">ELOHIM</Link>
            </span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Lorem ipsum dolor<br />sit amet.
            </h2>
            <p className="mt-2.5 text-sm text-gray-400 max-w-xs leading-relaxed">
              Consectetur adipisicing elit. Obcaecati ea harum animi sint officiis quisquam.
            </p>
          </div>

          <p className="text-xs text-gray-400"></p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-white p-10 md:p-20">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">Iniciar sesión</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 flex gap-8 flex-col">
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo electrónico</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-blue-400 focus:ring-blue-400/30 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <Input
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 pr-10 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-blue-400 focus:ring-blue-400/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {mostrarContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md mt-2"
            >
              {isLoading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}