"use client";

import { MetodoPagoShell } from "@/components/features/pago/pago";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShopNavbarActions } from "@/components/ui/ShopNavbarActions";

export default function MetodoPagoPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/resumenCompra");
  };

  const handleBack = () => {
    router.push("/carrito");
  };

  return (
    <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
      {/* Background decorations */}
      <div className="pointer-events-none! absolute! inset-0! bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]!" />
      <div className="pointer-events-none! absolute! left-1/2! top-10! h-32! w-32! -translate-x-1/2! rounded-full! bg-blue-500/10! blur-3xl!" />

      <div className="relative! flex! min-h-screen! flex-col!">
        {/* Header */}
        <div className="px-4! py-6! sm:px-6! lg:px-8!">
          <div className="rounded-3xl! border! border-slate-200/80! bg-white/95! p-4! shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm! sm:p-6! lg:p-8!">
            <div className="mb-4! flex! flex-wrap! items-center! justify-between! gap-3! sm:mb-8! sm:gap-6!">
              <div className="flex! items-center! gap-4! p-4!">
                <div className="flex! h-7! w-7! items-center! justify-center! rounded-md! bg-blue-600! text-white! shadow-sm!">
                  <svg
                    className="h-4! w-4!"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-sm! font-semibold! tracking-tight! text-gray-900!">
                    <Link href="/">ESMIRNA</Link>
                  </span>
                </div>
              </div>
              <ShopNavbarActions showCart showCatalog />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1! w-full! px-4! py-8! sm:px-6! sm:py-12! lg:px-12!">
          <div className="w-full! mx-auto! max-w-2xl!">
            {/* Breadcrumb / Progreso */}
            <div className="mb-8!">
              <div className="flex! items-center! justify-center! gap-2! text-sm! text-slate-600! font-medium!">
                <div className="flex! items-center! justify-center! w-8! h-8! rounded-full! bg-blue-600! text-white!">
                  1
                </div>
                <span className="text-blue-600! font-semibold!">Carrito</span>
                <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex! items-center! justify-center! w-8! h-8! rounded-full! bg-blue-600! text-white!">
                  2
                </div>
                <span className="text-blue-600! font-semibold!">Método</span>
                <svg className="h-4! w-4!" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex! items-center! justify-center! w-8! h-8! rounded-full! border-2! border-slate-300! text-slate-400!">
                  3
                </div>
                <span className="text-slate-400!">Resumen</span>
              </div>
            </div>

            {/* Botón Atrás */}
            <div className="mb-8!">
              <button
                onClick={handleBack}
                className="flex! items-center! gap-2! px-4! py-2! rounded-lg! border! border-slate-200! text-slate-700! hover:bg-slate-50! transition-colors! font-medium!"
              >
                <svg
                  className="h-4! w-4!"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Atrás
              </button>
            </div>

            <MetodoPagoShell onContinue={handleContinue} />
          </div>
        </main>
      </div>
    </div>
  );
}
