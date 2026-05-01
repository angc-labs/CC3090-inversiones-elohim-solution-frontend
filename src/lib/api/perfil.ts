import mockPerfil from "@/mock/perfil.json";

export type UserProfile = {
  usuarioId: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  tipoUsuario: "cliente";
  tipoCliente: "mayorista" | "minorista" | "particular";
  direccion: string;
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

export async function getProfile(): Promise<UserProfile> {
  await new Promise((r) => setTimeout(r, 600));
  return mockPerfil as UserProfile;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    ...mockPerfil,
    ...payload,
    direccion: payload.direccion ?? mockPerfil.direccion,
  } as UserProfile;
}
