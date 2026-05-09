"use client";

import { CarritoShell } from "@/components/features/carrito/CarritoShell";
import { useRouter } from "next/navigation";
import { CiLogout, CiBoxList } from "react-icons/ci";
import Link from "next/link";
import { logout as logoutRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

export default function CarritoPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      if (token) {
        await logoutRequest(token);
      }
    } catch {
      // Ignorar error remoto
    } finally {
      logout();
      router.push("/login");
    }
  };

  const handleReservar = async () => {
    try {
      const fakeResponse = {
        codigo: Math.floor(Math.random() * 100000),
      };

      toast.success("Reservación creada exitosamente", {
        description: `Código: ${fakeResponse.codigo}`,
      });

      setTimeout(() => {
        router.push("/perfil");
      }, 1500);

    } catch {
      toast.error("Error al crear la reservación");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-slate-900">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">

        {/* HEADER */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between gap-6 mb-8">

              <div className="flex items-center gap-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
                  ⚡
                </div>
                <span className="text-sm font-semibold">
                  <Link href="/">ESMIRNA</Link>
                </span>
              </div>

              <div className="flex items-center gap-4">

                <Link href="/catalogo" className="p-2 hover:bg-slate-100 rounded-lg">
                  <CiBoxList className="text-2xl" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg"
                >
                  <CiLogout className="text-2xl" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <main className="flex-1 px-6 py-12 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            <CarritoShell>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-bold">
                  Productos seleccionados
                </h2>
              </div>
            </CarritoShell>

            <div className="lg:col-span-3 flex justify-end mt-6">
              <button
                onClick={handleReservar}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Reservar pedido
              </button>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}