"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Calendar,
  CreditCard,
  Users,
  Package,
  BarChart3,
  User,
  Store,
  Plus,
  Search,
  LogOut,
  ChevronDown,
  Eye,
  X,
  Loader2,
  Mail,
  Sparkles,
  Menu,
  Kanban
} from "lucide-react";
import {
  getTiendas,
  crearTienda,
  type TiendaDto,
  getSucursales,
  type SucursalDto,
  getPlatformUsuarios,
  type PlatformUsuarioDto,
  getPlatformProductos,
  type PlatformProductoDto,
  getPlatformReservaciones,
  type ReservacionDto,
  cambiarEstadoPlatformUsuario,
  cambiarRolPlatformUsuario,
  actualizarConfiguracionVisual,
  getIntegraciones
} from "@/lib/api/admin";

// Import modular tab components
import { DashboardTab } from "@/components/features/portal/DashboardTab";
import { SucursalesTab } from "@/components/features/portal/SucursalesTab";
import { ClientesTab } from "@/components/features/portal/ClientesTab";
import { UsuariosTab } from "@/components/features/portal/UsuariosTab";
import { ProductosTab } from "@/components/features/portal/ProductosTab";
import { ReservacionesTab } from "@/components/features/portal/ReservacionesTab";
import { PagosTab } from "@/components/features/portal/PagosTab";
import { ReportesTab } from "@/components/features/portal/ReportesTab";
import { SettingsTab } from "@/components/features/portal/SettingsTab";
import { KanbanTab } from "@/components/features/portal/KanbanTab";
import { PortalModal } from "@/components/ui/PortalModal";

const TAB_TITLES: Record<string, string> = {
  tablero: "Tablero",
  sucursales: "Sucursales",
  clientes: "Clientes",
  usuarios: "Usuarios",
  productos: "Productos",
  reservaciones: "Reservaciones",
  pagos: "Pagos",
  reportes: "Reportes",
  settings: "Configuración",
  kanban: "Tablero Kanban"
};

