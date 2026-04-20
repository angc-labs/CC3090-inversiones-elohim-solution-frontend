"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isSessionExpired = useAuthStore(state => state.isSessionExpired());
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isSessionExpired) {
      logout();
      router.push("/login");
    }
  }, [isAuthenticated, isSessionExpired, logout, router]);

  if (!isAuthenticated || isSessionExpired) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
