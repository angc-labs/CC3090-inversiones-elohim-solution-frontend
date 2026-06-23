"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostLoginPath } from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  FaArrowRight,
  FaCheck,
  FaShoppingCart,
  FaPalette,
  FaLayerGroup,
  FaBoxOpen,
  FaCreditCard,
  FaCloudUploadAlt,
  FaMobileAlt,
  FaStore,
  FaRocket,
  FaGithub,
} from "react-icons/fa";
import gsap from "gsap";

const FEATURES = [
  {
    icon: <FaLayerGroup />,
    title: "Constructor Visual de Tiendas",
    desc: "Diseña tu tienda con un editor de secciones estilo Shopify. Anuncia barras, héroes, grids de productos y más — sin código.",
    accent: "#22D3A6",
  },
  {
    icon: <FaPalette />,
    title: "Diseño Completamente Tuyo",
    desc: "Colores, gradientes, glassmorphism, blur, opacidad y fuentes. Cada sección tiene opciones avanzadas para lograr el look que imaginas.",
    accent: "#818CF8",
  },
  {
    icon: <FaBoxOpen />,
    title: "Gestión de Productos e Inventario",
    desc: "Registra tu catálogo, controla stock por sucursal y configura precios mayoristas y detallistas de forma independiente.",
    accent: "#F59E0B",
  },
  {
    icon: <FaCreditCard />,
    title: "Pagos con Stripe",
    desc: "Acepta tarjetas de crédito/débito con Stripe Connect. Tus cobros, en tu cuenta. Contra entrega también disponible.",
    accent: "#60A5FA",
  },
  {
    icon: <FaCloudUploadAlt />,
    title: "Imágenes con Cloudinary",
    desc: "Sube imágenes de productos y logos directamente desde la consola. CDN de nivel mundial para tiempos de carga óptimos.",
    accent: "#34D399",
  },
  {
    icon: <FaMobileAlt />,
    title: "100% Responsive",
    desc: "Tu tienda se ve perfecta en cualquier dispositivo. El constructor y el storefront están optimizados para móvil, tablet y desktop.",
    accent: "#F472B6",
  },
];

