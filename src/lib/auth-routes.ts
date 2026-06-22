import { TRol } from "@/stores/useAuthStore";

/** Rutas del panel admin (requieren admin o cajero). */
export const ADMIN_PANEL_PREFIX = "/admin";

/** Rutas solo para rol administrador (no cajero). */
export const ADMIN_ONLY_PATHS = ["/admin/usuarios", "/admin/productos"] as const;

/** Rutas de tienda para clientes autenticados. */
export const CLIENT_PROTECTED_PREFIXES = [
  "/home",
  "/portal",
  "/catalogo",
  "/carrito",
  "/perfil",
  "/reservas",
  "/metodoPago",
  "/resumenCompra",
  "/transferencia_bancaria",
  "/cambiar-contrase",
] as const;

export function getPostLoginPath(rol: TRol): string {
  return "/portal";
}

export function isAdminPanelRol(rol: TRol): boolean {
  return rol === "admin" || rol === "cajero";
}

export function isAdminRol(rol: TRol): boolean {
  return rol === "admin";
}

export function isClienteRol(rol: TRol): boolean {
  return rol === "cliente";
}

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isClientProtectedPath(pathname: string): boolean {
  return CLIENT_PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}
