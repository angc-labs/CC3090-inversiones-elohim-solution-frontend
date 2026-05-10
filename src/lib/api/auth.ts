import { apiRequest, API_URL, buildAuthHeaders } from "@/lib/api/client";
import { TRol } from "@/stores/useAuthStore";

type TAuthApiResponse = {
  usuarioId: string;
  correo: string;
  nombre: string;
  tipoUsuario: "cliente" | "administrador";
  rol?: "cajero" | "administrador" | null;
  tipoCliente?: "mayorista" | "minorista" | "particular" | null;
  token: string;
  expiraEn: string;
};

export type TAuthResponse = {
  usuarioId: string;
  correo: string;
  nombre: string;
  rol: TRol;
  token: string;
  expiraEn: number;
};

export type TRegisterInput = {
  correo: string;
  nombre: string;
  contrasena: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  tipoCliente?: "mayorista" | "minorista" | "particular";
};

function mapRol(response: TAuthApiResponse): TRol {
  if (response.tipoUsuario === "cliente") {
    return "cliente";
  }

  if (response.rol === "cajero") {
    return "cajero";
  }

  return "admin";
}

function mapAuthResponse(response: TAuthApiResponse): TAuthResponse {
  return {
    usuarioId: response.usuarioId,
    correo: response.correo,
    nombre: response.nombre,
    rol: mapRol(response),
    token: response.token,
    expiraEn: Date.parse(response.expiraEn),
  };
}

export async function login(correo: string, contrasena: string): Promise<TAuthResponse> {
  const response = await apiRequest<TAuthApiResponse>(
    "/api/auth/login",
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ correo, contrasena }),
    },
    "Error al iniciar sesión"
  );

  return mapAuthResponse(response);
}

export async function register(data: TRegisterInput): Promise<TAuthResponse> {
  const response = await apiRequest<TAuthApiResponse>(
    "/api/auth/register",
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({
        correo: data.correo,
        nombre: data.nombre,
        contrasena: data.contrasena,
        tipoUsuario: "cliente",
        tipoCliente: data.tipoCliente ?? "particular",
        apellido: data.apellido,
        telefono: data.telefono,
        direccion: data.direccion,
      }),
    },
    "Error al registrar usuario"
  );

  return mapAuthResponse(response);
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("No se pudo cerrar la sesión");
  }
}

export async function forgotPassword(correo: string): Promise<void> {
  await apiRequest<{ mensaje: string }>(
    "/api/auth/forgot-password",
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ correo }),
    },
    "No se pudo enviar el correo de recuperación"
  );
}