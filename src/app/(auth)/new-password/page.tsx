"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function NuevaPasswordPage() {
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
    <main className="auth-page">
      <div className="card">
        <div className="card-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="#f8fafc" strokeWidth="1.5" />
            <path
              d="M7 9V6.5a3 3 0 016 0V9"
              stroke="#f8fafc"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="10" cy="13" r="1" fill="#f8fafc" />
          </svg>
        </div>

        <div className="card-header">
          <h1 className="card-title">Nueva contraseña</h1>
          <p className="card-description">
            {tokenInvalido
              ? "El enlace no es válido. Solicita uno nuevo desde la pantalla de recuperación."
              : "Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta."}
          </p>
        </div>

        {!tokenInvalido && !success && (
          <>
            <div className="field">
              <label htmlFor="nueva-password">Nueva contraseña</label>
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
              />
            </div>

            <div className="field">
              <label htmlFor="confirmar-password">Confirmar contraseña</label>
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
              />
            </div>

            <button
              type="button"
              className="btn-submit"
              disabled={isLoading || !password || !confirmPassword}
              onClick={handleSubmit}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="spinner"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    width="16"
                    height="16"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      opacity="0.75"
                    />
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar nueva contraseña"
              )}
            </button>

            {error && (
              <p role="alert" aria-live="assertive" className="feedback feedback--error">
                {error}
              </p>
            )}
          </>
        )}

        {success && (
          <>
            <p role="status" aria-live="polite" className="feedback feedback--success">
              Contraseña actualizada correctamente.
            </p>
            <button
              type="button"
              className="btn-submit"
              style={{ marginTop: "1rem" }}
              onClick={() => router.push("/login")}
            >
              Ir al inicio de sesión
            </button>
          </>
        )}

        {tokenInvalido && (
          <button
            type="button"
            className="btn-submit"
            onClick={() => router.push("/recuperar")}
          >
            Solicitar nuevo enlace
          </button>
        )}
      </div>
    </main>
  );
}