import Link from "next/link";
import { ArrowLeft, Home, ShieldAlert, Store } from "lucide-react";

type StoreNotFoundViewProps = {
  variant: "store" | "portal";
};

export function StoreNotFoundView({ variant }: StoreNotFoundViewProps) {
  const isPortal = variant === "portal";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-120px] top-14 h-72 w-72 rounded-full bg-[#1AB38C]/12 blur-3xl" />
        <div className="absolute right-[-80px] top-24 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(26,179,140,0.14),rgba(250,250,250,0.65)_44%,#ffffff)] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="space-y-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1AB38C] text-white shadow-lg shadow-[#1AB38C]/25">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#1AB38C]">{isPortal ? "Portal administrativo" : "Tienda"}</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Página no encontrada</h1>
                </div>
                <p className="max-w-lg text-sm leading-6 text-slate-600">
                  {isPortal
                    ? "La ruta del portal que intentaste abrir no existe o fue movida. Vuelve al panel principal para seguir administrando la tienda."
                    : "La tienda no encontró esa ruta. Revisa la dirección o vuelve al escaparate para seguir navegando."}
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
                  <Store className="h-5 w-5 text-[#1AB38C]" />
                  <p className="mt-3 text-sm font-bold text-slate-950">Estilo de tienda</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Interfaz ligera, clara y con el mismo acento visual del storefront.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
                  <Home className="h-5 w-5 text-[#1AB38C]" />
                  <p className="mt-3 text-sm font-bold text-slate-950">Acceso seguro</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Redirige al inicio para encontrar la ruta correcta sin perder contexto.</p>
                </div>
              </div>
            </section>

            <section className="flex flex-col justify-center gap-6 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">404</p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {isPortal ? "Ruta de administración ausente" : "Ruta de tienda ausente"}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {isPortal
                    ? "Los accesos del portal tienen su propia navegación. Regresa al tablero principal para continuar."
                    : "Si llegaste desde un enlace o una navegación interna, puedes regresar al escaparate principal o al perfil."}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={isPortal ? "/portal" : "/"}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {isPortal ? "Volver al portal" : "Volver a la tienda"}
                </Link>
                <Link
                  href={isPortal ? "/" : "/perfil"}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Home className="h-4 w-4 text-[#1AB38C]" />
                  {isPortal ? "Ir a la tienda" : "Abrir mi perfil"}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
