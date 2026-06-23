"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
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
  TrendingUp,
  ShoppingCart,
  ShieldAlert,
  Activity,
  CheckCircle,
  X,
  Loader2,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Mail,
  Sliders,
  DollarSign,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Save,
  Check,
  AlertTriangle,
  Upload,
  Download,
  FileText,
  Menu
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  getTiendas,
  crearTienda,
  TiendaDto,
  getSucursales,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
  SucursalDto,
  getPlatformUsuarios,
  invitarPlatformUsuario,
  cambiarRolPlatformUsuario,
  cambiarEstadoPlatformUsuario,
  eliminarPlatformUsuario,
  PlatformUsuarioDto,
  getPlatformProductos,
  crearPlatformProducto,
  crearPlatformProductosBulk,
  CrearPlatformProductoBulkInput,
  actualizarPlatformProducto,
  eliminarPlatformProducto,
  PlatformProductoDto,
  getPlatformReservaciones,
  cambiarEstadoReservacion,
  ReservacionDto,
  getIntegraciones,
  guardarIntegraciones,
  CredencialesIntegracionDtoFull,
  InventarioDto,
  actualizarConfiguracionVisual,
  actualizarTiendaInfo
} from "@/lib/api/admin";
import { obtenerCategorias } from "@/lib/api/productos";
import {
  obtenerReporteProductos,
  obtenerReporteEmpleados,
  obtenerReporteMetodosPago,
  ejecutarRawReporte,
  type TReporteProductos,
  type TReporteEmpleados,
  type TReporteMetodosPago
} from "@/lib/api/reportes";
import type { TCategoria } from "@/types";
import { adminResetPassword } from "@/lib/api/auth";

// Mock chart series
const CHART_DATA_24H = [
  { name: "02:00", realTime: 340, predicted: 420 },
  { name: "04:00", realTime: 210, predicted: 300 },
  { name: "06:00", realTime: 450, predicted: 480 },
  { name: "08:00", realTime: 720, predicted: 680 },
  { name: "10:00", realTime: 890, predicted: 840 },
  { name: "12:00", realTime: 842, predicted: 790 },
  { name: "14:00", realTime: 620, predicted: 710 },
  { name: "16:00", realTime: 510, predicted: 600 },
  { name: "18:00", realTime: 680, predicted: 650 },
  { name: "20:00", realTime: 790, predicted: 800 },
  { name: "22:00", realTime: 550, predicted: 580 },
  { name: "00:00", realTime: 410, predicted: 490 }
];

const CHART_DATA_7D = [
  { name: "Lun", realTime: 5200, predicted: 5000 },
  { name: "Mar", realTime: 6100, predicted: 5800 },
  { name: "Mié", realTime: 5900, predicted: 6300 },
  { name: "Jue", realTime: 7200, stroke: "#38BDF8", realTimeFill: "#22D3A6", predicted: 7000 },
  { name: "Vie", realTime: 8400, predicted: 8000 },
  { name: "Sáb", realTime: 4500, predicted: 4900 },
  { name: "Dom", realTime: 3100, predicted: 3600 }
];

const CHART_DATA_30D = [
  { name: "Semana 1", realTime: 24500, predicted: 26000 },
  { name: "Semana 2", realTime: 29800, predicted: 28000 },
  { name: "Semana 3", realTime: 34200, predicted: 31000 },
  { name: "Semana 4", realTime: 38900, predicted: 35000 }
];

