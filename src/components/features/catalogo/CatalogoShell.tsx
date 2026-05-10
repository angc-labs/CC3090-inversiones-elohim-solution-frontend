"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ShopNavbarActions } from "@/components/ui/ShopNavbarActions";

type CatalogoShellProps = {
  children: ReactNode;
  eyebrow?: string;
  showSidebar?: boolean;
};

export function CatalogoShell({
  children,
  eyebrow = "CATÁLOGO DE PRODUCTOS",
  showSidebar = false,
}: CatalogoShellProps) {
  return (
    <div className="relative! min-h-screen! bg-[#f6f8fc]! text-slate-900!">
      {/* Background decorations */}
      <div className="pointer-events-none! absolute! inset-0! bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]!" />
      <div className="pointer-events-none! absolute! left-1/2! top-10! h-32! w-32! -translate-x-1/2! rounded-full! bg-blue-500/10! blur-3xl!" />

      <div className="relative! flex! min-h-screen! flex-col!">
        {/* Header Card with Search */}
        <div className="px-4! py-6! sm:px-6! lg:px-8!">
          <div className="rounded-3xl! border! border-slate-200/80! bg-white/95! p-4! shadow-[0_24px_70px_rgba(15,23,42,0.10)]! backdrop-blur-sm!">
            <div className="flex! items-center! justify-between! gap-6!">
              <div className="flex! items-center! gap-4! p-4!">
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
              <ShopNavbarActions showCart showCatalog={false} />
            </div>
          </div>
        </div>
        {/* Main content */}
        <main className="flex! flex-1! px-4! py-4! sm:px-6! lg:px-8!">
          <div className="w-full! max-w-7xl! mx-auto!">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}