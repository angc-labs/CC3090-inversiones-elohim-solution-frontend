"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// TODO: Descomentar cuando el endpoint este disponible:
// import { solicitarRecuperacion } from "@/lib/api/auth";

export function RecuperarForm() {
  const [correo, setCorreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!correo) return;
    setIsLoading(true);

    try {
      // TODO: Reemplazar la simulacion por la llamada real cuando el endpoint este listo:
      // await solicitarRecuperacion(correo);
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
      setEnviado(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f8f6] md:flex-row">
      <div className="relative flex-1 overflow-hidden bg-[#f0f0ec]">
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
              Recupera tu acceso
              <br />
              en pocos pasos.
            </h2>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-gray-400">
              Te enviaremos instrucciones para restablecer tu contrasena sin exponer informacion sensible.
            </p>
          </div>

          <p className="text-xs text-gray-400">Seguridad centrada en el cliente.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-10 md:p-20">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Image src="/globe.svg" alt="" width={18} height={18} aria-hidden="true" className="opacity-80" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">Recuperar contrasena</h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Ingresa tu correo y te enviaremos un enlace para recuperar tu cuenta.
            </p>
          </div>

          {enviado ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              Si el correo existe, recibiras un enlace de recuperacion.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-1.5">
                <label htmlFor="correo-recuperar" className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Correo electronico
                </label>
                <input
                  id="correo-recuperar"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !correo}
                aria-busy={isLoading}
                className="h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            Recordaste tu contrasena?{" "}
            <Link href="/login" className="font-medium text-blue-600 transition-colors hover:text-blue-700">
              Iniciar sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