export default function PortalPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("tablero");
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Reports states
  const [reportSubTab, setReportSubTab] = useState<"productos" | "empleados" | "pagos" | "personalizado">("productos");
  const [reportProductos, setReportProductos] = useState<TReporteProductos | null>(null);
  const [reportEmpleados, setReportEmpleados] = useState<TReporteEmpleados | null>(null);
  const [reportMetodosPago, setReportMetodosPago] = useState<TReporteMetodosPago | null>(null);
  const [reportesLoading, setReportesLoading] = useState(false);
  const [reportesError, setReportesError] = useState<string | null>(null);

  // Date filters for Reports
  const [reportFiltro, setReportFiltro] = useState<{ desde: string; hasta: string; modo: "todos" | "ventas" | "reservaciones" }>(() => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - 30);
    return {
      desde: desde.toISOString().slice(0, 10),
      hasta: hasta.toISOString().slice(0, 10),
      modo: "todos"
    };
  });

  // Custom SQL Console states
  const [customQuery, setCustomQuery] = useState("SELECT id, nombre, stock_actual, stock_minimo FROM public.\"Producto\" WHERE tienda_id = @tenant_id AND stock_actual < stock_minimo;");
  const [customQueryResult, setCustomQueryResult] = useState<Array<Record<string, any>> | null>(null);
  const [customQueryError, setCustomQueryError] = useState<string | null>(null);
  const [customQueryLoading, setCustomQueryLoading] = useState(false);

  // Stores states
  const [tiendas, setTiendas] = useState<TiendaDto[]>([]);
  const [activeStore, setActiveStore] = useState<TiendaDto | null>(null);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreSlug, setNewStoreSlug] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Store Builder State
  const [storeConfig, setStoreConfig] = useState<any>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("announcement");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPublishingConfig, setIsPublishingConfig] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) {
        if (!["tablero", "sucursales", "clientes", "usuarios", "productos", "reservaciones", "settings"].includes(tab)) {
          toast.error("Pestaña no válida en la URL, redirigiendo al tablero");
          router.replace("/portal?tab=tablero");
          return;
        }
        setActiveTab(tab);
      }
    }
  }, []);

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
    constructor: "Constructor de Tienda",
  };

  useEffect(() => {
    const storeName = activeStore?.nombre ? ` – ${activeStore.nombre}` : "";
    document.title = `${TAB_TITLES[activeTab] ?? activeTab}${storeName} | Portal Admin`;
  }, [activeTab, activeStore]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  };

  // View transitions navigation helper
  const navigateWithTransition = (href: string) => {
    if (typeof document !== "undefined" && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        router.push(href);
      });
    } else {
      router.push(href);
    }
  };



  // Sucursales state
  const [sucursales, setSucursales] = useState<SucursalDto[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [isSucursalModalOpen, setIsSucursalModalOpen] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState<SucursalDto | null>(null);
  const [sucursalForm, setSucursalForm] = useState({
    nombre: "",
    direccion: "",
    telefono: ""
  });
  const [selectedSucursalDetail, setSelectedSucursalDetail] = useState<SucursalDto | null>(null);

  // Clientes / Usuarios state
  const [usuarios, setUsuarios] = useState<PlatformUsuarioDto[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    tipoUsuario: "staff",
    rolStaff: "cajero",
    contrasena: "",
    sucursalId: ""
  });
  const [isChangeRolModalOpen, setIsChangeRolModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<PlatformUsuarioDto | null>(null);
  const [changeRolForm, setChangeRolForm] = useState({
    tipoUsuario: "cliente",
    rolStaff: "cajero",
    sucursalId: ""
  });

  // Reset password modal state
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordUsuario, setResetPasswordUsuario] = useState<PlatformUsuarioDto | null>(null);
  const [resetCodes, setResetCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);

  // Settings / Integraciones state
  const [settingsForm, setSettingsForm] = useState({
    stripeSecretKey: "",
    stripePublicKey: "",
    cloudinaryCloudName: "",
    cloudinaryApiKey: "",
    cloudinaryApiSecret: "",
    smtpEmail: "",
    smtpPassword: ""
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [storeForm, setStoreForm] = useState({
    nombre: "",
    slug: "",
    logoUrl: ""
  });
  const [isSavingStoreInfo, setIsSavingStoreInfo] = useState(false);

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
      let headerSec = null;
      if (config?.pages) {
        const homePage = config.pages.find((p: any) => p.id === "home") || config.pages[0];
        headerSec = homePage?.sections?.find((s: any) => s.type === "header");
      } else {
        headerSec = config?.sections?.find((s: any) => s.type === "header");
      }

      setStoreForm({
        nombre: activeStore.nombre || "",
        slug: activeStore.slug || "",
        logoUrl: headerSec?.properties?.logoUrl || ""
      });
    }
  }, [activeStore]);

  // Productos state
  const [productos, setProductos] = useState<PlatformProductoDto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<CrearPlatformProductoBulkInput[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isProductoModalOpen, setIsProductoModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<PlatformProductoDto | null>(null);
  const [categorias, setCategorias] = useState<TCategoria[]>([]);
  const [productoForm, setProductoForm] = useState({
    nombre: "",
    precioMayoreo: 0,
    precioDetalle: 0,
    categoriaId: "",
    sku: "",
    descripcion: "",
    imagenUrl: "",
    publicado: true,
    stockMinimo: 0
  });
  const [stockSucursalesMap, setStockSucursalesMap] = useState<Record<string, number>>({});
  const [productSearchQuery, setProductSearchQuery] = useState("");

  // Reservaciones state
  const [reservaciones, setReservaciones] = useState<ReservacionDto[]>([]);
  const [loadingReservaciones, setLoadingReservaciones] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Chart time filter
  const [timeFilter, setTimeFilter] = useState<"24H" | "7D" | "30D">("24H");
  const [chartData, setChartData] = useState(CHART_DATA_24H);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Role check helpers
  const esSuperAdmin = usuario?.esSuperAdmin || usuario?.rol === "superadmin";
  const esAdmin = esSuperAdmin || usuario?.rol === "admin";
  const esStaff = esAdmin || usuario?.rol === "cajero";

  // Guard routing
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load stores from backend
  useEffect(() => {
    if (token) {
      getTiendas(token)
        .then((data) => {
          setTiendas(data);
          // Resolve active store
          const storedTenantId = window.localStorage.getItem("active_tenant_id");
          if (storedTenantId) {
            const found = data.find((t) => t.id === storedTenantId);
            if (found) {
              setActiveStore(found);
              return;
            }
          }
          // Fallback to first store
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

  // Load active tab data
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
      setLoadingSucursales(true);
      getSucursales(token)
        .then(setSucursales)
        .catch(() => toast.error("Error al cargar sucursales"))
        .finally(() => setLoadingSucursales(false));
    } else if (activeTab === "clientes" || activeTab === "usuarios") {
      if (!esAdmin) {
        setUsuarios([]);
        return;
      }
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
    } else if (activeTab === "productos") {
      setLoadingProductos(true);
      Promise.all([
        getPlatformProductos(token).catch(() => []),
        obtenerCategorias().catch(() => [])
      ]).then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
        setLoadingProductos(false);
      }).catch(() => {
        toast.error("Error al cargar productos o categorías");
        setLoadingProductos(false);
      });
    } else if (activeTab === "reservaciones") {
      if (!esStaff) {
        setReservaciones([]);
        return;
      }
      setLoadingReservaciones(true);
      getPlatformReservaciones(token)
        .then(setReservaciones)
        .catch(() => toast.error("Error al cargar reservaciones"))
        .finally(() => setLoadingReservaciones(false));
    } else if (activeTab === "settings") {
      if (!esAdmin) return;
      setLoadingSettings(true);
      getIntegraciones(token)
        .then((data) => {
          setSettingsForm({
            stripeSecretKey: data.stripeSecretKey || "",
            stripePublicKey: data.stripePublicKey || "",
            cloudinaryCloudName: data.cloudinaryCloudName || "",
            cloudinaryApiKey: data.cloudinaryApiKey || "",
            cloudinaryApiSecret: data.cloudinaryApiSecret || "",
            smtpEmail: data.smtpEmail || "",
            smtpPassword: data.smtpPassword || ""
          });
        })
        .catch(() => toast.error("Error al cargar la configuración de integraciones"))
        .finally(() => setLoadingSettings(false));
    }
  }, [token, activeStore, activeTab]);

  // Close dropdowns on outside click
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

  // Update chart data based on filter selection
  useEffect(() => {
    if (timeFilter === "24H") setChartData(CHART_DATA_24H);
    else if (timeFilter === "7D") setChartData(CHART_DATA_7D.map(d => ({ name: d.name, realTime: d.realTime, predicted: d.predicted })));
    else if (timeFilter === "30D") setChartData(CHART_DATA_30D);
  }, [timeFilter]);

  // Auto-generate slug from store name
  useEffect(() => {
    const slug = newStoreName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setNewStoreSlug(slug);
  }, [newStoreName]);

  // Fetch Reports Data
  useEffect(() => {
    if (!token || !activeStore || activeTab !== "reportes") return;

    if (reportSubTab === "personalizado") return;

    setReportesLoading(true);
    setReportesError(null);

    const desdeIso = reportFiltro.desde ? new Date(`${reportFiltro.desde}T00:00:00`).toISOString() : undefined;
    const hastaIso = reportFiltro.hasta ? new Date(`${reportFiltro.hasta}T23:59:59`).toISOString() : undefined;
    const filtro = { desde: desdeIso, hasta: hastaIso, modo: reportFiltro.modo };

    if (reportSubTab === "productos") {
      obtenerReporteProductos(token, filtro)
        .then(setReportProductos)
        .catch((err) => setReportesError(err instanceof Error ? err.message : "Error al cargar reporte de productos"))
        .finally(() => setReportesLoading(false));
    } else if (reportSubTab === "empleados") {
      obtenerReporteEmpleados(token, filtro)
        .then(setReportEmpleados)
        .catch((err) => setReportesError(err instanceof Error ? err.message : "Error al cargar reporte de empleados"))
        .finally(() => setReportesLoading(false));
    } else if (reportSubTab === "pagos") {
      obtenerReporteMetodosPago(token, filtro)
        .then(setReportMetodosPago)
        .catch((err) => setReportesError(err instanceof Error ? err.message : "Error al cargar reporte de métodos de pago"))
        .finally(() => setReportesLoading(false));
    }
  }, [token, activeStore, activeTab, reportSubTab, reportFiltro]);

  // Execute SQL Query
  const handleExecuteSql = async () => {
    if (!token) return;
    setCustomQueryLoading(true);
    setCustomQueryError(null);
    setCustomQueryResult(null);

    try {
      const result = await ejecutarRawReporte(token, customQuery);
      setCustomQueryResult(result.rows);
      toast.success("Consulta SQL ejecutada con éxito");
    } catch (err) {
      setCustomQueryError(err instanceof Error ? err.message : "Error al ejecutar la consulta SQL");
      toast.error("Error al ejecutar la consulta");
    } finally {
      setCustomQueryLoading(false);
    }
  };

  // Handle store selection
  const handleSelectStore = (store: TiendaDto) => {
    setActiveStore(store);
    window.localStorage.setItem("active_tenant_id", store.id);
    setIsStoreDropdownOpen(false);
    toast.success(`Tienda cambiada a: ${store.nombre}`);
    router.refresh();
  };

  // Handle store creation
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
      toast.success(`¡Tienda "${created.nombre}" creada y seleccionada!`);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo crear la tienda";
      toast.error(msg);
    } finally {
      setIsCreatingStore(false);
    }
  };

  // Store Builder Handlers
  const handlePropertyChange = (property: string, value: any) => {
    if (!storeConfig) return;
    setStoreConfig((prev: any) => {
      const updatedSections = prev.sections.map((sec: any) => {
        if (sec.id === selectedSectionId) {
          return {
            ...sec,
            properties: {
              ...sec.properties,
              [property]: value
            }
          };
        }
        return sec;
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const handlePublishConfig = async () => {
    if (!token || !activeStore || !storeConfig) return;
    setIsPublishingConfig(true);
    try {
      const updated = await actualizarConfiguracionVisual(token, storeConfig);
      setActiveStore(updated);
      setTiendas((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success("¡Plantilla visual publicada y guardada con éxito!");
    } catch (err) {
      console.error(err);
      toast.error("Error al publicar la plantilla.");
    } finally {
      setIsPublishingConfig(false);
    }
  };

  // Dynamic Search Engine
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { categoria: string; nombre: string; onClick: () => void }[] = [];

    // Search sucursales
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

    // Search users/clients
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

  // Grouped search results helper
  const groupedSearchResults = searchResults.reduce((acc, current) => {
    if (!acc[current.categoria]) {
      acc[current.categoria] = [];
    }
    acc[current.categoria].push(current);
    return acc;
  }, {} as Record<string, typeof searchResults>);

  // Format user role for UI
  const formatRole = (role: string | null | undefined) => {
    if (usuario?.esSuperAdmin) {
      return "Super Administrador";
    }
    if (role === "admin" || role === "administrador") {
      return "Administrador de Tienda";
    }
    if (role === "cajero") {
      return "Cajero / Personal";
    }
    return "Cliente Registrado";
  };

  // --- SUCURSALES HANDLERS ---
  const handleOpenSucursalModal = (sucursal: SucursalDto | null = null) => {
    if (sucursal) {
      setSelectedSucursal(sucursal);
      setSucursalForm({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion ?? "",
        telefono: sucursal.telefono ?? ""
      });
    } else {
      setSelectedSucursal(null);
      setSucursalForm({ nombre: "", direccion: "", telefono: "" });
    }
    setIsSucursalModalOpen(true);
  };

  const handleSubmitSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (selectedSucursal) {
        const updated = await actualizarSucursal(token, selectedSucursal.id, sucursalForm);
        setSucursales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Sucursal actualizada exitosamente");
      } else {
        const created = await crearSucursal(token, sucursalForm);
        setSucursales((prev) => [...prev, created]);
        toast.success("Sucursal creada exitosamente");
      }
      setIsSucursalModalOpen(false);
    } catch (err) {
      toast.error("Error al guardar la sucursal");
    }
  };

  const handleDeleteSucursal = async (id: string) => {
    if (!token || !window.confirm("¿Estás seguro de que deseas eliminar esta sucursal?")) return;

    try {
      await eliminarSucursal(token, id);
      setSucursales((prev) => prev.filter((s) => s.id !== id));
      toast.success("Sucursal eliminada");
    } catch (err) {
      toast.error("No se pudo eliminar la sucursal");
    }
  };

  // --- CLIENTES & COLABORADORES HANDLERS ---
  const handleOpenInviteModal = () => {
    setInviteForm({ email: "", name: "", tipoUsuario: "staff", rolStaff: "cajero", contrasena: "", sucursalId: "" });
    setIsInviteModalOpen(true);
  };

  const handleInviteUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        email: inviteForm.email,
        name: inviteForm.name,
        tipoUsuario: inviteForm.tipoUsuario,
        rolStaff: inviteForm.tipoUsuario === "staff" ? inviteForm.rolStaff : undefined,
        contrasena: inviteForm.contrasena || undefined,
        sucursalId: inviteForm.tipoUsuario === "staff" && inviteForm.sucursalId ? inviteForm.sucursalId : null
      };
      const created = await invitarPlatformUsuario(token, payload);
      setUsuarios((prev) => [created, ...prev]);
      setIsInviteModalOpen(false);
      toast.success("Usuario registrado exitosamente");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al agregar usuario";
      toast.error(msg);
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    if (!token) return;
    if (confirm("¿Estás seguro de que deseas eliminar a este colaborador? Si tiene historial de compras o reservaciones, será suspendido en su lugar.")) {
      try {
        await eliminarPlatformUsuario(token, id);
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        toast.success("Usuario eliminado o suspendido exitosamente");
      } catch (err) {
        toast.error("Error al eliminar el usuario");
      }
    }
  };

  const handleOpenChangeRolModal = (u: PlatformUsuarioDto) => {
    setSelectedUsuario(u);
    setChangeRolForm({
      tipoUsuario: u.tipoUsuario,
      rolStaff: u.rolStaff ?? "cajero",
      sucursalId: u.sucursalId ?? ""
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

  const handleOpenResetPasswordModal = (u: PlatformUsuarioDto) => {
    setResetPasswordUsuario(u);
    setResetCodes([]);
    setIsResetPasswordModalOpen(true);
  };

  const handleGenerateRecoveryCodes = async () => {
    if (!token || !resetPasswordUsuario) return;
    setIsGeneratingCodes(true);
    try {
      const result = await adminResetPassword(resetPasswordUsuario.id, token);
      setResetCodes(result.codigos);

      // Auto-download the .txt file
      const now = new Date().toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
      const contenido = [
        "=== CÓDIGOS DE RECUPERACIÓN DE CONTRASEÑA ===",
        "",
        `Usuario: ${result.nombre}`,
        `Correo:  ${result.correo}`,
        `Generado el: ${now}`,
        "",
        "INSTRUCCIONES:",
        "1. Guarda estos códigos en un lugar seguro.",
        "2. Para recuperar tu contraseña, ve a: /recuperar",
        "3. Ingresa tu correo y uno de estos códigos.",
        "4. Cada código solo puede usarse UNA vez.",
        "5. Los códigos expiran en 365 días.",
        "",
        "--- CÓDIGOS (úsalos en MAYÚSCULAS) ---",
        ...result.codigos.map((c, i) => `  ${i + 1}. ${c}`),
        "",
        "⚠️  No compartas estos códigos con nadie.",
        "⚠️  Guárdalos fuera del sistema (papel, gestor de contraseñas).",
      ].join("\n");

      const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `codigos-recuperacion-${result.correo.replace(/@.*/, "")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Códigos generados y descargados exitosamente");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al generar códigos";
      toast.error(msg);
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingSettings(true);
    try {
      await guardarIntegraciones(token, settingsForm);
      toast.success("Configuración de integraciones guardada exitosamente");
    } catch (err) {
      toast.error("Error al guardar la configuración de integraciones");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeStore) return;

    setIsSavingStoreInfo(true);
    try {
      const normalizedSlug = storeForm.slug.trim().toLowerCase();
      if (!storeForm.nombre.trim()) {
        toast.error("El nombre de la tienda no puede estar vacío");
        setIsSavingStoreInfo(false);
        return;
      }
      if (!normalizedSlug) {
        toast.error("El slug de la tienda no puede estar vacío");
        setIsSavingStoreInfo(false);
        return;
      }

      // Validar formato del slug
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(normalizedSlug)) {
        toast.error("El slug solo puede contener letras minúsculas, números y guiones");
        setIsSavingStoreInfo(false);
        return;
      }

      const updated = await actualizarTiendaInfo(token, {
        nombre: storeForm.nombre.trim(),
        slug: normalizedSlug
      });

      // Actualizar la configuración visual con el logo y nombre
      let currentConfig: any = null;
      if (updated.configuracionVisual) {
        try {
          currentConfig = typeof updated.configuracionVisual === "string"
            ? JSON.parse(updated.configuracionVisual)
            : updated.configuracionVisual;
        } catch (e) {
          console.error("Error parsing visual config", e);
        }
      }

      if (!currentConfig || (!currentConfig.sections && !currentConfig.pages)) {
        currentConfig = storeConfig || { sections: [] };
      }

      // Update name and logo in header properties of all pages
      if (currentConfig.pages) {
        currentConfig.pages = currentConfig.pages.map((p: any) => ({
          ...p,
          sections: (p.sections || []).map((sec: any) => {
            if (sec.type === "header") {
              return {
                ...sec,
                properties: {
                  ...sec.properties,
                  storeName: storeForm.nombre.trim(),
                  logoUrl: storeForm.logoUrl.trim()
                }
              };
            }
            return sec;
          })
        }));
      }

      // Also update root sections if they exist
      if (currentConfig.sections) {
        currentConfig.sections = currentConfig.sections.map((sec: any) => {
          if (sec.type === "header") {
            return {
              ...sec,
              properties: {
                ...sec.properties,
                storeName: storeForm.nombre.trim(),
                logoUrl: storeForm.logoUrl.trim()
              }
            };
          }
          return sec;
        });
      }

      const updatedWithVisual = await actualizarConfiguracionVisual(token, currentConfig);

      // Actualizar estados locales
      setActiveStore(updatedWithVisual);
      setStoreConfig(currentConfig);
      setTiendas((prev) => prev.map((t) => t.id === updatedWithVisual.id ? updatedWithVisual : t));
      toast.success("Información de la tienda y logotipo guardados exitosamente");
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar la información de la tienda. Es posible que el slug ya esté en uso.");
    } finally {
      setIsSavingStoreInfo(false);
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

  // --- PRODUCTOS HANDLERS ---
  const handleOpenProductoModal = (prod: PlatformProductoDto | null = null) => {
    if (prod) {
      setSelectedProducto(prod);
      setProductoForm({
        nombre: prod.nombre,
        precioMayoreo: prod.precioMayoreo,
        precioDetalle: prod.precioDetalle,
        categoriaId: prod.categoriaId ?? "",
        sku: prod.sku ?? "",
        descripcion: prod.descripcion ?? "",
        imagenUrl: prod.imagenUrl ?? "",
        publicado: prod.publicado,
        stockMinimo: prod.stockMinimo
      });
      const map: Record<string, number> = {};
      prod.inventarios?.forEach(i => {
        map[i.sucursalId] = i.stock;
      });
      setStockSucursalesMap(map);
    } else {
      setSelectedProducto(null);
      setProductoForm({
        nombre: "",
        precioMayoreo: 0,
        precioDetalle: 0,
        categoriaId: "",
        sku: "",
        descripcion: "",
        imagenUrl: "",
        publicado: true,
        stockMinimo: 0
      });
      setStockSucursalesMap({});
    }
    setIsProductoModalOpen(true);
  };

  const handleSubmitProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const stockSucursales = Object.entries(stockSucursalesMap).map(([sucursalId, stock]) => ({
      sucursalId,
      stock: Number(stock) || 0
    }));

    const payload = {
      nombre: productoForm.nombre,
      precioMayoreo: Number(productoForm.precioMayoreo),
      precioDetalle: Number(productoForm.precioDetalle),
      categoriaId: productoForm.categoriaId || null,
      sku: productoForm.sku || null,
      descripcion: productoForm.descripcion || null,
      imagenUrl: productoForm.imagenUrl || null,
      publicado: productoForm.publicado,
      stockMinimo: Number(productoForm.stockMinimo) || 0,
      stockSucursales
    };

    try {
      if (selectedProducto) {
        const updated = await actualizarPlatformProducto(token, selectedProducto.id, payload);
        setProductos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Producto modificado exitosamente");
      } else {
        const created = await crearPlatformProducto(token, payload);
        setProductos((prev) => [created, ...prev]);
        toast.success("Producto creado exitosamente");
      }
      setIsProductoModalOpen(false);
    } catch (err) {
      toast.error("Error al guardar el producto");
    }
  };

  const handleTogglePublicadoProducto = async (prod: PlatformProductoDto) => {
    if (!token) return;

    try {
      const payload = {
        nombre: prod.nombre,
        precioMayoreo: prod.precioMayoreo,
        precioDetalle: prod.precioDetalle,
        categoriaId: prod.categoriaId,
        sku: prod.sku,
        descripcion: prod.descripcion,
        imagenUrl: prod.imagenUrl,
        publicado: !prod.publicado
      };
      const updated = await actualizarPlatformProducto(token, prod.id, payload);
      setProductos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      toast.success(`Producto ${updated.publicado ? "visible" : "oculto"} en el catálogo`);
    } catch (err) {
      toast.error("Error al cambiar la visibilidad");
    }
  };

  const handleDeleteProducto = async (id: string) => {
    if (!token || !window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      await eliminarPlatformProducto(token, id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado exitosamente");
    } catch (err) {
      toast.error("Error al eliminar el producto");
    }
  };

  // --- BULK PRODUCT IMPORT AND REPORTS HANDLERS ---
  const downloadTemplate = (format: "csv" | "xlsx") => {
    const templateData = [
      {
        Nombre: "Producto Ejemplo 1",
        Descripcion: "Descripción detallada del producto ejemplo 1",
        Sku: "SKU-EJEMPLO-01",
        PrecioDetalle: 120.50,
        PrecioMayoreo: 95.00,
        StockActual: 50,
        StockMinimo: 5,
        CategoriaId: "",
        Publicado: true,
        ImagenUrl: "https://ejemplo.com/imagen.jpg"
      },
      {
        Nombre: "Producto Ejemplo 2",
        Descripcion: "Descripción detallada del producto ejemplo 2",
        Sku: "SKU-EJEMPLO-02",
        PrecioDetalle: 45.00,
        PrecioMayoreo: 35.00,
        StockActual: 100,
        StockMinimo: 10,
        CategoriaId: "",
        Publicado: false,
        ImagenUrl: ""
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Productos");
    XLSX.writeFile(workbook, `plantilla_importacion_productos.${format}`, { bookType: format === "xlsx" ? "xlsx" : "csv" });
    toast.success(`Plantilla descargada en formato ${format.toUpperCase()}`);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        if (json.length === 0) {
          toast.error("El archivo está vacío o no contiene filas de datos.");
          return;
        }

        // Validar columnas
        const requiredColumns = ["Nombre", "PrecioDetalle", "PrecioMayoreo"];
        const firstRow = json[0];
        const missing = requiredColumns.filter(col => !(col in firstRow));
        if (missing.length > 0) {
          toast.error(`Columnas requeridas faltantes: ${missing.join(", ")}`);
          return;
        }

        // Validar y mapear filas
        const productsToCreate: CrearPlatformProductoBulkInput[] = json.map((row, index) => {
          const nombre = String(row.Nombre || "").trim();
          if (!nombre) {
            throw new Error(`Fila ${index + 2}: El 'Nombre' es requerido.`);
          }

          const precioDetalle = parseFloat(row.PrecioDetalle);
          if (isNaN(precioDetalle) || precioDetalle < 0) {
            throw new Error(`Fila ${index + 2}: El 'PrecioDetalle' debe ser un número válido >= 0.`);
          }

          const precioMayoreo = parseFloat(row.PrecioMayoreo);
          if (isNaN(precioMayoreo) || precioMayoreo < 0) {
            throw new Error(`Fila ${index + 2}: El 'PrecioMayoreo' debe ser un número válido >= 0.`);
          }

          const stockActual = parseInt(row.StockActual || "0", 10);
          const stockMinimo = parseInt(row.StockMinimo || "0", 10);

          return {
            nombre,
            descripcion: row.Descripcion ? String(row.Descripcion) : null,
            sku: row.Sku ? String(row.Sku) : null,
            precioDetalle,
            precioMayoreo,
            stockActual: isNaN(stockActual) ? 0 : stockActual,
            stockMinimo: isNaN(stockMinimo) ? 0 : stockMinimo,
            categoriaId: row.CategoriaId ? String(row.CategoriaId) : null,
            publicado: row.Publicado === undefined ? true : (String(row.Publicado).toLowerCase() === "true" || row.Publicado === true || row.Publicado === 1),
            imagenUrl: row.ImagenUrl ? String(row.ImagenUrl) : null
          };
        });

        setParsedProducts(productsToCreate);
        toast.success(`Archivo cargado con éxito. ${productsToCreate.length} productos listos para importar.`);
      } catch (err: any) {
        toast.error(err.message || "Error al procesar el archivo.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    if (!token || parsedProducts.length === 0) return;

    setIsImporting(true);
    try {
      const created = await crearPlatformProductosBulk(token, parsedProducts);
      setProductos((prev) => [...created, ...prev]);
      toast.success(`¡Carga masiva completada! ${created.length} productos importados.`);
      setIsImportModalOpen(false);
      setParsedProducts([]);
    } catch (err) {
      toast.error("Error al importar productos al servidor.");
    } finally {
      setIsImporting(false);
    }
  };

  const tieneDatosReporte = () => {
    if (reportSubTab === "productos" && reportProductos?.detalle && reportProductos.detalle.length > 0) return true;
    if (reportSubTab === "empleados" && reportEmpleados?.detalle && reportEmpleados.detalle.length > 0) return true;
    if (reportSubTab === "pagos" && reportMetodosPago?.detalle && reportMetodosPago.detalle.length > 0) return true;
    if (reportSubTab === "personalizado" && customQueryResult && customQueryResult.length > 0) return true;
    return false;
  };

  const exportarReporte = (format: "csv" | "xlsx") => {
    if (!token) return;

    let data: any[] = [];
    let fileNameName = "";

    if (reportSubTab === "productos" && reportProductos) {
      data = reportProductos.detalle.map(row => ({
        Posicion: row.posicion,
        Producto: row.producto,
        "Cantidad Vendida": row.cantidadVendida,
        "Ingresos (S/)": row.ingresos,
        "Precio Promedio (S/)": row.precioPromedio
      }));
      fileNameName = "ventas_por_producto";
    } else if (reportSubTab === "empleados" && reportEmpleados) {
      data = reportEmpleados.detalle.map(row => ({
        Empleado: row.empleado,
        "Ventas Realizadas": row.ventasRealizadas,
        "Monto Total (S/)": row.montoTotal,
        "Promedio por Venta (S/)": row.promedioPorVenta,
        "Desempeño": row.desempeno
      }));
      fileNameName = "desempeno_empleados";
    } else if (reportSubTab === "pagos" && reportMetodosPago) {
      data = reportMetodosPago.detalle.map(row => ({
        "Método de Pago": row.metodo,
        "Cantidad de Transacciones": row.cantidadTransacciones,
        "Porcentaje (%)": row.porcentaje,
        "Monto Total (S/)": row.montoTotal,
        "Monto Promedio (S/)": row.montoPromedio
      }));
      fileNameName = "metodos_pago";
    } else if (reportSubTab === "personalizado" && customQueryResult) {
      data = customQueryResult;
      fileNameName = "consulta_personalizada";
    }

    if (data.length === 0) {
      toast.error("No hay datos para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
    XLSX.writeFile(workbook, `reporte_${fileNameName}_${new Date().toISOString().slice(0,10)}.${format}`, { bookType: format === "xlsx" ? "xlsx" : "csv" });
    toast.success(`Reporte exportado exitosamente en formato ${format.toUpperCase()}`);
  };

  // --- RESERVACIONES HANDLERS ---
  const handleToggleEstadoPagoReservacion = async (res: ReservacionDto) => {
    if (!token) return;
    const nuevoEstado = res.estadoPago === "pagado" ? "pendiente" : "pagado";
    try {
      const updated = await cambiarEstadoReservacion(token, res.id, { estadoPago: nuevoEstado });
      setReservaciones((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success("Estado de pago actualizado");
    } catch (err) {
      toast.error("Error al actualizar el estado de pago");
    }
  };

  const handleToggleDespachoReservacion = async (res: ReservacionDto) => {
    if (!token) return;
    const nuevoEstado = res.estadoDespacho === "despachado" ? "procesando" : "despachado";
    try {
      const updated = await cambiarEstadoReservacion(token, res.id, { estadoDespacho: nuevoEstado });
      setReservaciones((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success("Estado de despacho actualizado");
    } catch (err) {
      toast.error("Error al actualizar el estado de despacho");
    }
  };

  // --- CALCULATE DYNAMIC METRICS FOR DASHBOARD ---
  const totalVentas = reservaciones.filter(r => r.estadoPago === "pagado").reduce((acc, r) => acc + Number(r.montoTotal), 0);
  const ordenesActivas = reservaciones.filter(r => r.estadoDespacho === "procesando").length;
  const totalReservasCount = reservaciones.length;
  const totalStockSum = productos.reduce((acc, p) => acc + p.stockTotal, 0);

  // Helper for dashboard
  const getUsuarioNombre = (usuarioId: string) => {
    const usr = usuarios.find((u) => u.id === usuarioId);
    return usr ? usr.name : "Cliente";
  };

  const hoyStart = new Date();
  hoyStart.setHours(0,0,0,0);
  const ayerStart = new Date(hoyStart.getTime() - 24 * 60 * 60 * 1000);

  const hoyStr = new Date().toDateString();
  const ventasHoyCount = reservaciones.filter((r) => new Date(r.fechaReserva).toDateString() === hoyStr).length;
  const displayVentasHoy = ventasHoyCount;

  const ventasAyer = reservaciones.filter(r => {
    const d = new Date(r.fechaReserva);
    return d >= ayerStart && d < hoyStart;
  }).length;

  let displayVentasHoyChange = "Sin ventas hoy";
  if (ventasAyer > 0) {
    const diff = ((ventasHoyCount - ventasAyer) / ventasAyer) * 100;
    displayVentasHoyChange = `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}% vs ayer`;
  } else if (ventasHoyCount > 0) {
    displayVentasHoyChange = `+100% vs ayer`;
  }

  const displayIngresos = `Q ${totalVentas.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const ingresosAyer = reservaciones
    .filter(r => {
      const d = new Date(r.fechaReserva);
      return d >= ayerStart && d < hoyStart && r.estadoPago === "pagado";
    })
    .reduce((acc, r) => acc + Number(r.montoTotal), 0);

  const ingresosHoy = reservaciones
    .filter(r => {
      const d = new Date(r.fechaReserva);
      return d >= hoyStart && r.estadoPago === "pagado";
    })
    .reduce((acc, r) => acc + Number(r.montoTotal), 0);

  let displayIngresosChange = "Sin ingresos hoy";
  if (ingresosAyer > 0) {
    const diff = ((ingresosHoy - ingresosAyer) / ingresosAyer) * 100;
    displayIngresosChange = `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}% vs ayer`;
  } else if (ingresosHoy > 0) {
    displayIngresosChange = `+100% vs ayer`;
  }

  const displayProductosActivos = productos.filter((p) => p.publicado).length;

  const criticalProducts = productos.filter((p) => p.stockTotal <= p.stockMinimo);
  const displayStockCritico = criticalProducts.length;

  // Chart data 1: Ventas por Hora
  const hourCounts = new Array(10).fill(0); // 8:00 to 17:00
  reservaciones.forEach((r) => {
    const date = new Date(r.fechaReserva);
    const hour = date.getHours();
    if (hour >= 8 && hour <= 17) {
      hourCounts[hour - 8]++;
    }
  });
  const chartDataVentasHora = hourCounts.map((count, index) => ({
    name: `${(index + 8).toString().padStart(2, "0")}:00`,
    ventas: count
  }));

  // Chart data 2: Productos Más Vendidos (Top 5)
  const productSalesMap: Record<string, { name: string; quantity: number }> = {};
  reservaciones.forEach((r) => {
    r.detalles.forEach((d) => {
      if (d.productoNombre) {
        if (!productSalesMap[d.productoNombre]) {
          productSalesMap[d.productoNombre] = { name: d.productoNombre, quantity: 0 };
        }
        productSalesMap[d.productoNombre].quantity += d.cantidad;
      }
    });
  });
  const chartDataTop5 = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((p) => ({ name: p.name, ventas: p.quantity }));

  // List 1: Alertas de Stock Crítico
  const displayedCriticalProducts = criticalProducts.map((p) => ({
    nombre: p.nombre,
    minimo: p.stockMinimo,
    disponibles: p.stockTotal
  }));

  // List 2: Últimas Ventas
  const latestSales = [...reservaciones]
    .sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());
  const displayedSales = latestSales.slice(0, 4).map((res) => ({
    codigo: `V-${res.id.substring(0, 6).toUpperCase()}`,
    cliente: getUsuarioNombre(res.usuarioId),
    hora: new Date(res.fechaReserva).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    monto: `Q ${res.montoTotal.toFixed(2)}`,
    metodo: res.stripeIntentId ? "Tarjeta" : "Efectivo"
  }));

  // Compute lists of users
  const staffUsuarios = usuarios.filter(u => u.tipoUsuario === "staff" || u.tipoUsuario === "administrador");
  if (usuario && !staffUsuarios.some(u => u.email === usuario.correo)) {
    staffUsuarios.push({
      id: usuario.usuarioId,
      name: usuario.nombre,
      email: usuario.correo,
      emailVerified: true,
      image: null,
      tipoUsuario: "staff",
      rolStaff: usuario.rol === "admin" ? "administrador" : usuario.rol,
      estado: true,
      createdAt: new Date().toISOString(),
      sucursalId: null,
      sucursalNombre: null
    });
  }
  const clientUsuarios = usuarios.filter(u => u.tipoUsuario === "cliente");
  const colaboradoresCount = staffUsuarios.length;

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
              <span>Tablero</span>
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
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left cursor-pointer border-none w-full text-slate-400 hover:bg-slate-900/40 hover:text-white bg-transparent animate-fade-in"
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
      {/* Sidebar de Escritorio */}
      <aside className="w-64 border-r border-slate-900 bg-slate-955/40 p-6 flex-col justify-between shrink-0 view-transition-sidebar hidden lg:flex h-[100dvh] max-h-[100dvh] fixed top-0 left-0 z-20 overflow-y-auto">
        {renderSidebar(false)}
      </aside>

      {/* Drawer Móvil Backdrop */}
      {menuAbierto && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Sidebar Móvil Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-900 bg-slate-950/95 p-6 transition-transform duration-200 lg:hidden h-[100dvh] max-h-[100dvh] overflow-y-auto",
          menuAbierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderSidebar(true)}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/20 px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4 relative z-45 view-transition-header">
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
              <div className="absolute top-12 left-0 w-full rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-2xl shadow-black max-h-[360px] overflow-y-auto z-50">
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
            {/* Store/Tenant Selector */}
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
                <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl shadow-black z-50">
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

            {/* System Configuration Button */}
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
              </div>
              <div className="h-9 w-9 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-xs font-black text-[#38BDF8]">
                  {usuario.nombre.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 relative z-10 view-transition-content">
          {/* Decorative Blur Backgrounds */}
          <div className="pointer-events-none absolute top-20 left-1/3 h-[400px] w-[400px] rounded-full bg-[#22D3A6]/2 blur-[100px] -z-10" />
          <div className="pointer-events-none absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-[#38BDF8]/2 blur-[120px] -z-10" />

          {/* TAB: TABLERO (DASHBOARD) */}
          {activeTab === "tablero" && (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-xl font-black text-white">Dashboard</h2>
                <p className="text-xs text-slate-400">Bienvenido al panel de administración</p>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Ventas del Día */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Ventas del Día</span>
                    <ShoppingCart size={14} className="text-[#38BDF8]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{displayVentasHoy}</span>
                  </div>
                  <div className={`text-[10px] font-bold flex items-center gap-1 ${ventasHoyCount > 0 ? "text-[#22D3A6]" : "text-slate-400"}`}>
                    <span>{displayVentasHoyChange}</span>
                  </div>
                </div>

                {/* Card 2: Ingresos Totales */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Ingresos Totales</span>
                    <DollarSign size={14} className="text-[#22D3A6]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">{displayIngresos}</span>
                  </div>
                  <div className={`text-[10px] font-bold flex items-center gap-1 ${totalVentas > 0 ? "text-[#22D3A6]" : "text-slate-400"}`}>
                    <span>{displayIngresosChange}</span>
                  </div>
                </div>

                {/* Card 3: Productos Activos */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Productos Activos</span>
                    <Package size={14} className="text-[#38BDF8]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{displayProductosActivos}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <span>En inventario</span>
                  </div>
                </div>

                {/* Card 4: Stock Crítico */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-slate-800 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Stock Crítico</span>
                    <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-500">{displayStockCritico}</span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-500/80 flex items-center gap-1">
                    <span>Requieren atención</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Ventas por Hora */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas por Hora</h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataVentasHora} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip
                          cursor={{ stroke: "rgba(14, 24, 39, 0.4)", strokeWidth: 1 }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black space-y-1">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">{label}</p>
                                  <p className="font-semibold text-[#38BDF8] text-xs leading-none">Ventas: {payload[0].value}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="ventas"
                          stroke="#38BDF8"
                          strokeWidth={2.5}
                          dot={{ fill: "#38BDF8", stroke: "#081018", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Productos Más Vendidos (Top 5) */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos Más Vendidos (Top 5)</h3>
                  <div className="h-64 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataTop5} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#475569"
                          fontSize={9}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                          interval={0}
                          tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}...` : val)}
                        />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip
                          cursor={{ fill: "rgba(14, 24, 39, 0.4)" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black space-y-1">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none text-ellipsis overflow-hidden max-w-xs">{label}</p>
                                  <p className="font-semibold text-[#22D3A6] text-xs leading-none">Ventas: {payload[0].value} uds</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="ventas" fill="#38BDF8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Lists Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Alertas de Stock Crítico */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas de Stock Crítico</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold">
                      {displayedCriticalProducts.length} productos
                    </span>
                  </div>
                  <div className="space-y-3">
                    {displayedCriticalProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 transition-all hover:bg-amber-500/10">
                        <div>
                          <h4 className="text-xs font-bold text-white">{p.nombre}</h4>
                          <span className="text-[10px] text-slate-400">Stock mínimo: {p.minimo} unidades</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-amber-500">{p.disponibles}</span>
                          <p className="text-[9px] text-slate-400">disponibles</p>
                        </div>
                      </div>
                    ))}
                    {displayedCriticalProducts.length === 0 && (
                      <p className="text-xs text-slate-500 italic text-center py-8">
                        No hay productos en estado de stock crítico actualmente.
                      </p>
                    )}
                  </div>
                </div>

                {/* Últimas Ventas */}
                <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Últimas Ventas</h3>
                  <div className="space-y-3">
                    {displayedSales.map((sale, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-900 bg-slate-950/20 hover:border-slate-800 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white">{sale.codigo}</h4>
                          <p className="text-[10px] text-slate-400">{sale.cliente}</p>
                          <span className="text-[9px] text-slate-500 block">{sale.hora}</span>
                        </div>
                        <div className="text-right space-y-1.5">
                          <span className="text-xs font-black text-white">{sale.monto}</span>
                          <div>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-900 text-[#22D3A6] border border-slate-800 uppercase tracking-wider">
                              {sale.metodo}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {displayedSales.length === 0 && (
                      <p className="text-xs text-slate-500 italic text-center py-8">
                        No se han registrado ventas recientemente.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUCURSALES */}
          {activeTab === "sucursales" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Sucursales</h2>
                  <p className="text-xs text-slate-400">Administra las ubicaciones físicas de tu tienda</p>
                </div>
                {esAdmin && (
                  <button
                    onClick={() => handleOpenSucursalModal()}
                    className="h-10 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none"
                  >
                    <Plus size={16} />
                    <span>Agregar Sucursal</span>
                  </button>
                )}
              </div>

              {loadingSucursales ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              ) : sucursales.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                  <GitBranch className="mx-auto text-slate-600" size={40} />
                  <p className="text-sm text-slate-400">No hay sucursales registradas para esta tienda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sucursales.map((suc) => (
                    <div
                      key={suc.id}
                      onClick={() => setSelectedSucursalDetail(suc)}
                      className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col justify-between hover:border-slate-800 transition-all gap-4 cursor-pointer hover:bg-slate-900/60"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <GitBranch className="text-[#38BDF8]" size={18} />
                          <h3 className="text-base font-bold text-white">{suc.nombre}</h3>
                        </div>
                        <p className="text-xs text-slate-400 min-h-[36px]">{suc.direccion || "Sin dirección registrada"}</p>
                        <p className="text-xs font-semibold text-[#22D3A6]">{suc.telefono ? `Teléfono: ${suc.telefono}` : "Sin teléfono registrado"}</p>
                      </div>

                      {esAdmin && (
                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-900/60">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenSucursalModal(suc);
                            }}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer border-none"
                            title="Editar Sucursal"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSucursal(suc.id);
                            }}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer border-none"
                            title="Eliminar Sucursal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CLIENTES */}
          {activeTab === "clientes" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Clientes (CRM)</h2>
                <p className="text-xs text-slate-400">Consulta la base de datos de clientes registrados en tu tienda</p>
              </div>

              {loadingUsuarios ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              ) : clientUsuarios.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                  <Users className="mx-auto text-slate-600" size={40} />
                  <p className="text-sm text-slate-400">No se encontraron clientes registrados.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Correo</th>
                          <th className="p-4">Estado</th>
                          {esAdmin && <th className="p-4 text-right">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {clientUsuarios.map((u) => (
                            <tr key={u.id} className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all">
                              <td className="p-4 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-[#38BDF8]">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-white">{u.name}</span>
                              </td>
                              <td className="p-4 text-slate-300">{u.email}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                  u.estado ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                }`}>
                                  {u.estado ? "Activo" : "Suspendido"}
                                </span>
                              </td>
                              {esAdmin && (
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleToggleEstadoUsuario(u)}
                                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer border-none text-[10px] font-bold"
                                  >
                                    {u.estado ? "Suspender" : "Activar"}
                                  </button>
                                  <button
                                    onClick={() => handleOpenChangeRolModal(u)}
                                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[#38BDF8] cursor-pointer border-none text-[10px] font-bold ml-2"
                                  >
                                    Cambiar Rol
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: USUARIOS */}
          {activeTab === "usuarios" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">Usuarios de la Tienda (Personal)</h2>
                  <p className="text-xs text-slate-400">Administra los roles, permisos y estados de los colaboradores del staff</p>
                </div>
                {esAdmin && (
                  <button
                    onClick={handleOpenInviteModal}
                    className="h-10 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none"
                  >
                    <Mail size={16} />
                    <span>Invitar Colaborador</span>
                  </button>
                )}
              </div>

              {loadingUsuarios ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              ) : staffUsuarios.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                  <Users className="mx-auto text-slate-600" size={40} />
                  <p className="text-sm text-slate-400">No se encontraron usuarios de staff.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                          <th className="p-4">Colaborador</th>
                          <th className="p-4">Correo</th>
                          <th className="p-4">Rol Staff</th>
                          <th className="p-4">Estado</th>
                          {esAdmin && <th className="p-4 text-right">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {staffUsuarios.map((u) => (
                            <tr key={u.id} className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all">
                              <td className="p-4 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-[#38BDF8]">
                                  {u.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-bold text-white">{u.name}</span>
                              </td>
                              <td className="p-4 text-slate-300">{u.email}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded-md bg-[#38BDF8]/10 text-[#38BDF8] text-[9px] font-black uppercase tracking-wider">
                                  {u.rolStaff || "Cajero"}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  disabled={!esAdmin}
                                  onClick={() => handleToggleEstadoUsuario(u)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                                    u.estado ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                  }`}
                                >
                                  {u.estado ? "Activo" : "Suspendido"}
                                </button>
                              </td>
                                {esAdmin && (
                                  <td className="p-4 text-right space-x-2">
                                    <button
                                      onClick={() => handleOpenChangeRolModal(u)}
                                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[#38BDF8] cursor-pointer border-none text-[10px] font-bold"
                                      title="Cambiar Tipo / Rol"
                                    >
                                      Editar Permisos
                                    </button>
                                    <button
                                      onClick={() => handleOpenResetPasswordModal(u)}
                                      className="p-1.5 rounded bg-slate-900 hover:bg-amber-950/40 text-amber-400 cursor-pointer border-none text-[10px] font-bold"
                                      title="Generar códigos de recuperación de contraseña"
                                    >
                                      Reestablecer Contraseña
                                    </button>
                                    {usuario?.correo !== u.email && (
                                      <button
                                        onClick={() => handleDeleteUsuario(u.id)}
                                        className="p-1.5 rounded bg-slate-900 hover:bg-rose-950/30 text-rose-400 cursor-pointer border-none text-[10px] font-bold"
                                        title="Eliminar Colaborador"
                                      >
                                        Eliminar
                                      </button>
                                    )}
                                  </td>
                                )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTOS */}
          {activeTab === "productos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white">Productos</h2>
                  <p className="text-xs text-slate-400">Administra catálogo de productos, precios y visualiza stocks totales</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      placeholder="Filtrar por nombre o SKU..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="h-9 w-full pl-9 pr-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs placeholder:text-slate-500 text-slate-100 outline-none focus:border-[#22D3A6]/40"
                    />
                  </div>
                  {esAdmin && (
                    <>
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="h-9 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-750 shrink-0"
                      >
                        <Upload size={16} />
                        <span>Importar Productos</span>
                      </button>
                      <button
                        onClick={() => handleOpenProductoModal()}
                        className="h-9 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none shrink-0"
                      >
                        <Plus size={16} />
                        <span>Nuevo Producto</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {loadingProductos ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              ) : productos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                  <Package className="mx-auto text-slate-600" size={40} />
                  <p className="text-sm text-slate-400">No se encontraron productos registrados.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                          <th className="p-4">Nombre</th>
                          <th className="p-4">SKU</th>
                          <th className="p-4">Precio Detalle</th>
                          <th className="p-4">Precio Mayoreo</th>
                          <th className="p-4 text-center">Stock Total</th>
                          <th className="p-4">Publicado</th>
                          {esAdmin && <th className="p-4 text-right">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {productos
                          .filter((p) =>
                            p.nombre.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                            (p.sku && p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()))
                          )
                          .map((p) => (
                            <tr key={p.id} className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {p.imagenUrl ? (
                                    <img src={p.imagenUrl} alt={p.nombre} className="h-8 w-8 rounded bg-slate-900 object-cover" />
                                  ) : (
                                    <div className="h-8 w-8 rounded bg-slate-900 flex items-center justify-center text-slate-600">
                                      <Package size={14} />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-white text-xs leading-tight">{p.nombre}</p>
                                    <p className="text-[10px] text-slate-500 truncate max-w-xs">{p.descripcion}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-slate-400 font-mono">{p.sku || "—"}</td>
                              <td className="p-4 text-white font-semibold">Q{p.precioDetalle.toFixed(2)}</td>
                              <td className="p-4 text-slate-350">Q{p.precioMayoreo.toFixed(2)}</td>
                              <td className="p-4 text-center font-bold text-[#38BDF8]">{p.stockTotal} uds</td>
                              <td className="p-4">
                                <button
                                  disabled={!esAdmin}
                                  onClick={() => handleTogglePublicadoProducto(p)}
                                  className={`p-1.5 rounded-lg transition-all border-none bg-transparent cursor-pointer ${
                                    p.publicado ? "text-[#22D3A6] hover:text-[#22D3A6]/70" : "text-slate-600 hover:text-slate-400"
                                  }`}
                                >
                                  {p.publicado ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                              </td>
                              {esAdmin && (
                                <td className="p-4 text-right space-x-2">
                                  <button
                                    onClick={() => handleOpenProductoModal(p)}
                                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer border-none"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProducto(p.id)}
                                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-all cursor-pointer border-none"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: RESERVACIONES */}
          {activeTab === "reservaciones" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Reservaciones</h2>
                <p className="text-xs text-slate-400">Consulta las reservaciones y pedidos de tus clientes en tiempo real</p>
              </div>

              {loadingReservaciones ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              ) : reservaciones.filter(r => r.estadoPago !== "pagado").length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                  <Calendar className="mx-auto text-slate-600" size={40} />
                  <p className="text-sm text-slate-400">No hay reservaciones activas para esta tienda.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                          <th className="p-4">Código Reservación</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Monto Total</th>
                          <th className="p-4">Estado Pago</th>
                          <th className="p-4">Despacho</th>
                          <th className="p-4">Detalle Artículos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservaciones
                          .filter((r) => r.estadoPago !== "pagado")
                          .map((res) => (
                            <tr key={res.id} className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all">
                              <td className="p-4 font-mono font-bold text-white">#{res.id.substring(0, 8).toUpperCase()}</td>
                              <td className="p-4 text-slate-400">{new Date(res.fechaReserva).toLocaleString("es-ES")}</td>
                              <td className="p-4 text-[#22D3A6] font-bold">Q{res.montoTotal.toFixed(2)}</td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleEstadoPagoReservacion(res)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                                    res.estadoPago === "pagado" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {res.estadoPago}
                                </button>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleDespachoReservacion(res)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                                    res.estadoDespacho === "despachado" ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                                  }`}
                                >
                                  {res.estadoDespacho}
                                </button>
                              </td>
                              <td className="p-4 text-slate-300">
                                <div className="flex flex-col gap-0.5 text-[10px]">
                                  {res.detalles.map((d, index) => (
                                    <span key={index}>
                                      • {d.productoNombre ?? "Artículo"}: {d.cantidad} ud x Q{d.precioCobrado.toFixed(2)}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAGOS (ONLY PROJECTIONS FROM RESERVATIONS WITH STATE PAID) */}
          {activeTab === "pagos" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Control de Caja y Pagos</h2>
                <p className="text-xs text-slate-400">Verifica las transacciones con estado de pago registrado como COMPLETADO</p>
              </div>

              {reservaciones.filter(r => r.estadoPago === "pagado").length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3">
                  <CreditCard className="mx-auto text-slate-600" size={40} />
                  <p className="text-sm text-slate-400">No hay pagos confirmados registrados para esta tienda.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900 bg-slate-950/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/60 text-slate-400 uppercase font-bold tracking-wider">
                          <th className="p-4">Identificador Pago</th>
                          <th className="p-4">Stripe Intent ID</th>
                          <th className="p-4">Fecha Transacción</th>
                          <th className="p-4">Importe Neto</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4">Despacho / Entrega</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservaciones
                          .filter((r) => r.estadoPago === "pagado")
                          .map((res) => (
                            <tr key={res.id} className="border-b border-slate-900/55 hover:bg-slate-950/30 transition-all">
                              <td className="p-4 font-mono font-bold text-white">PAG-{res.id.substring(0, 6).toUpperCase()}</td>
                              <td className="p-4 text-slate-450">{res.stripeIntentId || "Efectivo / Transferencia"}</td>
                              <td className="p-4 text-slate-400">{new Date(res.fechaReserva).toLocaleString()}</td>
                              <td className="p-4 text-[#22D3A6] font-bold">Q{res.montoTotal.toFixed(2)}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                                  Verificado
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleToggleDespachoReservacion(res)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer border-none ${
                                    res.estadoDespacho === "despachado" ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                                  }`}
                                >
                                  {res.estadoDespacho}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: REPORTES (SQL TOOL) */}
          {activeTab === "reportes" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-900 pb-5">
                <div>
                  <h2 className="text-xl font-black text-white">Reportes de Negocio</h2>
                  <p className="text-xs text-slate-400">Analiza el rendimiento de tu tienda y realiza consultas personalizadas</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Filters (only show if not in personalized tab) */}
                  {reportSubTab !== "personalizado" && (
                    <>
                      {/* Mode selection */}
                      <div className="inline-flex rounded-xl bg-slate-955 p-1 border border-slate-900">
                        {(["todos", "ventas", "reservaciones"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setReportFiltro((prev) => ({ ...prev, modo: m }))}
                            className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border-none bg-transparent cursor-pointer ${
                              reportFiltro.modo === m
                                ? "bg-[#22D3A6] text-slate-950 shadow-sm"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {m === "todos" ? "Todos" : m === "ventas" ? "Ventas" : "Reservaciones"}
                          </button>
                        ))}
                      </div>

                      {/* Date picker */}
                      <div className="flex items-center gap-2 rounded-xl bg-slate-955 p-1 border border-slate-900 text-xs">
                        <input
                          type="date"
                          value={reportFiltro.desde}
                          onChange={(e) => setReportFiltro((prev) => ({ ...prev, desde: e.target.value }))}
                          className="bg-transparent border-none text-slate-300 font-mono text-[10px] focus:outline-none p-1 w-28 cursor-pointer"
                        />
                        <span className="text-slate-600">al</span>
                        <input
                          type="date"
                          value={reportFiltro.hasta}
                          onChange={(e) => setReportFiltro((prev) => ({ ...prev, hasta: e.target.value }))}
                          className="bg-transparent border-none text-slate-300 font-mono text-[10px] focus:outline-none p-1 w-28 cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {/* Export Buttons */}
                  {tieneDatosReporte() && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportarReporte("csv")}
                        className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
                      >
                        <Download size={12} />
                        <span>Exportar CSV</span>
                      </button>
                      <button
                        onClick={() => exportarReporte("xlsx")}
                        className="h-8 px-3 rounded-lg bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-none shrink-0"
                      >
                        <FileText size={12} />
                        <span>Exportar Excel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub Tabs Navigation */}
              <div className="flex border-b border-slate-900 gap-6">
                {(["productos", "empleados", "pagos", "personalizado"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setReportSubTab(tab);
                      setReportesError(null);
                    }}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative border-none bg-transparent cursor-pointer ${
                      reportSubTab === tab
                        ? "text-[#22D3A6] font-extrabold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab === "productos"
                      ? "Productos"
                      : tab === "empleados"
                      ? "Empleados"
                      : tab === "pagos"
                      ? "Métodos de Pago"
                      : "Personalizado (SQL)"}
                    {reportSubTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#22D3A6]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Error Alert */}
              {reportesError && reportSubTab !== "personalizado" && (
                <div className="rounded-xl border border-rose-900 bg-rose-950/20 p-4 text-xs text-rose-400 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>{reportesError}</span>
                </div>
              )}

              {/* Loading State */}
              {reportesLoading && reportSubTab !== "personalizado" && (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              )}

              {/* Content Panel */}
              {!reportesLoading && (
                <div className="space-y-6">
                  {/* SUBTAB: PRODUCTOS */}
                  {reportSubTab === "productos" && reportProductos && (
                    <div className="space-y-6">
                      {/* KPIs */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Productos Vendidos</span>
                          <span className="text-2xl font-black text-white">{reportProductos.totalProductosVendidos.toLocaleString("es-PE")}</span>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ingresos Totales</span>
                          <span className="text-2xl font-black text-[#22D3A6]">
                            S/ {reportProductos.ingresosTotales.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Producto Top</span>
                          <span className="text-lg font-black text-white truncate">{reportProductos.productoTop ?? "—"}</span>
                          {reportProductos.unidadesProductoTop != null && (
                            <span className="text-[10px] text-slate-400 font-semibold">{reportProductos.unidadesProductoTop} unidades</span>
                          )}
                        </div>
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Cantidad Vendida */}
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cantidad Vendida por Producto</h3>
                          <div className="h-64 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportProductos.productos.map(p => ({ name: p.producto, cantidad: p.cantidadVendida }))} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                                <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={50} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                  cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                                          <p className="font-semibold text-[#38BDF8] text-xs">Cantidad: {payload[0].value}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="cantidad" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Ingresos por Producto */}
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos por Producto</h3>
                          <div className="h-64 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportProductos.productos.map(p => ({ name: p.producto, ingresos: p.ingresos }))} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                                <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} angle={-25} textAnchor="end" height={50} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `S/ ${v}`} />
                                <Tooltip
                                  cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                                          <p className="font-semibold text-[#22D3A6] text-xs">Ingresos: S/ {Number(payload[0].value).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="ingresos" fill="#22D3A6" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Detail Table */}
                      <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                        <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detalle de Productos Más Vendidos</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/10 font-bold uppercase tracking-wider text-[10px]">
                                <th className="px-5 py-3 text-center w-16">Posición</th>
                                <th className="px-5 py-3">Producto</th>
                                <th className="px-5 py-3 text-center">Cantidad Vendida</th>
                                <th className="px-5 py-3 text-right">Ingresos</th>
                                <th className="px-5 py-3 text-right">Precio Promedio</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {reportProductos.detalle.map((row) => (
                                <tr key={row.posicion} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                                  <td className="px-5 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold ${
                                      row.posicion === 1
                                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                        : row.posicion === 2
                                        ? "bg-slate-400/15 text-slate-300 border border-slate-400/20"
                                        : "bg-slate-800/40 text-slate-400"
                                    }`}>
                                      #{row.posicion}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 font-bold text-white">{row.producto}</td>
                                  <td className="px-5 py-3 text-center font-mono">{row.cantidadVendida}</td>
                                  <td className="px-5 py-3 text-right text-[#22D3A6] font-mono">S/ {row.ingresos.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                                  <td className="px-5 py-3 text-right text-slate-400 font-mono">S/ {row.precioPromedio.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: EMPLEADOS */}
                  {reportSubTab === "empleados" && reportEmpleados && (
                    <div className="space-y-6">
                      {/* KPIs */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Empleados</span>
                          <span className="text-2xl font-black text-white">{reportEmpleados.totalEmpleados}</span>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Ventas</span>
                          <span className="text-2xl font-black text-white">{reportEmpleados.totalVentas}</span>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monto Total</span>
                          <span className="text-2xl font-black text-[#22D3A6]">
                            S/ {reportEmpleados.montoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-2 hover:border-slate-800 transition-all">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Vendedor</span>
                          <span className="text-lg font-black text-white truncate">{reportEmpleados.topVendedor ?? "—"}</span>
                          {reportEmpleados.ventasTopVendedor != null && (
                            <span className="text-[10px] text-slate-400 font-semibold">{reportEmpleados.ventasTopVendedor} ventas</span>
                          )}
                        </div>
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Ventas por Empleado */}
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Número de Ventas por Empleado</h3>
                          <div className="h-64 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportEmpleados.empleados.map(e => ({ name: e.empleado, ventas: e.ventas }))} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                  cursor={{ fill: "rgba(38, 189, 248, 0.05)" }}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                                          <p className="font-semibold text-[#38BDF8] text-xs">Ventas: {payload[0].value}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="ventas" fill="#38BDF8" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Monto por Empleado */}
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto Total Vendido</h3>
                          <div className="h-64 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportEmpleados.empleados.map(e => ({ name: e.empleado, monto: e.monto }))} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                                <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `S/ ${v}`} />
                                <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                <Tooltip
                                  cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                                          <p className="font-semibold text-[#22D3A6] text-xs">Monto: S/ {Number(payload[0].value).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="monto" fill="#22D3A6" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Detail Table */}
                      <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                        <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Productividad Detallada</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/10 font-bold uppercase tracking-wider text-[10px]">
                                <th className="px-5 py-3">Empleado</th>
                                <th className="px-5 py-3 text-center">Ventas Realizadas</th>
                                <th className="px-5 py-3 text-right">Monto Total</th>
                                <th className="px-5 py-3 text-right">Promedio por Venta</th>
                                <th className="px-5 py-3 text-center">Desempeño</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {reportEmpleados.detalle.map((row) => (
                                <tr key={row.empleado} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                                  <td className="px-5 py-3 font-bold text-white">{row.empleado}</td>
                                  <td className="px-5 py-3 text-center font-mono">{row.ventasRealizadas}</td>
                                  <td className="px-5 py-3 text-right text-[#22D3A6] font-mono">S/ {row.montoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                                  <td className="px-5 py-3 text-right text-slate-400 font-mono">S/ {row.promedioPorVenta.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                                  <td className="px-5 py-3 text-center">
                                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                      row.desempeno === "Excelente"
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : row.desempeno === "Muy Bueno"
                                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                        : "bg-slate-800/60 text-slate-300"
                                    }`}>
                                      {row.desempeno}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: METODOS DE PAGO */}
                  {reportSubTab === "pagos" && reportMetodosPago && (
                    <div className="space-y-6">
                      {/* KPIs Summary */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {reportMetodosPago.resumen.map((item) => (
                          <div key={item.metodo} className="rounded-xl border border-slate-900 bg-slate-950/40 p-5 flex flex-col gap-1 hover:border-slate-800 transition-all">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.metodo}</span>
                            <span className="text-2xl font-black text-white">{item.transacciones} transacciones</span>
                            <span className="text-xs text-[#22D3A6] font-bold">Total: S/ {item.monto.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Distribución por Método */}
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distribución por Método de Pago</h3>
                          <div className="h-64 w-full flex items-center justify-center text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                          <p className="text-[10px] font-bold text-white uppercase tracking-wider">{data.metodo}</p>
                                          <p className="font-semibold text-[#38BDF8] text-xs">Transacciones: {data.transacciones}</p>
                                          <p className="font-semibold text-[#22D3A6] text-xs">Porcentaje: {data.porcentaje}%</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Pie
                                  data={reportMetodosPago.distribucion}
                                  dataKey="transacciones"
                                  nameKey="metodo"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#38BDF8"
                                  label={({ name, porcentaje }) => `${name} (${porcentaje}%)`}
                                  labelLine={{ stroke: "#475569", strokeWidth: 1 }}
                                >
                                  {reportMetodosPago.distribucion.map((entry, idx) => {
                                    const colors = ["#38BDF8", "#22D3A6", "#F59E0B", "#EF4444", "#8B5CF6"];
                                    return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                                  })}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Monto por Método */}
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 flex flex-col gap-4">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monto por Método de Pago</h3>
                          <div className="h-64 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={reportMetodosPago.distribucion} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                                <CartesianGrid stroke="#0e1827" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="metodo" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `S/ ${v}`} />
                                <Tooltip
                                  cursor={{ fill: "rgba(34, 211, 166, 0.05)" }}
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl shadow-black">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                                          <p className="font-semibold text-[#38BDF8] text-xs">Monto Total: S/ {Number(payload[0].value).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Bar dataKey="monto" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Detail Table */}
                      <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                        <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detalle de Métodos de Pago</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/10 font-bold uppercase tracking-wider text-[10px]">
                                <th className="px-5 py-3">Método</th>
                                <th className="px-5 py-3 text-center">Cantidad de Transacciones</th>
                                <th className="px-5 py-3 text-center">Porcentaje</th>
                                <th className="px-5 py-3 text-right">Monto Total</th>
                                <th className="px-5 py-3 text-right">Monto Promedio</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {reportMetodosPago.detalle.map((row) => (
                                <tr key={row.metodo} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                                  <td className="px-5 py-3 font-bold text-white">{row.metodo}</td>
                                  <td className="px-5 py-3 text-center font-mono">{row.cantidadTransacciones}</td>
                                  <td className="px-5 py-3 text-center">
                                    <span className="inline-flex items-center justify-center rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold">
                                      {row.porcentaje}%
                                    </span>
                                  </td>
                                  <td className="px-5 py-3 text-right text-[#22D3A6] font-mono">S/ {row.montoTotal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                                  <td className="px-5 py-3 text-right text-slate-400 font-mono">S/ {row.montoPromedio.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB: PERSONALIZADO */}
                  {reportSubTab === "personalizado" && (
                    <div className="space-y-6">
                      <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
                          <div className="flex items-center gap-2">
                            <Sliders className="text-[#22D3A6]" size={18} />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consola SQL Custom (Soporta variables: @tenant_id)</h3>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                            READ-ONLY ACTIVE
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <textarea
                            value={customQuery}
                            onChange={(e) => setCustomQuery(e.target.value)}
                            placeholder="Escribe tu consulta SQL SELECT..."
                            className="w-full h-32 p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs focus:border-[#22D3A6] focus:ring-1 focus:ring-[#22D3A6] outline-none resize-y"
                          />
                          <p className="text-[10px] text-slate-500 leading-normal">
                            * Por razones de seguridad y aislamiento de datos, toda consulta SQL debe incluir un filtro explícito en la columna <code className="text-[#38BDF8] font-mono">tienda_id</code> utilizando la variable <code className="text-[#22D3A6] font-mono">@tenant_id</code> (ej: <code className="text-[#22D3A6] font-mono">WHERE tienda_id = @tenant_id</code>). Solo se permiten comandos de lectura (<code className="text-[#38BDF8] font-mono">SELECT</code> / <code className="text-[#38BDF8] font-mono">WITH</code>).
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">Tus consultas se ejecutan con privilegios restringidos de base de datos.</span>
                          <button
                            onClick={handleExecuteSql}
                            disabled={customQueryLoading}
                            className="h-9 px-5 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-bold cursor-pointer border-none transition-all flex items-center gap-2"
                          >
                            {customQueryLoading ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                <span>Ejecutando...</span>
                              </>
                            ) : (
                              <span>Ejecutar Query</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Custom Query Error */}
                      {customQueryError && (
                        <div className="rounded-xl border border-rose-900 bg-rose-950/20 p-5 space-y-2">
                          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                            <AlertTriangle size={16} />
                            <span>Error de Ejecución SQL</span>
                          </div>
                          <p className="text-xs font-mono text-rose-300 bg-rose-950/40 p-3 rounded-lg border border-rose-900/30 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {customQueryError}
                          </p>
                        </div>
                      )}

                      {/* Custom Query Results */}
                      {customQueryResult && (
                        <div className="rounded-xl border border-slate-900 bg-slate-950/40 overflow-hidden">
                          <div className="border-b border-slate-900 bg-slate-950/80 px-5 py-4 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Resultado de la Consulta</h3>
                            <span className="text-[10px] font-bold text-[#22D3A6] bg-[#22D3A6]/10 px-2 py-0.5 rounded border border-[#22D3A6]/20 uppercase">
                              {customQueryResult.length} fila(s) encontrada(s)
                            </span>
                          </div>

                          {customQueryResult.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 font-mono text-xs">
                              La consulta se completó con éxito pero no devolvió ninguna fila.
                            </div>
                          ) : (
                            <div className="overflow-x-auto max-h-[400px]">
                              <table className="w-full text-left border-collapse text-xs font-mono">
                                <thead>
                                  <tr className="border-b border-slate-900 text-slate-400 bg-slate-950/20 font-bold uppercase tracking-wider text-[10px] sticky top-0">
                                    {Object.keys(customQueryResult[0]).map((key) => (
                                      <th key={key} className="px-5 py-3 whitespace-nowrap bg-slate-950">{key}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900">
                                  {customQueryResult.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-900/10 transition-colors text-slate-300">
                                      {Object.keys(customQueryResult[0]).map((key) => {
                                        const cellVal = row[key];
                                        return (
                                          <td key={key} className="px-5 py-3 whitespace-nowrap max-w-[250px] truncate">
                                            {cellVal === null ? (
                                              <span className="text-slate-600 font-semibold italic">NULL</span>
                                            ) : typeof cellVal === "object" ? (
                                              JSON.stringify(cellVal)
                                            ) : (
                                              String(cellVal)
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === "settings" && esAdmin && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Configuración de Integraciones</h2>
                <p className="text-xs text-slate-400">Configura tus credenciales y llaves de API para Stripe y Cloudinary</p>
              </div>

              {/* Información de la Tienda */}
              <form onSubmit={handleSaveStoreInfo} className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4 max-w-2xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
                  <Store className="text-[#22D3A6]" size={18} />
                  <span>Información de la Tienda</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Tienda</label>
                    <input
                      type="text"
                      value={storeForm.nombre}
                      onChange={(e) => setStoreForm({ ...storeForm, nombre: e.target.value })}
                      className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identificador (Slug / Subdominio)</label>
                    <input
                      type="text"
                      value={storeForm.slug}
                      onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-[#22D3A6] text-xs font-mono font-semibold outline-none focus:border-[#22D3A6] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Logo de la Tienda (URL)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://ejemplo.com/logo.png"
                        value={storeForm.logoUrl || ""}
                        onChange={(e) => setStoreForm({ ...storeForm, logoUrl: e.target.value })}
                        className="flex-1 h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                      />
                      {settingsForm.cloudinaryCloudName && settingsForm.cloudinaryApiKey && settingsForm.cloudinaryApiSecret && (
                        <label className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 shrink-0">
                          <Upload size={14} />
                          <span>Subir Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  toast.loading("Subiendo logo a Cloudinary...");
                                  const url = await uploadToCloudinary(file, token ?? "");
                                  setStoreForm(prev => ({ ...prev, logoUrl: url }));
                                  toast.dismiss();
                                  toast.success("Logo subido correctamente");
                                } catch (err) {
                                  toast.dismiss();
                                  toast.error(err instanceof Error ? err.message : "Error al subir logo");
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dominio de Pruebas</span>
                    <a
                      href={`http://${activeStore?.slug}.lvh.me:3000/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 hover:underline bg-slate-900/60 px-3 py-2 rounded-lg truncate w-fit font-mono"
                    >
                      {activeStore?.slug}.lvh.me:3000
                    </a>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingStoreInfo}
                    className="h-9 px-4 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingStoreInfo && <Loader2 className="animate-spin" size={14} />}
                    <span>Guardar Tienda</span>
                  </button>
                </div>
              </form>

              {loadingSettings ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                  {/* Stripe Keys */}
                  <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
                      <CreditCard className="text-[#38BDF8]" size={18} />
                      <span>Pasarela de Pago (Stripe)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stripe Public Key (Llave Pública)</label>
                        <input
                          type="text"
                          placeholder="pk_test_..."
                          value={settingsForm.stripePublicKey}
                          onChange={(e) => setSettingsForm({ ...settingsForm, stripePublicKey: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stripe Secret Key (Llave Privada/Secreta)</label>
                        <input
                          type="password"
                          placeholder="sk_test_..."
                          value={settingsForm.stripeSecretKey}
                          onChange={(e) => setSettingsForm({ ...settingsForm, stripeSecretKey: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cloudinary Keys */}
                  <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
                      <Package className="text-[#A78BFA]" size={18} />
                      <span>Almacenamiento de Multimedia (Cloudinary)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudinary Cloud Name (Nombre del Cloud)</label>
                        <input
                          type="text"
                          placeholder="Nombre de la nube..."
                          value={settingsForm.cloudinaryCloudName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryCloudName: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudinary API Key</label>
                        <input
                          type="text"
                          placeholder="API Key..."
                          value={settingsForm.cloudinaryApiKey}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryApiKey: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloudinary API Secret</label>
                        <input
                          type="password"
                          placeholder="API Secret..."
                          value={settingsForm.cloudinaryApiSecret}
                          onChange={(e) => setSettingsForm({ ...settingsForm, cloudinaryApiSecret: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SMTP Credentials */}
                  <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900/60 pb-3">
                      <Mail className="text-[#38BDF8]" size={18} />
                      <span>Configuración de Correo Emisor (SMTP)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo de Envío (SMTP)</label>
                        <input
                          type="email"
                          placeholder="ejemplo@gmail.com"
                          value={settingsForm.smtpEmail}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpEmail: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña de Aplicación</label>
                        <input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={settingsForm.smtpPassword}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpPassword: e.target.value })}
                          className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6] transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[11px] text-slate-450 leading-relaxed">
                          Esta configuración se utiliza para enviar los códigos de recuperación de contraseña a tus clientes de forma automática.
                          Si usas Gmail, asegúrate de activar la verificación en dos pasos y generar una <strong>Contraseña de Aplicación</strong>.
                          Soportamos Gmail y Outlook/Hotmail automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="h-11 px-6 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingSettings ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <span>Guardar Configuración</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* SUCURSAL DETAIL MODAL */}
      {selectedSucursalDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-955 p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSucursalDetail(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1 pb-4 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <GitBranch className="text-[#22D3A6]" size={22} />
                <h3 className="text-lg font-black text-white">{selectedSucursalDetail.nombre}</h3>
              </div>
              <p className="text-xs text-slate-400">{selectedSucursalDetail.direccion || "Sin dirección registrada"}</p>
              {selectedSucursalDetail.telefono && (
                <p className="text-xs text-[#38BDF8] font-medium">Teléfono: {selectedSucursalDetail.telefono}</p>
              )}
            </div>

            {/* List of Cashiers assigned */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cajeros Asignados</h4>
              {(() => {
                const cajeros = staffUsuarios.filter(u => u.rolStaff === "cajero" && u.sucursalId === selectedSucursalDetail.id);
                if (cajeros.length === 0) {
                  return <p className="text-xs text-slate-500 italic">No hay cajeros asignados a esta sucursal.</p>;
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cajeros.map(c => (
                      <div key={c.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-900 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {c.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* List of Products assigned */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Productos en Stock</h4>
              {(() => {
                const prodsEnSucursal = productos.filter(p => 
                  p.inventarios?.some(i => i.sucursalId === selectedSucursalDetail.id && i.stock > 0)
                );
                if (prodsEnSucursal.length === 0) {
                  return <p className="text-xs text-slate-500 italic">No hay productos con stock en esta sucursal.</p>;
                }
                return (
                  <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="p-3">Producto</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Precio</th>
                          <th className="p-3 text-right">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-xs">
                        {prodsEnSucursal.map(p => {
                          const stock = p.inventarios.find(i => i.sucursalId === selectedSucursalDetail.id)?.stock || 0;
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/10">
                              <td className="p-3 font-semibold text-white">{p.nombre}</td>
                              <td className="p-3 text-slate-400 font-mono">{p.sku || "-"}</td>
                              <td className="p-3 text-slate-300">${p.precioDetalle}</td>
                              <td className="p-3 text-right font-black text-[#22D3A6]">{stock} uds</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CREATE STORE DIALOG MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
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
        </div>
      )}

      {/* SUCURSALES FORM MODAL (CREATE / EDIT) */}
      {isSucursalModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsSucursalModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">{selectedSucursal ? "Editar Sucursal" : "Agregar Sucursal"}</h3>
              <p className="text-xs text-slate-400">Ingresa los datos para la sucursal de tu tienda</p>
            </div>

            <form onSubmit={handleSubmitSucursal} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Sucursal</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sucursal Central Oeste"
                  value={sucursalForm.nombre}
                  onChange={(e) => setSucursalForm({ ...sucursalForm, nombre: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dirección Física</label>
                <textarea
                  placeholder="Ej. Calzada Roosevelt 22-43, Ciudad de Guatemala"
                  value={sucursalForm.direccion}
                  onChange={(e) => setSucursalForm({ ...sucursalForm, direccion: e.target.value })}
                  className="h-20 w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</label>
                <input
                  type="text"
                  placeholder="Ej. 2440-1922"
                  value={sucursalForm.telefono}
                  onChange={(e) => setSucursalForm({ ...sucursalForm, telefono: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-650 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all hover:scale-[1.01] cursor-pointer border-none flex items-center justify-center"
              >
                <span>Guardar Sucursal</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INVITE USER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Agregar / Invitar Usuario</h3>
              <p className="text-xs text-slate-400">Registra o invita a un nuevo colaborador a la tienda</p>
            </div>

            <form onSubmit={handleInviteUsuario} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. José Fernando"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña Inicial (Opcional)</label>
                <input
                  type="password"
                  placeholder="Por defecto: DMHub123*"
                  value={inviteForm.contrasena}
                  onChange={(e) => setInviteForm({ ...inviteForm, contrasena: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8] focus:ring-1"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Usuario</label>
                <select
                  value={inviteForm.tipoUsuario}
                  onChange={(e) => setInviteForm({ ...inviteForm, tipoUsuario: e.target.value })}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-100 outline-none focus:border-[#38BDF8]"
                >
                  <option value="staff">Personal (Staff)</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>

              {inviteForm.tipoUsuario === "staff" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rol de Staff</label>
                    <select
                      value={inviteForm.rolStaff}
                      onChange={(e) => setInviteForm({ ...inviteForm, rolStaff: e.target.value })}
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
                      value={inviteForm.sucursalId}
                      onChange={(e) => setInviteForm({ ...inviteForm, sucursalId: e.target.value })}
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
                <span>Agregar Usuario</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {isChangeRolModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
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
        </div>
      )}

      {/* REESTABLECER CONTRASEÑA MODAL */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Reestablecer Contraseña</h3>
              <p className="text-xs text-slate-400">Genera códigos de recuperación para {resetPasswordUsuario?.name}</p>
            </div>

            {resetCodes.length === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-xs text-amber-300 leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle size={14} />
                    <span>Importante</span>
                  </p>
                  <p>
                    Al reestablecer la contraseña, se generarán 8 códigos de recuperación de un solo uso.
                  </p>
                  <p>
                    Se descargará automáticamente un archivo de texto con las instrucciones y códigos. Debes proveerle uno de estos códigos al usuario para que pueda ingresar su nueva contraseña.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRecoveryCodes}
                  disabled={isGeneratingCodes}
                  className="h-11 w-full rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isGeneratingCodes ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generando códigos...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Generar y Descargar Códigos</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-950/40 bg-emerald-950/20 text-xs text-emerald-400 leading-relaxed space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>¡Códigos Generados Exitosamente!</span>
                  </p>
                  <p>
                    Se ha descargado un archivo de texto (.txt) con la información.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Códigos de Recuperación</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-100 select-all max-h-40 overflow-y-auto">
                    {resetCodes.map((code, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-900">
                        <span className="text-slate-400 text-[10px] font-bold">{idx + 1}.</span>
                        <span className="font-bold text-white tracking-wide">{code}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-slate-500">Haz clic y arrastra para seleccionar y copiar cualquiera de los códigos.</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateRecoveryCodes}
                    className="h-11 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download size={15} />
                    <span>Descargar Nuevamente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="h-11 flex-1 rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
                  >
                    <span>Listo / Cerrar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* PRODUCT FORM MODAL (CREATE / EDIT) */}
      {isProductoModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-55 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 my-8 relative">
            <button
              onClick={() => setIsProductoModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">{selectedProducto ? "Editar Producto" : "Agregar Producto"}</h3>
              <p className="text-xs text-slate-400">Llena los datos para el catálogo de productos</p>
            </div>

            <form onSubmit={handleSubmitProducto} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Harina Suave Premium"
                    value={productoForm.nombre}
                    onChange={(e) => setProductoForm({ ...productoForm, nombre: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código SKU</label>
                  <input
                    type="text"
                    placeholder="Ej. HAR-SUA-01"
                    value={productoForm.sku}
                    onChange={(e) => setProductoForm({ ...productoForm, sku: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio Detalle</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productoForm.precioDetalle || ""}
                    onChange={(e) => setProductoForm({ ...productoForm, precioDetalle: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio Mayoreo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productoForm.precioMayoreo || ""}
                    onChange={(e) => setProductoForm({ ...productoForm, precioMayoreo: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                  <select
                    value={productoForm.categoriaId}
                    onChange={(e) => setProductoForm({ ...productoForm, categoriaId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  >
                    <option value="">Sin Categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombreCategoria}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Punto Crítico (Stock Mínimo)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej. 10"
                    value={productoForm.stockMinimo || 0}
                    onChange={(e) => setProductoForm({ ...productoForm, stockMinimo: Number(e.target.value) })}
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Imagen URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://cloudinary.com/ejemplo.jpg"
                    value={productoForm.imagenUrl}
                    onChange={(e) => setProductoForm({ ...productoForm, imagenUrl: e.target.value })}
                    className="flex-1 h-10 rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8]"
                  />
                  {settingsForm.cloudinaryCloudName && settingsForm.cloudinaryApiKey && settingsForm.cloudinaryApiSecret && (
                    <label className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700 shrink-0">
                      <Upload size={14} />
                      <span>Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              toast.loading("Subiendo imagen del producto...");
                              const url = await uploadToCloudinary(file, token ?? "");
                              setProductoForm(prev => ({ ...prev, imagenUrl: url }));
                              toast.dismiss();
                              toast.success("Imagen de producto subida correctamente");
                            } catch (err) {
                              toast.dismiss();
                              toast.error(err instanceof Error ? err.message : "Error al subir imagen");
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descripción del Producto</label>
                <textarea
                  placeholder="Detalles sobre presentación, empaque, peso..."
                  value={productoForm.descripcion}
                  onChange={(e) => setProductoForm({ ...productoForm, descripcion: e.target.value })}
                  className="h-20 w-full rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-100 outline-none focus:border-[#38BDF8] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock por Sucursal</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 border border-slate-800 bg-slate-900/40 p-3 rounded-lg">
                  {sucursales.map((suc) => (
                    <div key={suc.id} className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{suc.nombre}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stockSucursalesMap[suc.id] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setStockSucursalesMap({
                            ...stockSucursalesMap,
                            [suc.id]: val
                          });
                        }}
                        className="h-8 w-24 rounded border border-slate-800 bg-slate-950 px-2 text-xs text-slate-100 outline-none text-right focus:border-[#38BDF8]"
                      />
                    </div>
                  ))}
                  {sucursales.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No hay sucursales registradas.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="prod-publicado"
                  checked={productoForm.publicado}
                  onChange={(e) => setProductoForm({ ...productoForm, publicado: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-[#22D3A6] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="prod-publicado" className="text-xs text-slate-350 cursor-pointer select-none">
                  Publicar en catálogo de clientes inmediatamente
                </label>
              </div>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center"
              >
                <span>Guardar Producto</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BULK PRODUCT IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-55 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-5 my-8 relative">
            <button
              onClick={() => {
                setIsImportModalOpen(false);
                setParsedProducts([]);
              }}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Importación Masiva de Productos</h3>
              <p className="text-xs text-slate-400">Carga tus productos en lote usando archivos CSV o XLSX (Excel)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-900 bg-slate-900/10 p-4 rounded-xl">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Descarga la Plantilla</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Usa nuestras plantillas para asegurarte de que los encabezados y tipos de datos coincidan exactamente.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadTemplate("csv")}
                    className="h-8 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-slate-800"
                  >
                    <Download size={10} />
                    <span>Plantilla CSV</span>
                  </button>
                  <button
                    onClick={() => downloadTemplate("xlsx")}
                    className="h-8 px-3 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-slate-800"
                  >
                    <Download size={10} />
                    <span>Plantilla Excel</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Sube tu archivo (.csv / .xlsx)</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Selecciona el archivo excel o delimitado por comas con tus productos listos para publicar.</p>
                <label className="h-8 px-3 rounded-lg bg-[#22D3A6] hover:bg-[#1ebda1] text-slate-950 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none w-full text-center">
                  <Upload size={12} />
                  <span>Seleccionar Archivo</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleImportFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {parsedProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#22D3A6] uppercase tracking-wider">
                    Vista Previa de Importación ({parsedProducts.length} productos)
                  </span>
                  <span className="text-[9px] text-slate-500 italic font-semibold">
                    * El inventario inicial se asignará a la sucursal por defecto.
                  </span>
                </div>

                <div className="rounded-xl border border-slate-900 overflow-hidden max-h-48 overflow-y-auto bg-slate-950/40">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950 text-slate-500 uppercase font-bold tracking-wider sticky top-0">
                        <th className="p-2">Nombre</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2 text-right">P. Detalle</th>
                        <th className="p-2 text-right">P. Mayoreo</th>
                        <th className="p-2 text-center">Stock</th>
                        <th className="p-2 text-center">Publicado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {parsedProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-900/10 transition-colors text-slate-350">
                          <td className="p-2 font-semibold text-white max-w-[150px] truncate">{p.nombre}</td>
                          <td className="p-2 font-mono text-slate-400">{p.sku || "—"}</td>
                          <td className="p-2 text-right font-mono">S/ {p.precioDetalle.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono">S/ {p.precioMayoreo.toFixed(2)}</td>
                          <td className="p-2 text-center font-mono">{p.stockActual}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-flex rounded px-1.5 py-0.5 text-[8px] font-bold ${
                              p.publicado ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                            }`}>
                              {p.publicado ? "SÍ" : "NO"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="h-11 w-full rounded-xl bg-[#22D3A6] hover:bg-[#1ebda1] disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Importando {parsedProducts.length} productos...</span>
                    </>
                  ) : (
                    <span>Confirmar y Guardar en Catálogo</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
