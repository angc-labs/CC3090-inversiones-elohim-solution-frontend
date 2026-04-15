import { TProducto } from "@/types";

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

export async function obtenerProductos(): Promise<TProducto[]> {
  const res = await fetch(`${API_URL}/api/product`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  
  if (!res.ok) {
    throw new Error("Error al obtener productos");
  }
  
  return res.json();
}