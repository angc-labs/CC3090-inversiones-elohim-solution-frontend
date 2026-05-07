"use client";

import { useState, useEffect } from "react";
import type { TMetodoPago, TMetodoPagoSeleccionado } from "@/stores/useMetodoPagoStore";
import { useMetodoPagoStore } from "@/stores/useMetodoPagoStore";
import { obtenerMetodosPago } from "@/lib/api/pago";
import { useAuthStore } from "@/stores/useAuthStore";

type MetodoPagoShellProps = {
  onContinue?: () => void;
};

// Tipos de transacción
type TMetodo = "transferencia" | "tarjeta" | "efectivo" | "paypal";
type TTipoTransaccion = "anticipada" | "contraentrega";

// Configuración de compatibilidad entre métodos y tipos de transacción
const COMPATIBILIDAD_METODOS: Record<TMetodo, TTipoTransaccion[]> = {
  transferencia: ["anticipada"],
  tarjeta: ["anticipada"],
  paypal: ["anticipada"],
  efectivo: ["contraentrega"],
};

// Métodos disponibles con su información
const METODOS_PAGO_DISPONIBLES: Record<TMetodo, { nombre: string; descripcion: string; icono: string }> = {
  transferencia: {
    nombre: "Transferencia bancaria",
    descripcion: "Realiza una transferencia directa a nuestra cuenta bancaria",
    icono: "🏦",
  },
  tarjeta: {
    nombre: "Pago con tarjeta",
    descripcion: "Realiza el pago con tu tarjeta de crédito o débito",
    icono: "💳",
  },
  efectivo: {
    nombre: "Pago en efectivo",
    descripcion: "Realiza el pago en efectivo al recibir tu pedido",
    icono: "💵",
  },
  paypal: {
    nombre: "PayPal",
    descripcion: "Realiza el pago de forma segura con tu cuenta de PayPal",
    icono: "🅿️",
  },
};

// Tipos de transacción disponibles
const TIPOS_TRANSACCION_DISPONIBLES: Record<TTipoTransaccion, { nombre: string; descripcion: string; icono: string }> = {
  anticipada: {
    nombre: "Pago Anticipado",
    descripcion: "Realiza el pago ahora y recibe tu pedido después",
    icono: "⏰",
  },
  contraentrega: {
    nombre: "Contra Entrega",
    descripcion: "Realiza el pago cuando recibas tu pedido",
    icono: "📦",
  },
};

