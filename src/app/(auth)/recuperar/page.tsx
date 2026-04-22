"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function solicitarRecuperacion(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/recuperar-contrasena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    // Silenciado intencionalmente: no revelamos si el correo existe
    return;
  }
}

export default function RecuperarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) return;
    setIsLoading(true);
    setMensaje(null);

    try {
      await solicitarRecuperacion(email);
    } catch {
      // Silenciado intencionalmente: no revelamos si el correo existe
    } finally {
      setMensaje("Si el correo existe, recibirás un enlace de recuperación.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f8f8f6] md:flex-row">
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
              <Link href="/">ESMIRNA</Link>
            </span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Recupera tu acceso<br />en minutos.
            </h2>
            <p className="mt-2.5 text-sm text-gray-400 max-w-xs leading-relaxed">
              Te enviaremos un enlace seguro para restablecer tu contraseña.
            </p>
          </div>

          <p className="text-xs text-gray-400"></p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-10 md:p-20">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Recuperar contraseña</h1>
            <p className="mt-2 text-sm text-gray-500">
              Ingresa tu correo electrónico y te enviaremos instrucciones.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="space-y-7 flex gap-6 flex-col"
          >
            {mensaje && <Alert type="success" message={mensaje} />}

            <div className="space-y-1.5">
              <label htmlFor="email-recuperar" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Correo electrónico
              </label>
              <Input
                id="email-recuperar"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-blue-400 focus:ring-blue-400/30 transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="h-11 w-full rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
            >
              {isLoading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿Recordaste tu contraseña?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}