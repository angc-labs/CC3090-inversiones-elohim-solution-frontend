import type { SupportedLanguage } from "@/lib/theme-language";

export type TranslationKey = keyof typeof esTranslations;

export const esTranslations = {
  // Navigation & Tabs
  "portal.tablero": "Tablero",
  "portal.sucursales": "Sucursales",
  "portal.clientes": "Clientes",
  "portal.usuarios": "Usuarios",
  "portal.productos": "Productos",
  "portal.reservaciones": "Reservaciones",
  "portal.pagos": "Pagos",
  "portal.reportes": "Reportes",
  "portal.kanban": "Kanban",
  "portal.constructor": "Constructor",
  "portal.configuracion": "Configuración",
  "portal.integraciones": "Integraciones",
  "portal.superadmin": "Super Admin",

  // Header & Controls
  "portal.search_placeholder": "Buscar en panel (módulos, productos, órdenes)...",
  "portal.select_store": "Seleccionar Tienda",
  "portal.switch_instance": "Cambiar Instancia",
  "portal.all_stores": "Todas las Tiendas (Global)",
  "portal.manage_stores": "Administrar Tiendas",
  "portal.logout": "Cerrar Sesión",
  "portal.docs": "Documentación",
  "portal.online_docs": "Documentación en Línea",
  "portal.light_mode": "Modo Claro",
  "portal.dark_mode": "Modo Oscuro",
  "portal.toggle_theme": "Cambiar tema (Claro / Oscuro)",
  "portal.language": "Idioma",
  "portal.lang_es": "Español",
  "portal.lang_en": "English",
  "portal.toggle_lang": "Cambiar idioma (ES / EN)",
  "portal.active_store": "Instancia Activa",
  "portal.admin_role": "Administrador",
  "portal.superadmin_role": "Super Administrador",
  "portal.staff_role": "Colaborador",
  "portal.public_catalog": "Ver Tienda",

  // Common UI
  "common.loading": "Cargando...",
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.delete": "Eliminar",
  "common.edit": "Editar",
  "common.create": "Crear",
  "common.actions": "Acciones",
  "common.status": "Estado",
  "common.active": "Activo",
  "common.inactive": "Inactivo",
  "common.filter": "Filtrar",
  "common.export": "Exportar",
  "common.import": "Importar",
  "common.total": "Total",
  "common.yes": "Sí",
  "common.no": "No",
  "common.close": "Cerrar",
  "common.search": "Buscar",
  "common.no_results": "No se encontraron resultados",
} as const;

export const enTranslations: Record<TranslationKey, string> = {
  // Navigation & Tabs
  "portal.tablero": "Dashboard",
  "portal.sucursales": "Branches",
  "portal.clientes": "Customers",
  "portal.usuarios": "Users",
  "portal.productos": "Products",
  "portal.reservaciones": "Bookings & Orders",
  "portal.pagos": "Payments",
  "portal.reportes": "Reports",
  "portal.kanban": "Kanban",
  "portal.constructor": "Store Builder",
  "portal.configuracion": "Settings",
  "portal.integraciones": "Integrations",
  "portal.superadmin": "Super Admin",

  // Header & Controls
  "portal.search_placeholder": "Search portal (modules, products, orders)...",
  "portal.select_store": "Select Store",
  "portal.switch_instance": "Switch Instance",
  "portal.all_stores": "All Stores (Global)",
  "portal.manage_stores": "Manage Stores",
  "portal.logout": "Log Out",
  "portal.docs": "Documentation",
  "portal.online_docs": "Online Documentation",
  "portal.light_mode": "Light Mode",
  "portal.dark_mode": "Dark Mode",
  "portal.toggle_theme": "Toggle theme (Light / Dark)",
  "portal.language": "Language",
  "portal.lang_es": "Español",
  "portal.lang_en": "English",
  "portal.toggle_lang": "Switch language (ES / EN)",
  "portal.active_store": "Active Store",
  "portal.admin_role": "Administrator",
  "portal.superadmin_role": "Super Administrator",
  "portal.staff_role": "Staff Member",
  "portal.public_catalog": "View Store",

  // Common UI
  "common.loading": "Loading...",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.create": "Create",
  "common.actions": "Actions",
  "common.status": "Status",
  "common.active": "Active",
  "common.inactive": "Inactive",
  "common.filter": "Filter",
  "common.export": "Export",
  "common.import": "Import",
  "common.total": "Total",
  "common.yes": "Yes",
  "common.no": "No",
  "common.close": "Close",
  "common.search": "Search",
  "common.no_results": "No results found",
};

export const dictionaries: Record<SupportedLanguage, Record<string, string>> = {
  es: esTranslations,
  en: enTranslations,
};

export function translate(
  lang: SupportedLanguage,
  key: string,
  fallback?: string
): string {
  const dict = dictionaries[lang] || dictionaries.es;
  if (dict && key in dict) {
    return dict[key];
  }
  if (dictionaries.es && key in dictionaries.es) {
    return dictionaries.es[key];
  }
  return fallback ?? key;
}
