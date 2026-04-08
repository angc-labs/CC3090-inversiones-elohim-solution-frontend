import { create } from "zustand";

type TUiStore = {
  sidebarAbierto: boolean;
  modalConfirmacion: boolean;
  toggleSidebar: () => void;
  abrirModalConfirmacion: () => void;
  cerrarModalConfirmacion: () => void;
};

export const useUiStore = create<TUiStore>((set) => ({
  sidebarAbierto: false,
  modalConfirmacion: false,
  toggleSidebar: () => set((state) => ({ sidebarAbierto: !state.sidebarAbierto })),
  abrirModalConfirmacion: () => set({ modalConfirmacion: true }),
  cerrarModalConfirmacion: () => set({ modalConfirmacion: false }),
}));