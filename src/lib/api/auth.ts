import { apiRequest, API_URL, buildAuthHeaders } from "@/lib/api/client";
import { TRol } from "@/stores/useAuthStore";

type TAuthApiResponse = {
  usuarioId: string;
  correo: string;
  nombre: string;
  tipoUsuario: "cliente" | "administrador";
  rol?: "cajero" | "administrador" | "superadmin" | null;
  tipoCliente?: "mayorista" | "minorista" | "particular" | null;
  token: string;
  expiraEn: string;
  esSuperAdmin?: boolean;
};

export type TAuthResponse = {
  usuarioId: string;
  correo: string;
  nombre: string;
  rol: TRol;
  esSuperAdmin: boolean;
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
  tipoUsuario?: "cliente" | "administrador";
};

function mapRol(response: TAuthApiResponse): TRol {
  if (response.tipoUsuario === "cliente") {
    return "cliente";
  }

  if (response.rol === "cajero") {
    return "cajero";
  }

  if (response.rol === "superadmin" || response.esSuperAdmin) {
    return "superadmin";
  }

  return "admin";
}

function mapAuthResponse(response: TAuthApiResponse): TAuthResponse {
  return {
    usuarioId: response.usuarioId,
    correo: response.correo,
    nombre: response.nombre,
    rol: mapRol(response),
    esSuperAdmin: response.esSuperAdmin === true,
    token: response.token,
    expiraEn: Date.parse(response.expiraEn),
  };
}

export async function login(correo: string, contrasena: string): Promise<TAuthResponse> {
  const response = await apiRequest<TAuthApiResponse>(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ correo, contrasena }),
    },
    "Error al iniciar sesión"
  );

  return mapAuthResponse(response);
}

export async function loginWithGoogle(
  idToken: string,
  tipoUsuario: "cliente" | "administrador",
  tiendaId?: string
): Promise<TAuthResponse> {
  const response = await apiRequest<TAuthApiResponse>(
    "/api/v1/auth/google",
    {
      method: "POST",
      headers: buildAuthHeaders(undefined, tipoUsuario === "administrador"),
      body: JSON.stringify({ idToken, tiendaId, tipoUsuario }),
    },
    "Error al continuar con Google"
  );

  return mapAuthResponse(response);
}

export async function register(data: TRegisterInput): Promise<TAuthResponse> {
  const isClient = data.tipoUsuario === "cliente";
  const response = await apiRequest<TAuthApiResponse>(
    "/api/v1/auth/register",
    {
      method: "POST",
      headers: buildAuthHeaders(undefined, !isClient),
      body: JSON.stringify({
        correo: data.correo,
        nombre: data.nombre,
        contrasena: data.contrasena,
        tipoUsuario: data.tipoUsuario || "administrador",
        rol: data.tipoUsuario === "cliente" ? undefined : "administrador",
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
  const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
    method: "POST",
    headers: buildAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error("No se pudo cerrar la sesión");
  }
}

export async function forgotPassword(correo: string): Promise<void> {
  await apiRequest<{ mensaje: string }>(
    "/api/v1/auth/forgot-password",
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ correo }),
    },
    "No se pudo enviar el correo de recuperación"
  );
}

export async function changePassword(
  contrasenaActual: string,
  nuevaContrasena: string,
  token?: string
): Promise<void> {
  await apiRequest<void>(
    "/api/v1/auth/change-password",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ contrasenaActual, nuevaContrasena }),
    },
    "Error al cambiar la contraseña"
  );
}

export type TRecoveryCodesResponse = {
  usuarioId: string;
  correo: string;
  nombre: string;
  codigos: string[];
};

/**
 * Admin generates 8 recovery codes for a user.
 * Only admins/superadmins can call this.
 */
export async function adminResetPassword(
  usuarioId: string,
  token: string
): Promise<TRecoveryCodesResponse> {
  return apiRequest<TRecoveryCodesResponse>(
    `/api/admin/usuarios/${usuarioId}/reset-password`,
    {
      method: "POST",
      headers: buildAuthHeaders(token),
    },
    "Error al generar códigos de recuperación"
  );
}

/**
 * Recover password using a recovery code (no email required).
 */
export async function recoverWithCode(
  correo: string,
  codigo: string,
  nuevaContrasena: string
): Promise<{ mensaje: string }> {
  return apiRequest<{ mensaje: string }>(
    "/api/v1/auth/recover-with-code",
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify({ correo, codigo, nuevaContrasena }),
    },
    "Error al recuperar la contraseña"
  );
}

export async function solicitarCodigoRecuperacion(
  correo: string,
  tiendaId: string
): Promise<{ mensaje: string }> {
  return apiRequest<{ mensaje: string }>(
    "/api/v1/auth/forgot-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": tiendaId,
      },
      body: JSON.stringify({ correo }),
    },
    "Error al solicitar el código de recuperación"
  );
}
