import type { IconType } from "react-icons";
import {
  FaBoxOpen,
  FaChevronDown,
  FaCoffee,
  FaGamepad,
  FaKey,
  FaMobileAlt,
  FaPaw,
  FaShoppingCart,
  FaStore,
  FaTruck,
  FaUsers,
} from "react-icons/fa";
import { BLOG_USE_CASES, type BlogUseCase } from "@/data/blog-use-cases";

const ICONS: Record<BlogUseCase["icon"], IconType> = {
  cart: FaShoppingCart,
  gaming: FaGamepad,
  pickup: FaTruck,
  mobile: FaMobileAlt,
  users: FaUsers,
  health: FaStore,
  security: FaKey,
  wholesale: FaBoxOpen,
  coffee: FaCoffee,
  pet: FaPaw,
};

const ACCENTS: Record<
  BlogUseCase["accent"],
  { badge: string; icon: string; line: string; glow: string }
> = {
  emerald: {
    badge: "border-[#22D3A6]/25! bg-[#22D3A6]/10! text-[#5EE8C2]!",
    icon: "border-[#22D3A6]/20! bg-[#22D3A6]/10! text-[#22D3A6]!",
    line: "from-[#22D3A6]!",
    glow: "bg-[#22D3A6]/10!",
  },
  violet: {
    badge: "border-[#818CF8]/25! bg-[#818CF8]/10! text-[#A5B4FC]!",
    icon: "border-[#818CF8]/20! bg-[#818CF8]/10! text-[#818CF8]!",
    line: "from-[#818CF8]!",
    glow: "bg-[#818CF8]/10!",
  },
  sky: {
    badge: "border-[#38BDF8]/25! bg-[#38BDF8]/10! text-[#7DD3FC]!",
    icon: "border-[#38BDF8]/20! bg-[#38BDF8]/10! text-[#38BDF8]!",
    line: "from-[#38BDF8]!",
    glow: "bg-[#38BDF8]/10!",
  },
  amber: {
    badge: "border-[#F59E0B]/25! bg-[#F59E0B]/10! text-[#FBBF24]!",
    icon: "border-[#F59E0B]/20! bg-[#F59E0B]/10! text-[#F59E0B]!",
    line: "from-[#F59E0B]!",
    glow: "bg-[#F59E0B]/10!",
  },
  rose: {
    badge: "border-[#F472B6]/25! bg-[#F472B6]/10! text-[#F9A8D4]!",
    icon: "border-[#F472B6]/20! bg-[#F472B6]/10! text-[#F472B6]!",
    line: "from-[#F472B6]!",
    glow: "bg-[#F472B6]/10!",
  },
};

