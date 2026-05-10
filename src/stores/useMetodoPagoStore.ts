import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TMetodoPagoSeleccionado = {
  /** `idMetodoPago` del backend */
  id: string;
  metodo: "efectivo" | "tarjeta";
  tipoTransaccion: "anticipada" | "contraentrega";
  alias?: string;
};

type TMetodoPagoStore = {
  metodoPagoSeleccionado: TMetodoPagoSeleccionado | null;
  seleccionarMetodoPago: (metodo: TMetodoPagoSeleccionado) => void;
  limpiarMetodoPago: () => void;
};

export const useMetodoPagoStore = create<TMetodoPagoStore>()(
  persist(
    (set) => ({
      metodoPagoSeleccionado: null,

      seleccionarMetodoPago: (metodo) => set({ metodoPagoSeleccionado: metodo }),

      limpiarMetodoPago: () => set({ metodoPagoSeleccionado: null }),
    }),
    { name: "elohim-metodo-pago" }
  )
);