const SECTIONS_DEMO = [
  { type: "Anuncio", label: "📢 Barra de Anuncio", color: "#22D3A6" },
  { type: "Header", label: "🧭 Encabezado / Nav", color: "#818CF8" },
  { type: "Hero", label: "🌟 Sección Hero", color: "#F59E0B" },
  { type: "Products", label: "📦 Grid de Productos", color: "#60A5FA" },
  { type: "RichText", label: "📝 Texto Enriquecido", color: "#34D399" },
  { type: "Footer", label: "📄 Pie de Página", color: "#F472B6" },
];

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const usuario = useAuthStore((state) => state.usuario);

  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  const [activeSection, setActiveSection] = useState(0);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (isAuthenticated && usuario) {
      router.push(getPostLoginPath(usuario.rol));
    }
  }, [isAuthenticated, router, usuario]);

  // Cycle through demo sections
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % SECTIONS_DEMO.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      gsap.set([badgeRef.current, titleRef.current, descRef.current, ctasRef.current, visualRef.current], {
        opacity: 0, y: 30,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tl.to(badgeRef.current, { opacity: 1, y: 0, delay: 0.2 })
        .to(titleRef.current, { opacity: 1, y: 0 }, "-=0.6")
        .to(descRef.current, { opacity: 1, y: 0 }, "-=0.6")
        .to(ctasRef.current, { opacity: 1, y: 0 }, "-=0.6")
        .to(visualRef.current, { opacity: 1, y: 0 }, "-=0.4");

      const revealOnScroll = (element: HTMLElement | null) => {
        if (!element) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.fromTo(element, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
                observer.unobserve(element);
              }
            });
          },
          { threshold: 0.08 }
        );
        observer.observe(element);
      };

      revealOnScroll(featuresRef.current);
      revealOnScroll(demoRef.current);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative! min-h-screen! bg-gradient-to-b! from-[#060d14]! via-[#09151f]! to-[#060d14]! text-slate-100! overflow-x-hidden! font-sans!">
      {/* Background glows */}
      <div className="pointer-events-none! fixed! top-0! left-1/4! h-[600px]! w-[600px]! -translate-x-1/2! rounded-full! bg-[#22D3A6]/8! blur-[130px]!" />
      <div className="pointer-events-none! fixed! top-1/2! right-0! h-[500px]! w-[500px]! rounded-full! bg-[#818CF8]/6! blur-[150px]!" />

      {/* ─── Navbar ─── */}
      <header className="fixed! top-0! z-50! w-full! border-b! border-slate-800/50! bg-[#060d14]/80! backdrop-blur-md!">
        <div className="mx-auto! flex! h-16! max-w-7xl! items-center! justify-between! px-4! sm:px-6! lg:px-8!">
          <div className="flex! items-center! gap-2.5!">
            <img src="/logo.png" alt="DM Hub Logo" className="h-8! w-auto! object-contain!" />
          </div>

          <nav className="hidden! md:flex! items-center! gap-8! text-sm! font-medium! text-slate-400!">
            <a href="#caracteristicas" className="hover:text-[#22D3A6]! transition-colors!">Características</a>
            <a href="#constructor" className="hover:text-[#22D3A6]! transition-colors!">Constructor</a>
            <a href="#precios" className="hover:text-[#22D3A6]! transition-colors!">Cómo funciona</a>
          </nav>

          <div className="flex! items-center! gap-3!">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login?role=administrador")}
              className="h-9! px-4! text-sm! text-slate-300! hover:text-white! hover:bg-slate-800/50! rounded-xl! transition-all!"
            >
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/register?role=administrador")}
              className="h-9! px-5! rounded-xl! bg-[#22D3A6]! hover:bg-[#1ebda1]! text-sm! font-bold! text-slate-900! shadow-[0_4px_14px_0_rgba(34,211,166,0.2)]! transition-all! hover:scale-[1.02]!"
            >
              Crear tienda gratis
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        ref={heroRef}
        className="relative! flex! min-h-screen! flex-col! items-center! justify-center! px-4! pt-24! pb-16! text-center! max-w-7xl! mx-auto!"
      >
        <div className="relative! z-10! max-w-4xl! mx-auto!">
          <div
            ref={badgeRef}
            className="mb-6! inline-flex! items-center! gap-2! rounded-full! border! border-[#22D3A6]/20! bg-[#22D3A6]/5! px-4! py-1.5! text-xs! font-medium! text-[#22D3A6]! backdrop-blur-sm!"
          >
            <span className="relative! flex! h-2! w-2!">
              <span className="absolute! inline-flex! h-full! w-full! animate-ping! rounded-full! bg-[#22D3A6]! opacity-75!" />
              <span className="relative! inline-flex! h-2! w-2! rounded-full! bg-[#22D3A6]!" />
            </span>
            Tu tienda online, con tu estilo y tus reglas
          </div>

          <h1
            ref={titleRef}
            className="text-4xl! sm:text-6xl! lg:text-7xl! font-black! tracking-tight! leading-[1.08]! text-white!"
          >
            Crea tu{" "}
            <span className="bg-clip-text! text-transparent! bg-gradient-to-r! from-[#22D3A6]! via-[#818CF8]! to-[#60A5FA]!">
              tienda en línea
            </span>
            <br className="hidden! sm:inline!" />
            {" "}en minutos
          </h1>

          <p
            ref={descRef}
            className="mx-auto! mt-6! max-w-2xl! text-base! sm:text-lg! leading-relaxed! text-slate-400!"
          >
            Diseña cada sección de tu tienda con total libertad — colores, fondos, tipografías, animaciones.
            Gestiona productos, pedidos y pagos con Stripe desde una sola consola.
          </p>

          <div
            ref={ctasRef}
            className="mt-10! flex! flex-col! sm:flex-row! items-center! justify-center! gap-4!"
          >
            <Button
              onClick={() => router.push("/register?role=administrador")}
              className="w-full! sm:w-auto! h-12! px-8! rounded-xl! bg-[#22D3A6]! text-slate-900! font-bold! hover:bg-[#1ebda1]! shadow-[0_8px_30px_rgb(34,211,166,0.15)]! transition-all! hover:scale-[1.03]! flex! items-center! justify-center! gap-2!"
            >
              Empezar gratis <FaArrowRight className="text-xs!" />
            </Button>
            <button
              onClick={() => router.push("/login?role=administrador")}
              className="w-full! sm:w-auto! h-12! px-8! rounded-xl! border! border-slate-700! bg-slate-900/40! hover:bg-slate-800/60! text-sm! font-semibold! text-slate-300! hover:text-white! transition-all! flex! items-center! justify-center! gap-2!"
            >
              <FaShoppingCart className="text-[#22D3A6]!" /> Ver mi consola
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div
          ref={visualRef}
          className="relative! mt-16! w-full! max-w-5xl! rounded-2xl! border! border-slate-800! bg-slate-950/80! p-3! shadow-2xl! shadow-black/80! backdrop-blur-sm!"
        >
          <div className="absolute! inset-0! bg-gradient-to-t! from-[#060d14]! via-transparent! to-transparent! pointer-events-none! rounded-2xl! z-10!" />

          {/* Browser chrome */}
          <div className="flex! items-center! justify-between! border-b! border-slate-800/80! px-4! pb-3! pt-1!">
            <div className="flex! items-center! gap-1.5!">
              <span className="h-3! w-3! rounded-full! bg-rose-500/80!" />
              <span className="h-3! w-3! rounded-full! bg-amber-500/80!" />
              <span className="h-3! w-3! rounded-full! bg-emerald-500/80!" />
            </div>
            <div className="text-xs! text-slate-500! font-mono! bg-slate-900! px-4! py-1! rounded-lg! border! border-slate-800!">
              dmhub.com/portal/constructor
            </div>
            <div className="w-12!" />
          </div>

          {/* Storefront builder mockup */}
          <div className="grid! grid-cols-12! gap-0! text-left! min-h-[320px]!">
            {/* Section list sidebar */}
            <div className="col-span-3! border-r! border-slate-800/60! p-3! space-y-1.5! hidden! md:block!">
              <p className="text-[9px]! font-black! text-slate-500! uppercase! tracking-wider! px-2! pb-1!">Secciones</p>
              {SECTIONS_DEMO.map((s, i) => (
                <div
                  key={s.type}
                  className={`flex! items-center! gap-2! px-2! py-1.5! rounded-lg! text-[10px]! font-semibold! transition-all! cursor-pointer! ${
                    activeSection === i
                      ? "bg-slate-800! text-white!"
                      : "text-slate-500! hover:bg-slate-900!"
                  }`}
                >
                  <span
                    className="h-1.5! w-1.5! rounded-full! flex-shrink-0!"
                    style={{ backgroundColor: activeSection === i ? s.color : "#475569" }}
                  />
                  {s.label}
                </div>
              ))}
            </div>

            {/* Live preview area */}
            <div className="col-span-12! md:col-span-6! border-r! border-slate-800/60! overflow-hidden!">
              {/* Simulated storefront sections */}
              <div
                className="h-6! flex! items-center! justify-center! text-[9px]! font-bold! transition-all! duration-500!"
                style={{ backgroundColor: "#22D3A6", color: "#0F172A" }}
              >
                🚀 ENVÍO GRATIS EN PEDIDOS SUPERIORES A Q500
              </div>
              <div className="h-8! bg-slate-900! border-b! border-slate-800! flex! items-center! px-3! justify-between!">
                <span className="text-[9px]! font-black! text-white!">✦ DM Hub</span>
                <div className="flex! gap-3! text-[8px]! text-slate-400!">
                  <span>Inicio</span><span>Catálogo</span><span>Contacto</span>
                </div>
                <span className="text-[9px]! text-slate-400!">🛒</span>
              </div>
              <div
                className="h-28! flex! flex-col! items-center! justify-center! text-center! px-4! transition-all! duration-700! relative! overflow-hidden!"
                style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
              >
                <div className="text-[11px]! font-black! text-white! leading-tight! mb-1!">Moda que te define</div>
                <div className="text-[8px]! text-slate-400! mb-3!">Descubre nuestra nueva colección</div>
                <div className="flex! gap-2!">
                  <span className="px-2.5! py-1! rounded-md! text-[8px]! font-bold! text-slate-900!" style={{ backgroundColor: "#22D3A6" }}>Ver colección</span>
                  <span className="px-2.5! py-1! rounded-md! text-[8px]! font-bold! border! border-slate-600! text-slate-400!">Ofertas</span>
                </div>
              </div>
              <div className="grid! grid-cols-3! gap-1.5! p-2!">
                {[
                  { name: "Reloj Elite", price: "Q249", color: "#22D3A6" },
                  { name: "Audio Pro", price: "Q599", color: "#818CF8" },
                  { name: "Tenis X1", price: "Q849", color: "#F59E0B" },
                ].map((p, i) => (
                  <div key={i} className="bg-slate-900! rounded-lg! p-1.5! border! border-slate-800!">
                    <div className="aspect-square! rounded! mb-1! flex! items-center! justify-center!" style={{ backgroundColor: `${p.color}18` }}>
                      <span className="text-lg!" style={{ color: p.color }}>📦</span>
                    </div>
                    <div className="text-[8px]! font-bold! text-white! truncate!">{p.name}</div>
                    <div className="text-[8px]! font-black!" style={{ color: p.color }}>{p.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties panel */}
            <div className="hidden! md:block! col-span-3! p-3! space-y-3!">
              <p className="text-[9px]! font-black! text-slate-500! uppercase! tracking-wider! px-1!">Propiedades</p>
              <div className="space-y-2!">
                {[
                  { label: "Color de fondo", value: "#0F172A", type: "color" },
                  { label: "Color de texto", value: "#FFFFFF", type: "color" },
                  { label: "Glassmorphism", value: "off", type: "toggle" },
                  { label: "Opacidad", value: "100%", type: "range" },
                ].map((p) => (
                  <div key={p.label} className="flex! items-center! justify-between! px-2! py-1.5! bg-slate-900/60! rounded-lg!">
                    <span className="text-[8px]! text-slate-400! font-medium!">{p.label}</span>
                    <span className="text-[8px]! font-bold! text-[#22D3A6]!">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section
        id="caracteristicas"
        ref={featuresRef}
        className="py-24! px-4! max-w-7xl! mx-auto! border-t! border-slate-800/40!"
      >
        <div className="text-center! max-w-3xl! mx-auto! mb-16!">
          <h2 className="text-3xl! sm:text-5xl! font-black! text-white!">
            Todo lo que necesitas
          </h2>
          <p className="mt-4! text-slate-400! text-base! sm:text-lg!">
            De cero a tienda publicada en minutos. Sin complicaciones, sin código.
          </p>
        </div>

        <div className="grid! grid-cols-1! sm:grid-cols-2! lg:grid-cols-3! gap-6!">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group! relative! bg-slate-900/30! border! border-slate-800/60! p-6! rounded-2xl! hover:border-slate-700/80! transition-all! hover:-translate-y-1! duration-300!"
            >
              <div
                className="h-11! w-11! rounded-xl! flex! items-center! justify-center! text-lg! mb-5! transition-transform! group-hover:scale-110! duration-300!"
                style={{ backgroundColor: `${f.accent}18`, color: f.accent }}
              >
                {f.icon}
              </div>
              <h4 className="text-sm! font-bold! text-white! mb-2!">{f.title}</h4>
              <p className="text-slate-400! text-xs! leading-relaxed!">{f.desc}</p>
              <div
                className="absolute! bottom-0! left-6! right-6! h-px! opacity-0! group-hover:opacity-100! transition-all! duration-300!"
                style={{ backgroundColor: f.accent }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works / Constructor Demo ─── */}
      <section
        id="constructor"
        ref={demoRef}
        className="py-24! px-4! max-w-7xl! mx-auto! border-t! border-slate-800/40!"
      >
        <div className="grid! grid-cols-1! lg:grid-cols-2! gap-16! items-center!">
          {/* Steps */}
          <div className="space-y-8!">
            <div>
              <div className="inline-flex! items-center! gap-2! rounded-full! bg-[#818CF8]/10! border! border-[#818CF8]/20! px-3! py-1! text-xs! font-bold! text-[#818CF8]! mb-4!">
                <FaRocket /> Proceso Simple
              </div>
              <h2 className="text-3xl! sm:text-4xl! lg:text-5xl! font-black! text-white! leading-tight!">
                Configura, diseña y publica
              </h2>
              <p className="text-slate-400! text-sm! sm:text-base! leading-relaxed! mt-4!">
                Nuestro constructor de secciones te da control total sobre cada elemento visual de tu tienda.
              </p>
            </div>

            {[
              {
                step: "01",
                title: "Configura tu tienda",
                desc: "Ingresa el nombre, slug, logo y colores base. Tu tienda tendrá una URL propia como matiendita.dmhub.com.",
                color: "#22D3A6",
              },
              {
                step: "02",
                title: "Diseña con el constructor",
                desc: "Agrega y ordena secciones: Hero, Productos, Texto, Carrito, Footer. Personaliza colores, imágenes y efectos de cada una.",
                color: "#818CF8",
              },
              {
                step: "03",
                title: "Agrega productos y publica",
                desc: "Sube tus productos con imagen vía Cloudinary, fija precios, activa Stripe para cobros y dale \"Publicar\" a tu tienda.",
                color: "#F59E0B",
              },
            ].map((s) => (
              <div key={s.step} className="flex! gap-4! items-start!">
                <div
                  className="flex-shrink-0! h-10! w-10! rounded-xl! flex! items-center! justify-center! text-xs! font-black!"
                  style={{ backgroundColor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
                >
                  {s.step}
                </div>
                <div>
                  <h4 className="text-sm! font-bold! text-white! mb-1!">{s.title}</h4>
                  <p className="text-xs! text-slate-400! leading-relaxed!">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Animated section editor mockup */}
          <div className="bg-slate-900/60! border! border-slate-800! rounded-2xl! overflow-hidden! shadow-2xl! shadow-black/60!">
            <div className="bg-slate-950! border-b! border-slate-800! px-4! py-3! flex! items-center! justify-between!">
              <span className="text-xs! font-bold! text-slate-300!">Constructor de Tienda</span>
              <span
                className="text-[10px]! px-2.5! py-0.5! rounded-full! font-bold!"
                style={{ backgroundColor: "#22D3A620", color: "#22D3A6" }}
              >
                Vista Previa en Vivo
              </span>
            </div>

            <div className="p-4! space-y-2!">
              <p className="text-[9px]! font-black! text-slate-500! uppercase! tracking-wider! mb-3!">
                Secciones de la página
              </p>
              {SECTIONS_DEMO.map((s, i) => (
                <div
                  key={s.type}
                  className="flex! items-center! justify-between! px-3! py-2.5! rounded-xl! border! transition-all! duration-500! cursor-pointer!"
                  style={{
                    backgroundColor: activeSection === i ? `${s.color}10` : "rgba(15,23,42,0.3)",
                    borderColor: activeSection === i ? `${s.color}40` : "rgba(51,65,85,0.5)",
                    transform: activeSection === i ? "scale(1.02)" : "scale(1)",
                  }}
                  onClick={() => setActiveSection(i)}
                >
                  <div className="flex! items-center! gap-2.5!">
                    <div
                      className="h-2! w-2! rounded-full! transition-colors! duration-300!"
                      style={{ backgroundColor: activeSection === i ? s.color : "#475569" }}
                    />
                    <span
                      className="text-xs! font-semibold! transition-colors! duration-300!"
                      style={{ color: activeSection === i ? s.color : "#94A3B8" }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {activeSection === i && (
                    <span
                      className="text-[9px]! font-black! px-2! py-0.5! rounded-md!"
                      style={{ backgroundColor: `${s.color}20`, color: s.color }}
                    >
                      Editando
                    </span>
                  )}
                </div>
              ))}

              <div className="pt-3! border-t! border-slate-800! mt-3!">
                <div className="flex! items-center! justify-between! text-[10px]! font-bold! text-slate-400! px-1!">
                  <span>Configuración activa</span>
                  <span style={{ color: SECTIONS_DEMO[activeSection].color }}>
                    {SECTIONS_DEMO[activeSection].type}
                  </span>
                </div>
                <div className="mt-2! grid! grid-cols-2! gap-2!">
                  {["Color de fondo", "Texto", "Glassmorphism", "Opacidad"].map((prop) => (
                    <div key={prop} className="bg-slate-950! rounded-lg! px-2.5! py-1.5! text-[8px]! text-slate-500! font-medium!">
                      {prop}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section
        id="precios"
        className="py-20! px-4! max-w-5xl! mx-auto! text-center! border-t! border-slate-800/40! mb-20!"
      >
        <div className="relative! rounded-3xl! overflow-hidden! p-12! border! border-slate-800!">
          <div className="absolute! inset-0! bg-gradient-to-br! from-[#22D3A6]/5! via-[#818CF8]/5! to-[#060d14]!" />
          <div className="relative! z-10!">
            <h2 className="text-3xl! sm:text-5xl! font-black! text-white!">
              ¿Listo para abrir tu tienda?
            </h2>
            <p className="mt-4! max-w-xl! mx-auto! text-slate-400! text-sm! sm:text-base!">
              Registra tu cuenta, diseña tu tienda y empieza a vender.
              Sin límite de productos. Pagos con Stripe incluidos.
            </p>
            <div className="mt-8! flex! flex-col! sm:flex-row! items-center! justify-center! gap-4!">
              <Button
                onClick={() => router.push("/register?role=administrador")}
                className="w-full! sm:w-auto! h-12! px-10! rounded-xl! bg-[#22D3A6]! text-slate-900! font-bold! hover:bg-[#1ebda1]! shadow-[0_8px_30px_rgb(34,211,166,0.15)]! transition-all! hover:scale-[1.03]!"
              >
                Crear cuenta gratis
              </Button>
              <button
                onClick={() => router.push("/login?role=administrador")}
                className="w-full! sm:w-auto! h-12! px-8! rounded-xl! border! border-slate-700! bg-slate-900/40! hover:bg-slate-800/60! text-sm! font-semibold! text-slate-300! hover:text-white! transition-all! flex! items-center! justify-center! gap-2!"
              >
                Ya tengo cuenta →
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-10! flex! flex-wrap! items-center! justify-center! gap-6! text-xs! text-slate-500!">
              {[
                { icon: <FaCheck className="text-[#22D3A6]!" />, label: "Sin tarjeta de crédito" },
                { icon: <FaCreditCard className="text-[#60A5FA]!" />, label: "Stripe Connect" },
                { icon: <FaCloudUploadAlt className="text-[#34D399]!" />, label: "Cloudinary CDN" },
                { icon: <FaMobileAlt className="text-[#F472B6]!" />, label: "100% Responsive" },
              ].map((b) => (
                <div key={b.label} className="flex! items-center! gap-1.5!">
                  {b.icon} {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t! border-slate-800/60! bg-slate-950! py-10! px-4! text-slate-500! text-xs!">
        <div className="max-w-7xl! mx-auto! flex! flex-col! sm:flex-row! items-center! justify-between! gap-6!">
          <div className="flex! items-center! gap-2.5!">
            <img src="/logo.png" alt="DM Hub Logo" className="h-7! w-auto! object-contain!" />
          </div>
          <div>© 2026 Distributors Marketplace Hub. Todos los derechos reservados.</div>
          <div className="flex! gap-6!">
            <a href="#" className="hover:text-slate-300! transition-colors!">Términos</a>
            <a href="#" className="hover:text-slate-300! transition-colors!">Privacidad</a>
            <a href="#" className="hover:text-slate-300! transition-colors!">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}