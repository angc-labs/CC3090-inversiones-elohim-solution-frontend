import { apiRequest, buildAuthHeaders } from "@/lib/api/client";

export type UserProfile = {
  usuarioId: string;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
  tipoUsuario: string;
  tipoCliente?: string | null;
  direccion?: string | null;
  rol?: string | null;
  fechaRegistro: string;
};

export type UpdateProfilePayload = {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena?: string;
  telefono: string;
  direccion?: string;
};

export type PerfilActualizadoResponse = {
  usuarioId: string;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
};

export async function getProfile(token: string): Promise<UserProfile> {
  return apiRequest<UserProfile>(
    "/api/usuario/me",
    {
      method: "GET",
      headers: buildAuthHeaders(token),
    },
    "No se pudo cargar el perfil"
  );
}

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload
): Promise<PerfilActualizadoResponse> {
  const body: Record<string, unknown> = {
    nombre: payload.nombre,
    apellido: payload.apellido || null,
    correo: payload.correo,
    telefono: payload.telefono.trim() ? payload.telefono.trim() : null,
  };
  if (payload.direccion !== undefined) {
    body.direccion = payload.direccion.trim() ? payload.direccion.trim() : null;
  }
  if (payload.contrasena) {
    body.contrasena = payload.contrasena;
  }

  return apiRequest<PerfilActualizadoResponse>(
    "/api/usuario/me",
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(body),
    },
    "No se pudo actualizar el perfil"
  );
}
