"use client";

import { CarritoShell } from "@/components/features/carrito/CarritoShell";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShopNavbarActions } from "@/components/ui/ShopNavbarActions";

export default function CarritoPage() {
  const router = useRouter();

  const handleContinuarAlMetodo = () => {
    router.push("/metodoPago");
  };

  return (
    <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">

      {/* Background decorations */}
      <div className="pointer-events-none! absolute! inset-0! bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]!" />
      <div className="pointer-events-none! absolute! left-1/2! top-10! h-32! w-32! -translate-x-1/2! rounded-full! bg-blue-500/10! blur-3xl!" />

      <div className="relative! flex! min-h-screen! flex-col!">

        {/* Header */}
        <div className="px-4! py-4! sm:px-6! sm:py-6! lg:px-8!">
          <div className="rounded-3xl! border! border-slate-200/80! bg-white/95! p-3! shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm! sm:p-4!">
            <div className="flex! flex-wrap! items-center! justify-between! gap-3! sm:gap-6!">
              <div className="flex! min-w-0! items-center! gap-3! p-2! sm:gap-4! sm:p-4!">
                <div className="flex! h-7! w-7! items-center! justify-center! rounded-md! bg-blue-600! text-white! shadow-sm!">
                  <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm! font-semibold! tracking-tight! text-gray-900!">
                    <Link href="/">ESMIRNA</Link>
                  </span>
                </div>
              </div>
              <ShopNavbarActions showCart={false} showCatalog />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1! w-full! px-4! py-8! sm:px-6! sm:py-12! lg:px-12!">
          <div className="mx-auto! grid! w-full! max-w-5xl! grid-cols-1! gap-8! lg:grid-cols-3! lg:gap-10!">
            <div className="col-span-1! lg:col-span-3! mb-2! sm:mb-6!">
              <div className="flex! flex-wrap! items-center! justify-center! gap-1.5! text-xs! font-medium! text-slate-600! sm:gap-2! sm:text-sm!">
                <div className="flex! items-center! justify-center! w-7! h-7! sm:w-8! sm:h-8! rounded-full! bg-blue-600! text-white! text-xs!">
                  1
                </div>
                <span className="text-blue-600! font-semibold!">Carrito</span>
                <svg className="h-3! w-3! sm:h-4! sm:w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex! items-center! justify-center! w-7! h-7! sm:w-8! sm:h-8! rounded-full! border-2! border-slate-300! text-slate-400!">
                  2
                </div>
                <span className="hidden! text-slate-400! sm:inline!">Método</span>
                <svg className="h-3! w-3! text-slate-300! sm:h-4! sm:w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex! items-center! justify-center! w-7! h-7! sm:w-8! sm:h-8! rounded-full! border-2! border-slate-300! text-slate-400!">
                  3
                </div>
                <span className="hidden! text-slate-400! sm:inline!">Resumen</span>
              </div>
            </div>
            <CarritoShell>
              <div className="flex! items-center! gap-4! mb-8!">
                <h2 className="text-2xl! font-bold! text-slate-900!">
                  Productos seleccionados
                </h2>
              </div>
            </CarritoShell>

            <div className="col-span-1! lg:col-span-3! flex! justify-stretch! sm:justify-end!">
              <button
                onClick={handleContinuarAlMetodo}
                className="inline-flex! w-full! items-center! justify-center! rounded-full! bg-blue-600! px-6! py-3! text-sm! font-semibold! text-white! transition! hover:bg-blue-700! sm:w-auto!"
              >
                Continuar a método de pago
              </button>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}