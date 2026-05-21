"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { logout as logoutRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/useAuthStore";

export function useLogout() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  return useCallback(async () => {
    try {
      if (token) {
        await logoutRequest(token);
      }
    } catch {
      // Si el token ya expiró, igual limpiamos la sesión local.
    } finally {
      logout();
      router.push("/login");
    }
  }, [logout, router, token]);
}
