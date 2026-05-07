"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CiShoppingCart, CiUser } from "react-icons/ci";
import { MdArrowBack } from "react-icons/md";
import { useCarrito } from "@/hooks/useCarrito";
import { useConfirmarReservacion } from "@/hooks/useConfirmarReservacion";
import { useAuthStore } from "@/stores/useAuthStore";
import { BankTransferDetails } from "@/components/features/carrito/BankTransferDetails";

export default function TransferenciaBancariaPage() {
  const router = useRouter();
  const { items, total } = useCarrito();
  const { confirmar, isLoading, error } = useConfirmarReservacion();
  const usuario = useAuthStore((state) => state.usuario);

  const handleConfirm = async (observaciones?: string) => {
    const reservacion = await confirmar("transferencia", observaciones);
    if (reservacion) {
      router.push(`/carrito/confirmado/${reservacion.idReservacion}`);
    }
  };

  // Si no hay items en el carrito, mostrar mensaje
  if (!items.length) {
    return (
      <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex min-h-screen flex-col">
          {/* Header */}
          <div className="px-4! py-6! sm:px-6! lg:px-8!">
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm!">
              <div className="flex items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4 p-4!">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold tracking-tight text-gray-900">
                      <Link href="/">ESMIRNA</Link>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4! mr-4!">
                  <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                    <Link href="/catalogo" className="flex items-center gap-2! text-slate-700 font-medium">
                      <CiShoppingCart className="text-2xl" />
                    </Link>
                  </button>
                  <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                    <CiUser className="text-2xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1! px-6! py-12! sm:px-8! lg:px-12! w-full!">
            <div className="w-full! mx-auto max-w-2xl">
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-12! text-center shadow-md backdrop-blur-sm">
                <h1 className="text-3xl! font-bold text-slate-900 mb-4">
                  Transferencia Bancaria
                </h1>
                <p className="text-slate-600 mb-8">
                  Tu carrito está vacío. Agrega productos antes de proceder con el pago.
                </p>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-full font-semibold hover:shadow-md transition-shadow"
                >
                  Ir al catálogo
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!usuario) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <div className="px-4! py-6! sm:px-6! lg:px-8!">
          <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm!">
            <div className="flex items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4 p-4!">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold tracking-tight text-gray-900">
                    <Link href="/">ESMIRNA</Link>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4! mr-4!">
                <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                  <Link href="/carrito" className="flex items-center gap-2! text-slate-700 font-medium">
                    <CiShoppingCart className="text-2xl" />
                  </Link>
                </button>
                <button className="p-2! hover:bg-slate-100 rounded-lg transition-colors">
                  <CiUser className="text-2xl" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1! px-6! py-12! sm:px-8! lg:px-12! w-full!">
          <div className="w-full! mx-auto grid! grid-cols-1! lg:grid-cols-3! gap-10!">
            {/* Left: Formulario */}
            <div className="lg:col-span-2! space-y-8!">
              {/* Título */}
              <div className="flex items-center gap-3">
                <h1 className="text-3xl! font-bold text-slate-900">
                  Pago por Transferencia Bancaria
                </h1>
              </div>

              {/* Componente de transferencia */}
              <BankTransferDetails
                onConfirm={handleConfirm}
                isLoading={isLoading}
              />

              {/* Error message */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6! text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Botón volver */}
              <div className="flex flex-col! sm:flex-row! gap-4! pt-6!">
                <Link
                  href="/carrito"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  <MdArrowBack className="text-lg" />
                  Volver al carrito
                </Link>
              </div>
            </div>

            {/* Right: Resumen de totales */}
            <div className="lg:col-span-1!">
              <div className="sticky! top-8! rounded-2xl border border-slate-200/80 bg-white/95 p-6! shadow-md backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Resumen</h3>

                <div className="space-y-3! text-sm mb-6!">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>Q {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Envío</span>
                    <span>Q 0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Impuesto</span>
                    <span>Q 0.00</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 pt-4!">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl! font-bold text-blue-600">Q {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6! p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Nota:</span> Tu reservación será confirmada una vez que recibamos tu pago.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}