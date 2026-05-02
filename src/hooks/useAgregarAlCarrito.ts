import { useState } from "react";
import { agregarArticuloCarrito } from "@/lib/api/carrito";
import { useAuthStore } from "@/stores/useAuthStore";

export function useAgregarAlCarrito() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const agregar = async (productoId: string, cantidad: number) => {
    if (!token) {
      setError("No hay sesión activa");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await agregarArticuloCarrito(token, { productoId, cantidad });
      // Éxito, no hacer nada especial
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("Stock insuficiente")) {
          // Extraer el stock disponible del mensaje
          const match = err.message.match(/Disponible: (\d+)/);
          const disponible = match ? parseInt(match[1], 10) : 0;
          setError(`Stock insuficiente. Solo quedan ${disponible} unidades.`);
        } else {
          setError(err.message);
        }
      } else {
        setError("Error desconocido al agregar al carrito");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { agregar, isLoading, error, clearError: () => setError(null) };
}