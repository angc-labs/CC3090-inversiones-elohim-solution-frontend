"use client";

import { useAuthStore } from "@/stores/useAuthStore";
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
  X,
  Loader2,
  Trash2,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Save,
  ShoppingCart,
  ArrowLeft,
  GripVertical,
  FilePlus,
  FileText,
  Type,
  Image as LucideImage,
  ShoppingBag,
  Sliders,
  ArrowUp,
  ArrowDown,
  Download,
  Upload
} from "lucide-react";
import {
  getTiendas,
  crearTienda,
  TiendaDto,
  actualizarConfiguracionVisual,
  getIntegraciones
} from "@/lib/api/admin";
import { uploadToCloudinary } from "@/lib/cloudinary";

// Helper to detect if a background color is dark
const isDarkBg = (bgColor: string) => {
  if (!bgColor) return false;
  if (bgColor === "transparent") return false;
  if (bgColor.startsWith("#")) {
    const hex = bgColor.replace("#", "");
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq < 128;
    }
  }
  return false;
};

// Helper to translate section properties into dynamic React CSS styles
const getSectionStyle = (properties: any, theme: any) => {
  const styles: React.CSSProperties = {};
  if (!properties) return styles;

  const bgColor = properties.backgroundColor || "transparent";
  const textColor = properties.textColor || undefined;

  if (properties.useGlassmorphism) {
    let rgbaBg = "rgba(255, 255, 255, 0.15)";
    if (bgColor && bgColor.startsWith("#")) {
      const hex = bgColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16) || 255;
      const g = parseInt(hex.substring(2, 4), 16) || 255;
      const b = parseInt(hex.substring(4, 6), 16) || 255;
      const alpha = (properties.opacity ?? 30) / 100;
      rgbaBg = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else if (bgColor === "transparent") {
      const alpha = (properties.opacity ?? 30) / 100;
      rgbaBg = `rgba(255, 255, 255, ${alpha})`;
    } else {
      rgbaBg = bgColor;
    }
    
    styles.backgroundColor = rgbaBg;
    const blurAmount = properties.blur ?? 12;
    styles.backdropFilter = `blur(${blurAmount}px)`;
    styles.WebkitBackdropFilter = `blur(${blurAmount}px)`;
    styles.border = "1px solid rgba(255, 255, 255, 0.2)";
    styles.boxShadow = "0 8px 32px 0 rgba(0, 0, 0, 0.1)";
  } else {
    if (bgColor !== "transparent") {
      if (bgColor.startsWith("#") && properties.opacity !== undefined && properties.opacity !== 100) {
        const hex = bgColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;
        const alpha = properties.opacity / 100;
        styles.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      } else {
        styles.backgroundColor = bgColor;
      }
    } else {
      styles.backgroundColor = "transparent";
    }
  }

  if (textColor) {
    styles.color = textColor;
  }

  if (properties.textShadow) {
    styles.textShadow = "0 2px 4px rgba(0,0,0,0.6)";
  }

  return styles;
};

