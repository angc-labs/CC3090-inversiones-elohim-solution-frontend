import { apiRequest, buildAuthHeaders } from "@/lib/api/client";

export type UsuarioAdminDto = {
  id: string;
  nombre: string;
  apellido: string | null;
  correo: string;
  telefono: string | null;
  tipoUsuario: string;
  rol: string | null;
  estado: boolean;
  fechaCreacion: string;
};

export async function getAdminUsuarios(
  token: string,
  params?: { busqueda?: string; tipoUsuario?: string; estado?: boolean }
): Promise<UsuarioAdminDto[]> {
  const query = new URLSearchParams();
  if (params?.busqueda) query.set("busqueda", params.busqueda);
  if (params?.tipoUsuario) query.set("tipoUsuario", params.tipoUsuario);
  if (params?.estado !== undefined) query.set("estado", String(params.estado));

  const qs = query.toString();
  return apiRequest<UsuarioAdminDto[]>(
    `/api/admin/usuarios${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: buildAuthHeaders(token) },
    "No se pudo obtener la lista de usuarios"
  );
}

export async function cambiarEstadoUsuario(
  token: string,
  id: string,
  estado: boolean
): Promise<UsuarioAdminDto> {
  return apiRequest<UsuarioAdminDto>(
    `/api/admin/usuarios/${id}/estado`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify({ estado }),
    },
    "No se pudo cambiar el estado del usuario"
  );
}

export type CrearUsuarioAdminDto = {
  correo: string;
  nombre: string;
  contrasena: string;
  tipoUsuario: string;
  apellido?: string;
  telefono?: string;
  rol?: string;
};

export type ActualizarUsuarioAdminDto = {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo?: string;
  rol?: string;
};

export async function crearUsuarioAdmin(
  token: string,
  dto: CrearUsuarioAdminDto
): Promise<UsuarioAdminDto> {
  return apiRequest<UsuarioAdminDto>(
    "/api/admin/usuarios",
    {
      method: "POST",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(dto),
    },
    "No se pudo crear el usuario"
  );
}

export async function actualizarUsuarioAdmin(
  token: string,
  id: string,
  dto: ActualizarUsuarioAdminDto
): Promise<UsuarioAdminDto> {
  return apiRequest<UsuarioAdminDto>(
    `/api/admin/usuarios/${id}`,
    {
      method: "PUT",
      headers: buildAuthHeaders(token),
      body: JSON.stringify(dto),
    },
    "No se pudo actualizar el usuario"
  );
}

export async function eliminarUsuarioAdmin(
  token: string,
  id: string
): Promise<void> {
  return apiRequest<void>(
    `/api/admin/usuarios/${id}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(token),
    },
    "No se pudo eliminar el usuario"
  );
}
