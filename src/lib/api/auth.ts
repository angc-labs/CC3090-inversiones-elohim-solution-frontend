const API_URL = (globalThis as typeof globalThis & {
  process?: {
    env?: {
      NEXT_PUBLIC_API_URL?: string;
    };
  };
}).process?.env?.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está configurada");
}

export type TLoginResponse = {
  clienteId: string;
  correo: string;
  nombre: string;
  token: string;
  expiraEn: number;
};

export type TRegisterResponse = TLoginResponse;

class AuthError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function mapErrorMessage(status: number, message: string): string {
  const messages: Record<number, Record<string, string>> = {
    400: {
      invalid_credentials: "Correo o contraseña incorrectos",
      email_already_exists: "Este correo ya está registrado",
      invalid_email: "El formato del correo no es válido",
      weak_password: "La contraseña debe tener al menos 8 caracteres",
      missing_fields: "Por favor completa todos los campos requeridos",
    },
    401: {
      unauthorized: "No autorizado. Intenta de nuevo.",
    },
    409: {
      email_exists: "Este correo ya está registrado",
    },
    500: {
      server_error: "Error del servidor. Intenta más tarde.",
    },
  };

  return messages[status]?.[message] || message || "Error desconocido";
}

export async function login(correo: string, contrasena: string): Promise<TLoginResponse> {
  try {
    const res = await fetch(`${API_URL}/api/client/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Error al iniciar sesión", code: "unknown" }));
      const mappedMessage = mapErrorMessage(res.status, error.code || error.message);
      throw new AuthError(mappedMessage, error.code || "unknown");
    }

    return res.json();
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("Error al conectar con el servidor", "network_error");
  }
}

export async function register(data: {
  correo: string;
  nombre: string;
  contrasena: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
}): Promise<TRegisterResponse> {
  try {
    const res = await fetch(`${API_URL}/api/client/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Error al registrar", code: "unknown" }));
      const mappedMessage = mapErrorMessage(res.status, error.code || error.message);
      throw new AuthError(mappedMessage, error.code || "unknown");
    }

    return res.json();
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("Error al conectar con el servidor", "network_error");
  }
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_URL}/api/client/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}