"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// TODO: Descomentar cuando el endpoint este disponible:
// import { cambiarPassword } from "@/lib/api/auth";

const IS_DEV = process.env.NODE_ENV === "development";

type TProps = {
  token: string | null;
};

type LayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function PasswordAuthLayout({ title, description, children }: LayoutProps) {
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
              Controla tu acceso
              <br />
              con total claridad.
            </h2>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-gray-400">
              Manten tus credenciales actualizadas y protege tu cuenta con un flujo simple y seguro.
            </p>
          </div>

          <p className="text-xs text-gray-400">Proteccion continua para tus clientes.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white p-10 md:p-20">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Image src="/window.svg" alt="" width={18} height={18} aria-hidden="true" className="opacity-80" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export function NuevaPasswordForm({ token }: TProps) {
  const router = useRouter();

  // En desarrollo se usa un token ficticio para visualizar el formulario
  const tokenEfectivo = token ?? (IS_DEV ? "dev-test-token" : null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Reemplazar por la llamada real cuando el endpoint esté listo:
      // await cambiarPassword(tokenEfectivo!, password);
      if (IS_DEV) {
        // Simulación temporal — quitar cuando el endpoint esté implementado
        await new Promise<void>((resolve) => setTimeout(resolve, 400));
      } else {
        throw new Error("Endpoint no disponible aún.");
      }
      setSuccess(true);
    } catch {
      setError(
        IS_DEV
          ? "[Modo desarrollo] Endpoint no implementado aún. El formulario es solo visual."
          : "El enlace no es válido o ha expirado."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenEfectivo) {
    return (
      <PasswordAuthLayout
        title="Enlace invalido"
        description="Este enlace no es valido o ya fue utilizado. Solicita uno nuevo."
      >
        <button
          type="button"
          className="h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
          onClick={() => router.push("/recuperar")}
        >
          Solicitar nuevo enlace
        </button>
      </PasswordAuthLayout>
    );
  }

  if (success) {
    return (
      <PasswordAuthLayout
        title="Contrasena actualizada"
        description="Tu acceso fue restablecido correctamente."
      >
        <p
          role="status"
          aria-live="polite"
          className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700"
        >
          Contrasena actualizada correctamente.
        </p>
        <button
          type="button"
          className="h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
          onClick={() => router.push("/login")}
        >
          Ir al inicio de sesion
        </button>
      </PasswordAuthLayout>
    );
  }

  return (
    <PasswordAuthLayout
      title="Nueva contrasena"
      description="Ingresa tu nueva contrasena para recuperar el acceso."
    >
      {IS_DEV && !token && (
        <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
          Modo desarrollo: sin token real. El envio es simulado.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="nueva-password" className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Nueva contrasena
          </label>
          <input
            id="nueva-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            aria-required="true"
            autoComplete="new-password"
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmar-password" className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Confirmar contrasena
          </label>
          <input
            id="confirmar-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
            aria-required="true"
            autoComplete="new-password"
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          aria-busy={isLoading}
          className="h-11 w-full rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : "Guardar nueva contrasena"}
        </button>
      </form>

      {error && (
        <p role="alert" aria-live="assertive" className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </PasswordAuthLayout>
  );
}