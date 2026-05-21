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
