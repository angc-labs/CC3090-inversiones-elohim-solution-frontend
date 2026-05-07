import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TMetodoPago = {
  id: string;
  stripePaymentMethodId: string;
  alias: string;
  marca: "visa" | "mastercard" | "amex";
  ultimosDigitos: string;
  expiraMes: number;
  expiraAnio: number;
};

export type TMetodoPagoSeleccionado = {
  id: string;
  metodo: "transferencia" | "tarjeta" | "efectivo" | "paypal";
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

      seleccionarMetodoPago: (metodo) =>
        set({ metodoPagoSeleccionado: metodo }),

      limpiarMetodoPago: () =>
        set({ metodoPagoSeleccionado: null }),
    }),
    { name: "elohim-metodo-pago" }
  )
);
