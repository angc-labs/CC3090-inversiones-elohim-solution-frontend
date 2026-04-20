"use client";

import { useState } from "react";

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
    <main className="page-recuperar">
      <div className="card">
        <div className="card-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3v7m0 0l-3.5 3.5M10 10l3.5 3.5"
              stroke="#f8fafc"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="10" r="7.5" stroke="#f8fafc" strokeWidth="1.5" opacity="0.35" />
          </svg>
        </div>

        <div className="card-header">
          <h1 className="card-title">Recuperar contraseña</h1>
          <p className="card-description">
            Ingresa tu correo y te enviaremos un enlace para recuperar tu cuenta.
          </p>
        </div>

        <div className="field">
          <label htmlFor="email-recuperar">Correo electrónico</label>
          <input
            id="email-recuperar"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            aria-required="true"
            autoComplete="email"
          />
        </div>

        <button
          type="button"
          className="btn-submit"
          disabled={isLoading || !email}
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
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  opacity="0.75"
                />
              </svg>
              Enviando...
            </>
          ) : (
            "Enviar enlace"
          )}
        </button>

        {mensaje && (
          <p role="status" aria-live="polite" className="feedback">
            {mensaje}
          </p>
        )}
      </div>
    </main>
  );
}