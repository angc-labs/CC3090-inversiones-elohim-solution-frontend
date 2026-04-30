import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TCarritoItem = {
  productoId: string;
  nombreProducto: string;
  precio: number;
  cantidad: number;
  imagenPrincipal?: string;
  stockActual?: number;
};

type TCarritoStore = {
  items: TCarritoItem[];
  agregarItem: (item: TCarritoItem) => void;
  eliminarItem: (productoId: string) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  totalItems: () => number;
  totalPrecio: () => number;
};

const normalizeCantidad = (cantidad: number) => Math.max(1, Math.floor(cantidad));

export const useCarritoStore = create<TCarritoStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregarItem: (item) =>
        set((state) => {
          const cantidad = normalizeCantidad(item.cantidad);
          const existe = state.items.find((i) => i.productoId === item.productoId);
          if (existe) {
            return {
              items: state.items.map((i) =>
                i.productoId === item.productoId
                  ? { ...i, cantidad: normalizeCantidad(i.cantidad + cantidad) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, cantidad }] };
        }),

      eliminarItem: (productoId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productoId !== productoId),
        })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productoId === productoId ? { ...i, cantidad: normalizeCantidad(cantidad) } : i
          ),
        })),

      limpiarCarrito: () => set({ items: [] }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),

      totalPrecio: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    }),
    { name: "elohim-carrito" }
  )
);