import { TProducto } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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