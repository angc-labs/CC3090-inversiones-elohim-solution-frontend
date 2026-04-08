import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TRol = "cliente" | "cajero" | "admin";

export type TUsuario = {
  clienteId: string;
  correo: string;
  nombre: string;
  rol: TRol;
};

type TAuthStore = {
  usuario: TUsuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (usuario: TUsuario, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,

      login: (usuario, token) =>
        set({ usuario, token, isAuthenticated: true }),

      logout: () =>
        set({ usuario: null, token: null, isAuthenticated: false }),
    }),
    { name: "elohim-auth" }
  )
);