import { TRol } from "@/stores/useAuthStore";

export function getPostLoginPath(rol: TRol): string {
  if (rol === "admin" || rol === "cajero") {
    return "/admin";
  }

  return "/home";
}

export function isAdminPanelRol(rol: TRol): boolean {
  return rol === "admin" || rol === "cajero";
}

export function isClienteRol(rol: TRol): boolean {
  return rol === "cliente";
}
