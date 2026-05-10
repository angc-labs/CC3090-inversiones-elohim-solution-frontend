"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isSessionExpired = useAuthStore(state => state.isSessionExpired());
  const logout = useAuthStore(state => state.logout);

  // Esperar a que Zustand haya hidratado el estado desde localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // No hacer nada hasta que se haya hidratado
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isSessionExpired) {
      logout();
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, isSessionExpired, logout, router]);

  // Mostrar loading mientras se hidrata
  if (!isHydrated || !isAuthenticated || isSessionExpired) {
    return (
      <div className="flex! h-screen! items-center! justify-center! bg-gray-50!">
        <div className="text-center!">
          <p className="text-gray-500!">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