export default function PortalPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("tablero");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Shared platform master data
  const [tiendas, setTiendas] = useState<TiendaDto[]>([]);
  const [activeStore, setActiveStore] = useState<TiendaDto | null>(null);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreSlug, setNewStoreSlug] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Shared store details
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [hasCloudinary, setHasCloudinary] = useState(false);

  // Master lists passed to components
  const [sucursales, setSucursales] = useState<SucursalDto[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  const [usuarios, setUsuarios] = useState<PlatformUsuarioDto[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const [productos, setProductos] = useState<PlatformProductoDto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  const [reservaciones, setReservaciones] = useState<ReservacionDto[]>([]);
  const [loadingReservaciones, setLoadingReservaciones] = useState(false);

  // Modals inside ClientesTab/portal page (e.g. Change Role)
  const [isChangeRolModalOpen, setIsChangeRolModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<PlatformUsuarioDto | null>(null);
  const [changeRolForm, setChangeRolForm] = useState({
    tipoUsuario: "cliente",
    rolStaff: "cajero",
    sucursalId: ""
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const esSuperAdmin = usuario?.esSuperAdmin || usuario?.rol === "superadmin";
  const esAdmin = esSuperAdmin || usuario?.rol === "admin";
  const esStaff = esAdmin || usuario?.rol === "cajero";

  // Route protection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Restricción de acceso para la pestaña Kanban
  useEffect(() => {
    if (usuario && activeTab === "kanban" && !esStaff) {
      toast.error("No tienes permisos para acceder a esta sección.");
      handleTabChange("tablero");
    }
  }, [usuario, activeTab, esStaff]);

  // Load visual config mapping
  useEffect(() => {
    if (activeStore) {
      let config = null;
      if (activeStore.configuracionVisual) {
        try {
          config = typeof activeStore.configuracionVisual === "string"
            ? JSON.parse(activeStore.configuracionVisual)
            : activeStore.configuracionVisual;
        } catch (e) {
          console.error("Error parsing visual config", e);
        }
      }
      if (!config || !config.sections) {
        config = {
          sections: [
            {
              id: "announcement",
              type: "announcement",
              name: "Announcement Bar",
              properties: {
                bannerText: "ENVÍO GRATIS EN PEDIDOS SUPERIORES A Q500 • USA EL CÓDIGO LOGISTIC10",
                backgroundColor: "#1AB38C",
                textColor: "#FFFFFF",
                fontWeight: "Bold",
                stickyBanner: true,
                verticalPadding: 8,
                linkAction: "Open Link",
                linkUrl: "https://store.com/promo"
              }
            },
            {
              id: "header",
              type: "header",
              name: "Header",
              properties: {
                storeName: activeStore.nombre,
                logoUrl: "",
                menuItems: ["New Arrivals", "Logistics Tools", "Business Edition"]
              }
            },
            {
              id: "hero",
              type: "hero",
              name: "Hero Section",
              properties: {
                title: "Master Your Distribution Strategy",
                subtitle: "Commercial grade inventory systems designed for the modern logistics operator. Precision meets performance.",
                primaryButtonText: "Shop Collection",
                secondaryButtonText: "View Catalog",
                backgroundColor: "#0F172A",
                backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
                textColor: "#FFFFFF"
              }
            },
            {
              id: "products",
              type: "products",
              name: "Product Grid",
              properties: {
                title: "Featured Essentials",
                columns: 3,
                productsCount: 3
              }
            },
            {
              id: "footer",
              type: "footer",
              name: "Footer",
              properties: {
                copyrightText: `© 2026 ${activeStore.nombre}. All rights reserved.`,
                backgroundColor: "#0F172A",
                textColor: "#94A3B8"
              }
            }
          ]
        };
      }
      setStoreConfig(config);
    }
  }, [activeStore]);

  // Read tab parameter from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        if (!["tablero", "sucursales", "clientes", "usuarios", "productos", "reservaciones", "pagos", "reportes", "settings", "kanban"].includes(tab)) {
          toast.error("Pestaña no válida en la URL, redirigiendo al tablero");
          router.replace("/portal?tab=tablero");
          return;
        }
        setActiveTab(tab);
      }
    }
  }, []);

  // Update dynamic document title
  useEffect(() => {
    const storeName = activeStore?.nombre ? ` – ${activeStore.nombre}` : "";
    document.title = `${TAB_TITLES[activeTab] ?? activeTab}${storeName} | Portal Admin`;
  }, [activeTab, activeStore]);

  // Load stores list
  useEffect(() => {
    if (token) {
      getTiendas(token)
        .then((data) => {
          setTiendas(data);
          const storedTenantId = window.localStorage.getItem("active_tenant_id");
          if (storedTenantId) {
            const found = data.find((t) => t.id === storedTenantId);
            if (found) {
              setActiveStore(found);
              return;
            }
          }
          if (data.length > 0) {
            setActiveStore(data[0]);
            window.localStorage.setItem("active_tenant_id", data[0].id);
          }
        })
        .catch((err) => {
          console.error("Error al cargar tiendas", err);
          toast.error("No se pudieron cargar las tiendas.");
        });
    }
  }, [token]);

  // Check integrations for Cloudinary
  useEffect(() => {
    if (token) {
      getIntegraciones(token)
        .then((res) => {
          setHasCloudinary(!!(res.cloudinaryCloudName && res.cloudinaryApiKey && res.cloudinaryApiSecret));
        })
        .catch((err) => console.error("Error al verificar Cloudinary", err));
    }
  }, [token]);

  // Main reload effect for tabs
  useEffect(() => {
    if (!token || !activeStore) return;

    if (activeTab === "tablero") {
      Promise.all([
        getSucursales(token).catch(() => [] as SucursalDto[]),
        (esAdmin ? getPlatformUsuarios(token) : Promise.resolve([] as PlatformUsuarioDto[])).catch(() => [] as PlatformUsuarioDto[]),
        getPlatformProductos(token).catch(() => [] as PlatformProductoDto[]),
        (esStaff ? getPlatformReservaciones(token) : Promise.resolve([] as ReservacionDto[])).catch(() => [] as ReservacionDto[])
      ] as const).then(([sucList, usrList, prodList, resList]) => {
        setSucursales(sucList as SucursalDto[]);
        setUsuarios(usrList as PlatformUsuarioDto[]);
        setProductos(prodList as PlatformProductoDto[]);
        setReservaciones(resList as ReservacionDto[]);
      });
    } else if (activeTab === "sucursales") {
      refreshSucursales();
    } else if (activeTab === "clientes" || activeTab === "usuarios") {
      refreshUsuarios();
    } else if (activeTab === "productos") {
      refreshProductos();
    } else if (activeTab === "reservaciones" || activeTab === "pagos") {
      refreshReservaciones();
    }
  }, [token, activeStore, activeTab]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Individual reloaders passed down to tabs
  const refreshSucursales = () => {
    if (!token) return;
    setLoadingSucursales(true);
    getSucursales(token)
      .then(setSucursales)
      .catch(() => toast.error("Error al cargar sucursales"))
      .finally(() => setLoadingSucursales(false));
  };

  const refreshUsuarios = () => {
    if (!token || !esAdmin) return;
    setLoadingUsuarios(true);
    Promise.all([
      getPlatformUsuarios(token).catch(() => [] as PlatformUsuarioDto[]),
      getSucursales(token).catch(() => [] as SucursalDto[])
    ]).then(([usrList, sucList]) => {
      setUsuarios(usrList);
      setSucursales(sucList);
    })
    .catch(() => toast.error("Error al cargar colaboradores y sucursales"))
    .finally(() => setLoadingUsuarios(false));
  };

  const refreshProductos = () => {
    if (!token) return;
    setLoadingProductos(true);
    getPlatformProductos(token)
      .then((prods) => {
        setProductos(prods);
      })
      .catch(() => {
        toast.error("Error al cargar productos");
      })
      .finally(() => {
        setLoadingProductos(false);
      });
  };

  const refreshReservaciones = () => {
    if (!token || !esStaff) return;
    setLoadingReservaciones(true);
    getPlatformReservaciones(token)
      .then(setReservaciones)
      .catch(() => toast.error("Error al cargar reservaciones"))
      .finally(() => setLoadingReservaciones(false));
  };

  // Tab changer helper updating search param
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  };

  const navigateWithTransition = (href: string) => {
    if (typeof document !== "undefined" && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }
  };

  // Select Store / Tenant Selector
  const handleSelectStore = (store: TiendaDto) => {
    setActiveStore(store);
    window.localStorage.setItem("active_tenant_id", store.id);
    setIsStoreDropdownOpen(false);
    toast.success(`Tienda cambiada a: ${store.nombre}`);
    router.refresh();
  };

  // Create new tenant instance
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newStoreSlug) {
      toast.error("Por favor completa los campos");
      return;
    }
    if (!token) return;

    setIsCreatingStore(true);
    try {
      const created = await crearTienda(token, {
        nombre: newStoreName,
        slug: newStoreSlug
      });
      setTiendas((prev) => [...prev, created]);
      setActiveStore(created);
      window.localStorage.setItem("active_tenant_id", created.id);
      setIsCreateModalOpen(false);
      setNewStoreName("");
      setNewStoreSlug("");
      toast.success(`¡Tienda "${created.nombre}" creada y seleccionada!`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo crear la tienda";
      toast.error(msg);
    } finally {
      setIsCreatingStore(false);
    }
  };

  // Dynamic Search Engine
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { categoria: string; nombre: string; onClick: () => void }[] = [];

    // Search branches
    sucursales.filter(s => s.nombre.toLowerCase().includes(q) || (s.direccion && s.direccion.toLowerCase().includes(q))).forEach(s => {
      results.push({
        categoria: "Sucursales",
        nombre: `${s.nombre} (${s.direccion ?? "Sin dirección"})`,
        onClick: () => {
          handleTabChange("sucursales");
          setSearchQuery("");
        }
      });
    });

    // Search users
    usuarios.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).forEach(u => {
      results.push({
        categoria: "Clientes y Colaboradores",
        nombre: `${u.name} - ${u.email} (${u.tipoUsuario === "staff" ? u.rolStaff : "Cliente"})`,
        onClick: () => {
          handleTabChange("clientes");
          setSearchQuery("");
        }
      });
    });

    // Search products
    productos.filter(p => p.nombre.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))).forEach(p => {
      results.push({
        categoria: "Productos",
        nombre: `${p.nombre} [SKU: ${p.sku ?? "N/A"}]`,
        onClick: () => {
          handleTabChange("productos");
          setSearchQuery("");
        }
      });
    });

    return results;
  };

  const searchResults = getSearchResults();

  const groupedSearchResults = searchResults.reduce((acc, current) => {
    if (!acc[current.categoria]) {
      acc[current.categoria] = [];
    }
    acc[current.categoria].push(current);
    return acc;
  }, {} as Record<string, typeof searchResults>);

  const formatRole = (role: string | null | undefined) => {
    if (usuario?.esSuperAdmin) {
      return "Super Administrador";
    }
    if (role === "administrador" || role === "admin") return "Administrador";
    if (role === "cajero") return "Cajero";
    return role || "Personal";
  };

  // Clientes CRM role modal handlers
  const handleOpenChangeRolModal = (u: PlatformUsuarioDto) => {
    setSelectedUsuario(u);
    setChangeRolForm({
      tipoUsuario: u.tipoUsuario,
      rolStaff: u.rolStaff || "cajero",
      sucursalId: u.sucursalId || ""
    });
    setIsChangeRolModalOpen(true);
  };

  const handleChangeRolUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUsuario) return;

    try {
      const payload = {
        tipoUsuario: changeRolForm.tipoUsuario,
        rolStaff: changeRolForm.tipoUsuario === "staff" ? changeRolForm.rolStaff : undefined,
        sucursalId: changeRolForm.tipoUsuario === "staff" && changeRolForm.sucursalId ? changeRolForm.sucursalId : null
      };
      const updated = await cambiarRolPlatformUsuario(token, selectedUsuario.id, payload);
      setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setIsChangeRolModalOpen(false);
      toast.success("Rol actualizado exitosamente");
    } catch (err) {
      toast.error("Error al actualizar el rol");
    }
  };

  const handleToggleEstadoUsuario = async (u: PlatformUsuarioDto) => {
    if (!token) return;

    try {
      const updated = await cambiarEstadoPlatformUsuario(token, u.id, !u.estado);
      setUsuarios((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success(`Usuario ${updated.estado ? "activado" : "desactivado"} exitosamente`);
    } catch (err) {
      toast.error("Error al actualizar el estado del usuario");
    }
  };

  const renderSidebar = (isMobile: boolean) => {
    const handleLinkClick = (tab: string) => {
      handleTabChange(tab);
      if (isMobile) setMenuAbierto(false);
    };

    return (
      <>
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DM Hub Logo" className="h-8 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">DM Hub</h1>
            </div>
            {isMobile && (
              <button
                onClick={() => setMenuAbierto(false)}
                className="ml-auto text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-1"
                aria-label="Cerrar menú lateral"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => handleLinkClick("tablero")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "tablero" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => handleLinkClick("sucursales")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "sucursales" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <GitBranch size={18} />
              <span>Sucursales</span>
            </button>
            <button
              onClick={() => handleLinkClick("reservaciones")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "reservaciones" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <Calendar size={18} />
              <span>Reservaciones</span>
            </button>
            <button
              onClick={() => handleLinkClick("pagos")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "pagos" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <CreditCard size={18} />
              <span>Pagos</span>
            </button>
            {esStaff && (
              <button
                onClick={() => handleLinkClick("kanban")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                  activeTab === "kanban" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
                }`}
              >
                <Kanban size={18} />
                <span>Tablero Kanban</span>
              </button>
            )}
            <button
              onClick={() => handleLinkClick("clientes")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "clientes" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <Users size={18} />
              <span>Clientes</span>
            </button>
            <button
              onClick={() => handleLinkClick("productos")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "productos" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <Package size={18} />
              <span>Productos</span>
            </button>
            <button
              onClick={() => handleLinkClick("reportes")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "reportes" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <BarChart3 size={18} />
              <span>Reportes</span>
            </button>
            <button
              onClick={() => handleLinkClick("usuarios")}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                activeTab === "usuarios" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
              }`}
            >
              <User size={18} />
              <span>Usuarios</span>
            </button>
            {esAdmin && (
              <>
                <button
                  onClick={() => {
                    navigateWithTransition("/portal/constructor");
                    if (isMobile) setMenuAbierto(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
                >
                  <Sparkles size={18} />
                  <span>Constructor Tienda</span>
                </button>
                <button
                  onClick={() => handleLinkClick("settings")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full ${
                    activeTab === "settings" ? "bg-[#22D3A6] text-slate-955 shadow-[0_4px_12px_rgba(34,211,166,0.15)]" : "text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent"
                  }`}
                >
                  <Settings size={18} />
                  <span>Configuración</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="pt-6 border-t border-slate-900/80">
          <button
            onClick={() => {
              logout();
              router.push("/login");
              toast.success("Sesión cerrada correctamente");
            }}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-rose-400 rounded-xl transition-all text-left cursor-pointer border-none bg-transparent w-full"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </>
    );
  };

  if (!usuario) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#081018] text-slate-100 font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-slate-900 bg-slate-955/40 p-6 flex-col justify-between shrink-0 hidden lg:flex h-[100dvh] max-h-[100dvh] fixed top-0 left-0 z-20 overflow-y-auto">
        {renderSidebar(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-900 bg-slate-955 p-6 transition-transform duration-200 lg:hidden h-[100dvh] max-h-[100dvh] overflow-y-auto",
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderSidebar(true)}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/20 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4 relative z-45">
          {/* Hamburger Menu Toggle on Mobile/Tablet */}
          <button
            onClick={() => setMenuAbierto(true)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 border-none bg-transparent cursor-pointer flex items-center justify-center"
            aria-label="Abrir menú lateral"
          >
            <Menu size={20} />
          </button>

          {/* Live Search */}
          <div ref={searchContainerRef} className="w-full max-w-md relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar por sucursal, productos y colaboradores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="h-10 w-full pl-10 pr-4 rounded-xl border border-slate-800 bg-slate-900/40 text-sm placeholder:text-slate-500 text-slate-100 outline-none transition-all focus:border-[#22D3A6]/50 focus:ring-1 focus:ring-[#22D3A6]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Live Search Popup */}
            {isSearchFocused && searchQuery && (
              <div className="absolute top-12 left-0 w-full rounded-xl border border-slate-800 bg-slate-955 p-4 shadow-2xl shadow-black max-h-[360px] overflow-y-auto z-50 animate-fade-in">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Sin resultados para "{searchQuery}"</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedSearchResults).map(([cat, items]) => (
                      <div key={cat} className="space-y-1">
                        <h4 className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider px-2">{cat}</h4>
                        <div className="flex flex-col">
                          {items.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                item.onClick();
                                setIsSearchFocused(false);
                              }}
                              className="text-xs text-left text-slate-300 px-2 py-2 rounded-lg hover:bg-slate-900/60 hover:text-white transition-all border-none bg-transparent cursor-pointer block w-full text-ellipsis overflow-hidden whitespace-nowrap"
                            >
                              {item.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dropdown Stores, Profile */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Store Selector */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-200 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 hover:text-white transition-all"
              >
                <Store size={14} className="text-[#38BDF8]" />
                <span className="max-w-[150px] truncate">{activeStore?.nombre ?? "Seleccionar Tienda"}</span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {isStoreDropdownOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-800 bg-slate-955 p-2 shadow-2xl shadow-black z-50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 border-b border-slate-900">
                    Cambiar Instancia
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1 flex flex-col gap-0.5">
                    {tiendas.map((t) => (
                      <div key={t.id} className="flex items-center justify-between px-1 rounded-lg hover:bg-slate-900/40 group transition-all">
                        <button
                          onClick={() => handleSelectStore(t)}
                          className={`flex-1 flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left border-none cursor-pointer bg-transparent ${
                            activeStore?.id === t.id ? "text-[#22D3A6]" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="truncate">{t.nombre}</span>
                          {activeStore?.id === t.id && <span className="h-1.5 w-1.5 rounded-full bg-[#22D3A6] shrink-0 ml-2" />}
                        </button>
                        <a
                          href={`/preview/${t.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#38BDF8] hover:bg-slate-900 transition-all cursor-pointer mr-1 flex items-center justify-center"
                          title={`Ver Preview Live de ${t.nombre}`}
                        >
                          <Eye size={12} />
                        </a>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-900 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsStoreDropdownOpen(false);
                        setIsCreateModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#38BDF8] hover:text-[#22D3A6] rounded-lg hover:bg-slate-900/40 transition-all text-left border-none cursor-pointer bg-transparent w-full"
                    >
                      <Plus size={14} />
                      <span>Crear nueva tienda</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Config Button */}
            {esAdmin && (
              <button
                onClick={() => handleTabChange("settings")}
                className={`h-10 w-10 rounded-xl border flex items-center justify-center cursor-pointer transition-all hover:text-white ${
                  activeTab === "settings"
                    ? "border-[#22D3A6] bg-[#22D3A6]/10 text-[#22D3A6]"
                    : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
                }`}
                title="Configuración del Sistema"
              >
                <Settings size={16} />
              </button>
            )}

            {/* Profile Avatar */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">{usuario.nombre}</p>
                <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{formatRole(usuario.rol)}</p>
              </div>
              <div className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-xs font-black text-[#38BDF8]">
                  {usuario.nombre.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab panels rendering container */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 relative z-10">
          <div className="pointer-events-none absolute top-20 left-1/3 h-[400px] w-[400px] rounded-full bg-[#22D3A6]/2 blur-[100px] -z-10" />
          <div className="pointer-events-none absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-[#38BDF8]/2 blur-[120px] -z-10" />

          {/* TAB: TABLERO (DASHBOARD) */}
          {activeTab === "tablero" && (
            <DashboardTab
              productos={productos}
              usuarios={usuarios}
              reservaciones={reservaciones}
              usuario={usuario}
              esAdmin={esAdmin}
              esStaff={esStaff}
            />
          )}

          {/* TAB: SUCURSALES */}
          {activeTab === "sucursales" && (
            <SucursalesTab
              token={token ?? ""}
              sucursales={sucursales}
              loadingSucursales={loadingSucursales}
              productos={productos}
              usuarios={usuarios}
              esAdmin={esAdmin}
              onRefresh={refreshSucursales}
            />
          )}

          {/* TAB: CLIENTES */}
          {activeTab === "clientes" && (
            <ClientesTab
              usuarios={usuarios}
              loadingUsuarios={loadingUsuarios}
              esAdmin={esAdmin}
              onToggleEstado={handleToggleEstadoUsuario}
              onOpenChangeRol={handleOpenChangeRolModal}
            />
          )}

          {/* TAB: USUARIOS */}
          {activeTab === "usuarios" && (
            <UsuariosTab
              token={token ?? ""}
              usuarios={usuarios}
              loadingUsuarios={loadingUsuarios}
              sucursales={sucursales}
              usuario={usuario}
              esAdmin={esAdmin}
              onRefresh={refreshUsuarios}
            />
          )}

          {/* TAB: PRODUCTOS */}
          {activeTab === "productos" && (
            <ProductosTab
              token={token ?? ""}
              productos={productos}
              loadingProductos={loadingProductos}
              categorias={[]}
              sucursales={sucursales}
              esAdmin={esAdmin}
              hasCloudinary={hasCloudinary}
              onRefresh={refreshProductos}
            />
          )}

          {/* TAB: RESERVACIONES */}
          {activeTab === "reservaciones" && (
            <ReservacionesTab
              token={token ?? ""}
              reservaciones={reservaciones}
              loadingReservaciones={loadingReservaciones}
              onRefresh={refreshReservaciones}
            />
          )}

          {/* TAB: PAGOS */}
          {activeTab === "pagos" && (
            <PagosTab
              token={token ?? ""}
              reservaciones={reservaciones}
              onRefresh={refreshReservaciones}
            />
          )}

          {/* TAB: KANBAN */}
          {activeTab === "kanban" && esStaff && (
            <KanbanTab
              token={token ?? ""}
              reservaciones={reservaciones}
              loadingReservaciones={loadingReservaciones}
              usuarios={usuarios}
              sucursales={sucursales}
              onRefresh={refreshReservaciones}
            />
          )}

          {/* TAB: REPORTES */}
          {activeTab === "reportes" && (
            <ReportesTab
              token={token ?? ""}
              activeStore={activeStore}
            />
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && (
            <SettingsTab
              token={token}
              esAdmin={esAdmin}
              activeStore={activeStore}
              setActiveStore={setActiveStore}
              storeConfig={storeConfig}
              setStoreConfig={setStoreConfig}
              setTiendas={setTiendas}
            />
          )}
        </div>
      </main>

      {/* CREATE STORE DIALOG MODAL */}
      {isCreateModalOpen && (
        <PortalModal onClose={() => setIsCreateModalOpen(false)} ariaLabel="Crear nueva tienda">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Crear Nueva Tienda</h3>
              <p className="text-xs text-slate-400">Crea una instancia de tienda independiente en la plataforma</p>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Tienda</label>
                <input
                  type="text"
                  placeholder="Ej. Distribuidora DM Hub Alimentos"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slug de Acceso (URL)</label>
                <input
                  type="text"
                  placeholder="ej-distribuidora-dmhub"
                  required
                  value={newStoreSlug}
                  onChange={(e) => setNewStoreSlug(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8]"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingStore}
                className="h-12 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold shadow-[0_4px_12px_rgba(34,211,166,0.2)] transition-all hover:scale-[1.01] cursor-pointer border-none flex items-center justify-center gap-2"
              >
                {isCreatingStore ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creando Tienda...</span>
                  </>
                ) : (
                  <span>Crear Tienda</span>
                )}
              </button>
            </form>
          </div>
        </PortalModal>
      )}

      {/* CRM CLIENTS CHANGE ROLE MODAL */}
      {isChangeRolModalOpen && (
        <PortalModal onClose={() => setIsChangeRolModalOpen(false)} ariaLabel="Cambiar tipo y rol">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-955 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsChangeRolModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Cambiar Tipo & Rol</h3>
              <p className="text-xs text-slate-400">Modifica los permisos de {selectedUsuario?.name}</p>
            </div>

            <form onSubmit={handleChangeRolUsuario} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Usuario</label>
                <select
                  value={changeRolForm.tipoUsuario}
                  onChange={(e) => setChangeRolForm({ ...changeRolForm, tipoUsuario: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                >
                  <option value="cliente">Cliente</option>
                  <option value="staff">Personal (Staff)</option>
                </select>
              </div>

              {changeRolForm.tipoUsuario === "staff" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rol de Staff</label>
                    <select
                      value={changeRolForm.rolStaff}
                      onChange={(e) => setChangeRolForm({ ...changeRolForm, rolStaff: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                    >
                      <option value="cajero">Cajero</option>
                      <option value="administrador">Administrador</option>
                      <option value="superadmin">Super Administrador</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sucursal</label>
                    <select
                      value={changeRolForm.sucursalId}
                      onChange={(e) => setChangeRolForm({ ...changeRolForm, sucursalId: e.target.value })}
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                    >
                      <option value="">Ninguna sucursal (Sin asignar)</option>
                      {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <span>Guardar Permisos</span>
              </button>
            </form>
          </div>
        </PortalModal>
      )}
    </div>
  );
}
