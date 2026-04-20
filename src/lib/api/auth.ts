const API_URL = (globalThis as typeof globalThis & {
  process?: {
    env?: {
      NEXT_PUBLIC_API_URL?: string;
    };
  };
}).process?.env?.NEXT_PUBLIC_API_URL;

//if (!API_URL) {
 // throw new Error("NEXT_PUBLIC_API_URL no está configurada");
//}

export type TLoginResponse = {
  clienteId: string;
  correo: string;
  nombre: string;
  token: string;
  expiraEn: number;
};

export type TRegisterResponse = TLoginResponse;

export async function login(correo: string, contrasena: string): Promise<TLoginResponse> {
  const res = await fetch(`${API_URL}/api/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error al iniciar sesión" }));
    throw new Error(error.message || "Credenciales inválidas");
  }
  
  return res.json();
}

export async function register(data: {
  correo: string;
  nombre: string;
  contrasena: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
}): Promise<TRegisterResponse> {
  const res = await fetch(`${API_URL}/api/client/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error al registrar" }));
    throw new Error(error.message || "Error al registrar usuario");
  }
  
  return res.json();
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_URL}/api/client/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}