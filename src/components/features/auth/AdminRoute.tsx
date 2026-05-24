"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getPostLoginPath,
  isAdminOnlyPath,
  isAdminPanelRol,
  isAdminRol,
} from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";

type AdminRouteProps = {
  children: React.ReactNode;
};

export function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const usuario = useAuthStore((state) => state.usuario);
  const isSessionExpired = useAuthStore((state) => state.isSessionExpired());
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isSessionExpired) {
      logout();
      router.push("/login");
      return;
    }

    if (usuario && !isAdminPanelRol(usuario.rol)) {
      router.push(getPostLoginPath(usuario.rol));
      return;
    }

    if (usuario && isAdminOnlyPath(pathname) && !isAdminRol(usuario.rol)) {
      router.replace("/admin");
    }
  }, [isHydrated, isAuthenticated, isSessionExpired, logout, router, usuario, pathname]);

  if (
    !isHydrated ||
    !isAuthenticated ||
    isSessionExpired ||
    !usuario ||
    !isAdminPanelRol(usuario.rol)
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
