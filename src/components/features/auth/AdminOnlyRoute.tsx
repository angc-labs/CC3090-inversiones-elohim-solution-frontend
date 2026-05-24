"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminRol } from "@/lib/auth-routes";
import { useAuthStore } from "@/stores/useAuthStore";

type AdminOnlyRouteProps = {
  children: React.ReactNode;
};

/** Solo administradores (no cajeros). Debe usarse dentro de AdminRoute. */
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const router = useRouter();
  const usuario = useAuthStore((s) => s.usuario);

  useEffect(() => {
    if (usuario && !isAdminRol(usuario.rol)) {
      router.replace("/admin");
    }
  }, [router, usuario]);

  if (!usuario || !isAdminRol(usuario.rol)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-500">No tenés permiso para ver esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
}
