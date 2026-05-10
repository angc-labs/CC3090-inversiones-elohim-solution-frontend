import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TRol = "cliente" | "cajero" | "admin";

export type TUsuario = {
  usuarioId: string;
  correo: string;
  nombre: string;
  rol: TRol;
};

type TAuthStore = {
  usuario: TUsuario | null;
  token: string | null;
  expiraEn: number | null;
  isAuthenticated: boolean;
  login: (usuario: TUsuario, token: string, expiraEn: number) => void;
  logout: () => void;
  isSessionExpired: () => boolean;
};

export const useAuthStore = create<TAuthStore>()(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      expiraEn: null,
      isAuthenticated: false,

      login: (usuario, token, expiraEn) =>
        set({ usuario, token, expiraEn, isAuthenticated: true }),

      logout: () =>
        set({ usuario: null, token: null, expiraEn: null, isAuthenticated: false }),

      isSessionExpired: () => {
        const state = get();
        if (!state.expiraEn) return false;
        return Date.now() > state.expiraEn;
      },
    }),
    { name: "elohim-auth" }
  )
);