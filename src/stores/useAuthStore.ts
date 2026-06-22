import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TRol = "cliente" | "cajero" | "admin" | "superadmin";

export type TUsuario = {
  usuarioId: string;
  correo: string;
  nombre: string;
  rol: TRol;
  esSuperAdmin?: boolean;
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

      login: (usuario, token, expiraEn) => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("active_tenant_id");
        }
        set({ usuario, token, expiraEn, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("active_tenant_id");
        }
        set({ usuario: null, token: null, expiraEn: null, isAuthenticated: false });
      },

      isSessionExpired: () => {
        const state = get();
        if (!state.expiraEn) return false;
        return Date.now() > state.expiraEn;
      },
    }),
    { name: "elohim-auth" }
  )
);