export function MetodoPagoShell({ onContinue }: MetodoPagoShellProps) {
  const [selectedTipoTransaccion, setSelectedTipoTransaccion] = useState<TTipoTransaccion | null>(
    null
  );
  const [selectedMetodoId, setSelectedMetodoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { metodoPagoSeleccionado, seleccionarMetodoPago } = useMetodoPagoStore();
  const token = useAuthStore((state) => state.token);
  const [metodosTarjeta, setMetodosTarjeta] = useState<TMetodoPago[]>([]);

  useEffect(() => {
    if (metodoPagoSeleccionado) {
      setSelectedTipoTransaccion(metodoPagoSeleccionado.tipoTransaccion);
      setSelectedMetodoId(metodoPagoSeleccionado.id);
    }
  }, [metodoPagoSeleccionado]);

  useEffect(() => {
    const cargarMetodosTarjeta = async () => {
      if (!token) return;
      try {
        const metodos = await obtenerMetodosPago(token);
        setMetodosTarjeta(metodos);
      } catch {
        // Si hay error, continuamos con los métodos predefinidos
        console.error("Error al cargar métodos de pago");
      }
    };

    void cargarMetodosTarjeta();
  }, [token]);

  const handleSelectTipoTransaccion = (tipo: TTipoTransaccion) => {
    setSelectedTipoTransaccion(tipo);
    setSelectedMetodoId(null);
    setError(null);
  };

  const handleSelectMetodo = (id: string, metodo: TMetodo) => {
    setSelectedMetodoId(id);
    setError(null);

    if (!selectedTipoTransaccion) {
      setError("Por favor, selecciona un tipo de transaccion primero");
      return;
    }

    const metodoPago: TMetodoPagoSeleccionado = {
      id,
      metodo,
      tipoTransaccion: selectedTipoTransaccion,
      alias: metodo === "tarjeta" ? metodosTarjeta.find((m) => m.id === id)?.alias : undefined,
    };
    seleccionarMetodoPago(metodoPago);
  };

  const handleContinuar = () => {
    if (!selectedTipoTransaccion) {
      setError("Por favor, selecciona un tipo de transaccion");
      return;
    }
    if (!selectedMetodoId) {
      setError("Por favor, selecciona un metodo de pago");
      return;
    }
    setError(null);
    onContinue?.();
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Finaliza tu compra
        </h2>
        <p className="text-slate-600">Elige cómo deseas pagar y recibir tu pedido</p>
      </div>

      {/* Paso 1: Seleccionar tipo de transacción */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Paso 1: ¿Cuándo deseas pagar?
        </h3>
        <div className="space-y-3">
          {(Object.entries(TIPOS_TRANSACCION_DISPONIBLES) as Array<
            [TTipoTransaccion, { nombre: string; descripcion: string; icono: string }]
          >).map(([tipo, info]) => (
            <div
              key={tipo}
              onClick={() => handleSelectTipoTransaccion(tipo)}
              className={`relative cursor-pointer rounded-xl border-2 transition-all p-5 ${
                selectedTipoTransaccion === tipo
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Radio button */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all ${
                    selectedTipoTransaccion === tipo
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedTipoTransaccion === tipo && (
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.icono}</span>
                    <h4 className="font-semibold text-slate-900">{info.nombre}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{info.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paso 2: Seleccionar método de pago */}
      {selectedTipoTransaccion && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Paso 2: Elige tu método de pago
          </h3>
          <div className="space-y-3">
            {(Object.entries(METODOS_PAGO_DISPONIBLES) as Array<
              [TMetodo, { nombre: string; descripcion: string; icono: string }]
            >)
              .filter(([metodo]) => COMPATIBILIDAD_METODOS[metodo].includes(selectedTipoTransaccion))
              .map(([metodo, info]) => (
                <div
                  key={metodo}
                  onClick={() => handleSelectMetodo(metodo, metodo)}
                  className={`relative cursor-pointer rounded-xl border-2 transition-all p-5 ${
                    selectedMetodoId === metodo
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Radio button */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all ${
                        selectedMetodoId === metodo
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedMetodoId === metodo && (
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{info.icono}</span>
                        <h4 className="font-semibold text-slate-900">{info.nombre}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{info.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tarjetas guardadas (solo si se selecciona tarjeta y es anticipada) */}
      {selectedTipoTransaccion === "anticipada" &&
        selectedMetodoId === "tarjeta" &&
        metodosTarjeta.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">O usa una tarjeta guardada</h3>
            <div className="space-y-3">
              {metodosTarjeta.map((tarjeta) => (
                <div
                  key={tarjeta.id}
                  onClick={() => handleSelectMetodo(tarjeta.id, "tarjeta")}
                  className={`relative cursor-pointer rounded-xl border-2 transition-all p-5 ${
                    selectedMetodoId === tarjeta.id
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Radio button */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all ${
                        selectedMetodoId === tarjeta.id
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selectedMetodoId === tarjeta.id && (
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Contenido de tarjeta */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-100">
                          <span className="text-xs font-bold text-slate-600">
                            {tarjeta.marca.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{tarjeta.alias}</h4>
                          <p className="text-sm text-slate-600">
                            •••• {tarjeta.ultimosDigitos} • {tarjeta.expiraMes}/{tarjeta.expiraAnio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Mensaje de error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Botón continuar */}
      <button
        onClick={handleContinuar}
        disabled={isLoading || !selectedTipoTransaccion || !selectedMetodoId}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Guardando..." : "Continuar"}
      </button>
    </div>
  );
}
