import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  eyebrow?: string;
  footerLeft?: ReactNode;
  footerRight?: ReactNode;
  topRight?: ReactNode;
};

export function AuthShell({
  children,
  title,
  description,
  eyebrow = "ELOHIM TIENDA ONLINE",
  footerLeft,
  footerRight,
  topRight,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fc] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_26%),linear-gradient(to_bottom,#ffffff_0%,#f4f7fb_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <span className="text-sm leading-none">🛍</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">
                {eyebrow}
              </p>
            </div>
          </div>
          {topRight ? <div className="hidden sm:block">{topRight}</div> : null}
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-245 lg:grid lg:grid-cols-[1fr_420px] lg:items-center lg:gap-12">
            <section className="hidden lg:block">
              <div className="relative rounded-4xl border border-white/70 bg-white/70 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Compra con más claridad
                </p>
                <h1 className="max-w-md text-5xl font-black tracking-tight text-slate-950">
                  Una experiencia de compra más simple y ordenada.
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
                  Diseñamos una entrada limpia, centrada y rápida para que tus clientes se conecten sin distracciones.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Acceso", "Rápido y claro"],
                    ["Soporte", "Ayuda visible"],
                    ["Compra", "Menos fricción"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mx-auto w-full max-w-105">
              <div className="rounded-4xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-sm sm:p-8">
                <div className="mb-8 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-700">
                    {eyebrow}
                  </p>
                  <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.35rem)] font-black tracking-tight text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </div>

                {children}
              </div>

              {(footerLeft || footerRight) && (
                <div className="mt-6 flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <div>{footerLeft}</div>
                  <div>{footerRight}</div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}