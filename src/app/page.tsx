"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="relative min-h-screen bg-[#f8f8f6]">
      {/* Subtle top gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(59,130,246,0.10),transparent)]" />

      <header className="fixed top-0! z-50! w-full! border-b border-gray-100 bg-white/75 backdrop-blur-md">
        <div className="mx-auto! flex! h-14 max-w-6xl items-center! justify-between! px-4! sm:px-6! lg:px-8!">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              <Link href="/">ESMIRNA</Link>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
              className="h-8 px-4! py-2! text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/register")}
              className="h-8 px-4! rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-14">
        <div className="relative z-10 text-center max-w-2xl mx-auto">

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-xs font-medium text-blue-600 shadow-sm backdrop-blur-sm px-3! py-2!">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            </span>
            Lorem ipsum dolor
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.8rem,9vw,5.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-gray-900">
            Tienda {" "}
            <span className="text-blue-600">Elohim</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-lg text-[1.05rem] leading-relaxed text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati ea harum animi sint officiis quisquam vel natus praesentium.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              onClick={() => router.push("/login")}
              className="h-11 rounded-full bg-blue-600 px-8! text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-all hover:shadow-md"
            >
              Comenzar ahora
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/register")}
              className="h-11 rounded-full border-gray-200 bg-white px-8! text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
            >
              Crear cuenta
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}