export function UseCasesBlog() {
  return (
    <section
      id="blog"
      aria-labelledby="blog-title"
      className="relative! overflow-hidden! border-t! border-slate-800/40! px-4! py-24!"
    >
      <div className="pointer-events-none! absolute! inset-x-0! top-0! mx-auto! h-72! max-w-5xl! bg-gradient-to-b! from-[#22D3A6]/5! to-transparent! blur-3xl!" />

      <div className="relative! mx-auto! max-w-7xl!">
        <header className="mx-auto! mb-14! max-w-3xl! text-center!">
          <div className="mb-4! inline-flex! items-center! gap-2! rounded-full! border! border-[#22D3A6]/20! bg-[#22D3A6]/10! px-3! py-1! text-xs! font-bold! text-[#5EE8C2]!">
            <span className="h-1.5! w-1.5! rounded-full! bg-[#22D3A6]!" />
            Blog · Casos de uso
          </div>
          <h2
            id="blog-title"
            className="text-3xl! font-black! leading-tight! text-white! sm:text-5xl!"
          >
            Diez necesidades reales, una tienda preparada
          </h2>
          <p className="mt-5! text-base! leading-relaxed! text-slate-400! sm:text-lg!">
            Historias breves para descubrir cómo clientes y equipos usan DM Hub,
            desde el primer clic hasta el retiro en sucursal.
          </p>

          <div className="mt-7! flex! flex-wrap! items-center! justify-center! gap-2! text-[11px]! font-bold! uppercase! tracking-[0.14em]! text-slate-500!">
            <span className="rounded-full! border! border-slate-800! bg-slate-900/60! px-3! py-1.5!">
              10 casos
            </span>
            <span className="rounded-full! border! border-slate-800! bg-slate-900/60! px-3! py-1.5!">
              6 bloques temáticos
            </span>
            <span className="rounded-full! border! border-slate-800! bg-slate-900/60! px-3! py-1.5!">
              Recorridos end-to-end
            </span>
          </div>
        </header>

        <div className="grid! grid-cols-1! gap-6! lg:grid-cols-2!">
          {BLOG_USE_CASES.map((useCase) => {
            const Icon = ICONS[useCase.icon];
            const accent = ACCENTS[useCase.accent];

            return (
              <article
                key={useCase.id}
                className="group! relative! flex! flex-col! overflow-hidden! rounded-3xl! border! border-slate-800/80! bg-[#09131d]/85! p-6! shadow-[0_20px_70px_rgba(0,0,0,0.18)]! transition-all! duration-300! hover:-translate-y-1! hover:border-slate-700! sm:p-8!"
              >
                <div
                  className={`pointer-events-none! absolute! -right-16! -top-16! h-40! w-40! rounded-full! blur-3xl! transition-opacity! duration-300! group-hover:opacity-100! ${accent.glow}`}
                />
                <div
                  className={`absolute! inset-x-8! top-0! h-px! bg-gradient-to-r! to-transparent! opacity-60! ${accent.line}`}
                />

                <div className="relative! flex! h-full! flex-col!">
                  <div className="flex! items-start! justify-between! gap-4!">
                    <div
                      className={`flex! h-11! w-11! shrink-0! items-center! justify-center! rounded-2xl! border! text-lg! ${accent.icon}`}
                    >
                      <Icon aria-hidden="true" />
                    </div>
                    <div className="flex! flex-wrap! justify-end! gap-2!">
                      <span
                        className={`rounded-full! border! px-2.5! py-1! text-[10px]! font-bold! uppercase! tracking-wider! ${accent.badge}`}
                      >
                        Caso {String(useCase.id).padStart(2, "0")}
                      </span>
                      <span className="rounded-full! border! border-slate-800! bg-slate-950/60! px-2.5! py-1! text-[10px]! font-semibold! text-slate-400!">
                        {useCase.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-6! text-xl! font-black! leading-snug! text-white! sm:text-2xl!">
                    {useCase.title}
                  </h3>
                  <p className="mt-3! text-sm! leading-relaxed! text-slate-400!">
                    {useCase.scenario}
                  </p>

                  <blockquote className="mt-6! rounded-2xl! border! border-slate-800/80! bg-slate-950/55! p-4! text-sm! leading-relaxed! text-slate-300!">
                    <span className="font-bold! text-white!">Como </span>
                    {useCase.actor},{" "}
                    <span className="font-bold! text-white!">quiero </span>
                    {useCase.goal},{" "}
                    <span className="font-bold! text-white!">para </span>
                    {useCase.benefit}.
                  </blockquote>

                  <div className="mt-5! flex! flex-wrap! gap-2!">
                    {useCase.actions.map((action) => (
                      <span
                        key={action}
                        className="rounded-lg! border! border-slate-800! bg-slate-900/70! px-2.5! py-1.5! text-[10px]! font-semibold! text-slate-400!"
                      >
                        {action}
                      </span>
                    ))}
                  </div>

                  <details className="group/details mt-6! border-t! border-slate-800/80! pt-5!">
                    <summary className="flex! cursor-pointer! list-none! items-center! justify-between! gap-4! text-xs! font-bold! text-slate-200! outline-none! transition-colors! hover:text-[#22D3A6]! focus-visible:text-[#22D3A6]! [&::-webkit-details-marker]:hidden!">
                      Ver recorrido completo
                      <span
                        aria-hidden="true"
                        className="flex! h-7! w-7! items-center! justify-center! rounded-full! border! border-slate-700! text-slate-400! transition-transform! duration-200! group-open/details:rotate-180!"
                      >
                        <FaChevronDown className="text-[10px]!" />
                      </span>
                    </summary>

                    <div className="mt-5! grid! gap-5! sm:grid-cols-[1fr_0.8fr]!">
                      <ol className="space-y-3!">
                        {useCase.flow.map((step, index) => (
                          <li
                            key={step}
                            className="flex! gap-3! text-xs! leading-relaxed! text-slate-400!"
                          >
                            <span className="flex! h-5! w-5! shrink-0! items-center! justify-center! rounded-full! bg-slate-800! text-[9px]! font-black! text-slate-300!">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <div className="rounded-2xl! border! border-[#22D3A6]/15! bg-[#22D3A6]/5! p-4!">
                        <p className="text-[10px]! font-black! uppercase! tracking-[0.14em]! text-[#5EE8C2]!">
                          Impacto
                        </p>
                        <p className="mt-2! text-xs! leading-relaxed! text-slate-300!">
                          {useCase.impact}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
