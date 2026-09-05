"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostLoginPath } from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  FaUserShield,
  FaUserTag,
  FaUser,
  FaColumns,
  FaDownload,
  FaUpload
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
  const rolesRef = useRef<HTMLDivElement>(null);
  const ventasRef = useRef<HTMLDivElement>(null);
  const kanbanRef = useRef<HTMLDivElement>(null);

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
      gsap.set([badgeRef.current, titleRef.current, descRef.current, ctasRef.current], {
        opacity: 0, y: 30,
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tl.to(badgeRef.current, { opacity: 1, y: 0, delay: 0.2 })
        .to(titleRef.current, { opacity: 1, y: 0 }, "-=0.6")
        .to(descRef.current, { opacity: 1, y: 0 }, "-=0.6")
        .to(ctasRef.current, { opacity: 1, y: 0 }, "-=0.6");

      const blurTargets = [visualRef.current, featuresRef.current, demoRef.current, rolesRef.current, ventasRef.current, kanbanRef.current];
      gsap.set(blurTargets, { opacity: 0, y: 50, filter: "blur(16px)" });

      const revealOnScroll = (element: HTMLElement | null, delay = 0) => {
        if (!element) return;
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                gsap.to(element, {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  duration: 1.1,
                  delay,
                  ease: "power2.out",
                });
                observer.unobserve(element);
              }
            });
          },
          { threshold: 0.08 }
        );
        observer.observe(element);
      };

      revealOnScroll(visualRef.current);
      revealOnScroll(featuresRef.current);
      revealOnScroll(demoRef.current);
      revealOnScroll(rolesRef.current);
      revealOnScroll(ventasRef.current);
      revealOnScroll(kanbanRef.current, 0.15);
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
            <a href="#roles" className="hover:text-[#22D3A6]! transition-colors!">Roles</a>
            <a href="#ventas" className="hover:text-[#22D3A6]! transition-colors!">Administración</a>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="hover:text-[#22D3A6]! transition-colors!">Documentación</a>
            <a href="#precios" className="hover:text-[#22D3A6]! transition-colors!">Empezar</a>
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
          className="relative! mt-16! w-full! max-w-5xl! rounded-2xl! border! border-slate-800/80! bg-slate-955/80! p-3! shadow-2xl! shadow-black/80! backdrop-blur-sm!"
        >
          {/* Browser chrome */}
          <div className="flex! items-center! justify-between! border-b! border-slate-800/80! px-4! pb-3! pt-1! mb-3!">
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

          <div className="overflow-hidden! rounded-xl! border! border-slate-850!">
            <img
              src="/constructor.gif"
              alt="Constructor Visual de Tiendas"
              className="w-full! h-auto! object-cover!"
            />
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

      {/* ─── Constructor Features Grid ─── */}
      <section
        id="constructor"
        ref={demoRef}
        className="py-24! px-4! max-w-7xl! mx-auto! border-t! border-slate-800/40!"
      >
        <div className="text-center! max-w-3xl! mx-auto! mb-16!">
          <div className="inline-flex! items-center! gap-2! rounded-full! bg-[#818CF8]/10! border! border-[#818CF8]/20! px-3! py-1! text-xs! font-bold! text-[#818CF8]! mb-4!">
            <FaRocket /> Proceso Simple
          </div>
          <h2 className="text-3xl! sm:text-5xl! font-black! text-white! leading-tight!">
            Configura, diseña y publica
          </h2>
          <p className="text-slate-400! text-base! sm:text-lg! leading-relaxed! mt-4!">
            Nuestro constructor visual te da control absoluto sobre tu storefront en tres pasos sencillos.
          </p>
        </div>

        <div className="grid! grid-cols-1! md:grid-cols-3! gap-8!">
          {[
            {
              step: "01",
              title: "Configura tu tienda",
              desc: "Ingresa el nombre, slug y colores base. Tu tienda tendrá una URL propia e independiente.",
              icon: <FaStore className="text-[#22D3A6]!" />,
              color: "#22D3A6",
            },
            {
              step: "02",
              title: "Diseña con el Constructor",
              desc: "Ordena secciones como banners, headers, grids y footers. Configura tipografías, fondos, glassmorphism y exporta/importa el diseño en formato JSON para respaldos o clonación.",
              icon: <FaPalette className="text-[#818CF8]!" />,
              color: "#818CF8",
              hasJsonBadges: true,
            },
            {
              step: "03",
              title: "Agrega productos y vende",
              desc: "Carga catálogo por sucursales, fija precios mayoristas o al detalle, activa cobros con Stripe y publica tu tienda live.",
              icon: <FaRocket className="text-[#F59E0B]!" />,
              color: "#F59E0B",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="group! bg-slate-900/40! border! border-slate-800! p-6! rounded-2xl! relative! overflow-hidden! flex! flex-col! justify-between! hover:border-slate-700/80! transition-all! hover:-translate-y-1! duration-300!"
            >
              <div>
                <div className="flex! items-center! justify-between! mb-6!">
                  <div
                    className="h-10! w-10! rounded-xl! flex! items-center! justify-center! text-lg! transition-transform! group-hover:scale-110! duration-300!"
                    style={{ backgroundColor: `${s.color}15` }}
                  >
                    {s.icon}
                  </div>
                  <span className="text-xs! font-bold! opacity-50!">PASO {s.step}</span>
                </div>
                <h4 className="text-base! font-bold! text-white! mb-2!">{s.title}</h4>
                <p className="text-xs! text-slate-400! leading-relaxed!">{s.desc}</p>
              </div>

              {s.hasJsonBadges && (
                <div className="mt-6! pt-4! border-t! border-slate-800/80! flex! flex-wrap! gap-2!">
                  <span className="inline-flex! items-center! gap-1! rounded-lg! bg-slate-950! border! border-slate-800! px-2! py-1! text-[9px]! font-bold! text-slate-400!">
                    <FaDownload className="text-[#22D3A6]!" /> Exportar JSON
                  </span>
                  <span className="inline-flex! items-center! gap-1! rounded-lg! bg-slate-950! border! border-slate-800! px-2! py-1! text-[9px]! font-bold! text-slate-400!">
                    <FaUpload className="text-[#818CF8]!" /> Importar JSON
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Roles Section ─── */}
      <section
        id="roles"
        ref={rolesRef}
        className="py-24! px-4! max-w-7xl! mx-auto! border-t! border-slate-800/40!"
      >
        <div className="text-center! max-w-3xl! mx-auto! mb-16!">
          <div className="inline-flex! items-center! gap-2! rounded-full! bg-[#38BDF8]/10! border! border-[#38BDF8]/20! px-3! py-1! text-xs! font-bold! text-[#38BDF8]! mb-4!">
            <FaUserShield /> Control de Roles y Acceso
          </div>
          <h2 className="text-3xl! sm:text-5xl! font-black! text-white!">
            Perfiles de Usuario Definidos
          </h2>
          <p className="mt-4! text-slate-400! text-base! sm:text-lg!">
            Nuestra plataforma cuenta con control de accesos por roles (RBAC) para delegar tareas con total seguridad.
          </p>
        </div>

        <div className="grid! grid-cols-1! md:grid-cols-3! gap-8!">
          {[
            {
              title: "Administrador / Super Admin",
              desc: "Control absoluto de la tienda y sucursales. Configura los parámetros visuales en el editor, administra integraciones (Stripe, Cloudinary, SMTP), gestiona colaboradores y visualiza reportes analíticos avanzados.",
              icon: <FaUserShield className="text-[#38BDF8]!" />,
              color: "border-[#38BDF8]/25 bg-[#38BDF8]/5",
              features: ["Constructor visual de tiendas", "Reportes SQL personalizados", "Cuentas y sucursales"]
            },
            {
              title: "Cajero / Personal de Staff",
              desc: "Encargado de la operación diaria. Tiene acceso en tiempo real al Tablero Kanban de ventas, verifica pagos en efectivo/caja y procesa los despachos de las reservaciones locales asignadas.",
              icon: <FaUserTag className="text-[#22D3A6]!" />,
              color: "border-[#22D3A6]/25 bg-[#22D3A6]/5",
              features: ["Tablero Kanban en tiempo real", "Control de pagos en caja", "Cambios de estado de despacho"]
            },
            {
              title: "Cliente de Tienda",
              desc: "Usuario final. Puede explorar productos en el storefront público, agregar artículos a su carrito con precios diferenciados (detallista/mayorista), reservar pedidos y consultar su historial de compras.",
              icon: <FaUser className="text-[#818CF8]!" />,
              color: "border-[#818CF8]/25 bg-[#818CF8]/5",
              features: ["Storefront responsivo interactivo", "Pagos seguros con tarjeta", "Mis compras / historial"]
            }
          ].map((r, i) => (
            <div
              key={i}
              className={cn(
                "group! p-8! rounded-2xl! border! transition-all! duration-300! flex! flex-col! justify-between! hover:-translate-y-1!",
                r.color
              )}
            >
              <div>
                <div className="flex! items-center! gap-3! mb-5!">
                  <div className="text-2xl! transition-transform! group-hover:scale-110! duration-300!">{r.icon}</div>
                  <h4 className="text-base! font-bold! text-white!">{r.title}</h4>
                </div>
                <p className="text-xs! text-slate-400! leading-relaxed! mb-6!">{r.desc}</p>
              </div>

              <div className="space-y-2! border-t! border-slate-800/80! pt-4!">
                <p className="text-[10px]! font-bold! text-slate-500! uppercase! tracking-widest!">Permisos Clave</p>
                {r.features.map((f, idx) => (
                  <div key={idx} className="flex! items-center! gap-2! text-[11px]! text-slate-350!">
                    <FaCheck className="text-[#22D3A6]! text-[9px]!" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Ventas Section ─── */}
      <section
        id="ventas"
        ref={ventasRef}
        className="py-24! px-4! max-w-7xl! mx-auto! border-t! border-slate-800/40!"
      >
        <div className="grid! grid-cols-1! lg:grid-cols-2! gap-16! items-center!">
          {/* Text descriptions */}
          <div className="space-y-6!">
            <div className="inline-flex! items-center! gap-2! rounded-full! bg-[#22D3A6]/10! border! border-[#22D3A6]/20! px-3! py-1! text-xs! font-bold! text-[#22D3A6]! mb-2!">
              <FaCreditCard /> Consola de Ventas
            </div>
            <h2 className="text-3xl! sm:text-4xl! lg:text-5xl! font-black! text-white! leading-tight!">
              Administración de Ventas y Flujo de Caja
            </h2>
            <p className="text-slate-400! text-sm! sm:text-base! leading-relaxed!">
              Optimiza tus operaciones comerciales mediante una interfaz fluida e integrada. Controla cada transacción y despacho en segundos.
            </p>

            <div className="space-y-4! pt-4!">
              {[
                {
                  title: "Sincronización en Tiempo Real",
                  desc: "El Tablero Kanban y las reservaciones se actualizan automáticamente en segundo plano cada 6 segundos, alertando con chimes y notificaciones ante nuevas órdenes."
                },
                {
                  title: "Control de Pagos con Tarjeta y Efectivo",
                  desc: "Verifica los intents de Stripe procesados en la pestaña de Pagos, o cambia manualmente el estado de pago del pedido en el Kanban a 'Pago Verificado'."
                },
                {
                  title: "Listado Maestro de Reservaciones",
                  desc: "Un registro centralizado con la información de facturación del cliente, detalles de artículos de la reservación, cantidad, subtotal e importes netos."
                },
                {
                  title: "Tablero Kanban de Flujo de Trabajo",
                  desc: "Permite a los cajeros arrastrar tarjetas a lo largo de tres fases: Pendiente de Pago, Pago Verificado y Despachado, asegurando el orden en la preparación y entrega."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex! gap-3! items-start!">
                  <div className="mt-1! flex-shrink-0! h-2! w-2! rounded-full! bg-[#22D3A6]!" />
                  <div>
                    <h5 className="text-xs! font-bold! text-white! mb-0.5!">{item.title}</h5>
                    <p className="text-[11px]! text-slate-400! leading-relaxed!">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanban GIF or Mockup container */}
          <div ref={kanbanRef} className="bg-slate-900/60! border! border-slate-800! rounded-2xl! overflow-hidden! shadow-2xl! shadow-black/80! p-3! relative!">
            <p className="text-[9px]! font-black! text-slate-500! uppercase! tracking-wider! mb-2.5! px-1!">
              Tablero Kanban Operativo
            </p>
            <div className="overflow-hidden! rounded-xl! border! border-slate-850! bg-[#081018]! aspect-[16/10]! flex! items-center! justify-center! relative!">
              <img
                src="/kanban.gif"
                alt="Tablero Kanban de Ventas"
                className="w-full! h-full! object-cover! rounded-lg!"
              />
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
        </div>
      </footer>
    </div>
  );
}