export default function ConstructorPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Role checks
  const esSuperAdmin = usuario?.esSuperAdmin || usuario?.rol === "superadmin";
  const esAdmin = esSuperAdmin || usuario?.rol === "admin";

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
  const [leftTab, setLeftTab] = useState<"sections" | "theme">("sections");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPublishingConfig, setIsPublishingConfig] = useState(false);
  
  const [activePageId, setActivePageId] = useState<string>("home");
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionType, setNewSectionType] = useState("custom");
  const [constructorSearchTerm, setConstructorSearchTerm] = useState("");

  const [cloudinaryConfig, setCloudinaryConfig] = useState<{
    cloudName: string;
    apiKey: string;
    hasCredentials: boolean;
  }>({ cloudName: "", apiKey: "", hasCredentials: false });

  const [isHydrated, setIsHydrated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Hydration safety check
  useEffect(() => {
    const hasAuthData = typeof window !== "undefined" && window.localStorage.getItem("dmhub-auth");
    if (!hasAuthData) {
      router.push("/login");
      return;
    }
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      setIsHydrated(true);
    }
  }, [isAuthenticated, token]);

  // Load stores
  useEffect(() => {
    if (isHydrated && token) {
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
  }, [isHydrated, token]);

  // Load integrations for Cloudinary config
  useEffect(() => {
    if (isHydrated && token && activeStore) {
      getIntegraciones(token)
        .then((data) => {
          if (data.cloudinaryCloudName && data.cloudinaryApiKey && data.cloudinaryApiSecret) {
            setCloudinaryConfig({
              cloudName: data.cloudinaryCloudName,
              apiKey: data.cloudinaryApiKey,
              hasCredentials: true
            });
          } else {
            setCloudinaryConfig({ cloudName: "", apiKey: "", hasCredentials: false });
          }
        })
        .catch((err) => {
          console.error("Error fetching integrations in constructor", err);
        });
    }
  }, [isHydrated, token, activeStore]);

  // Load visual config
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
      
      const defaultSections = [
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
            productsCount: 3,
            layoutType: "grid",
            showSearch: false
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
      ];

      if (!config || (!config.sections && !config.pages)) {
        config = {
          sections: defaultSections
        };
      }

      // Migrate config to have pages list
      if (!config.pages || config.pages.length === 0) {
        config = {
          ...config,
          pages: [
            {
              id: "home",
              name: "Inicio",
              isHome: true,
              sections: config.sections || defaultSections
            }
          ],
          currentPageId: "home"
        };
      }

      // Migrate config to have theme settings
      if (!config.theme) {
        config = {
          ...config,
          theme: {
            backgroundColor: "#F8FAFC",
            accentColor: "#1AB38C",
            backgroundGradient: "linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)",
            useGradient: false
          }
        };
      }

      setStoreConfig(config);
      setActivePageId(config.currentPageId || "home");
    }
  }, [activeStore]);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStore = (store: TiendaDto) => {
    setActiveStore(store);
    window.localStorage.setItem("active_tenant_id", store.id);
    setIsStoreDropdownOpen(false);
    toast.success(`Tienda cambiada a: ${store.nombre}`);
    router.refresh();
  };

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

  const handlePropertyChange = (property: string, value: any) => {
    if (!storeConfig) return;
    setStoreConfig((prev: any) => {
      const currentPage = prev.pages.find((p: any) => p.id === activePageId) || prev.pages[0];
      const section = currentPage.sections.find((s: any) => s.id === selectedSectionId);
      const isSharedSection = ["header", "footer"].includes(selectedSectionId) || section?.type === "announcement" || selectedSectionId === "announcement";

      const updatedPages = prev.pages.map((page: any) => {
        if (isSharedSection || page.id === activePageId) {
          const updatedSections = page.sections.map((sec: any) => {
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
          return { ...page, sections: updatedSections };
        }
        return page;
      });

      const activePage = updatedPages.find((p: any) => p.id === activePageId) || updatedPages[0];

      return {
        ...prev,
        pages: updatedPages,
        sections: activePage.sections
      };
    });
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (["header", "footer"].includes(id)) {
      e.preventDefault();
      return;
    }
    setDraggedSectionId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (["header", "footer"].includes(id)) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSectionId || draggedSectionId === targetId || ["header", "footer"].includes(targetId)) return;

    setStoreConfig((prev: any) => {
      const currentPage = prev.pages.find((p: any) => p.id === activePageId) || prev.pages[0];
      const sections = [...currentPage.sections];
      const draggedIdx = sections.findIndex((s) => s.id === draggedSectionId);
      const targetIdx = sections.findIndex((s) => s.id === targetId);

      if (draggedIdx !== -1 && targetIdx !== -1) {
        const [moved] = sections.splice(draggedIdx, 1);
        sections.splice(targetIdx, 0, moved);
      }

      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          return { ...page, sections };
        }
        return page;
      });

      return {
        ...prev,
        pages: updatedPages,
        sections
      };
    });

    setDraggedSectionId(null);
  };

  // Custom pages handlers
  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const pageId = newPageName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    if (!pageId) return;

    setStoreConfig((prev: any) => {
      if (prev.pages.some((p: any) => p.id === pageId)) {
        toast.error("Ya existe una página con ese nombre.");
        return prev;
      }

      const homePage = prev.pages.find((p: any) => p.id === "home") || prev.pages[0];
      const announcement = homePage.sections.find((s: any) => s.type === "announcement");
      const header = homePage.sections.find((s: any) => s.type === "header");
      const footer = homePage.sections.find((s: any) => s.type === "footer");

      const newPageSections = [];
      if (announcement) newPageSections.push(announcement);
      if (header) newPageSections.push(header);
      
      newPageSections.push({
        id: "richtext_" + Date.now(),
        type: "richtext",
        name: "Contenido de Página",
        properties: {
          title: newPageName,
          content: "Esta es una página en blanco. Haz clic aquí para editar el contenido.",
          backgroundColor: "#FFFFFF",
          textColor: "#0F172A",
          paddingVertical: 48
        }
      });

      if (footer) newPageSections.push(footer);

      const newPage = {
        id: pageId,
        name: newPageName,
        isHome: false,
        sections: newPageSections
      };

      const updatedPages = [...prev.pages, newPage];
      const menuItems = updatedPages.map((p: any) => p.name);
      
      const fullyUpdatedPages = updatedPages.map((page: any) => {
        const sectionsWithUpdatedHeader = page.sections.map((sec: any) => {
          if (sec.type === "header") {
            return {
              ...sec,
              properties: {
                ...sec.properties,
                menuItems
              }
            };
          }
          return sec;
        });
        return { ...page, sections: sectionsWithUpdatedHeader };
      });

      toast.success(`Página "${newPageName}" creada y agregada al menú.`);
      setIsCreatePageModalOpen(false);
      setNewPageName("");
      setActivePageId(pageId);

      const activePage = fullyUpdatedPages.find((p: any) => p.id === pageId);

      return {
        ...prev,
        pages: fullyUpdatedPages,
        sections: activePage.sections
      };
    });
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const newSecId = `section-${Date.now()}`;
    const newSection: any = {
      id: newSecId,
      type: newSectionType,
      name: newSectionName.trim(),
      properties: {}
    };

    if (newSectionType === "announcement") {
      newSection.properties = {
        bannerText: "Nuevo Anuncio especial",
        backgroundColor: "#1AB38C",
        textColor: "#FFFFFF",
        fontWeight: "Bold",
        verticalPadding: 8
      };
    } else if (newSectionType === "hero") {
      newSection.properties = {
        title: "Nuevo Título Hero",
        subtitle: "Subtítulo descriptivo de tu sección...",
        primaryButtonText: "Botón",
        backgroundColor: "#0F172A",
        textColor: "#FFFFFF"
      };
    } else if (newSectionType === "products") {
      newSection.properties = {
        title: "Nuestros Productos",
        columns: 3,
        productsCount: 3,
        layoutType: "grid",
        showSearch: false
      };
    } else if (newSectionType === "richtext") {
      newSection.properties = {
        title: "Título de Texto",
        content: "Escribe contenido aquí...",
        backgroundColor: "#FFFFFF",
        textColor: "#0F172A",
        paddingVertical: 48
      };
    } else if (newSectionType === "custom") {
      newSection.properties = {
        blocks: [
          { id: `block-text-${Date.now()}-1`, type: "text", content: "Texto de la sección personalizada. Edítame en el panel de la derecha." },
          { id: `block-image-${Date.now()}-2`, type: "image", url: "" },
          { id: `block-prod-${Date.now()}-3`, type: "product_card", title: "Producto Destacado" }
        ]
      };
    } else if (newSectionType === "cart") {
      newSection.properties = {
        title: "Carrito de Compras",
        showReservations: true,
        showCardPayments: true
      };
    }

    setStoreConfig((prev: any) => {
      const currentPage = prev.pages.find((p: any) => p.id === activePageId) || prev.pages[0];
      const sections = [...currentPage.sections];
      
      const footerIdx = sections.findIndex((s) => s.id === "footer" || s.type === "footer");
      if (footerIdx !== -1) {
        sections.splice(footerIdx, 0, newSection);
      } else {
        sections.push(newSection);
      }

      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          return { ...page, sections };
        }
        return page;
      });

      return {
        ...prev,
        pages: updatedPages,
        sections
      };
    });

    setSelectedSectionId(newSecId);
    setIsAddSectionModalOpen(false);
    setNewSectionName("");
    setNewSectionType("custom");
    toast.success("Sección agregada exitosamente");
  };

  const handleDeleteSection = () => {
    if (["header", "footer"].includes(selectedSectionId)) {
      toast.error("No se puede eliminar una sección compartida obligatoria (Header, Footer)");
      return;
    }

    setStoreConfig((prev: any) => {
      const currentPage = prev.pages.find((p: any) => p.id === activePageId) || prev.pages[0];
      const sections = currentPage.sections.filter((s: any) => s.id !== selectedSectionId);

      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          return { ...page, sections };
        }
        return page;
      });

      return {
        ...prev,
        pages: updatedPages,
        sections
      };
    });

    // Select first remaining section
    const currentPage = storeConfig.pages.find((p: any) => p.id === activePageId) || storeConfig.pages[0];
    const remainingSections = currentPage.sections.filter((s: any) => s.id !== selectedSectionId);
    if (remainingSections.length > 0) {
      setSelectedSectionId(remainingSections[0].id);
    } else {
      setSelectedSectionId("");
    }

    toast.success("Sección eliminada exitosamente");
  };

  const handleMoveBlock = (sectionId: string, blockIndex: number, direction: "up" | "down") => {
    setStoreConfig((prev: any) => {
      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          const updatedSections = page.sections.map((sec: any) => {
            if (sec.id === sectionId) {
              const blocks = [...(sec.properties.blocks || [])];
              const targetIdx = direction === "up" ? blockIndex - 1 : blockIndex + 1;
              if (targetIdx >= 0 && targetIdx < blocks.length) {
                const [moved] = blocks.splice(blockIndex, 1);
                blocks.splice(targetIdx, 0, moved);
              }
              return {
                ...sec,
                properties: { ...sec.properties, blocks }
              };
            }
            return sec;
          });
          return { ...page, sections: updatedSections };
        }
        return page;
      });

      const activePage = updatedPages.find((p: any) => p.id === activePageId) || updatedPages[0];

      return {
        ...prev,
        pages: updatedPages,
        sections: activePage.sections
      };
    });
  };

  const handleAddBlock = (sectionId: string, blockType: "text" | "image" | "product_card") => {
    setStoreConfig((prev: any) => {
      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          const updatedSections = page.sections.map((sec: any) => {
            if (sec.id === sectionId) {
              const blocks = [...(sec.properties.blocks || [])];
              const newBlock = {
                id: `block-${blockType}-${Date.now()}`,
                type: blockType,
                content: blockType === "text" ? "Nuevo bloque de texto" : undefined,
                url: blockType === "image" ? "" : undefined,
                title: blockType === "product_card" ? "Nueva Tarjeta de Producto" : undefined
              };
              blocks.push(newBlock);
              return {
                ...sec,
                properties: { ...sec.properties, blocks }
              };
            }
            return sec;
          });
          return { ...page, sections: updatedSections };
        }
        return page;
      });

      const activePage = updatedPages.find((p: any) => p.id === activePageId) || updatedPages[0];

      return {
        ...prev,
        pages: updatedPages,
        sections: activePage.sections
      };
    });
  };

  const handleDeleteBlock = (sectionId: string, blockIndex: number) => {
    setStoreConfig((prev: any) => {
      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          const updatedSections = page.sections.map((sec: any) => {
            if (sec.id === sectionId) {
              const blocks = [...(sec.properties.blocks || [])];
              blocks.splice(blockIndex, 1);
              return {
                ...sec,
                properties: { ...sec.properties, blocks }
              };
            }
            return sec;
          });
          return { ...page, sections: updatedSections };
        }
        return page;
      });

      const activePage = updatedPages.find((p: any) => p.id === activePageId) || updatedPages[0];

      return {
        ...prev,
        pages: updatedPages,
        sections: activePage.sections
      };
    });
  };

  const handleBlockFieldChange = (sectionId: string, blockIndex: number, field: string, value: any) => {
    setStoreConfig((prev: any) => {
      const updatedPages = prev.pages.map((page: any) => {
        if (page.id === activePageId) {
          const updatedSections = page.sections.map((sec: any) => {
            if (sec.id === sectionId) {
              const blocks = [...(sec.properties.blocks || [])];
              blocks[blockIndex] = {
                ...blocks[blockIndex],
                [field]: value
              };
              return {
                ...sec,
                properties: { ...sec.properties, blocks }
              };
            }
            return sec;
          });
          return { ...page, sections: updatedSections };
        }
        return page;
      });

      const activePage = updatedPages.find((p: any) => p.id === activePageId) || updatedPages[0];

      return {
        ...prev,
        pages: updatedPages,
        sections: activePage.sections
      };
    });
  };

  const handleDeletePage = (pageId: string) => {
    if (pageId === "home") {
      toast.error("No se puede eliminar la página de Inicio.");
      return;
    }

    setStoreConfig((prev: any) => {
      const updatedPages = prev.pages.filter((p: any) => p.id !== pageId);
      const menuItems = updatedPages.map((p: any) => p.name);

      const fullyUpdatedPages = updatedPages.map((page: any) => {
        const sectionsWithUpdatedHeader = page.sections.map((sec: any) => {
          if (sec.type === "header") {
            return {
              ...sec,
              properties: {
                ...sec.properties,
                menuItems
              }
            };
          }
          return sec;
        });
        return { ...page, sections: sectionsWithUpdatedHeader };
      });

      toast.success("Página eliminada.");
      setActivePageId("home");

      const activePage = fullyUpdatedPages.find((p: any) => p.id === "home");

      return {
        ...prev,
        pages: fullyUpdatedPages,
        sections: activePage.sections
      };
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

  if (!isHydrated || !usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#081018] text-white gap-3">
        <Loader2 className="animate-spin text-[#22D3A6]" size={32} />
        <p className="text-sm font-medium text-slate-400">Cargando Centro de Control...</p>
      </div>
    );
  }

  return (
    <div className="flex max-h-screen bg-[#081018] text-slate-100 font-sans antialiased">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Panels */}
        <div className="flex-1 p-6 relative z-10 view-transition-content flex flex-col min-h-0 overflow-hidden">
          {/* Decorative Blur Backgrounds */}
          <div className="pointer-events-none absolute top-20 left-1/3 h-[400px] w-[400px] rounded-full bg-[#22D3A6]/2 blur-[100px] -z-10" />
          <div className="pointer-events-none absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-[#38BDF8]/2 blur-[120px] -z-10" />

          {!storeConfig ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-5">
              <div className="p-5 rounded-2xl bg-slate-955/50 border border-slate-900 shadow-2xl flex items-center justify-center animate-pulse">
                <Store size={44} className="text-[#38BDF8]" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-black text-white">No hay ninguna tienda activa seleccionada</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto">
                  Por favor, selecciona una tienda utilizando el selector en la barra superior o crea una tienda para comenzar a personalizarla.
                </p>
              </div>
              <button
                onClick={() => setIsStoreDropdownOpen(true)}
                className="h-10 px-5 bg-gradient-to-r from-[#22D3A6] to-[#38BDF8] text-slate-955 text-xs font-black rounded-xl cursor-pointer hover:brightness-110 transition-all flex items-center gap-2 border-none"
              >
                <span>Seleccionar Tienda</span>
                <ChevronDown size={14} />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-5 overflow-hidden min-h-0">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateWithTransition("/portal")}
                    className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-2 transition-all hover:bg-slate-800/40 cursor-pointer border-none"
                    title="Volver al Portal"
                  >
                    <ArrowLeft size={14} />
                    <span>Volver</span>
                  </button>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Sparkles className="text-[#22D3A6]" size={22} />
                      <span>Constructor de Tienda</span>
                    </h2>
                    <p className="text-xs text-slate-400">Edita y publica la plantilla visual de tu tienda en línea</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Active Page Selector */}
                  <div className="flex items-center gap-2 bg-slate-955/65 px-3 py-1.5 rounded-xl border border-slate-900">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Editar Página:</span>
                    <select
                      value={activePageId}
                      onChange={(e) => {
                        setActivePageId(e.target.value);
                        const targetPage = storeConfig.pages.find((p: any) => p.id === e.target.value);
                        if (targetPage && targetPage.sections.length > 0) {
                          setSelectedSectionId(targetPage.sections[0].id);
                        }
                      }}
                      className="bg-transparent text-xs font-bold text-slate-200 border-none outline-none cursor-pointer"
                    >
                      {storeConfig.pages.map((p: any) => (
                        <option key={p.id} value={p.id} className="bg-slate-950 text-white">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {activePageId !== "home" && (
                    <button
                      onClick={() => handleDeletePage(activePageId)}
                      className="h-9 w-9 border border-rose-500/20 hover:border-rose-500/45 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                      title="Eliminar Página Actual"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}

                  {/* Toggle Left/Right Panels on Mobile/Tablet */}
                  <button
                    onClick={() => {
                      setShowLeftPanel(!showLeftPanel);
                      if (showRightPanel) setShowRightPanel(false);
                    }}
                    className={`xl:hidden h-10 px-3 rounded-xl border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900/40 hover:bg-slate-800/40 ${
                      showLeftPanel ? "text-[#22D3A6] border-[#22D3A6]/40" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sliders size={14} />
                    <span className="hidden sm:inline">Estructura</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowRightPanel(!showRightPanel);
                      if (showLeftPanel) setShowLeftPanel(false);
                    }}
                    className={`xl:hidden h-10 px-3 rounded-xl border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900/40 hover:bg-slate-800/40 ${
                      showRightPanel ? "text-[#22D3A6] border-[#22D3A6]/40" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Settings size={14} />
                    <span className="hidden sm:inline">Propiedades</span>
                  </button>

                  <div className="h-6 w-px bg-slate-800" />
                  {/* Viewport size toggles */}
                  <div className="flex items-center gap-1 bg-slate-955/60 p-1.5 rounded-xl border border-slate-900">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-2 rounded-lg cursor-pointer border-none transition-all ${
                        previewDevice === "desktop" ? "bg-[#22D3A6] text-slate-955" : "text-slate-400 hover:text-white bg-transparent"
                      }`}
                      title="Vista Escritorio"
                    >
                      <Monitor size={16} />
                    </button>
                    <button
                      onClick={() => setPreviewDevice("tablet")}
                      className={`p-2 rounded-lg cursor-pointer border-none transition-all ${
                        previewDevice === "tablet" ? "bg-[#22D3A6] text-slate-955" : "text-slate-400 hover:text-white bg-transparent"
                      }`}
                      title="Vista Tableta"
                    >
                      <Tablet size={16} />
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-2 rounded-lg cursor-pointer border-none transition-all ${
                        previewDevice === "mobile" ? "bg-[#22D3A6] text-slate-955" : "text-slate-400 hover:text-white bg-transparent"
                      }`}
                      title="Vista Móvil"
                    >
                      <Smartphone size={16} />
                    </button>
                  </div>

                  <a
                    href={`/preview/${activeStore?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-855 border border-slate-800 text-slate-350 hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer no-underline"
                    title="Ver Vista Previa Completa en Vivo"
                  >
                    <Eye size={14} className="text-[#38BDF8]" />
                    <span>Preview Live</span>
                  </a>

                  <button
                    onClick={handlePublishConfig}
                    disabled={isPublishingConfig}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#22D3A6] to-[#38BDF8] text-slate-955 text-xs font-black shadow-[0_4px_15px_rgba(34,211,166,0.2)] hover:brightness-110 cursor-pointer border-none transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPublishingConfig ? (
                      <>
                        <Loader2 className="animate-spin" size={15} />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Guardar y Publicar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Main constructor workspace layout */}
              <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
                {/* 1. LEFT PANEL: STRUCTURE */}
                {showLeftPanel && (
                  <div className="fixed inset-0 z-35 bg-slate-950/60 backdrop-blur-xs xl:hidden animate-fade-in" onClick={() => setShowLeftPanel(false)} />
                )}
                <div className={`
                  rounded-xl border border-slate-900 bg-slate-955/40 p-4 flex-col gap-4 overflow-y-auto select-none transition-all duration-300
                  xl:w-64 xl:static xl:flex xl:h-auto xl:max-h-none
                  fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/95 border-r shadow-2xl h-[100dvh] max-h-[100dvh]
                  ${showLeftPanel ? "flex translate-x-0" : "hidden xl:flex -translate-x-full xl:translate-x-0"}
                `}>
                  {/* Left Tab Switcher */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-900 shrink-0">
                    <button
                      onClick={() => {
                        setLeftTab("sections");
                        const currentPage = storeConfig.pages.find((p: any) => p.id === activePageId) || storeConfig.pages[0];
                        if (currentPage?.sections?.length > 0) {
                          setSelectedSectionId(currentPage.sections[0].id);
                        }
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all ${
                        leftTab === "sections" ? "bg-slate-800 text-white shadow-md animate-fade-in" : "text-slate-400 hover:text-white bg-transparent"
                      }`}
                    >
                      Secciones
                    </button>
                    <button
                      onClick={() => {
                        setLeftTab("theme");
                        setSelectedSectionId("theme-settings");
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all ${
                        leftTab === "theme" ? "bg-slate-800 text-white shadow-md animate-fade-in" : "text-slate-400 hover:text-white bg-transparent"
                      }`}
                    >
                      Diseño Global
                    </button>
                  </div>

                  {leftTab === "sections" ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
                        Estructura de la Tienda
                      </span>
                      
                      <div className="flex flex-col gap-1.5">
                        {(() => {
                          const currentPage = storeConfig.pages.find((p: any) => p.id === activePageId) || storeConfig.pages[0];
                          return currentPage.sections.map((section: any) => {
                            const isSelected = selectedSectionId === section.id;
                            const isShared = ["header", "footer"].includes(section.id);
                            return (
                              <div
                                key={section.id}
                                onClick={() => setSelectedSectionId(section.id)}
                                draggable={!isShared}
                                onDragStart={(e) => handleDragStart(e, section.id)}
                                onDragOver={(e) => handleDragOver(e, section.id)}
                                onDrop={(e) => handleDrop(e, section.id)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                                  isSelected
                                    ? "bg-slate-900 border-[#22D3A6] text-white shadow-[0_2px_8px_rgba(34,211,166,0.1)]"
                                    : "bg-slate-955/40 border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200"
                                } ${draggedSectionId === section.id ? "opacity-30 border-dashed border-[#38BDF8]" : ""}`}
                              >
                                <div className="flex items-center gap-2 max-w-[130px]">
                                  {!isShared && (
                                    <GripVertical size={13} className="text-slate-600 shrink-0 cursor-grab active:cursor-grabbing hover:text-slate-400" />
                                  )}
                                  <span className="text-xs font-semibold truncate">{section.name}</span>
                                </div>
                                <span className="text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-slate-900 text-slate-500 shrink-0">
                                  {section.type}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      <button
                        onClick={() => setIsAddSectionModalOpen(true)}
                        className="w-full h-9 flex items-center justify-center gap-1.5 text-[9px] font-bold text-[#22D3A6]/80 hover:text-[#22D3A6] border border-dashed border-[#22D3A6]/30 hover:border-[#22D3A6]/60 bg-transparent rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                      >
                        <Plus size={12} />
                        <span>Agregar Sección</span>
                      </button>

                      {/* Pages Management Section */}
                      <div className="border-t border-slate-900 pt-4 mt-2 space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          Páginas del Sitio
                        </span>
                        <div className="flex flex-col gap-1">
                          {storeConfig.pages.map((p: any) => {
                            const isActive = p.id === activePageId;
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setActivePageId(p.id);
                                  if (p.sections.length > 0) {
                                    setSelectedSectionId(p.sections[0].id);
                                  }
                                }}
                                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left border-none cursor-pointer w-full ${
                                  isActive ? "text-[#22D3A6] bg-slate-900/60" : "text-slate-400 hover:bg-slate-900/20 hover:text-white bg-transparent"
                                }`}
                              >
                                <FileText size={12} className={isActive ? "text-[#22D3A6]" : "text-slate-500"} />
                                <span className="truncate flex-1">{p.name}</span>
                                {p.isHome && <span className="text-[8px] font-bold text-slate-500 bg-slate-900 px-1 py-0.5 rounded">HOME</span>}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setIsCreatePageModalOpen(true)}
                          className="w-full h-9 flex items-center justify-center gap-1.5 text-[9px] font-bold text-[#38BDF8]/80 hover:text-[#38BDF8] border border-dashed border-[#38BDF8]/30 hover:border-[#38BDF8]/60 bg-transparent rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                        >
                          <FilePlus size={12} />
                          <span>Agregar Página</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">
                        Tema y Apariencia
                      </span>
                      <div
                        onClick={() => setSelectedSectionId("theme-settings")}
                        className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer border transition-all ${
                          selectedSectionId === "theme-settings"
                            ? "bg-slate-900 border-[#22D3A6] text-white shadow-[0_2px_8px_rgba(34,211,166,0.1)]"
                            : "bg-slate-955/40 border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Settings size={14} className="text-[#22D3A6]" />
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="text-xs font-bold text-white">Ajustes Globales</span>
                          <span className="text-[9px] text-slate-500">Colores, fondos y exportación</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. CENTER PANEL: LIVE PREVIEW CONTAINER */}
                <div className="flex-1 rounded-xl border border-slate-900 bg-[#0c1622] p-6 flex items-center justify-center overflow-auto min-w-0 relative">
                  <div
                    className={`bg-slate-955 rounded-xl border border-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full h-full min-h-[400px] ${
                      previewDevice === "mobile"
                        ? "max-w-sm"
                        : previewDevice === "tablet"
                        ? "max-w-2xl"
                        : "max-w-full"
                    }`}
                  >
                    {/* Mock Browser Header Bar */}
                    <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-900/60 flex items-center gap-3 shrink-0">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex-1 bg-slate-955 rounded-md px-3 py-1 text-[10px] text-slate-500 font-mono text-center truncate">
                        {activeStore?.slug}.dmhub.com
                      </div>
                    </div>

                    {/* Previews scroll area */}
                    <div
                      style={{
                        backgroundColor: storeConfig.theme?.useGradient ? undefined : (storeConfig.theme?.backgroundColor || "#FFFFFF"),
                        backgroundImage: storeConfig.theme?.useGradient ? (storeConfig.theme?.backgroundGradient || "none") : "none",
                        color: "#000000"
                      }}
                      className="flex-1 overflow-y-auto text-slate-900 flex flex-col font-sans select-none"
                    >
                      {(() => {
                        const currentPage = storeConfig.pages.find((p: any) => p.id === activePageId) || storeConfig.pages[0];
                        return currentPage.sections.map((section: any) => {
                          const isSelected = selectedSectionId === section.id;
                          const props = section.properties || {};
                          const customStyle = getSectionStyle(props, storeConfig.theme);
                          const isDark = props.useGlassmorphism || isDarkBg(props.backgroundColor || "#FFFFFF");

                          if (section.type === "announcement") {
                            const announcementBg = props.backgroundColor || storeConfig.theme?.accentColor || "#1AB38C";
                            return (
                              <div
                                key={section.id}
                                style={{
                                  backgroundColor: announcementBg,
                                  color: props.textColor || "#FFFFFF",
                                  padding: `${props.verticalPadding || 8}px 12px`,
                                  fontWeight: props.fontWeight === "Bold" ? "bold" : "normal",
                                  ...customStyle
                                }}
                                className={`text-center text-xs tracking-wider transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <span>{props.bannerText || "Anuncio especial aquí..."}</span>
                              </div>
                            );
                          }

                          if (section.type === "header") {
                            return (
                              <header
                                key={section.id}
                                style={{
                                  backgroundColor: props.backgroundColor || "#FFFFFF",
                                  color: props.textColor || "#0F172A",
                                  ...customStyle
                                }}
                                className={`border-b border-slate-200 ${previewDevice === "mobile" ? "px-3 py-2" : "px-6 py-4"} flex items-center justify-between transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Store size={18} style={{ color: props.textColor || "inherit" }} />
                                  <span style={{ color: props.textColor || "inherit" }} className="font-black tracking-tight text-sm">
                                    {props.storeName || "Mi Tienda"}
                                  </span>
                                </div>
                                <nav className={`${previewDevice === "mobile" ? "hidden" : "flex"} items-center gap-6`}>
                                  {storeConfig.pages.map((p: any) => (
                                    <span
                                      key={p.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePageId(p.id);
                                        if (p.sections.length > 0) {
                                          setSelectedSectionId(p.sections[0].id);
                                        }
                                      }}
                                      style={{
                                        color: p.id === activePageId ? (storeConfig.theme?.accentColor || "#1AB38C") : (props.textColor || "#64748B"),
                                        borderBottomColor: p.id === activePageId ? (storeConfig.theme?.accentColor || "#1AB38C") : "transparent",
                                        borderBottomWidth: p.id === activePageId ? 2 : 0,
                                        borderBottomStyle: p.id === activePageId ? "solid" : "none"
                                      }}
                                      className="text-xs font-bold cursor-pointer transition-colors pb-0.5"
                                    >
                                      {p.name}
                                    </span>
                                  ))}
                                </nav>
                                <div style={{ color: props.textColor || "inherit" }} className="flex items-center gap-4">
                                  <ShoppingCart size={16} />
                                </div>
                              </header>
                            );
                          }

                          if (section.type === "hero") {
                            const theme = storeConfig.theme;
                            const hasImage = !!props.backgroundImage;
                            const heroStyle: React.CSSProperties = {
                              color: props.textColor || "#FFFFFF",
                              ...(hasImage
                                ? {
                                    backgroundImage: `url(${props.backgroundImage})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                  }
                                : {}),
                              ...customStyle
                            };
                            if (!hasImage && !props.useGlassmorphism && !props.backgroundColor) {
                              if (theme?.useGradient) {
                                heroStyle.backgroundImage = theme.backgroundGradient || "none";
                              } else {
                                heroStyle.backgroundColor = theme?.backgroundColor || "#0F172A";
                              }
                            }
                            return (
                              <section
                                key={section.id}
                                style={heroStyle}
                                className={`relative ${previewDevice === "mobile" ? "py-8 px-4 min-h-[180px]" : "py-16 px-8 min-h-[260px]"} text-center flex flex-col items-center justify-center transition-all select-none ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                {hasImage && (
                                  <div 
                                    style={{ backgroundColor: `rgba(0, 0, 0, ${(props.overlayOpacity ?? 60) / 100})` }} 
                                    className="absolute inset-0 pointer-events-none" 
                                  />
                                )}
                                
                                <div className="relative z-10 max-w-lg space-y-4">
                                  <h2 className={`${previewDevice === "mobile" ? "text-lg" : "text-2xl sm:text-3xl"} font-black tracking-tight leading-tight text-white`}>
                                    {props.title || "Título del Hero"}
                                  </h2>
                                  <p className={`${previewDevice === "mobile" ? "text-[10px] leading-snug" : "text-xs leading-relaxed"} text-slate-200/90 max-w-md mx-auto`}>
                                    {props.subtitle || "Subtítulo descriptivo de tu tienda o marca..."}
                                  </p>
                                  <div className="flex items-center justify-center gap-3 pt-2">
                                    {props.primaryButtonText && (
                                      <button
                                        style={{ backgroundColor: storeConfig.theme?.accentColor || "#1AB38C" }}
                                        className="h-10 px-6 rounded-lg text-white font-bold text-xs cursor-pointer border-none shadow transition-all"
                                      >
                                        {props.primaryButtonText}
                                      </button>
                                    )}
                                    {props.secondaryButtonText && (
                                      <button className="h-10 px-6 rounded-lg bg-transparent border border-white text-white font-bold text-xs cursor-pointer hover:bg-white/10 transition-all">
                                        {props.secondaryButtonText}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (section.type === "products") {
                            const gridColumns = previewDevice === "mobile"
                              ? "grid-cols-1"
                              : (props.columns === 2 ? "grid-cols-2" : props.columns === 4 ? "grid-cols-4" : "grid-cols-3");
                            
                            const allMockProducts = [
                              { name: "Precision watch", label: "HOT", price: "Q249.00", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80", desc: "Smartwatch deportivo con GPS y sensor de ritmo cardíaco." },
                              { name: "Audio Hub Pro", label: "NEW", price: "Q599.00", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80", desc: "Audífonos premium con cancelación activa de ruido y audio HD." },
                              { name: "Velocity X1", label: "TRENDING", price: "Q849.00", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80", desc: "Tenis ultraligeros para alto rendimiento deportivo y running." }
                            ];

                            const filteredMocks = allMockProducts.filter(p => {
                              if (!props.showSearch || !constructorSearchTerm.trim()) return true;
                              const term = constructorSearchTerm.toLowerCase();
                              return p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term);
                            }).slice(0, props.productsCount || 3);

                            return (
                              <section
                                key={section.id}
                                style={{
                                  backgroundColor: props.backgroundColor || "#FFFFFF",
                                  color: props.textColor || "#0F172A",
                                  ...customStyle
                                }}
                                className={`${previewDevice === "mobile" ? "py-6 px-3 space-y-4" : "py-12 px-6 space-y-6"} transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <div 
                                  style={{ borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(241, 245, 249, 1)" }}
                                  className="flex items-center justify-between border-b pb-3"
                                >
                                  <h3 className="text-sm font-black uppercase tracking-wider">
                                    {props.title || "Productos Destacados"}
                                  </h3>
                                  <span 
                                    style={{ color: storeConfig.theme?.accentColor || "#1AB38C" }}
                                    className="text-xs font-semibold hover:underline cursor-pointer"
                                  >
                                    Ver todo
                                  </span>
                                </div>

                                {/* Search Bar in Simulator */}
                                {props.showSearch && (
                                  <div className="relative max-w-md mx-auto mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                      <Search size={14} />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Buscar productos..."
                                      value={constructorSearchTerm}
                                      onChange={(e) => setConstructorSearchTerm(e.target.value)}
                                      style={{
                                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#F8FAFC",
                                        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
                                        color: isDark ? "#F8FAFC" : "#0F172A"
                                      }}
                                      className="w-full h-9 pl-9 pr-8 rounded-xl border text-[11px] outline-none focus:border-[#22D3A6] transition-all shadow-sm"
                                    />
                                    {constructorSearchTerm && (
                                      <button
                                        onClick={() => setConstructorSearchTerm("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer"
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {props.layoutType === "list" ? (
                                  <div className="space-y-3 max-w-2xl mx-auto">
                                    {filteredMocks.map((p, idx) => (
                                      <div 
                                        key={idx} 
                                        style={{
                                          backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.5)",
                                          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(241, 245, 249, 1)"
                                        }}
                                        className="rounded-xl border p-3 flex gap-3"
                                      >
                                        <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-200 rounded-lg overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                          <span className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-slate-900 text-white text-[6px] font-black tracking-wider uppercase">
                                            {p.label}
                                          </span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0 text-left">
                                          <div className="space-y-0.5">
                                            <h4 style={{ color: isDark ? "#F8FAFC" : "#0F172A" }} className="text-[11px] font-bold truncate">{p.name}</h4>
                                            <p style={{ color: isDark ? "#94A3B8" : "#64748B" }} className="text-[9px] line-clamp-1 leading-snug">{p.desc}</p>
                                          </div>
                                          <div className="flex items-center justify-between mt-1.5">
                                            <span style={{ color: isDark ? "#F8FAFC" : "#334155" }} className="text-[11px] font-black">{p.price}</span>
                                            <button 
                                              style={{
                                                backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 1)",
                                                color: isDark ? "#F8FAFC" : "#475569"
                                              }}
                                              className="h-6 px-2.5 rounded-lg transition-all border-none cursor-pointer flex items-center gap-1.5 text-[9px] font-bold"
                                            >
                                              <ShoppingCart size={10} />
                                              <span>Añadir</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {filteredMocks.length === 0 && (
                                      <div className="text-center py-6 text-slate-450 text-[10px]">
                                        No se encontraron productos.
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className={`grid gap-4 ${gridColumns}`}>
                                    {filteredMocks.map((p, idx) => (
                                      <div 
                                        key={idx} 
                                        style={{
                                          backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.5)",
                                          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(241, 245, 249, 1)"
                                        }}
                                        className="rounded-xl border p-3 flex flex-col gap-2.5"
                                      >
                                        <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden relative flex items-center justify-center">
                                          <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[8px] font-black tracking-wider uppercase">
                                            {p.label}
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-left">
                                          <h4 style={{ color: isDark ? "#F8FAFC" : "#0F172A" }} className="text-[11px] font-bold truncate">{p.name}</h4>
                                          <span style={{ color: isDark ? "#CBD5E1" : "#334155" }} className="text-xs font-black">{p.price}</span>
                                        </div>
                                      </div>
                                    ))}
                                    {filteredMocks.length === 0 && (
                                      <div className="col-span-full text-center py-6 text-slate-450 text-[10px]">
                                        No se encontraron productos.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </section>
                            );
                          }

                          if (section.type === "richtext") {
                            return (
                              <section
                                key={section.id}
                                style={{
                                  backgroundColor: props.backgroundColor || "#FFFFFF",
                                  color: props.textColor || "#0F172A",
                                  paddingTop: `${props.paddingVertical || 48}px`,
                                  paddingBottom: `${props.paddingVertical || 48}px`,
                                  ...customStyle
                                }}
                                className={`px-8 text-center transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <div className="max-w-2xl mx-auto space-y-3">
                                  <h2 className="text-xl font-bold tracking-tight">
                                    {props.title || "Título de la Página"}
                                  </h2>
                                  <div 
                                    style={{ color: props.textColor ? `${props.textColor}dd` : undefined }} 
                                    className="text-xs leading-relaxed whitespace-pre-wrap"
                                  >
                                    {props.content || "Contenido descriptivo de tu página..."}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (section.type === "custom") {
                            const blocks = props.blocks || [];
                            return (
                              <section
                                key={section.id}
                                style={{
                                  backgroundColor: props.backgroundColor || "#FFFFFF",
                                  color: props.textColor || "#0F172A",
                                  ...customStyle
                                }}
                                className={`py-12 px-6 flex flex-col gap-6 transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
                                  {blocks.map((block: any) => {
                                    if (block.type === "text") {
                                      return (
                                        <p 
                                          key={block.id} 
                                          style={{ color: props.textColor || "inherit" }} 
                                          className="text-sm leading-relaxed text-center whitespace-pre-wrap"
                                        >
                                          {block.content || "Texto personalizado..."}
                                        </p>
                                      );
                                    }
                                    
                                    if (block.type === "image") {
                                      return (
                                        <div key={block.id} className="w-full flex justify-center">
                                          <img
                                            src={block.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                                            alt="Custom Block"
                                            className="max-w-full max-h-[300px] object-cover rounded-xl shadow-md"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
                                            }}
                                          />
                                        </div>
                                      );
                                    }
                                    
                                    if (block.type === "product_card") {
                                      return (
                                        <div 
                                          key={block.id} 
                                          style={{
                                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(248, 250, 252, 0.5)",
                                            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(241, 245, 249, 1)"
                                          }}
                                          className="w-full max-w-[240px] mx-auto rounded-xl border p-3 flex flex-col gap-2.5"
                                        >
                                          <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden relative flex items-center justify-center">
                                            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80" alt="Product" className="w-full h-full object-cover" />
                                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[8px] font-black tracking-wider uppercase">
                                              SELECT
                                            </span>
                                          </div>
                                          <div className="flex flex-col gap-1 text-left">
                                            <h4 style={{ color: isDark ? "#F8FAFC" : "#0F172A" }} className="text-[11px] font-bold truncate">{block.title || "Tarjeta de Producto"}</h4>
                                            <span style={{ color: isDark ? "#CBD5E1" : "#334155" }} className="text-xs font-black">Q299.00</span>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                  {blocks.length === 0 && (
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                                      Sección vacía. Añade bloques de texto, imagen o producto desde el panel lateral.
                                    </div>
                                  )}
                                </div>
                              </section>
                            );
                          }

                          if (section.type === "cart") {
                            return (
                              <section
                                key={section.id}
                                style={{
                                  backgroundColor: props.backgroundColor || "#FFFFFF",
                                  color: props.textColor || "#0F172A",
                                  ...customStyle
                                }}
                                className={`py-12 px-6 flex flex-col gap-6 transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <div 
                                  style={{
                                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#F8FAFC",
                                    borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0"
                                  }}
                                  className="max-w-2xl mx-auto w-full border rounded-2xl p-6 space-y-4"
                                >
                                  <h3 
                                    style={{ 
                                      color: isDark ? "#F8FAFC" : "#1E293B",
                                      borderBottomColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0"
                                    }}
                                    className="text-sm font-black border-b pb-2 flex items-center gap-2"
                                  >
                                    <ShoppingBag size={18} style={{ color: storeConfig.theme?.accentColor || "#1AB38C" }} />
                                    <span>{props.title || "Carrito de Compras / Checkout"}</span>
                                  </h3>
                                  <div className="space-y-3">
                                    <div 
                                      style={{
                                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
                                        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#F1F5F9"
                                      }}
                                      className="flex justify-between items-center p-3 rounded-xl border text-[10px]"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-150 rounded flex items-center justify-center text-slate-450 font-bold">Img</div>
                                        <div className="text-left">
                                          <div style={{ color: isDark ? "#F8FAFC" : "#334155" }} className="font-bold">Producto de Demostración</div>
                                          <div style={{ color: isDark ? "#94A3B8" : "#94A3B8" }}>Q 150.00 x 1</div>
                                        </div>
                                      </div>
                                      <div style={{ color: isDark ? "#F8FAFC" : "#1E293B" }} className="font-bold">Q 150.00</div>
                                    </div>
                                  </div>
                                  <div 
                                    style={{ borderTopColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0" }}
                                    className="border-t pt-3 flex justify-between items-center text-[10px]"
                                  >
                                    <span style={{ color: isDark ? "#94A3B8" : "#64748B" }} className="font-bold uppercase">Métodos de pago habilitados:</span>
                                    <div className="flex gap-2">
                                      {(props.showReservations ?? true) && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Reserva física</span>}
                                      {(props.showCardPayments ?? true) && <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Stripe</span>}
                                    </div>
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (section.type === "footer") {
                            return (
                              <footer
                                key={section.id}
                                style={{
                                  backgroundColor: props.backgroundColor || "#0F172A",
                                  color: props.textColor || "#94A3B8",
                                  ...customStyle
                                }}
                                className={`py-8 px-6 text-center ${previewDevice === "mobile" ? "text-[8px] py-4" : "text-[10px] py-8"} font-semibold border-t border-slate-800 transition-all select-none relative ${
                                  isSelected ? "outline outline-2 outline-[#22D3A6] outline-offset-[-2px] z-30" : ""
                                }`}
                              >
                                <span>{props.copyrightText || "© 2026 Reservados todos los derechos."}</span>
                              </footer>
                            );
                          }

                          return null;
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* 3. RIGHT PANEL: PROPERTIES PANEL */}
                {showRightPanel && (
                  <div className="fixed inset-0 z-35 bg-slate-950/60 backdrop-blur-xs xl:hidden animate-fade-in" onClick={() => setShowRightPanel(false)} />
                )}
                <div className={`
                  rounded-xl border border-slate-900 bg-slate-955/40 p-5 flex-col gap-5 overflow-y-auto select-none transition-all duration-300
                  xl:w-80 xl:static xl:flex xl:h-auto xl:max-h-none
                  fixed inset-y-0 right-0 z-40 w-80 bg-slate-950/95 border-l shadow-2xl h-[100dvh] max-h-[100dvh]
                  ${showRightPanel ? "flex translate-x-0" : "hidden xl:flex translate-x-full xl:translate-x-0"}
                `}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900/60 pb-2">
                    Propiedades de la Sección
                  </span>

                  {(() => {
                    if (selectedSectionId === "theme-settings") {
                      const theme = storeConfig.theme || {
                        backgroundColor: "#F8FAFC",
                        accentColor: "#1AB38C",
                        backgroundGradient: "linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)",
                        useGradient: false
                      };

                      const handleThemeChange = (field: string, val: any) => {
                        setStoreConfig((prev: any) => ({
                          ...prev,
                          theme: {
                            ...theme,
                            [field]: val
                          }
                        }));
                      };

                      const gradientPresets = [
                        { name: "Océano Profundo", css: "linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)" },
                        { name: "Atardecer Místico", css: "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)" },
                        { name: "Bosque Mágico", css: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
                        { name: "Nebulosa Violeta", css: "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)" },
                        { name: "Gris Premium", css: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }
                      ];

                      // JSON Import / Export handlers
                      const exportConfig = () => {
                        const jsonStr = JSON.stringify(storeConfig, null, 2);
                        const blob = new Blob([jsonStr], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `config_diseno_${activeStore?.slug || "tienda"}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        toast.success("Configuración de diseño exportada.");
                      };

                      const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const parsed = JSON.parse(event.target?.result as string);
                            if (!parsed.pages && !parsed.sections) {
                              toast.error("El archivo JSON no es una configuración visual de tienda válida.");
                              return;
                            }
                            
                            // Asegurar theme
                            if (!parsed.theme) {
                              parsed.theme = {
                                backgroundColor: "#F8FAFC",
                                accentColor: "#1AB38C",
                                backgroundGradient: "linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)",
                                useGradient: false
                              };
                            }

                            setStoreConfig(parsed);
                            if (parsed.currentPageId) {
                              setActivePageId(parsed.currentPageId);
                            }
                            toast.success("Diseño importado correctamente.");
                          } catch (err) {
                            toast.error("Error al leer el archivo JSON.");
                          }
                        };
                        reader.readAsText(file);
                      };

                      return (
                        <div className="flex flex-col gap-5 text-left">
                          <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                            <span className="text-xs font-black text-[#22D3A6] tracking-wide uppercase">
                              Diseño Global del Sitio
                            </span>
                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">
                              TEMA
                            </span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color de Acento (Botones, Links)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={theme.accentColor}
                                onChange={(e) => handleThemeChange("accentColor", e.target.value)}
                                className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                              />
                              <span className="text-[10px] font-bold font-mono text-slate-400">{theme.accentColor}</span>
                            </div>
                            <p className="text-[8px] text-slate-500">Color principal para botones, insignias y enlaces activos.</p>
                          </div>

                          <div className="flex items-center justify-between py-2 border-y border-slate-900/40 my-1">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-350">Usar Degradado de Fondo</span>
                              <span className="text-[9px] text-slate-500">Activa un fondo degradado CSS en lugar de un color plano</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={theme.useGradient}
                                onChange={(e) => handleThemeChange("useGradient", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22D3A6] peer-checked:after:bg-slate-955" />
                            </label>
                          </div>

                          {!theme.useGradient ? (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color de Fondo Plano</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={theme.backgroundColor}
                                  onChange={(e) => handleThemeChange("backgroundColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <span className="text-[10px] font-bold font-mono text-slate-400">{theme.backgroundColor}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Código de Degradado CSS</label>
                                <textarea
                                  value={theme.backgroundGradient}
                                  onChange={(e) => handleThemeChange("backgroundGradient", e.target.value)}
                                  placeholder="linear-gradient(135deg, ...)"
                                  className="w-full h-16 p-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 font-mono text-[10px] outline-none focus:border-[#22D3A6] transition-all resize-none"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Presets de Degradado</span>
                                <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                  {gradientPresets.map((preset, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleThemeChange("backgroundGradient", preset.css)}
                                      className="text-left p-1.5 rounded-lg border border-slate-850 hover:border-slate-800 bg-slate-955/20 text-[9px] text-slate-350 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                                    >
                                      <div style={{ backgroundImage: preset.css }} className="w-4 h-4 rounded shrink-0 border border-slate-800" />
                                      <span className="font-semibold truncate">{preset.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="border-t border-slate-900 pt-4 mt-2 space-y-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                              Guardar e Importar Plantilla
                            </span>
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={exportConfig}
                                className="w-full h-9 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#38BDF8] border border-[#38BDF8]/20 bg-[#38BDF8]/5 hover:bg-[#38BDF8]/10 rounded-xl cursor-pointer transition-all uppercase tracking-wider"
                              >
                                <Download size={12} />
                                <span>Exportar Diseño (JSON)</span>
                              </button>

                              <label className="w-full h-9 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#22D3A6] border border-[#22D3A6]/20 bg-[#22D3A6]/5 hover:bg-[#22D3A6]/10 rounded-xl cursor-pointer transition-all uppercase tracking-wider text-center">
                                <Upload size={12} />
                                <span>Importar Diseño (JSON)</span>
                                <input
                                  type="file"
                                  accept=".json"
                                  onChange={importConfig}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <p className="text-[8px] text-slate-500 leading-normal text-center">
                              * Exporta tu diseño para guardarlo como respaldo o cargarlo en otras tiendas.
                            </p>
                          </div>
                        </div>
                      );
                    }

                    const currentPage = storeConfig.pages.find((p: any) => p.id === activePageId) || storeConfig.pages[0];
                    const currentSection = currentPage.sections.find((s: any) => s.id === selectedSectionId);
                    if (!currentSection) return <p className="text-xs text-slate-500">Ninguna sección seleccionada</p>;
                    
                    const props = currentSection.properties;

                    return (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
                          <span className="text-xs font-black text-[#22D3A6] tracking-wide uppercase">
                            {currentSection.name}
                          </span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-500">
                            #{currentSection.id}
                          </span>
                        </div>

                        {/* ANNOUNCEMENT PROPERTIES */}
                        {currentSection.type === "announcement" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Texto del Banner</label>
                              <textarea
                                value={props.bannerText}
                                onChange={(e) => handlePropertyChange("bannerText", e.target.value)}
                                className="w-full h-16 p-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6] transition-all resize-none"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Fondo</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={props.backgroundColor}
                                    onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                  />
                                  <span className="text-[10px] font-bold font-mono text-slate-400">{props.backgroundColor}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Texto</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={props.textColor}
                                    onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                  />
                                  <span className="text-[10px] font-bold font-mono text-slate-400">{props.textColor}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Grosor de Fuente</label>
                              <div className="grid grid-cols-2 gap-2 bg-slate-955/45 p-1 rounded-xl border border-slate-900">
                                {["Medium", "Bold"].map((w) => (
                                  <button
                                    key={w}
                                    type="button"
                                    onClick={() => handlePropertyChange("fontWeight", w)}
                                    className={`py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border-none transition-all ${
                                      props.fontWeight === w ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:text-white bg-transparent"
                                    }`}
                                  >
                                    {w}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between py-1 border-y border-slate-900/40 my-1">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-300">Sticky Banner</span>
                                <span className="text-[9px] text-slate-500">Mantener banner fijo al hacer scroll</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={props.stickyBanner}
                                  onChange={(e) => handlePropertyChange("stickyBanner", e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22D3A6] peer-checked:after:bg-slate-950" />
                              </label>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Padding Vertical</span>
                                <span className="text-[#22D3A6] font-mono">{props.verticalPadding || 8}px</span>
                              </div>
                              <input
                                type="range"
                                min="4"
                                max="24"
                                value={props.verticalPadding || 8}
                                onChange={(e) => handlePropertyChange("verticalPadding", parseInt(e.target.value))}
                                className="w-full accent-[#22D3A6] h-1.5 rounded-lg bg-slate-900 outline-none cursor-pointer border-none"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Acción del Link</label>
                              <select
                                value={props.linkAction}
                                onChange={(e) => handlePropertyChange("linkAction", e.target.value)}
                                className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6]"
                              >
                                <option value="Open Link">Abrir Enlace</option>
                                <option value="None">Ninguna</option>
                              </select>
                            </div>

                            {props.linkAction === "Open Link" && (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL del Enlace</label>
                                <input
                                  type="text"
                                  value={props.linkUrl || ""}
                                  onChange={(e) => handlePropertyChange("linkUrl", e.target.value)}
                                  className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* HEADER PROPERTIES */}
                        {currentSection.type === "header" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Tienda</label>
                              <input
                                type="text"
                                value={props.storeName}
                                onChange={(e) => handlePropertyChange("storeName", e.target.value)}
                                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL del Logotipo (Opcional)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={props.logoUrl}
                                  onChange={(e) => handlePropertyChange("logoUrl", e.target.value)}
                                  placeholder="http://imagen..."
                                  className="flex-1 h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6] transition-all"
                                />
                                {cloudinaryConfig.hasCredentials && (
                                  <label className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shrink-0">
                                    <Upload size={14} />
                                    <span>Subir</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            toast.loading("Subiendo logotipo...");
                                            const url = await uploadToCloudinary(file, token!);
                                            handlePropertyChange("logoUrl", url);
                                            toast.dismiss();
                                            toast.success("Logotipo subido correctamente");
                                          } catch (err) {
                                            toast.dismiss();
                                            toast.error(err instanceof Error ? err.message : "Error al subir logotipo");
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
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Enlaces de Navegación (Menu)</label>
                              <div className="flex flex-col gap-2">
                                {(props.menuItems || []).map((item: string, idx: number) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newItems = [...props.menuItems];
                                        newItems[idx] = e.target.value;
                                        handlePropertyChange("menuItems", newItems);
                                      }}
                                      className="flex-1 h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                                    />
                                    <button
                                      onClick={() => {
                                        const newItems = props.menuItems.filter((_: any, i: number) => i !== idx);
                                        handlePropertyChange("menuItems", newItems);
                                      }}
                                      className="p-2 h-9 rounded-xl border border-slate-800 hover:border-red-500 hover:text-red-400 bg-transparent text-slate-500 transition-all cursor-pointer flex items-center justify-center"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    handlePropertyChange("menuItems", [...(props.menuItems || []), "Nuevo Link"]);
                                  }}
                                  className="h-8 mt-1 border border-dashed border-slate-800 hover:border-[#22D3A6]/45 text-[10px] text-slate-400 hover:text-[#22D3A6] bg-transparent rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 font-bold uppercase tracking-wider"
                                >
                                  <Plus size={10} />
                                  <span>Añadir Enlace</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* HERO PROPERTIES */}
                        {currentSection.type === "hero" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Título Principal</label>
                              <input
                                type="text"
                                value={props.title}
                                onChange={(e) => handlePropertyChange("title", e.target.value)}
                                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Subtítulo</label>
                              <textarea
                                value={props.subtitle}
                                onChange={(e) => handlePropertyChange("subtitle", e.target.value)}
                                className="w-full h-20 p-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6] transition-all resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Botón Principal</label>
                                <input
                                  type="text"
                                  value={props.primaryButtonText}
                                  onChange={(e) => handlePropertyChange("primaryButtonText", e.target.value)}
                                  className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Botón Secundario</label>
                                <input
                                  type="text"
                                  value={props.secondaryButtonText}
                                  onChange={(e) => handlePropertyChange("secondaryButtonText", e.target.value)}
                                  className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL Imagen de Fondo</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={props.backgroundImage}
                                  onChange={(e) => handlePropertyChange("backgroundImage", e.target.value)}
                                  placeholder="http://imagen..."
                                  className="flex-1 h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6] transition-all"
                                />
                                {cloudinaryConfig.hasCredentials && (
                                  <label className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shrink-0">
                                    <Upload size={14} />
                                    <span>Subir</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          try {
                                            toast.loading("Subiendo fondo...");
                                            const url = await uploadToCloudinary(file, token!);
                                            handlePropertyChange("backgroundImage", url);
                                            toast.dismiss();
                                            toast.success("Imagen de fondo subida correctamente");
                                          } catch (err) {
                                            toast.dismiss();
                                            toast.error(err instanceof Error ? err.message : "Error al subir fondo");
                                          }
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            {props.primaryButtonText && (
                              <div className="flex flex-col gap-1.5 border-t border-slate-900/60 pt-3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Acción Botón Principal</label>
                                <select
                                  value={props.primaryButtonAction || ""}
                                  onChange={(e) => {
                                    handlePropertyChange("primaryButtonAction", e.target.value);
                                    handlePropertyChange("primaryButtonValue", "");
                                  }}
                                  className="h-9 px-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs outline-none focus:border-[#22D3A6]"
                                >
                                  <option value="">Ninguna acción</option>
                                  <option value="external_url">Redirigir a URL externa</option>
                                  <option value="login">Login</option>
                                  <option value="register">Register</option>
                                  <option value="section_redirect">Redirigir a sección de esta página</option>
                                  <option value="page_redirect">Redirigir a otra página del sitio</option>
                                </select>

                                {props.primaryButtonAction === "external_url" && (
                                  <input
                                    type="text"
                                    placeholder="https://ejemplo.com"
                                    value={props.primaryButtonValue || ""}
                                    onChange={(e) => handlePropertyChange("primaryButtonValue", e.target.value)}
                                    className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                                  />
                                )}

                                {props.primaryButtonAction === "section_redirect" && (
                                  <select
                                    value={props.primaryButtonValue || ""}
                                    onChange={(e) => handlePropertyChange("primaryButtonValue", e.target.value)}
                                    className="h-9 px-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs outline-none focus:border-[#22D3A6]"
                                  >
                                    <option value="">Selecciona sección...</option>
                                    {(currentPage?.sections || [])
                                      .filter((s: any) => s.id !== "announcement" && s.id !== "header" && s.id !== "footer")
                                      .map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
                                      ))}
                                  </select>
                                )}

                                {props.primaryButtonAction === "page_redirect" && (
                                  <select
                                    value={props.primaryButtonValue || ""}
                                    onChange={(e) => handlePropertyChange("primaryButtonValue", e.target.value)}
                                    className="h-9 px-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs outline-none focus:border-[#22D3A6]"
                                  >
                                    <option value="">Selecciona página...</option>
                                    {(storeConfig.pages || []).map((p: any) => (
                                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )}

                            {props.secondaryButtonText && (
                              <div className="flex flex-col gap-1.5 border-t border-slate-900/60 pt-3">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Acción Botón Secundario</label>
                                <select
                                  value={props.secondaryButtonAction || ""}
                                  onChange={(e) => {
                                    handlePropertyChange("secondaryButtonAction", e.target.value);
                                    handlePropertyChange("secondaryButtonValue", "");
                                  }}
                                  className="h-9 px-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs outline-none focus:border-[#22D3A6]"
                                >
                                  <option value="">Ninguna acción</option>
                                  <option value="external_url">Redirigir a URL externa</option>
                                  <option value="login">Login</option>
                                  <option value="register">Register</option>
                                  <option value="section_redirect">Redirigir a sección de esta página</option>
                                  <option value="page_redirect">Redirigir a otra página del sitio</option>
                                </select>

                                {props.secondaryButtonAction === "external_url" && (
                                  <input
                                    type="text"
                                    placeholder="https://ejemplo.com"
                                    value={props.secondaryButtonValue || ""}
                                    onChange={(e) => handlePropertyChange("secondaryButtonValue", e.target.value)}
                                    className="h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                                  />
                                )}

                                {props.secondaryButtonAction === "section_redirect" && (
                                  <select
                                    value={props.secondaryButtonValue || ""}
                                    onChange={(e) => handlePropertyChange("secondaryButtonValue", e.target.value)}
                                    className="h-9 px-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs outline-none focus:border-[#22D3A6]"
                                  >
                                    <option value="">Selecciona sección...</option>
                                    {(currentPage?.sections || [])
                                      .filter((s: any) => s.id !== "announcement" && s.id !== "header" && s.id !== "footer")
                                      .map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
                                      ))}
                                  </select>
                                )}

                                {props.secondaryButtonAction === "page_redirect" && (
                                  <select
                                    value={props.secondaryButtonValue || ""}
                                    onChange={(e) => handlePropertyChange("secondaryButtonValue", e.target.value)}
                                    className="h-9 px-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-350 text-xs outline-none focus:border-[#22D3A6]"
                                  >
                                    <option value="">Selecciona página...</option>
                                    {(storeConfig.pages || []).map((p: any) => (
                                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )}

                            {/* Color Fondo */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Fondo <span className="text-slate-600 normal-case">(hex, rgba o transparent)</span></label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.backgroundColor || "") ? props.backgroundColor : "#0f172a"}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.backgroundColor || ""}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  placeholder="#0F172A o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                                <button type="button" onClick={() => handlePropertyChange("backgroundColor", "transparent")} className="h-8 px-2 rounded-lg border border-dashed border-slate-700 text-[9px] text-slate-500 hover:text-white hover:border-slate-500 bg-transparent cursor-pointer transition-all shrink-0">T</button>
                              </div>
                            </div>

                            {/* Color Texto */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Texto</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.textColor || "") ? props.textColor : "#ffffff"}
                                  onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.textColor || ""}
                                  onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                  placeholder="#FFFFFF o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                            </div>

                            {/* Color Íconos */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Íconos <span className="text-slate-600 normal-case">(botones decorativos)</span></label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.iconColor || "") ? props.iconColor : "#22d3a6"}
                                  onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.iconColor || ""}
                                  onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                                  placeholder="#22D3A6 o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                                <button type="button" onClick={() => handlePropertyChange("iconColor", "transparent")} className="h-8 px-2 rounded-lg border border-dashed border-slate-700 text-[9px] text-slate-500 hover:text-white hover:border-slate-500 bg-transparent cursor-pointer transition-all shrink-0">T</button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PRODUCTS PROPERTIES */}
                        {currentSection.type === "products" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Título de la Sección</label>
                              <input
                                type="text"
                                value={props.title}
                                onChange={(e) => handlePropertyChange("title", e.target.value)}
                                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Columnas Grid</label>
                                <select
                                  value={props.columns}
                                  onChange={(e) => handlePropertyChange("columns", parseInt(e.target.value))}
                                  className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6]"
                                >
                                  <option value={2}>2 Columnas</option>
                                  <option value={3}>3 Columnas</option>
                                  <option value={4}>4 Columnas</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cant. Productos</label>
                                <select
                                  value={props.productsCount}
                                  onChange={(e) => handlePropertyChange("productsCount", parseInt(e.target.value))}
                                  className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6]"
                                >
                                  <option value={1}>1 Producto</option>
                                  <option value={2}>2 Productos</option>
                                  <option value={3}>3 Productos</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Diseño Layout</label>
                              <select
                                value={props.layoutType || "grid"}
                                onChange={(e) => handlePropertyChange("layoutType", e.target.value)}
                                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6]"
                              >
                                <option value="grid">Cuadrícula (Grid)</option>
                                <option value="list">Lista (List)</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Productos por Página (Catálogo Completo)</label>
                              <select
                                value={props.pageSize || 6}
                                onChange={(e) => handlePropertyChange("pageSize", parseInt(e.target.value))}
                                className="w-full h-9 px-3 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs font-semibold outline-none focus:border-[#22D3A6]"
                              >
                                <option value={2}>2 Productos</option>
                                <option value={4}>4 Productos</option>
                                <option value={6}>6 Productos</option>
                                <option value={8}>8 Productos</option>
                                <option value={12}>12 Productos</option>
                                <option value={24}>24 Productos</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-955/40 mt-1">
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-300">Mostrar Buscador</span>
                                <span className="text-[9px] text-slate-500">Permite buscar productos en tiempo real</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={props.showSearch || false}
                                onChange={(e) => handlePropertyChange("showSearch", e.target.checked)}
                                className="h-4 w-4 rounded border-slate-800 bg-slate-955 text-[#22D3A6] focus:ring-0 focus:ring-offset-0 accent-[#22D3A6] cursor-pointer"
                              />
                            </div>

                            {/* Color Fondo sección */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Fondo <span className="text-slate-600 normal-case">(transparent admitido)</span></label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.backgroundColor || "") ? props.backgroundColor : "#ffffff"}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.backgroundColor || ""}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  placeholder="#FFFFFF o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                                <button type="button" onClick={() => handlePropertyChange("backgroundColor", "transparent")} className="h-8 px-2 rounded-lg border border-dashed border-slate-700 text-[9px] text-slate-500 hover:text-white hover:border-slate-500 bg-transparent cursor-pointer transition-all shrink-0">T</button>
                              </div>
                            </div>

                            {/* Color Íconos */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Íconos <span className="text-slate-600 normal-case">(carrito, badges)</span></label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.iconColor || "") ? props.iconColor : "#1ab38c"}
                                  onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.iconColor || ""}
                                  onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                                  placeholder="#1AB38C"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* RICH TEXT PROPERTIES */}
                        {currentSection.type === "richtext" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Título de la Página</label>
                              <input
                                type="text"
                                value={props.title || ""}
                                onChange={(e) => handlePropertyChange("title", e.target.value)}
                                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Contenido (Texto)</label>
                              <textarea
                                value={props.content || ""}
                                onChange={(e) => handlePropertyChange("content", e.target.value)}
                                className="w-full h-32 p-2 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6] transition-all resize-none"
                              />
                            </div>

                            {/* Color Fondo */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Fondo <span className="text-slate-600 normal-case">(transparent admitido)</span></label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.backgroundColor || "") ? props.backgroundColor : "#ffffff"}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.backgroundColor || ""}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  placeholder="#FFFFFF o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                                <button type="button" onClick={() => handlePropertyChange("backgroundColor", "transparent")} className="h-8 px-2 rounded-lg border border-dashed border-slate-700 text-[9px] text-slate-500 hover:text-white hover:border-slate-500 bg-transparent cursor-pointer transition-all shrink-0">T</button>
                              </div>
                            </div>

                            {/* Color Texto */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Texto</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.textColor || "") ? props.textColor : "#0f172a"}
                                  onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.textColor || ""}
                                  onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                  placeholder="#0F172A"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                            </div>

                            {/* Color Íconos */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Íconos</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.iconColor || "") ? props.iconColor : "#1ab38c"}
                                  onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.iconColor || ""}
                                  onChange={(e) => handlePropertyChange("iconColor", e.target.value)}
                                  placeholder="#1AB38C o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                                <button type="button" onClick={() => handlePropertyChange("iconColor", "transparent")} className="h-8 px-2 rounded-lg border border-dashed border-slate-700 text-[9px] text-slate-500 hover:text-white hover:border-slate-500 bg-transparent cursor-pointer transition-all shrink-0">T</button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Espaciado Vertical (Padding)</span>
                                <span className="text-[#22D3A6] font-mono">{props.paddingVertical || 48}px</span>
                              </div>
                              <input
                                type="range"
                                min="12"
                                max="120"
                                value={props.paddingVertical || 48}
                                onChange={(e) => handlePropertyChange("paddingVertical", parseInt(e.target.value))}
                                className="w-full accent-[#22D3A6] h-1.5 rounded-lg bg-slate-900 outline-none cursor-pointer border-none"
                              />
                            </div>
                          </div>
                        )}

                        {/* CART PROPERTIES */}
                        {currentSection.type === "cart" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Título de Sección</label>
                              <input
                                type="text"
                                value={props.title || ""}
                                onChange={(e) => handlePropertyChange("title", e.target.value)}
                                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-900">
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-slate-300">Habilitar Reservas</span>
                                <span className="text-[8px] text-slate-500">Pago físico en sucursal</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={props.showReservations ?? true}
                                onChange={(e) => handlePropertyChange("showReservations", e.target.checked)}
                                className="w-4 h-4 cursor-pointer accent-[#22D3A6]"
                              />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-900">
                              <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-slate-300">Habilitar Stripe</span>
                                <span className="text-[8px] text-slate-500">Pago en línea con tarjeta</span>
                              </div>
                              <input
                                type="checkbox"
                                checked={props.showCardPayments ?? true}
                                onChange={(e) => handlePropertyChange("showCardPayments", e.target.checked)}
                                className="w-4 h-4 cursor-pointer accent-[#22D3A6]"
                              />
                            </div>
                          </div>
                        )}

                        {/* FOOTER PROPERTIES */}
                        {currentSection.type === "footer" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Texto de Copyright</label>
                              <input
                                type="text"
                                value={props.copyrightText}
                                onChange={(e) => handlePropertyChange("copyrightText", e.target.value)}
                                className="h-10 px-4 rounded-xl border border-slate-800 bg-slate-955 text-slate-300 text-xs outline-none focus:border-[#22D3A6]"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Fondo</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={props.backgroundColor}
                                    onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                  />
                                  <span className="text-[10px] font-bold font-mono text-slate-400">{props.backgroundColor}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color Texto</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={props.textColor}
                                    onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                    className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                  />
                                  <span className="text-[10px] font-bold font-mono text-slate-400">{props.textColor}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CUSTOM SECTION (TREE) PROPERTIES */}
                        {currentSection.type === "custom" && (
                          <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Estructura de Bloques
                            </span>
                            
                            <div className="flex flex-col gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-900 max-h-[300px] overflow-y-auto">
                              {(!props.blocks || props.blocks.length === 0) ? (
                                <p className="text-[10px] text-slate-500 text-center py-4">No hay bloques en esta sección. Añade uno abajo.</p>
                              ) : (
                                props.blocks.map((block: any, idx: number) => {
                                  return (
                                    <div key={block.id} className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
                                      <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                                        <div className="flex items-center gap-1">
                                          {block.type === "text" && <Type size={11} className="text-[#38BDF8]" />}
                                          {block.type === "image" && <LucideImage size={11} className="text-[#A78BFA]" />}
                                          {block.type === "product_card" && <ShoppingBag size={11} className="text-[#F43F5E]" />}
                                          <span className="text-[9px] font-black uppercase text-slate-400">
                                            {block.type === "text" ? "Texto" : block.type === "image" ? "Imagen" : "Producto"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => handleMoveBlock(currentSection.id, idx, "up")}
                                            className="p-1 rounded bg-transparent border-none text-slate-500 hover:text-white hover:bg-slate-900 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                          >
                                            <ArrowUp size={10} />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={idx === props.blocks.length - 1}
                                            onClick={() => handleMoveBlock(currentSection.id, idx, "down")}
                                            className="p-1 rounded bg-transparent border-none text-slate-500 hover:text-white hover:bg-slate-900 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                          >
                                            <ArrowDown size={10} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteBlock(currentSection.id, idx)}
                                            className="p-1 rounded bg-transparent border-none text-rose-500 hover:text-rose-450 hover:bg-rose-950/30 cursor-pointer ml-0.5"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        </div>
                                      </div>
                                      
                                      {/* Block Content Inputs */}
                                      {block.type === "text" && (
                                        <div className="flex flex-col gap-1 text-left">
                                          <label className="text-[8px] font-bold text-slate-500 uppercase">Contenido</label>
                                          <textarea
                                            value={block.content || ""}
                                            onChange={(e) => handleBlockFieldChange(currentSection.id, idx, "content", e.target.value)}
                                            className="w-full h-12 p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-350 text-xs outline-none focus:border-[#22D3A6] transition-all resize-none"
                                            placeholder="Introduce el texto aquí..."
                                          />
                                        </div>
                                      )}
                                      
                                      {block.type === "image" && (
                                        <div className="flex flex-col gap-1 text-left">
                                          <label className="text-[8px] font-bold text-slate-500 uppercase">URL de Imagen</label>
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              value={block.url || ""}
                                              onChange={(e) => handleBlockFieldChange(currentSection.id, idx, "url", e.target.value)}
                                              className="flex-1 h-7 px-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-350 text-xs outline-none focus:border-[#22D3A6] transition-all"
                                              placeholder="https://ejemplo.com/imagen.jpg"
                                            />
                                            {cloudinaryConfig.hasCredentials && (
                                              <label className="h-7 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-[9px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-700 shrink-0">
                                                <Upload size={10} />
                                                <span>Subir</span>
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                      try {
                                                        toast.loading("Subiendo imagen de bloque...");
                                                        const url = await uploadToCloudinary(file, token!);
                                                        handleBlockFieldChange(currentSection.id, idx, "url", url);
                                                        toast.dismiss();
                                                        toast.success("Imagen de bloque subida correctamente");
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
                                      )}
                                      
                                      {block.type === "product_card" && (
                                        <div className="flex flex-col gap-1 text-left">
                                          <label className="text-[8px] font-bold text-slate-500 uppercase">Título de Producto</label>
                                          <input
                                            type="text"
                                            value={block.title || ""}
                                            onChange={(e) => handleBlockFieldChange(currentSection.id, idx, "title", e.target.value)}
                                            className="w-full h-7 px-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-350 text-xs outline-none focus:border-[#22D3A6] transition-all"
                                            placeholder="Ej. Precision watch"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                            
                            <div className="border-t border-slate-900 pt-3 flex flex-col gap-1.5">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block text-left">
                                Insertar Bloque
                              </span>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddBlock(currentSection.id, "text")}
                                  className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[9px] font-bold text-[#38BDF8] border border-slate-800 cursor-pointer transition-all flex flex-col items-center gap-1"
                                >
                                  <Type size={11} />
                                  <span>Texto</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddBlock(currentSection.id, "image")}
                                  className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[9px] font-bold text-[#A78BFA] border border-slate-800 cursor-pointer transition-all flex flex-col items-center gap-1"
                                >
                                  <LucideImage size={11} />
                                  <span>Imagen</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddBlock(currentSection.id, "product_card")}
                                  className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[9px] font-bold text-[#F43F5E] border border-slate-800 cursor-pointer transition-all flex flex-col items-center gap-1"
                                >
                                  <ShoppingBag size={11} />
                                  <span>Producto</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* ESTILOS AVANZADOS (COMÚN A TODAS LAS SECCIONES) */}
                        <div className="border-t border-slate-900/60 pt-4 mt-2 space-y-4">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-left">
                            Diseño y Estilo Avanzado
                          </span>

                          {/* Background Color (if not announcement, hero, products, richtext, footer) */}
                          {!["announcement", "hero", "products", "richtext", "footer"].includes(currentSection.type) && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color de Fondo</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.backgroundColor || "") ? props.backgroundColor : "#ffffff"}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.backgroundColor || ""}
                                  onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
                                  placeholder="#FFFFFF o transparent"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                                <button 
                                  type="button" 
                                  onClick={() => handlePropertyChange("backgroundColor", "transparent")} 
                                  className="h-8 px-2 rounded-lg border border-dashed border-slate-700 text-[9px] text-slate-500 hover:text-white hover:border-slate-500 bg-transparent cursor-pointer transition-all shrink-0"
                                >
                                  T
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Text Color (if not announcement, hero, richtext, footer) */}
                          {!["announcement", "hero", "richtext", "footer"].includes(currentSection.type) && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color de Texto</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={/^#[0-9a-f]{6}$/i.test(props.textColor || "") ? props.textColor : "#0f172a"}
                                  onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent outline-none p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={props.textColor || ""}
                                  onChange={(e) => handlePropertyChange("textColor", e.target.value)}
                                  placeholder="#0F172A"
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-955 text-slate-300 text-[10px] font-mono outline-none focus:border-[#22D3A6]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Glassmorphism Toggle */}
                          <div className="flex items-center justify-between py-2 border-y border-slate-900/40 my-1">
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-slate-350">Efecto Cristal (Glass)</span>
                              <span className="text-[9px] text-slate-500">Aplica desenfoque y fondo cristalino</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={props.useGlassmorphism || false}
                                onChange={(e) => handlePropertyChange("useGlassmorphism", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22D3A6] peer-checked:after:bg-slate-955" />
                            </label>
                          </div>

                          {/* Opacity Slider */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              <span>Opacidad del Fondo</span>
                              <span className="text-[#22D3A6] font-mono">{props.opacity ?? 100}%</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={props.opacity ?? 100}
                              onChange={(e) => handlePropertyChange("opacity", parseInt(e.target.value))}
                              className="w-full accent-[#22D3A6] h-1.5 rounded-lg bg-slate-900 outline-none cursor-pointer border-none"
                            />
                          </div>

                          {/* Blur Slider */}
                          {(props.useGlassmorphism) && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Fuerza de Desenfoque (Blur)</span>
                                <span className="text-[#22D3A6] font-mono">{props.blur ?? 12}px</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="24"
                                value={props.blur ?? 12}
                                onChange={(e) => handlePropertyChange("blur", parseInt(e.target.value))}
                                className="w-full accent-[#22D3A6] h-1.5 rounded-lg bg-slate-900 outline-none cursor-pointer border-none"
                              />
                            </div>
                          )}

                          {/* Text Shadow Toggle */}
                          <div className="flex items-center justify-between py-2 border-y border-slate-900/40 my-1">
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-slate-350">Sombra de Texto</span>
                              <span className="text-[9px] text-slate-500">Añade sombra para mejorar lectura</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={props.textShadow || false}
                                onChange={(e) => handlePropertyChange("textShadow", e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22D3A6] peer-checked:after:bg-slate-955" />
                            </label>
                          </div>

                          {/* Extra specific controls */}
                          {currentSection.type === "hero" && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>Opacidad de Capa Oscura</span>
                                <span className="text-[#22D3A6] font-mono">{props.overlayOpacity ?? 60}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={props.overlayOpacity ?? 60}
                                onChange={(e) => handlePropertyChange("overlayOpacity", parseInt(e.target.value))}
                                className="w-full accent-[#22D3A6] h-1.5 rounded-lg bg-slate-900 outline-none cursor-pointer border-none"
                              />
                            </div>
                          )}

                          {currentSection.type === "header" && (
                            <div className="flex items-center justify-between py-2 border-y border-slate-900/40 my-1">
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-350">Menú Fijo (Sticky)</span>
                                <span className="text-[9px] text-slate-500">Mantiene el menú arriba al hacer scroll</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={props.stickyHeader || false}
                                  onChange={(e) => handlePropertyChange("stickyHeader", e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22D3A6] peer-checked:after:bg-slate-955" />
                              </label>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleDeleteSection}
                          disabled={["header", "footer"].includes(selectedSectionId)}
                          className={`w-full mt-4 h-10 border text-[10px] font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                            ["header", "footer"].includes(selectedSectionId)
                              ? "bg-slate-900/30 border-slate-900/50 text-slate-500 cursor-not-allowed opacity-50"
                              : "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/30 hover:border-rose-500/60 text-rose-400 cursor-pointer"
                          }`}
                        >
                          <Trash2 size={12} />
                          <span>Eliminar Sección</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE STORE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-955 p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Store className="text-[#22D3A6]" size={18} />
                <span>Crear Nueva Tienda</span>
              </h3>
              <p className="text-xs text-slate-400">Instancia una nueva base de datos de comercio filtrada por tenant</p>
            </div>
            <form onSubmit={handleCreateStore} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Tienda</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. DM Hub Central"
                  value={newStoreName}
                  onChange={(e) => {
                    setNewStoreName(e.target.value);
                    const slug = e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/\s+/g, "-");
                    setNewStoreSlug(slug);
                  }}
                  className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-100 outline-none focus:border-[#22D3A6]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slug Subdominio</label>
                <input
                  type="text"
                  required
                  placeholder="ej-dmhub-central"
                  value={newStoreSlug}
                  onChange={(e) => setNewStoreSlug(e.target.value)}
                  className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-100 outline-none focus:border-[#22D3A6]"
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingStore}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[#22D3A6] to-[#38BDF8] text-slate-955 font-black text-xs shadow-lg hover:brightness-110 cursor-pointer border-none flex items-center justify-center"
              >
                {isCreatingStore ? <Loader2 className="animate-spin" size={16} /> : <span>Crear Tienda</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PAGE MODAL */}
      {isCreatePageModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-955 p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsCreatePageModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FilePlus className="text-[#38BDF8]" size={18} />
                <span>Agregar Nueva Página</span>
              </h3>
              <p className="text-xs text-slate-400">Crea una página en blanco que se integrará automáticamente en el menú</p>
            </div>
            <form onSubmit={handleCreatePage} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Página</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sobre Nosotros o Contacto"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-100 outline-none focus:border-[#22D3A6]"
                />
              </div>
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[#22D3A6] to-[#38BDF8] text-slate-955 font-black text-xs shadow-lg hover:brightness-110 cursor-pointer border-none flex items-center justify-center"
              >
                <span>Crear Página</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD SECTION MODAL */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-955 p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsAddSectionModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              <X size={18} />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FilePlus className="text-[#22D3A6]" size={18} />
                <span>Agregar Nueva Sección</span>
              </h3>
              <p className="text-xs text-slate-400">Inserta una nueva sección al final de la página activa</p>
            </div>
            <form onSubmit={handleAddSection} className="space-y-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Sección</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mi Galería o Sección de Promo"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-100 outline-none focus:border-[#22D3A6]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Sección</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="h-10 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 text-xs text-slate-100 outline-none focus:border-[#22D3A6]"
                >
                  <option value="custom">Sección Personalizada (Árbol)</option>
                  <option value="announcement">Barra de Anuncios</option>
                  <option value="hero">Sección Hero</option>
                  <option value="products">Grilla de Productos</option>
                  <option value="richtext">Bloque Rich Text / Contenido</option>
                  <option value="cart">Carrito de Compras / Checkout</option>
                </select>
              </div>
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[#22D3A6] to-[#38BDF8] text-slate-955 font-black text-xs shadow-lg hover:brightness-110 cursor-pointer border-none flex items-center justify-center"
              >
                <span>Crear Sección</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
