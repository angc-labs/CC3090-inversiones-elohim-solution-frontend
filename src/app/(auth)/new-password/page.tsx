"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/api/client";

async function cambiarPassword(token: string, contrasena: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, contrasena }),
  });

  if (!res.ok) {
    throw new Error("token_invalido");
  }
}

function NuevaPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tokenInvalido = !token;

  const handleSubmit = async () => {
    setError(null);

    if (!password || !confirmPassword) {
      setError("Por favor completa ambos campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) return;

    setIsLoading(true);

    try {
      await cambiarPassword(token, password);
      setSuccess(true);
    } catch {
      setError("El enlace es inválido o expiró. Solicita uno nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative! flex! min-h-screen! flex-col! bg-[#f8f8f6]! md:flex-row!">
      <div className="relative! flex-1! overflow-hidden! mr-6! bg-[#f0f0ec]!">
        <div className="absolute! inset-0! bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(59,130,246,0.08),transparent)]!" />
        <div className="relative! flex! h-full! min-h-50! flex-col! justify-between! p-10! md:py-14! md:pl-24! md:pr-16! md:pt-20!">
          <div className="flex! items-center! gap-2.5!">
            <div className="flex! h-7! w-7! items-center! justify-center! rounded-md! bg-blue-600! text-white! shadow-sm!">
              <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm! font-semibold! tracking-tight! text-gray-900!">
              <Link href="/">ESMIRNA</Link>
            </span>
          </div>

          <div className="hidden! md:block!">
            <h2 className="text-3xl! font-bold! leading-tight! tracking-tight! text-gray-900!">
              Define una nueva<br />contraseña segura.
            </h2>
            <p className="mt-2.5! text-sm! text-gray-400! max-w-xs! leading-relaxed!">
              Mantén tu cuenta protegida con una contraseña fuerte y fácil de recordar.
            </p>
          </div>

          <p className="text-xs! text-gray-400!"></p>
        </div>
      </div>

      <div className="flex! flex-1! items-center! justify-center! bg-white! p-10! md:p-20!">
        <div className="w-full! max-w-sm!">
          <div className="mb-8!">
            <h1 className="text-xl! font-semibold! text-gray-900! tracking-tight!">Nueva contraseña</h1>
            <p className="mt-2! text-sm! text-gray-500!">
              {tokenInvalido
                ? "El enlace no es válido. Solicita uno nuevo desde recuperación."
                : "Ingresa y confirma tu nueva contraseña para continuar."}
            </p>
          </div>

          {!tokenInvalido && !success && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
              className="space-y-7! flex! gap-6! flex-col!"
            >
              {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

              <div className="space-y-1.5!">
                <label htmlFor="nueva-password" className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">
                  Nueva contraseña
                </label>
                <Input
                  id="nueva-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  className="h-11! rounded-lg! border-gray-200! bg-gray-50! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
                />
              </div>

              <div className="space-y-1.5!">
                <label htmlFor="confirmar-password" className="text-xs! font-medium! text-gray-500! uppercase! tracking-wide!">
                  Confirmar contraseña
                </label>
                <Input
                  id="confirmar-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  className="h-11! rounded-lg! border-gray-200! bg-gray-50! text-gray-900! placeholder:text-gray-300! focus:bg-white! focus:border-blue-400! focus:ring-blue-400/30! transition-colors!"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="h-11! w-full! rounded-lg! bg-blue-600! font-medium! text-white! hover:bg-blue-700! shadow-sm! transition-all! hover:shadow-md!"
              >
                {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </form>
          )}

          {success && (
            <div className="space-y-5!">
              <Alert type="success" message="Contraseña actualizada correctamente." />
              <Button
                type="button"
                className="h-11! w-full! rounded-lg! bg-blue-600! font-medium! text-white! hover:bg-blue-700! shadow-sm! transition-all! hover:shadow-md!"
                onClick={() => router.push("/login")}
              >
                Ir al inicio de sesión
              </Button>
            </div>
          )}

          {tokenInvalido && (
            <Button
              type="button"
              className="h-11! w-full! rounded-lg! bg-blue-600! font-medium! text-white! hover:bg-blue-700! shadow-sm! transition-all! hover:shadow-md!"
              onClick={() => router.push("/recuperar")}
            >
              Solicitar nuevo enlace
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NuevaPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex! min-h-screen! items-center! justify-center! bg-[#f8f8f6]! text-sm! text-gray-500!">
          Cargando formulario...
        </div>
      }
    >
      <NuevaPasswordContent />
    </Suspense>
  );
}