import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TCliente = {
  usuarioId: string;
  correo: string;
  nombre: string;
  tipoCliente?: string | null;
};

type TClientAuthStore = {
  // Active session properties (bound to current tenant)
  cliente: TCliente | null;
  token: string | null;
  expiraEn: number | null;
  tiendaId: string | null;
  isAuthenticated: boolean;

  // Dictionary of all active client sessions per tenant
  sessions: Record<string, { cliente: TCliente; token: string; expiraEn: number }>;

  // Actions
  login: (cliente: TCliente, token: string, expiraEn: number, tiendaId: string) => void;
  logout: () => void;
  isSessionExpired: () => boolean;
  selectTenant: (tiendaId: string | null) => void;
};

export const useClientAuthStore = create<TClientAuthStore>()(
  persist(
    (set, get) => ({
      cliente: null,
      token: null,
      expiraEn: null,
      tiendaId: null,
      isAuthenticated: false,
      sessions: {},

      login: (cliente, token, expiraEn, tiendaId) => {
        const sessions = { ...get().sessions };
        sessions[tiendaId] = { cliente, token, expiraEn };
        set({
          sessions,
          cliente,
          token,
          expiraEn,
          tiendaId,
          isAuthenticated: true,
        });
      },

      logout: () => {
        const activeTiendaId = get().tiendaId;
        const sessions = { ...get().sessions };
        if (activeTiendaId) {
          delete sessions[activeTiendaId];
        }
        set({
          sessions,
          cliente: null,
          token: null,
          expiraEn: null,
          tiendaId: activeTiendaId,
          isAuthenticated: false,
        });
      },

      isSessionExpired: () => {
        const state = get();
        if (!state.expiraEn) return false;
        return Date.now() > state.expiraEn;
      },

      selectTenant: (tiendaId) => {
        if (!tiendaId) {
          set({
            cliente: null,
            token: null,
            expiraEn: null,
            tiendaId: null,
            isAuthenticated: false,
          });
          return;
        }

        const session = get().sessions?.[tiendaId];
        if (session) {
          set({
            cliente: session.cliente,
            token: session.token,
            expiraEn: session.expiraEn,
            tiendaId: tiendaId,
            isAuthenticated: true,
          });
        } else {
          set({
            cliente: null,
            token: null,
            expiraEn: null,
            tiendaId: tiendaId,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "elohim-client-auth",
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (typeof window !== "undefined") {
            const activeTenantId = window.localStorage.getItem("active_tenant_id");
            if (activeTenantId) {
              state.selectTenant(activeTenantId);
            }
          }
        }
      },
    }
  )
);
